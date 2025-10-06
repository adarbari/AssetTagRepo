"""
Notification models
"""
from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, Index, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON
from sqlalchemy.orm import relationship
from modules.shared.database.base import BaseModel, OrganizationMixin, SoftDeleteMixin


class NotificationConfig(BaseModel, OrganizationMixin, SoftDeleteMixin):
    """Notification configuration model for user preferences"""
    __tablename__ = "notification_configs"
    
    # Configuration level and entity
    level = Column(String(50), nullable=False, index=True)  # user, site, asset, global
    entity_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # ID of the entity (user, site, asset)
    entity_name = Column(String(255), nullable=True)  # Denormalized for performance
    
    # Channel configurations
    email_enabled = Column(Boolean, default=True)
    email_addresses = Column(JSON, default=list)  # Array of email addresses
    email_verified = Column(Boolean, default=False)
    
    sms_enabled = Column(Boolean, default=False)
    sms_phone_numbers = Column(JSON, default=list)  # Array of phone numbers
    sms_verified = Column(Boolean, default=False)
    
    push_enabled = Column(Boolean, default=True)
    push_devices = Column(JSON, default=list)  # Array of device tokens
    push_verified = Column(Boolean, default=False)
    
    webhook_enabled = Column(Boolean, default=False)
    webhook_endpoints = Column(JSON, default=list)  # Array of webhook URLs
    webhook_verified = Column(Boolean, default=False)
    
    # Notification filters
    alert_types = Column(JSON, default=list)  # Array of alert types to receive
    severity_levels = Column(JSON, default=list)  # Array of severity levels
    asset_types = Column(JSON, default=list)  # Array of asset types
    site_ids = Column(JSON, default=list)  # Array of site IDs
    
    # Quiet hours configuration
    quiet_hours_enabled = Column(Boolean, default=False)
    quiet_hours_start = Column(String(10), nullable=True)  # HH:MM format
    quiet_hours_end = Column(String(10), nullable=True)  # HH:MM format
    quiet_hours_timezone = Column(String(50), default="UTC")
    quiet_hours_exclude_critical = Column(Boolean, default=True)
    
    # Frequency limits
    max_notifications_per_hour = Column(Integer, default=10)
    max_notifications_per_day = Column(Integer, default=50)
    digest_mode = Column(Boolean, default=False)  # Group notifications into digests
    
    # Override settings
    is_override = Column(Boolean, default=False)  # Whether this overrides parent configs
    
    # Additional metadata
    metadata = Column(JSON, default={})
    
    # Indexes
    __table_args__ = (
        Index('idx_notification_config_level_entity', 'level', 'entity_id'),
        Index('idx_notification_config_org_level', 'organization_id', 'level'),
    )


class NotificationLog(BaseModel, OrganizationMixin):
    """Notification log model for tracking sent notifications"""
    __tablename__ = "notification_logs"
    
    # Notification details
    notification_type = Column(String(100), nullable=False, index=True)  # alert, reminder, system, etc.
    title = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(50), nullable=True, index=True)  # low, medium, high, critical
    
    # Recipient information
    recipient_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    recipient_name = Column(String(255), nullable=True)  # Denormalized for performance
    recipient_email = Column(String(255), nullable=True)
    recipient_phone = Column(String(50), nullable=True)
    
    # Delivery information
    channel = Column(String(50), nullable=False, index=True)  # email, sms, push, webhook
    delivery_status = Column(String(50), default="pending", index=True)  # pending, sent, delivered, failed
    delivery_attempts = Column(Integer, default=0)
    last_delivery_attempt = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    failed_at = Column(DateTime(timezone=True), nullable=True)
    failure_reason = Column(Text, nullable=True)
    
    # Related entities
    related_entity_type = Column(String(50), nullable=True)  # asset, site, job, etc.
    related_entity_id = Column(UUID(as_uuid=True), nullable=True)
    related_entity_name = Column(String(255), nullable=True)
    
    # Configuration used
    config_id = Column(UUID(as_uuid=True), ForeignKey("notification_configs.id"), nullable=True)
    
    # Additional metadata
    metadata = Column(JSON, default={})
    
    # Relationships
    recipient_user = relationship("User", foreign_keys=[recipient_user_id])
    config = relationship("NotificationConfig", foreign_keys=[config_id])
    
    # Indexes
    __table_args__ = (
        Index('idx_notification_log_recipient', 'recipient_user_id', 'created_at'),
        Index('idx_notification_log_status', 'delivery_status', 'created_at'),
        Index('idx_notification_log_type', 'notification_type', 'created_at'),
        Index('idx_notification_log_entity', 'related_entity_type', 'related_entity_id'),
    )


class NotificationTemplate(BaseModel, OrganizationMixin):
    """Notification template model for reusable message templates"""
    __tablename__ = "notification_templates"
    
    # Template details
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    template_type = Column(String(100), nullable=False, index=True)  # alert, reminder, system, etc.
    channel = Column(String(50), nullable=False, index=True)  # email, sms, push, webhook
    
    # Template content
    subject_template = Column(String(500), nullable=True)  # For email
    body_template = Column(Text, nullable=False)
    
    # Template variables
    variables = Column(JSON, default=list)  # Array of variable names used in template
    
    # Template settings
    is_active = Column(Boolean, default=True)
    is_system_template = Column(Boolean, default=False)  # System templates cannot be deleted
    
    # Additional metadata
    metadata = Column(JSON, default={})
    
    # Indexes
    __table_args__ = (
        Index('idx_notification_template_type_channel', 'template_type', 'channel'),
        Index('idx_notification_template_org_name', 'organization_id', 'name'),
    )
