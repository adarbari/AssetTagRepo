"""
Alert models
"""
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from modules.shared.database.base import BaseModel, OrganizationMixin


class Alert(BaseModel, OrganizationMixin):
    """Alert model"""

    __tablename__ = "alerts"

    # Alert identification
    alert_type = Column(
        String(100), nullable=False, index=True
    )  # theft, battery, compliance, etc.
    severity = Column(String(50), nullable=False, index=True)  # critical, warning, info
    status = Column(
        String(50), default="active", index=True
    )  # active, acknowledged, resolved

    # Asset information
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)
    asset_name = Column(String(255), nullable=False)  # Denormalized for performance

    # Alert details
    message = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)  # Additional context
    suggested_action = Column(Text, nullable=True)  # Recommended action

    # Location information
    location_description = Column(String(500), nullable=True)
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)

    # Geofence information (if applicable)
    geofence_id = Column(UUID(as_uuid=True), ForeignKey("geofences.id"), nullable=True)
    geofence_name = Column(String(255), nullable=True)  # Denormalized for performance

    # Timing
    triggered_at = Column(DateTime(timezone=True), nullable=False, index=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Resolution
    resolution_notes = Column(Text, nullable=True)
    resolved_by_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    # Auto-resolution
    auto_resolvable = Column(Boolean, default=False)
    auto_resolved = Column(Boolean, default=False)

    # Workflow execution
    workflow_actions = Column(JSON, nullable=True)  # Array of workflow actions executed

    # Metadata
    alert_metadata = Column(JSON, default={})

    # Relationships
    asset = relationship("Asset", back_populates="alerts")
    geofence = relationship("Geofence")
    resolved_by_user = relationship("User", foreign_keys=[resolved_by_user_id])

    # Indexes
    __table_args__ = (
        Index("idx_alert_org_type", "organization_id", "alert_type"),
        Index("idx_alert_org_severity", "organization_id", "severity"),
        Index("idx_alert_org_status", "organization_id", "status"),
        Index("idx_alert_asset_time", "asset_id", "triggered_at"),
        Index("idx_alert_geofence_time", "geofence_id", "triggered_at"),
        Index("idx_alert_triggered_time", "triggered_at"),
    )


class AlertRule(BaseModel, OrganizationMixin):
    """Alert rule configuration"""

    __tablename__ = "alert_rules"

    # Rule identification
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    alert_type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)

    # Rule conditions
    conditions = Column(JSON, nullable=False)  # Rule conditions in JSON format
    is_active = Column(Boolean, default=True, index=True)

    # Asset filtering
    asset_type_filter = Column(
        String(100), nullable=True
    )  # Apply to specific asset types
    site_filter = Column(
        UUID(as_uuid=True), ForeignKey("sites.id"), nullable=True
    )  # Apply to specific sites

    # Notification settings
    notification_channels = Column(JSON, nullable=True)  # email, webhook, push, etc.
    notification_recipients = Column(JSON, nullable=True)  # List of recipients

    # Throttling
    throttle_minutes = Column(
        Integer, nullable=True
    )  # Minimum time between alerts of same type
    max_alerts_per_hour = Column(Integer, nullable=True)  # Rate limiting

    # Auto-resolution
    auto_resolve_after_minutes = Column(
        Integer, nullable=True
    )  # Auto-resolve after X minutes
    auto_resolve_conditions = Column(
        JSON, nullable=True
    )  # Conditions for auto-resolution

    # Metadata
    alert_metadata = Column(JSON, default={})

    # Relationships
    site = relationship("Site", foreign_keys=[site_filter])

    # Indexes
    __table_args__ = (
        Index("idx_alert_rule_org_type", "organization_id", "alert_type"),
        Index("idx_alert_rule_org_active", "organization_id", "is_active"),
        Index("idx_alert_rule_site", "site_filter"),
    )


class AlertNotification(BaseModel, OrganizationMixin):
    """Alert notification tracking"""

    __tablename__ = "alert_notifications"

    # Notification identification
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id"), nullable=False)
    notification_channel = Column(
        String(50), nullable=False
    )  # email, webhook, push, sms
    recipient = Column(String(255), nullable=False)  # email address, phone number, etc.

    # Notification status
    status = Column(
        String(50), default="pending", index=True
    )  # pending, sent, delivered, failed
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    failed_at = Column(DateTime(timezone=True), nullable=True)

    # Error handling
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)

    # Metadata
    alert_metadata = Column(JSON, default={})

    # Relationships
    alert = relationship("Alert")

    # Indexes
    __table_args__ = (
        Index("idx_alert_notification_alert", "alert_id"),
        Index("idx_alert_notification_status", "status"),
        Index("idx_alert_notification_channel", "notification_channel"),
    )
