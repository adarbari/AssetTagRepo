"""
Notification API endpoints
"""
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from config.database import get_db
from modules.notifications.models import (NotificationConfig, NotificationLog,
                                          NotificationTemplate)
from modules.notifications.schemas import (NotificationConfigCreate,
                                           NotificationConfigResponse,
                                           NotificationConfigUpdate,
                                           NotificationLogResponse,
                                           NotificationStats,
                                           NotificationTemplateCreate,
                                           NotificationTemplateResponse,
                                           NotificationTemplateUpdate,
                                           NotificationTestRequest,
                                           NotificationTestResponse)

router = APIRouter()


@router.get("/notifications/configs", response_model=List[NotificationConfigResponse])
async def get_notification_configs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    level: Optional[str] = None,
    entity_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get list of notification configurations"""
    try:
        query = select(NotificationConfig).where(NotificationConfig.deleted_at.is_(None))

        # Apply filters
        if level:
            query = query.where(NotificationConfig.level == level)
        if entity_id:
            query = query.where(NotificationConfig.entity_id == entity_id)

        # Apply pagination
        query = query.order_by(NotificationConfig.created_at.desc()).offset(skip).limit(limit)

        result = await db.execute(query)
        configs = result.scalars().all()

        return [NotificationConfigResponse.from_orm(config) for config in configs]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notification configs: {str(e)}")


@router.get("/notifications/configs/{level}/{entity_id}", response_model=NotificationConfigResponse)
async def get_notification_config(level: str, entity_id: str, db: AsyncSession = Depends(get_db)):
    """Get specific notification configuration"""
    try:
        result = await db.execute(
            select(NotificationConfig).where(
                and_(
                    NotificationConfig.level == level,
                    NotificationConfig.entity_id == entity_id,
                    NotificationConfig.deleted_at.is_(None),
                )
            )
        )
        config = result.scalar_one_or_none()

        if not config:
            raise HTTPException(status_code=404, detail="Notification configuration not found")

        return NotificationConfigResponse.from_orm(config)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notification config: {str(e)}")


@router.post("/notifications/configs", response_model=NotificationConfigResponse)
async def create_notification_config(config_data: NotificationConfigCreate, db: AsyncSession = Depends(get_db)):
    """Create a new notification configuration"""
    try:
        # Check if config already exists for this level/entity
        if config_data.entity_id:
            existing = await db.execute(
                select(NotificationConfig).where(
                    and_(
                        NotificationConfig.level == config_data.level,
                        NotificationConfig.entity_id == config_data.entity_id,
                        NotificationConfig.deleted_at.is_(None),
                    )
                )
            )
            if existing.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Configuration already exists for this entity")

        # Create new configuration
        config = NotificationConfig(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org for now
            level=config_data.level,
            entity_id=config_data.entity_id,
            entity_name=config_data.entity_name,
            email_enabled=config_data.channels.email.enabled,
            email_addresses=config_data.channels.email.addresses or [],
            email_verified=config_data.channels.email.verified,
            sms_enabled=config_data.channels.sms.enabled,
            sms_phone_numbers=config_data.channels.sms.addresses or [],
            sms_verified=config_data.channels.sms.verified,
            push_enabled=config_data.channels.push.enabled,
            push_devices=config_data.channels.push.addresses or [],
            push_verified=config_data.channels.push.verified,
            webhook_enabled=config_data.channels.webhook.enabled,
            webhook_endpoints=config_data.channels.webhook.addresses or [],
            webhook_verified=config_data.channels.webhook.verified,
            alert_types=config_data.filters.types or [],
            severity_levels=config_data.filters.severities or [],
            asset_types=config_data.filters.asset_types or [],
            site_ids=config_data.filters.site_ids or [],
            quiet_hours_enabled=config_data.quiet_hours.enabled,
            quiet_hours_start=config_data.quiet_hours.start,
            quiet_hours_end=config_data.quiet_hours.end,
            quiet_hours_timezone=config_data.quiet_hours.timezone,
            quiet_hours_exclude_critical=config_data.quiet_hours.exclude_critical,
            max_notifications_per_hour=config_data.frequency.max_per_hour,
            max_notifications_per_day=config_data.frequency.max_per_day,
            digest_mode=config_data.frequency.digest_mode,
            is_override=config_data.is_override,
            metadata=config_data.metadata or {},
        )

        db.add(config)
        await db.commit()
        await db.refresh(config)

        return NotificationConfigResponse.from_orm(config)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating notification config: {str(e)}")


@router.put("/notifications/configs/{config_id}", response_model=NotificationConfigResponse)
async def update_notification_config(
    config_id: str, config_data: NotificationConfigUpdate, db: AsyncSession = Depends(get_db)
):
    """Update an existing notification configuration"""
    try:
        result = await db.execute(
            select(NotificationConfig).where(and_(NotificationConfig.id == config_id, NotificationConfig.deleted_at.is_(None)))
        )
        config = result.scalar_one_or_none()

        if not config:
            raise HTTPException(status_code=404, detail="Notification configuration not found")

        # Update fields
        update_data = config_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field == "channels" and value:
                # Update channel-specific fields
                config.email_enabled = value.email.enabled
                config.email_addresses = value.email.addresses or []
                config.email_verified = value.email.verified
                config.sms_enabled = value.sms.enabled
                config.sms_phone_numbers = value.sms.addresses or []
                config.sms_verified = value.sms.verified
                config.push_enabled = value.push.enabled
                config.push_devices = value.push.addresses or []
                config.push_verified = value.push.verified
                config.webhook_enabled = value.webhook.enabled
                config.webhook_endpoints = value.webhook.addresses or []
                config.webhook_verified = value.webhook.verified
            elif field == "filters" and value:
                # Update filter fields
                config.alert_types = value.types or []
                config.severity_levels = value.severities or []
                config.asset_types = value.asset_types or []
                config.site_ids = value.site_ids or []
            elif field == "quiet_hours" and value:
                # Update quiet hours fields
                config.quiet_hours_enabled = value.enabled
                config.quiet_hours_start = value.start
                config.quiet_hours_end = value.end
                config.quiet_hours_timezone = value.timezone
                config.quiet_hours_exclude_critical = value.exclude_critical
            elif field == "frequency" and value:
                # Update frequency fields
                config.max_notifications_per_hour = value.max_per_hour
                config.max_notifications_per_day = value.max_per_day
                config.digest_mode = value.digest_mode
            else:
                setattr(config, field, value)

        await db.commit()
        await db.refresh(config)

        return NotificationConfigResponse.from_orm(config)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating notification config: {str(e)}")


@router.delete("/notifications/configs/{config_id}")
async def delete_notification_config(config_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a notification configuration (soft delete)"""
    try:
        result = await db.execute(
            select(NotificationConfig).where(and_(NotificationConfig.id == config_id, NotificationConfig.deleted_at.is_(None)))
        )
        config = result.scalar_one_or_none()

        if not config:
            raise HTTPException(status_code=404, detail="Notification configuration not found")

        # Soft delete
        config.deleted_at = datetime.now()
        await db.commit()

        return {"message": "Notification configuration deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting notification config: {str(e)}")


@router.get("/notifications", response_model=List[NotificationLogResponse])
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    recipient_user_id: Optional[str] = None,
    notification_type: Optional[str] = None,
    channel: Optional[str] = None,
    delivery_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get list of notifications"""
    try:
        query = select(NotificationLog)

        # Apply filters
        if recipient_user_id:
            query = query.where(NotificationLog.recipient_user_id == recipient_user_id)
        if notification_type:
            query = query.where(NotificationLog.notification_type == notification_type)
        if channel:
            query = query.where(NotificationLog.channel == channel)
        if delivery_status:
            query = query.where(NotificationLog.delivery_status == delivery_status)

        # Apply pagination
        query = query.order_by(NotificationLog.created_at.desc()).offset(skip).limit(limit)

        result = await db.execute(query)
        notifications = result.scalars().all()

        return [NotificationLogResponse.from_orm(notification) for notification in notifications]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notifications: {str(e)}")


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, db: AsyncSession = Depends(get_db)):
    """Mark a notification as read"""
    try:
        result = await db.execute(select(NotificationLog).where(NotificationLog.id == notification_id))
        notification = result.scalar_one_or_none()

        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")

        # Update delivery status
        notification.delivery_status = "delivered"
        notification.delivered_at = datetime.now()

        await db.commit()

        return {"message": "Notification marked as read"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error marking notification as read: {str(e)}")


@router.post("/notifications/test", response_model=NotificationTestResponse)
async def test_notification(test_data: NotificationTestRequest, db: AsyncSession = Depends(get_db)):
    """Test notification configuration"""
    try:
        # TODO: Implement actual notification testing
        # This is a placeholder implementation

        # Simulate test notification
        test_id = str(uuid.uuid4())

        # Create test notification log
        test_notification = NotificationLog(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org
            notification_type="test",
            title="Test Notification",
            message=test_data.custom_message or "This is a test notification",
            channel=test_data.channel,
            recipient_email=test_data.recipient if test_data.channel == "email" else None,
            recipient_phone=test_data.recipient if test_data.channel == "sms" else None,
            delivery_status="sent",
            delivered_at=datetime.now(),
        )

        db.add(test_notification)
        await db.commit()

        return NotificationTestResponse(
            success=True, message=f"Test notification sent successfully via {test_data.channel}", delivery_id=test_id
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error testing notification: {str(e)}")


@router.get("/notifications/stats", response_model=NotificationStats)
async def get_notification_stats(db: AsyncSession = Depends(get_db)):
    """Get notification statistics"""
    try:
        # Get total notifications
        total_result = await db.execute(select(func.count(NotificationLog.id)))
        total_notifications = total_result.scalar()

        # Get notifications by channel
        channel_result = await db.execute(
            select(NotificationLog.channel, func.count(NotificationLog.id)).group_by(NotificationLog.channel)
        )
        notifications_by_channel = {row[0]: row[1] for row in channel_result.fetchall()}

        # Get notifications by status
        status_result = await db.execute(
            select(NotificationLog.delivery_status, func.count(NotificationLog.id)).group_by(NotificationLog.delivery_status)
        )
        notifications_by_status = {row[0]: row[1] for row in status_result.fetchall()}

        # Get notifications by type
        type_result = await db.execute(
            select(NotificationLog.notification_type, func.count(NotificationLog.id)).group_by(
                NotificationLog.notification_type
            )
        )
        notifications_by_type = {row[0]: row[1] for row in type_result.fetchall()}

        # Calculate success rate
        delivered = notifications_by_status.get("delivered", 0)
        sent = notifications_by_status.get("sent", 0)
        success_rate = None
        if total_notifications > 0:
            success_rate = ((delivered + sent) / total_notifications) * 100

        return NotificationStats(
            total_notifications=total_notifications,
            notifications_by_channel=notifications_by_channel,
            notifications_by_status=notifications_by_status,
            notifications_by_type=notifications_by_type,
            delivery_success_rate=success_rate,
            avg_delivery_time_seconds=None,  # TODO: Calculate from delivery times
            failed_notifications=notifications_by_status.get("failed", 0),
            pending_notifications=notifications_by_status.get("pending", 0),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notification stats: {str(e)}")
