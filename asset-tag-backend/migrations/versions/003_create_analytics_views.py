"""Create materialized views for analytics

Revision ID: 003_create_analytics_views
Revises: 002_create_hypertables
Create Date: 2025-01-27 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003_create_analytics_views'
down_revision = '002_create_hypertables'
branch_labels = None
depends_on = None


def upgrade():
    """Create materialized views for analytics"""
    
    # Daily utilization rollup
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS asset_utilization_daily AS
        SELECT 
            DATE(estimated_at) as day,
            asset_id,
            COUNT(*) as location_updates,
            SUM(COALESCE(distance_from_previous, 0)) as total_distance,
            COUNT(DISTINCT current_site_id) as sites_visited,
            AVG(confidence) as avg_confidence,
            MIN(estimated_at) as first_location,
            MAX(estimated_at) as last_location
        FROM estimated_locations
        GROUP BY day, asset_id
        WITH DATA;
    """)
    
    # Create index on the materialized view
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_asset_utilization_daily_asset_day 
        ON asset_utilization_daily(asset_id, day);
    """)
    
    # Asset health summary
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS asset_health_summary AS
        SELECT 
            a.id as asset_id,
            a.name,
            a.asset_type,
            a.status,
            AVG(o.battery_level) as avg_battery_24h,
            AVG(o.temperature) as avg_temperature_24h,
            MAX(o.observed_at) as last_observation,
            COUNT(o.id) as observation_count_24h,
            AVG(o.rssi) as avg_rssi_24h,
            COUNT(DISTINCT o.gateway_id) as unique_gateways_24h
        FROM assets a
        LEFT JOIN observations o ON a.id = o.asset_id 
            AND o.observed_at > NOW() - INTERVAL '24 hours'
        GROUP BY a.id, a.name, a.asset_type, a.status
        WITH DATA;
    """)
    
    # Create index on the materialized view
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_asset_health_summary_asset_id 
        ON asset_health_summary(asset_id);
    """)
    
    # Alert statistics
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS alert_statistics AS
        SELECT 
            DATE(triggered_at) as day,
            alert_type,
            severity,
            status,
            COUNT(*) as alert_count,
            AVG(CASE 
                WHEN resolved_at IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (resolved_at - triggered_at)) 
                ELSE NULL 
            END) as avg_resolution_time_seconds,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
            COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count
        FROM alerts
        WHERE triggered_at > NOW() - INTERVAL '90 days'
        GROUP BY day, alert_type, severity, status
        WITH DATA;
    """)
    
    # Create index on the materialized view
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_alert_statistics_day_type 
        ON alert_statistics(day, alert_type, severity);
    """)
    
    # Gateway performance metrics
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS gateway_performance_daily AS
        SELECT 
            DATE(observed_at) as day,
            gateway_id,
            COUNT(*) as observation_count,
            COUNT(DISTINCT asset_id) as unique_assets,
            AVG(rssi) as avg_rssi,
            MIN(rssi) as min_rssi,
            MAX(rssi) as max_rssi,
            STDDEV(rssi) as rssi_stddev,
            COUNT(CASE WHEN signal_quality = 'excellent' THEN 1 END) as excellent_signals,
            COUNT(CASE WHEN signal_quality = 'good' THEN 1 END) as good_signals,
            COUNT(CASE WHEN signal_quality = 'fair' THEN 1 END) as fair_signals,
            COUNT(CASE WHEN signal_quality = 'poor' THEN 1 END) as poor_signals
        FROM observations
        GROUP BY day, gateway_id
        WITH DATA;
    """)
    
    # Create index on the materialized view
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_gateway_performance_daily_gateway_day 
        ON gateway_performance_daily(gateway_id, day);
    """)
    
    # Site activity summary
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS site_activity_daily AS
        SELECT 
            DATE(estimated_at) as day,
            current_site_id,
            COUNT(DISTINCT asset_id) as unique_assets,
            COUNT(*) as location_updates,
            AVG(confidence) as avg_confidence,
            SUM(COALESCE(distance_from_previous, 0)) as total_movement
        FROM estimated_locations
        WHERE current_site_id IS NOT NULL
        GROUP BY day, current_site_id
        WITH DATA;
    """)
    
    # Create index on the materialized view
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_site_activity_daily_site_day 
        ON site_activity_daily(current_site_id, day);
    """)
    
    # Create refresh function
    op.execute("""
        CREATE OR REPLACE FUNCTION refresh_analytics_views()
        RETURNS void AS $$
        BEGIN
            REFRESH MATERIALIZED VIEW CONCURRENTLY asset_utilization_daily;
            REFRESH MATERIALIZED VIEW CONCURRENTLY asset_health_summary;
            REFRESH MATERIALIZED VIEW CONCURRENTLY alert_statistics;
            REFRESH MATERIALIZED VIEW CONCURRENTLY gateway_performance_daily;
            REFRESH MATERIALIZED VIEW CONCURRENTLY site_activity_daily;
        END;
        $$ LANGUAGE plpgsql;
    """)


def downgrade():
    """Drop materialized views"""
    
    # Drop refresh function
    op.execute("DROP FUNCTION IF EXISTS refresh_analytics_views();")
    
    # Drop materialized views
    op.execute("DROP MATERIALIZED VIEW IF EXISTS site_activity_daily CASCADE;")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS gateway_performance_daily CASCADE;")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS alert_statistics CASCADE;")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS asset_health_summary CASCADE;")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS asset_utilization_daily CASCADE;")
