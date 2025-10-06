"""Create compliance tables

Revision ID: 006_create_compliance_tables
Revises: 005_create_issues_tables
Create Date: 2024-01-15 10:30:00.000000

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "006_create_compliance_tables"
down_revision = "005_create_issues_tables"
branch_labels = None
depends_on = None


def upgrade():
    """Create compliance and compliance_checks tables"""

    # Create compliance table
    op.create_table(
        "compliance",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("compliance_type", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=True),
        sa.Column("asset_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("asset_name", sa.String(length=255), nullable=True),
        sa.Column("assigned_to_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("assigned_to_name", sa.String(length=255), nullable=True),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_reminder_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("certification_type", sa.String(length=100), nullable=True),
        sa.Column("certification_number", sa.String(length=100), nullable=True),
        sa.Column("issuing_authority", sa.String(length=255), nullable=True),
        sa.Column("renewal_required", sa.Boolean(), nullable=True),
        sa.Column("renewal_frequency_months", sa.Integer(), nullable=True),
        sa.Column("document_url", sa.String(length=500), nullable=True),
        sa.Column("document_name", sa.String(length=255), nullable=True),
        sa.Column("document_type", sa.String(length=100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("tags", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
        ),
        sa.ForeignKeyConstraint(
            ["assigned_to_user_id"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for compliance table
    op.create_index(
        "idx_compliance_org_type", "compliance", ["organization_id", "compliance_type"]
    )
    op.create_index(
        "idx_compliance_org_status", "compliance", ["organization_id", "status"]
    )
    op.create_index(
        "idx_compliance_org_due_date", "compliance", ["organization_id", "due_date"]
    )
    op.create_index("idx_compliance_asset", "compliance", ["asset_id"])
    op.create_index("idx_compliance_assigned", "compliance", ["assigned_to_user_id"])
    op.create_index("idx_compliance_overdue", "compliance", ["due_date", "status"])

    # Create compliance_checks table
    op.create_table(
        "compliance_checks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("compliance_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("check_type", sa.String(length=100), nullable=False),
        sa.Column("check_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("result", sa.String(length=50), nullable=False),
        sa.Column("score", sa.Integer(), nullable=True),
        sa.Column("checked_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("checked_by_name", sa.String(length=255), nullable=True),
        sa.Column("checked_by_role", sa.String(length=100), nullable=True),
        sa.Column("findings", sa.Text(), nullable=True),
        sa.Column("recommendations", sa.Text(), nullable=True),
        sa.Column("corrective_actions", sa.Text(), nullable=True),
        sa.Column("next_check_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("document_url", sa.String(length=500), nullable=True),
        sa.Column("document_name", sa.String(length=255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(
            ["checked_by_user_id"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["compliance_id"],
            ["compliance.id"],
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for compliance_checks table
    op.create_index(
        "idx_compliance_check_compliance",
        "compliance_checks",
        ["compliance_id", "check_date"],
    )
    op.create_index("idx_compliance_check_result", "compliance_checks", ["result"])
    op.create_index("idx_compliance_check_date", "compliance_checks", ["check_date"])
    op.create_index("idx_compliance_check_type", "compliance_checks", ["check_type"])


def downgrade():
    """Drop compliance and compliance_checks tables"""

    # Drop indexes
    op.drop_index("idx_compliance_check_type", table_name="compliance_checks")
    op.drop_index("idx_compliance_check_date", table_name="compliance_checks")
    op.drop_index("idx_compliance_check_result", table_name="compliance_checks")
    op.drop_index("idx_compliance_check_compliance", table_name="compliance_checks")
    op.drop_index("idx_compliance_overdue", table_name="compliance")
    op.drop_index("idx_compliance_assigned", table_name="compliance")
    op.drop_index("idx_compliance_asset", table_name="compliance")
    op.drop_index("idx_compliance_org_due_date", table_name="compliance")
    op.drop_index("idx_compliance_org_status", table_name="compliance")
    op.drop_index("idx_compliance_org_type", table_name="compliance")

    # Drop tables
    op.drop_table("compliance_checks")
    op.drop_table("compliance")
