"""Create vehicle asset pairings table

Revision ID: 008_create_vehicle_asset_pairings_table
Revises: 007_create_notifications_tables
Create Date: 2024-01-15 11:30:00.000000

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "008_create_vehicle_asset_pairings_table"
down_revision = "007_create_notifications_tables"
branch_labels = None
depends_on = None


def upgrade():
    """Create vehicle_asset_pairings table"""

    # Create vehicle_asset_pairings table
    op.create_table(
        "vehicle_asset_pairings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("vehicle_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("asset_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("paired_at", sa.String(length=100), nullable=False),
        sa.Column("paired_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("paired_by_name", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
        ),
        sa.ForeignKeyConstraint(
            ["paired_by_user_id"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["vehicle_id"],
            ["vehicles.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for vehicle_asset_pairings table
    op.create_index(
        "idx_vehicle_asset_pairing",
        "vehicle_asset_pairings",
        ["vehicle_id", "asset_id"],
    )
    op.create_index("idx_vehicle_asset_status", "vehicle_asset_pairings", ["status"])


def downgrade():
    """Drop vehicle_asset_pairings table"""

    # Drop indexes
    op.drop_index("idx_vehicle_asset_status", table_name="vehicle_asset_pairings")
    op.drop_index("idx_vehicle_asset_pairing", table_name="vehicle_asset_pairings")

    # Drop table
    op.drop_table("vehicle_asset_pairings")
