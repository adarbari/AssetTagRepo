"""Enable TimescaleDB extension

Revision ID: 001_enable_timescaledb
Revises: 
Create Date: 2025-01-27 10:00:00.000000

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "001_enable_timescaledb"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Enable TimescaleDB extension (skipped for local development)"""
    # Skip TimescaleDB extension for local development
    # op.execute("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;")

    # Create custom types for better performance
    op.execute("CREATE TYPE alert_severity AS ENUM ('critical', 'warning', 'info');")
    op.execute("CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved');")
    op.execute("CREATE TYPE asset_status AS ENUM ('active', 'inactive', 'maintenance', 'in-transit', 'checked-out');")
    op.execute("CREATE TYPE signal_quality AS ENUM ('excellent', 'good', 'fair', 'poor');")


def downgrade() -> None:
    """Disable TimescaleDB extension (skipped for local development)"""
    # Drop custom types
    op.execute("DROP TYPE IF EXISTS signal_quality CASCADE;")
    op.execute("DROP TYPE IF EXISTS asset_status CASCADE;")
    op.execute("DROP TYPE IF EXISTS alert_status CASCADE;")
    op.execute("DROP TYPE IF EXISTS alert_severity CASCADE;")

    # Skip TimescaleDB extension for local development
    # op.execute("DROP EXTENSION IF EXISTS timescaledb CASCADE;")
