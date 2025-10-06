"""Convert time-series tables to hypertables

Revision ID: 002_create_hypertables
Revises: 001_enable_timescaledb
Create Date: 2025-01-27 10:30:00.000000

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "002_create_hypertables"
down_revision = "001_enable_timescaledb"
branch_labels = None
depends_on = None


def upgrade():
    """Convert time-series tables to hypertables"""

    # Convert observations table to hypertable
    op.execute(
        """
        SELECT create_hypertable('observations', 'observed_at', 
                                chunk_time_interval => INTERVAL '1 hour',
                                if_not_exists => TRUE);
    """
    )

    # Convert estimated_locations table to hypertable
    op.execute(
        """
        SELECT create_hypertable('estimated_locations', 'estimated_at',
                                chunk_time_interval => INTERVAL '1 hour',
                                if_not_exists => TRUE);
    """
    )

    # Convert alerts table to hypertable
    op.execute(
        """
        SELECT create_hypertable('alerts', 'triggered_at',
                                chunk_time_interval => INTERVAL '1 day',
                                if_not_exists => TRUE);
    """
    )

    # Convert audit_logs table to hypertable
    op.execute(
        """
        SELECT create_hypertable('audit_logs', 'created_at',
                                chunk_time_interval => INTERVAL '1 day',
                                if_not_exists => TRUE);
    """
    )

    # Add compression to older chunks
    op.execute(
        """
        ALTER TABLE observations SET (
            timescaledb.compress,
            timescaledb.compress_segmentby = 'asset_id, gateway_id',
            timescaledb.compress_orderby = 'observed_at DESC'
        );
    """
    )

    op.execute(
        """
        ALTER TABLE estimated_locations SET (
            timescaledb.compress,
            timescaledb.compress_segmentby = 'asset_id',
            timescaledb.compress_orderby = 'estimated_at DESC'
        );
    """
    )

    # Add retention policies
    op.execute(
        """
        SELECT add_retention_policy('observations', INTERVAL '7 days', if_not_exists => TRUE);
    """
    )

    op.execute(
        """
        SELECT add_retention_policy('estimated_locations', INTERVAL '90 days', if_not_exists => TRUE);
    """
    )

    op.execute(
        """
        SELECT add_retention_policy('alerts', INTERVAL '180 days', if_not_exists => TRUE);
    """
    )

    op.execute(
        """
        SELECT add_retention_policy('audit_logs', INTERVAL '365 days', if_not_exists => TRUE);
    """
    )

    # Add compression policy (compress chunks older than 1 day)
    op.execute(
        """
        SELECT add_compression_policy('observations', INTERVAL '1 day', if_not_exists => TRUE);
    """
    )

    op.execute(
        """
        SELECT add_compression_policy('estimated_locations', INTERVAL '1 day', if_not_exists => TRUE);
    """
    )


def downgrade():
    """Remove hypertables and revert to regular tables"""

    # Remove retention policies
    op.execute("SELECT remove_retention_policy('audit_logs', if_exists => TRUE);")
    op.execute("SELECT remove_retention_policy('alerts', if_exists => TRUE);")
    op.execute(
        "SELECT remove_retention_policy('estimated_locations', if_exists => TRUE);"
    )
    op.execute("SELECT remove_retention_policy('observations', if_exists => TRUE);")

    # Remove compression policies
    op.execute(
        "SELECT remove_compression_policy('estimated_locations', if_exists => TRUE);"
    )
    op.execute("SELECT remove_compression_policy('observations', if_exists => TRUE);")

    # Convert hypertables back to regular tables
    op.execute(
        "SELECT * FROM timescaledb_information.hypertables WHERE hypertable_name = 'audit_logs';"
    )
    op.execute(
        "SELECT * FROM timescaledb_information.hypertables WHERE hypertable_name = 'alerts';"
    )
    op.execute(
        "SELECT * FROM timescaledb_information.hypertables WHERE hypertable_name = 'estimated_locations';"
    )
    op.execute(
        "SELECT * FROM timescaledb_information.hypertables WHERE hypertable_name = 'observations';"
    )

    # Note: Converting hypertables back to regular tables requires manual intervention
    # as TimescaleDB doesn't provide a direct downgrade function
    # This would typically involve:
    # 1. Creating new regular tables
    # 2. Copying data from hypertables
    # 3. Dropping hypertables
    # 4. Renaming new tables
