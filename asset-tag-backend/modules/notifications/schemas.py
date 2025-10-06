"""
Notification schemas
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator


class NotificationChannelConfig(BaseModel):
    """Schema for notification channel configuration"""

    enabled: bool = Field(default=True, description="Whether channel is enabled")
    addresses: Optional[List[str]] = Field(
        default_factory=list, description="Email addresses or phone numbers"
    )
    verified: bool = Field(default=False, description="Whether addresses are verified")


class NotificationChannels(BaseModel):
    """Schema for all notification channels"""

    email: NotificationChannelConfig = Field(
        default_factory=lambda: NotificationChannelConfig()
    )
    sms: NotificationChannelConfig = Field(
        default_factory=lambda: NotificationChannelConfig()
    )
    push: NotificationChannelConfig = Field(
        default_factory=lambda: NotificationChannelConfig()
    )
    webhook: NotificationChannelConfig = Field(
        default_factory=lambda: NotificationChannelConfig()
    )


class NotificationFilters(BaseModel):
    """Schema for notification filters"""

    types: List[str] = Field(default_factory=list, description="Alert types to receive")
    severities: List[str] = Field(
        default_factory=list, description="Severity levels to receive"
    )
    asset_types: Optional[List[str]] = Field(
        default_factory=list, description="Asset types to receive notifications for"
    )
    site_ids: Optional[List[str]] = Field(
        default_factory=list, description="Site IDs to receive notifications for"
    )

    @validator("severities")
    def validate_severities(cls, v):
        allowed_severities = ["low", "medium", "high", "critical"]
        for severity in v:
            if severity not in allowed_severities:
                raise ValueError(
                    f'Severity must be one of: {", ".join(allowed_severities)}'
                )
        return v


class QuietHours(BaseModel):
    """Schema for quiet hours configuration"""

    enabled: bool = Field(default=False, description="Whether quiet hours are enabled")
    start: str = Field(default="22:00", description="Start time in HH:MM format")
    end: str = Field(default="08:00", description="End time in HH:MM format")
    timezone: str = Field(default="UTC", description="Timezone for quiet hours")
    exclude_critical: bool = Field(
        default=True,
        description="Whether to exclude critical alerts during quiet hours",
    )

    @validator("start", "end")
    def validate_time_format(cls, v):
        try:
            datetime.strptime(v, "%H:%M")
        except ValueError:
            raise ValueError("Time must be in HH:MM format")
        return v


class NotificationFrequency(BaseModel):
    """Schema for notification frequency limits"""

    max_per_hour: int = Field(
        default=10, ge=1, le=100, description="Maximum notifications per hour"
    )
    max_per_day: int = Field(
        default=50, ge=1, le=1000, description="Maximum notifications per day"
    )
    digest_mode: bool = Field(
        default=False, description="Whether to group notifications into digests"
    )


class NotificationConfigBase(BaseModel):
    """Base notification configuration schema"""

    level: str = Field(..., description="Configuration level")
    entity_id: Optional[UUID] = Field(
        None, description="Entity ID for the configuration"
    )
    entity_name: Optional[str] = Field(None, description="Entity name")
    channels: NotificationChannels = Field(
        default_factory=NotificationChannels, description="Channel configurations"
    )
    filters: NotificationFilters = Field(
        default_factory=NotificationFilters, description="Notification filters"
    )
    quiet_hours: QuietHours = Field(
        default_factory=QuietHours, description="Quiet hours configuration"
    )
    frequency: NotificationFrequency = Field(
        default_factory=NotificationFrequency, description="Frequency limits"
    )
    is_override: bool = Field(
        default=False, description="Whether this overrides parent configurations"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Additional metadata"
    )

    @validator("level")
    def validate_level(cls, v):
        allowed_levels = ["user", "site", "asset", "global"]
        if v not in allowed_levels:
            raise ValueError(f'Level must be one of: {", ".join(allowed_levels)}')
        return v


class NotificationConfigCreate(NotificationConfigBase):
    """Schema for creating a notification configuration"""

    pass


class NotificationConfigUpdate(BaseModel):
    """Schema for updating a notification configuration"""

    entity_name: Optional[str] = None
    channels: Optional[NotificationChannels] = None
    filters: Optional[NotificationFilters] = None
    quiet_hours: Optional[QuietHours] = None
    frequency: Optional[NotificationFrequency] = None
    is_override: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None


class NotificationConfigResponse(NotificationConfigBase):
    """Schema for notification configuration response"""

    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationLogBase(BaseModel):
    """Base notification log schema"""

    notification_type: str = Field(..., description="Type of notification")
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Notification message")
    severity: Optional[str] = Field(None, description="Notification severity")
    channel: str = Field(..., description="Delivery channel")
    recipient_email: Optional[str] = Field(None, description="Recipient email")
    recipient_phone: Optional[str] = Field(None, description="Recipient phone")
    related_entity_type: Optional[str] = Field(None, description="Related entity type")
    related_entity_id: Optional[UUID] = Field(None, description="Related entity ID")
    related_entity_name: Optional[str] = Field(None, description="Related entity name")
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Additional metadata"
    )


class NotificationLogResponse(NotificationLogBase):
    """Schema for notification log response"""

    id: UUID
    recipient_user_id: Optional[UUID] = None
    recipient_name: Optional[str] = None
    delivery_status: str
    delivery_attempts: int
    last_delivery_attempt: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None
    failure_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationTemplateBase(BaseModel):
    """Base notification template schema"""

    name: str = Field(..., description="Template name")
    description: Optional[str] = Field(None, description="Template description")
    template_type: str = Field(..., description="Template type")
    channel: str = Field(..., description="Template channel")
    subject_template: Optional[str] = Field(
        None, description="Subject template (for email)"
    )
    body_template: str = Field(..., description="Body template")
    variables: List[str] = Field(default_factory=list, description="Template variables")
    is_active: bool = Field(default=True, description="Whether template is active")
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Additional metadata"
    )

    @validator("template_type")
    def validate_template_type(cls, v):
        allowed_types = [
            "alert",
            "reminder",
            "system",
            "report",
            "maintenance",
            "compliance",
        ]
        if v not in allowed_types:
            raise ValueError(
                f'Template type must be one of: {", ".join(allowed_types)}'
            )
        return v

    @validator("channel")
    def validate_channel(cls, v):
        allowed_channels = ["email", "sms", "push", "webhook"]
        if v not in allowed_channels:
            raise ValueError(f'Channel must be one of: {", ".join(allowed_channels)}')
        return v


class NotificationTemplateCreate(NotificationTemplateBase):
    """Schema for creating a notification template"""

    pass


class NotificationTemplateUpdate(BaseModel):
    """Schema for updating a notification template"""

    name: Optional[str] = None
    description: Optional[str] = None
    subject_template: Optional[str] = None
    body_template: Optional[str] = None
    variables: Optional[List[str]] = None
    is_active: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None


class NotificationTemplateResponse(NotificationTemplateBase):
    """Schema for notification template response"""

    id: UUID
    organization_id: UUID
    is_system_template: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationTestRequest(BaseModel):
    """Schema for testing notification configuration"""

    channel: str = Field(..., description="Channel to test")
    recipient: str = Field(..., description="Recipient address (email, phone, etc.)")
    template_id: Optional[UUID] = Field(None, description="Template to use for test")
    custom_message: Optional[str] = Field(None, description="Custom test message")

    @validator("channel")
    def validate_channel(cls, v):
        allowed_channels = ["email", "sms", "push", "webhook"]
        if v not in allowed_channels:
            raise ValueError(f'Channel must be one of: {", ".join(allowed_channels)}')
        return v


class NotificationTestResponse(BaseModel):
    """Schema for notification test response"""

    success: bool = Field(..., description="Whether test was successful")
    message: str = Field(..., description="Test result message")
    delivery_id: Optional[str] = Field(None, description="Delivery ID if successful")


class NotificationStats(BaseModel):
    """Schema for notification statistics"""

    total_notifications: int
    notifications_by_channel: Dict[str, int]
    notifications_by_status: Dict[str, int]
    notifications_by_type: Dict[str, int]
    delivery_success_rate: Optional[float] = None
    avg_delivery_time_seconds: Optional[float] = None
    failed_notifications: int
    pending_notifications: int
