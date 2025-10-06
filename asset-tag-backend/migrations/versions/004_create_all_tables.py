"""Create all database tables

Revision ID: 004_create_all_tables
Revises: 003_create_analytics_views
Create Date: 2025-01-27 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004_create_all_tables'
down_revision = '003_create_analytics_views'
branch_labels = None
depends_on = None


def upgrade():
    """Create all database tables"""
    
    # Create organizations table
    op.create_table('organizations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('domain', sa.String(length=255), nullable=True),
        sa.Column('settings', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('domain')
    )
    
    # Create users table
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_superuser', sa.Boolean(), nullable=True),
        sa.Column('role', sa.String(length=50), nullable=True),
        sa.Column('preferences', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username')
    )
    op.create_index('idx_user_org_email', 'users', ['organization_id', 'email'], unique=False)
    op.create_index('idx_user_org_username', 'users', ['organization_id', 'username'], unique=False)
    
    # Create sites table
    op.create_table('sites',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('location', sa.String(length=500), nullable=True),
        sa.Column('area', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('manager_name', sa.String(length=255), nullable=True),
        sa.Column('manager_id', sa.String(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('radius', sa.Integer(), nullable=True),
        sa.Column('tolerance', sa.Integer(), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('geofence_id', sa.String(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create personnel table
    op.create_table('personnel',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('current_site_id', sa.String(), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create personnel_activity table
    op.create_table('personnel_activity',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('personnel_id', sa.String(), nullable=False),
        sa.Column('site_id', sa.String(), nullable=False),
        sa.Column('site_name', sa.String(length=255), nullable=False),
        sa.Column('activity_type', sa.String(length=50), nullable=False),
        sa.Column('timestamp', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create assets table
    op.create_table('assets',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('serial_number', sa.String(length=255), nullable=True),
        sa.Column('asset_type', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('current_site_id', sa.String(), nullable=True),
        sa.Column('location_description', sa.String(length=500), nullable=True),
        sa.Column('last_seen', sa.DateTime(), nullable=True),
        sa.Column('battery_level', sa.Integer(), nullable=True),
        sa.Column('temperature', sa.Float(), nullable=True),
        sa.Column('movement', sa.Boolean(), nullable=True),
        sa.Column('assigned_to_user_id', sa.String(), nullable=True),
        sa.Column('manufacturer', sa.String(length=255), nullable=True),
        sa.Column('model', sa.String(length=255), nullable=True),
        sa.Column('purchase_date', sa.Date(), nullable=True),
        sa.Column('warranty_expiry', sa.Date(), nullable=True),
        sa.Column('maintenance_schedule', sa.String(length=100), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create gateways table
    op.create_table('gateways',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('gateway_id', sa.String(length=255), nullable=False),
        sa.Column('site_id', sa.String(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('is_online', sa.Boolean(), nullable=True),
        sa.Column('battery_level', sa.Integer(), nullable=True),
        sa.Column('last_seen', sa.DateTime(), nullable=True),
        sa.Column('firmware_version', sa.String(length=100), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create observations table (will be converted to hypertable later)
    op.create_table('observations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('asset_id', sa.String(), nullable=False),
        sa.Column('gateway_id', sa.String(), nullable=False),
        sa.Column('rssi', sa.Integer(), nullable=False),
        sa.Column('battery_level', sa.Integer(), nullable=True),
        sa.Column('temperature', sa.Float(), nullable=True),
        sa.Column('observed_at', sa.DateTime(), nullable=False),
        sa.Column('received_at', sa.DateTime(), nullable=True),
        sa.Column('signal_quality', sa.String(length=50), nullable=True),
        sa.Column('noise_level', sa.Integer(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create observation_batches table
    op.create_table('observation_batches',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('batch_id', sa.String(), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=False),
        sa.Column('observation_count', sa.Integer(), nullable=False),
        sa.Column('processing_status', sa.String(length=50), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create estimated_locations table (will be converted to hypertable later)
    op.create_table('estimated_locations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('asset_id', sa.String(), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('accuracy_meters', sa.Float(), nullable=True),
        sa.Column('estimation_method', sa.String(length=50), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('gateway_ids', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('estimated_at', sa.DateTime(), nullable=False),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create geofences table
    op.create_table('geofences',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('geofence_type', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('center_latitude', sa.Float(), nullable=True),
        sa.Column('center_longitude', sa.Float(), nullable=True),
        sa.Column('radius', sa.Integer(), nullable=True),
        sa.Column('coordinates', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('site_id', sa.String(), nullable=True),
        sa.Column('site_name', sa.String(length=255), nullable=True),
        sa.Column('alert_on_entry', sa.Boolean(), nullable=True),
        sa.Column('alert_on_exit', sa.Boolean(), nullable=True),
        sa.Column('geofence_classification', sa.String(length=50), nullable=True),
        sa.Column('tolerance', sa.Integer(), nullable=True),
        sa.Column('location_mode', sa.String(length=50), nullable=True),
        sa.Column('vehicle_id', sa.String(), nullable=True),
        sa.Column('vehicle_name', sa.String(length=255), nullable=True),
        sa.Column('asset_id', sa.String(), nullable=True),
        sa.Column('asset_name', sa.String(length=255), nullable=True),
        sa.Column('attachment_type', sa.String(length=50), nullable=True),
        sa.Column('expected_asset_ids', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create geofence_events table
    op.create_table('geofence_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('geofence_id', sa.String(), nullable=False),
        sa.Column('asset_id', sa.String(), nullable=False),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('timestamp', sa.String(), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('distance_from_geofence', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create vehicles table
    op.create_table('vehicles',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('vehicle_type', sa.String(length=100), nullable=False),
        sa.Column('license_plate', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('current_latitude', sa.Float(), nullable=True),
        sa.Column('current_longitude', sa.Float(), nullable=True),
        sa.Column('last_seen', sa.String(), nullable=True),
        sa.Column('assigned_driver_id', sa.String(), nullable=True),
        sa.Column('assigned_driver_name', sa.String(length=255), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create alerts table (will be converted to hypertable later)
    op.create_table('alerts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('alert_type', sa.String(length=100), nullable=False),
        sa.Column('severity', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('asset_id', sa.String(), nullable=True),
        sa.Column('geofence_id', sa.String(), nullable=True),
        sa.Column('site_id', sa.String(), nullable=True),
        sa.Column('triggered_at', sa.DateTime(), nullable=False),
        sa.Column('acknowledged_at', sa.DateTime(), nullable=True),
        sa.Column('acknowledged_by', sa.String(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.Column('resolved_by', sa.String(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create jobs table
    op.create_table('jobs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('job_type', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('priority', sa.String(length=50), nullable=True),
        sa.Column('scheduled_start', sa.DateTime(), nullable=True),
        sa.Column('scheduled_end', sa.DateTime(), nullable=True),
        sa.Column('actual_start', sa.DateTime(), nullable=True),
        sa.Column('actual_end', sa.DateTime(), nullable=True),
        sa.Column('assigned_to_user_id', sa.String(), nullable=True),
        sa.Column('site_id', sa.String(), nullable=True),
        sa.Column('location_description', sa.String(length=500), nullable=True),
        sa.Column('estimated_duration_hours', sa.Float(), nullable=True),
        sa.Column('actual_duration_hours', sa.Float(), nullable=True),
        sa.Column('estimated_cost', sa.Float(), nullable=True),
        sa.Column('actual_cost', sa.Float(), nullable=True),
        sa.Column('completion_notes', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create job_assets table
    op.create_table('job_assets',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('job_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('asset_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create maintenance_records table
    op.create_table('maintenance_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('asset_id', sa.String(), nullable=False),
        sa.Column('asset_name', sa.String(length=255), nullable=False),
        sa.Column('maintenance_type', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('priority', sa.String(length=50), nullable=True),
        sa.Column('scheduled_date', sa.Date(), nullable=True),
        sa.Column('completed_date', sa.Date(), nullable=True),
        sa.Column('assigned_to_user_id', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('duration_hours', sa.Float(), nullable=True),
        sa.Column('cost', sa.Float(), nullable=True),
        sa.Column('location', sa.String(length=500), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create check_in_out_records table
    op.create_table('check_in_out_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('asset_id', sa.String(), nullable=False),
        sa.Column('asset_name', sa.String(length=255), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('checked_out_by', sa.String(), nullable=True),
        sa.Column('checked_in_by', sa.String(), nullable=True),
        sa.Column('checked_out_at', sa.DateTime(), nullable=True),
        sa.Column('checked_in_at', sa.DateTime(), nullable=True),
        sa.Column('expected_return_date', sa.Date(), nullable=True),
        sa.Column('location', sa.String(length=500), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create audit_logs table (will be converted to hypertable later)
    op.create_table('audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('entity_type', sa.String(length=100), nullable=False),
        sa.Column('entity_id', sa.String(), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('user_name', sa.String(length=255), nullable=True),
        sa.Column('old_values', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('new_values', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    """Drop all database tables"""
    
    # Drop tables in reverse order to handle foreign key constraints
    op.drop_table('audit_logs')
    op.drop_table('check_in_out_records')
    op.drop_table('maintenance_records')
    op.drop_table('job_assets')
    op.drop_table('jobs')
    op.drop_table('alerts')
    op.drop_table('vehicles')
    op.drop_table('geofence_events')
    op.drop_table('geofences')
    op.drop_table('estimated_locations')
    op.drop_table('observation_batches')
    op.drop_table('observations')
    op.drop_table('gateways')
    op.drop_table('assets')
    op.drop_table('personnel_activity')
    op.drop_table('personnel')
    op.drop_table('sites')
    op.drop_table('users')
    op.drop_table('organizations')
