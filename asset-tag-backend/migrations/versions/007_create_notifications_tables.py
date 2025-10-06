"""Create notifications tables

Revision ID: 007_create_notifications_tables
Revises: 006_create_compliance_tables
Create Date: 2024-01-15 11:00:00.000000

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "007_create_notifications_tables"
down_revision = "006_create_compliance_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create notification_configs, notification_logs, and notification_templates tables"""

    # Create notification_configs table
    op.create_table(
        "notification_configs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("level", sa.String(length=50), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("entity_name", sa.String(length=255), nullable=True),
        sa.Column("email_enabled", sa.Boolean(), nullable=True),
        sa.Column(
            "email_addresses", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
        sa.Column("email_verified", sa.Boolean(), nullable=True),
        sa.Column("sms_enabled", sa.Boolean(), nullable=True),
        sa.Column(
            "sms_phone_numbers", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
        sa.Column("sms_verified", sa.Boolean(), nullable=True),
        sa.Column("push_enabled", sa.Boolean(), nullable=True),
        sa.Column(
            "push_devices", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
        sa.Column("push_verified", sa.Boolean(), nullable=True),
        sa.Column("webhook_enabled", sa.Boolean(), nullable=True),
        sa.Column(
            "webhook_endpoints", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
        sa.Column("webhook_verified", sa.Boolean(), nullable=True),
        sa.Column(
            "alert_types", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
        sa.Column(
            "severity_levels", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
        sa.Column(
            "asset_types", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
        sa.Column("site_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("quiet_hours_enabled", sa.Boolean(), nullable=True),
        sa.Column("quiet_hours_start", sa.String(length=10), nullable=True),
        sa.Column("quiet_hours_end", sa.String(length=10), nullable=True),
        sa.Column("quiet_hours_timezone", sa.String(length=50), nullable=True),
        sa.Column("quiet_hours_exclude_critical", sa.Boolean(), nullable=True),
        sa.Column("max_notifications_per_hour", sa.Integer(), nullable=True),
        sa.Column("max_notifications_per_day", sa.Integer(), nullable=True),
        sa.Column("digest_mode", sa.Boolean(), nullable=True),
        sa.Column("is_override", sa.Boolean(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for notification_configs table
    op.create_index(
        "idx_notification_config_level_entity",
        "notification_configs",
        ["level", "entity_id"],
    )
    op.create_index(
        "idx_notification_config_org_level",
        "notification_configs",
        ["organization_id", "level"],
    )

    # Create notification_logs table
    op.create_table(
        "notification_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("notification_type", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("severity", sa.String(length=50), nullable=True),
        sa.Column("recipient_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("recipient_name", sa.String(length=255), nullable=True),
        sa.Column("recipient_email", sa.String(length=255), nullable=True),
        sa.Column("recipient_phone", sa.String(length=50), nullable=True),
        sa.Column("channel", sa.String(length=50), nullable=False),
        sa.Column("delivery_status", sa.String(length=50), nullable=True),
        sa.Column("delivery_attempts", sa.Integer(), nullable=True),
        sa.Column("last_delivery_attempt", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failure_reason", sa.Text(), nullable=True),
        sa.Column("related_entity_type", sa.String(length=50), nullable=True),
        sa.Column("related_entity_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("related_entity_name", sa.String(length=255), nullable=True),
        sa.Column("config_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(
            ["config_id"],
            ["notification_configs.id"],
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
        ),
        sa.ForeignKeyConstraint(
            ["recipient_user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for notification_logs table
    op.create_index(
        "idx_notification_log_recipient",
        "notification_logs",
        ["recipient_user_id", "created_at"],
    )
    op.create_index(
        "idx_notification_log_status",
        "notification_logs",
        ["delivery_status", "created_at"],
    )
    op.create_index(
        "idx_notification_log_type",
        "notification_logs",
        ["notification_type", "created_at"],
    )
    op.create_index(
        "idx_notification_log_entity",
        "notification_logs",
        ["related_entity_type", "related_entity_id"],
    )

    # Create notification_templates table
    op.create_table(
        "notification_templates",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("template_type", sa.String(length=100), nullable=False),
        sa.Column("channel", sa.String(length=50), nullable=False),
        sa.Column("subject_template", sa.String(length=500), nullable=True),
        sa.Column("body_template", sa.Text(), nullable=False),
        sa.Column("variables", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("is_system_template", sa.Boolean(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for notification_templates table
    op.create_index(
        "idx_notification_template_type_channel",
        "notification_templates",
        ["template_type", "channel"],
    )
    op.create_index(
        "idx_notification_template_org_name",
        "notification_templates",
        ["organization_id", "name"],
    )


def downgrade() -> None:
    """Drop notification_configs, notification_logs, and notification_templates tables"""

    # Drop indexes
    op.drop_index(
        "idx_notification_template_org_name", table_name="notification_templates"
    )
    op.drop_index(
        "idx_notification_template_type_channel", table_name="notification_templates"
    )
    op.drop_index("idx_notification_log_entity", table_name="notification_logs")
    op.drop_index("idx_notification_log_type", table_name="notification_logs")
    op.drop_index("idx_notification_log_status", table_name="notification_logs")
    op.drop_index("idx_notification_log_recipient", table_name="notification_logs")
    op.drop_index(
        "idx_notification_config_org_level", table_name="notification_configs"
    )
    op.drop_index(
        "idx_notification_config_level_entity", table_name="notification_configs"
    )

    # Drop tables
    op.drop_table("notification_templates")
    op.drop_table("notification_logs")
    op.drop_table("notification_configs")
