"""Create issues tables

Revision ID: 005_create_issues_tables
Revises: 004_create_all_tables
Create Date: 2024-01-15 10:00:00.000000

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "004_create_issues_tables"
down_revision = "003_create_all_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create issues, issue_comments, and issue_attachments tables"""

    # Create issues table
    op.create_table(
        "issues",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("issue_type", sa.String(length=100), nullable=False),
        sa.Column("severity", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=True),
        sa.Column("asset_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("asset_name", sa.String(length=255), nullable=True),
        sa.Column("reported_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("reported_by_name", sa.String(length=255), nullable=True),
        sa.Column("assigned_to_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("assigned_to_name", sa.String(length=255), nullable=True),
        sa.Column("reported_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("acknowledged_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
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
        sa.ForeignKeyConstraint(
            ["reported_by_user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for issues table
    op.create_index("idx_issue_org_status", "issues", ["organization_id", "status"])
    op.create_index("idx_issue_org_severity", "issues", ["organization_id", "severity"])
    op.create_index("idx_issue_org_type", "issues", ["organization_id", "issue_type"])
    op.create_index("idx_issue_asset", "issues", ["asset_id"])
    op.create_index("idx_issue_assigned", "issues", ["assigned_to_user_id"])
    op.create_index("idx_issue_reported_date", "issues", ["reported_date"])

    # Create issue_comments table
    op.create_table(
        "issue_comments",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("issue_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("comment", sa.Text(), nullable=False),
        sa.Column("comment_type", sa.String(length=50), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("user_name", sa.String(length=255), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(
            ["issue_id"],
            ["issues.id"],
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for issue_comments table
    op.create_index(
        "idx_issue_comment_issue", "issue_comments", ["issue_id", "created_at"]
    )
    op.create_index("idx_issue_comment_user", "issue_comments", ["user_id"])

    # Create issue_attachments table
    op.create_table(
        "issue_attachments",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("issue_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("file_type", sa.String(length=100), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("file_url", sa.String(length=500), nullable=False),
        sa.Column("uploaded_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("uploaded_by_name", sa.String(length=255), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(
            ["issue_id"],
            ["issues.id"],
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
        ),
        sa.ForeignKeyConstraint(
            ["uploaded_by_user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for issue_attachments table
    op.create_index("idx_issue_attachment_issue", "issue_attachments", ["issue_id"])
    op.create_index("idx_issue_attachment_type", "issue_attachments", ["file_type"])


def downgrade() -> None:
    """Drop issues, issue_comments, and issue_attachments tables"""

    # Drop indexes
    op.drop_index("idx_issue_attachment_type", table_name="issue_attachments")
    op.drop_index("idx_issue_attachment_issue", table_name="issue_attachments")
    op.drop_index("idx_issue_comment_user", table_name="issue_comments")
    op.drop_index("idx_issue_comment_issue", table_name="issue_comments")
    op.drop_index("idx_issue_reported_date", table_name="issues")
    op.drop_index("idx_issue_assigned", table_name="issues")
    op.drop_index("idx_issue_asset", table_name="issues")
    op.drop_index("idx_issue_org_type", table_name="issues")
    op.drop_index("idx_issue_org_severity", table_name="issues")
    op.drop_index("idx_issue_org_status", table_name="issues")

    # Drop tables
    op.drop_table("issue_attachments")
    op.drop_table("issue_comments")
    op.drop_table("issues")
