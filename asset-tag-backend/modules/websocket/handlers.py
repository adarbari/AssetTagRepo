"""
WebSocket message handlers for different data types
"""

import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, Optional

from modules.websocket.connection_manager import manager

logger = logging.getLogger(__name__)


class LocationHandler:
    """Handler for location update messages"""

    @staticmethod
    async def broadcast_location_update(
        asset_id: str,
        latitude: float,
        longitude: float,
        additional_data: Optional[Dict[str, Any]] = None,
    ):
        """Broadcast location update to all location subscribers"""
        message = {
            "type": "location_update",
            "asset_id": asset_id,
            "latitude": latitude,
            "longitude": longitude,
            "timestamp": datetime.now().isoformat(),
            "data": additional_data or {},
        }

        await manager.broadcast_to_type(message, "locations")
        logger.debug(f"Broadcasted location update for asset {asset_id}")

    @staticmethod
    async def broadcast_location_batch(updates: list):
        """Broadcast multiple location updates in a batch"""
        message = {
            "type": "location_batch",
            "updates": updates,
            "timestamp": datetime.now().isoformat(),
        }

        await manager.broadcast_to_type(message, "locations")
        logger.debug(f"Broadcasted {len(updates)} location updates")


class AlertHandler:
    """Handler for alert messages"""

    @staticmethod
    async def broadcast_alert(
        alert_id: str,
        alert_type: str,
        severity: str,
        asset_id: Optional[str] = None,
        message: str = "",
        additional_data: Optional[Dict[str, Any]] = None,
    ):
        """Broadcast alert to all alert subscribers"""
        alert_message = {
            "type": "alert",
            "alert_id": alert_id,
            "alert_type": alert_type,
            "severity": severity,
            "asset_id": asset_id,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "data": additional_data or {},
        }

        await manager.broadcast_to_type(alert_message, "alerts")
        logger.info(f"Broadcasted alert {alert_id} of type {alert_type}")

    @staticmethod
    async def broadcast_alert_resolved(
        alert_id: str,
        resolved_by: Optional[str] = None,
        resolution_notes: Optional[str] = None,
    ):
        """Broadcast alert resolution"""
        message = {
            "type": "alert_resolved",
            "alert_id": alert_id,
            "resolved_by": resolved_by,
            "resolution_notes": resolution_notes,
            "timestamp": datetime.now().isoformat(),
        }

        await manager.broadcast_to_type(message, "alerts")
        logger.info(f"Broadcasted alert resolution for {alert_id}")


class GeofenceHandler:
    """Handler for geofence event messages"""

    @staticmethod
    async def broadcast_geofence_event(
        asset_id: str,
        geofence_id: str,
        event_type: str,
        latitude: float,
        longitude: float,
        additional_data: Optional[Dict[str, Any]] = None,
    ):
        """Broadcast geofence event (entry/exit)"""
        message = {
            "type": "geofence_event",
            "asset_id": asset_id,
            "geofence_id": geofence_id,
            "event_type": event_type,  # "entry" or "exit"
            "latitude": latitude,
            "longitude": longitude,
            "timestamp": datetime.now().isoformat(),
            "data": additional_data or {},
        }

        await manager.broadcast_to_type(message, "geofences")
        logger.info(
            f"Broadcasted geofence {event_type} for asset {asset_id} in geofence {geofence_id}"
        )

    @staticmethod
    async def broadcast_geofence_violation(
        asset_id: str,
        geofence_id: str,
        violation_type: str,
        message: str,
        additional_data: Optional[Dict[str, Any]] = None,
    ):
        """Broadcast geofence violation"""
        violation_message = {
            "type": "geofence_violation",
            "asset_id": asset_id,
            "geofence_id": geofence_id,
            "violation_type": violation_type,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "data": additional_data or {},
        }

        await manager.broadcast_to_type(violation_message, "geofences")
        logger.warning(f"Broadcasted geofence violation for asset {asset_id}")


class DashboardHandler:
    """Handler for dashboard metric messages"""

    @staticmethod
    async def broadcast_metric_update(
        metric_name: str,
        value: Any,
        unit: Optional[str] = None,
        additional_data: Optional[Dict[str, Any]] = None,
    ):
        """Broadcast metric update to dashboard subscribers"""
        message = {
            "type": "metric_update",
            "metric_name": metric_name,
            "value": value,
            "unit": unit,
            "timestamp": datetime.now().isoformat(),
            "data": additional_data or {},
        }

        await manager.broadcast_to_type(message, "dashboard")
        logger.debug(f"Broadcasted metric update: {metric_name} = {value}")

    @staticmethod
    async def broadcast_dashboard_summary(summary_data: Dict[str, Any]):
        """Broadcast dashboard summary data"""
        message = {
            "type": "dashboard_summary",
            "summary": summary_data,
            "timestamp": datetime.now().isoformat(),
        }

        await manager.broadcast_to_type(message, "dashboard")
        logger.debug("Broadcasted dashboard summary")

    @staticmethod
    async def broadcast_system_status(
        status: str, message: str = "", additional_data: Optional[Dict[str, Any]] = None
    ):
        """Broadcast system status update"""
        status_message = {
            "type": "system_status",
            "status": status,  # "healthy", "warning", "error"
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "data": additional_data or {},
        }

        await manager.broadcast_to_type(status_message, "dashboard")
        logger.info(f"Broadcasted system status: {status}")


class SystemHandler:
    """Handler for system-wide messages"""

    @staticmethod
    async def broadcast_maintenance_notification(
        asset_id: Optional[str] = None,
        maintenance_type: str = "scheduled",
        message: str = "",
        scheduled_time: Optional[datetime] = None,
    ):
        """Broadcast maintenance notification"""
        notification = {
            "type": "maintenance_notification",
            "asset_id": asset_id,
            "maintenance_type": maintenance_type,
            "message": message,
            "scheduled_time": scheduled_time.isoformat() if scheduled_time else None,
            "timestamp": datetime.now().isoformat(),
        }

        await manager.broadcast_to_all(notification)
        logger.info(f"Broadcasted maintenance notification: {message}")

    @staticmethod
    async def broadcast_job_update(
        job_id: str,
        status: str,
        message: str = "",
        additional_data: Optional[Dict[str, Any]] = None,
    ):
        """Broadcast job status update"""
        job_message = {
            "type": "job_update",
            "job_id": job_id,
            "status": status,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "data": additional_data or {},
        }

        await manager.broadcast_to_all(job_message)
        logger.info(f"Broadcasted job update: {job_id} - {status}")

    @staticmethod
    async def broadcast_compliance_reminder(
        compliance_id: str, compliance_type: str, due_date: datetime, message: str = ""
    ):
        """Broadcast compliance reminder"""
        reminder = {
            "type": "compliance_reminder",
            "compliance_id": compliance_id,
            "compliance_type": compliance_type,
            "due_date": due_date.isoformat(),
            "message": message,
            "timestamp": datetime.now().isoformat(),
        }

        await manager.broadcast_to_all(reminder)
        logger.info(f"Broadcasted compliance reminder: {compliance_id}")


# Convenience functions for easy access
async def broadcast_location_update(
    asset_id: str,
    latitude: float,
    longitude: float,
    additional_data: Optional[Dict[str, Any]] = None,
):
    """Convenience function for broadcasting location updates"""
    await LocationHandler.broadcast_location_update(
        asset_id, latitude, longitude, additional_data
    )


async def broadcast_alert(
    alert_id: str,
    alert_type: str,
    severity: str,
    asset_id: Optional[str] = None,
    message: str = "",
    additional_data: Optional[Dict[str, Any]] = None,
):
    """Convenience function for broadcasting alerts"""
    await AlertHandler.broadcast_alert(
        alert_id, alert_type, severity, asset_id, message, additional_data
    )


async def broadcast_geofence_event(
    asset_id: str,
    geofence_id: str,
    event_type: str,
    latitude: float,
    longitude: float,
    additional_data: Optional[Dict[str, Any]] = None,
):
    """Convenience function for broadcasting geofence events"""
    await GeofenceHandler.broadcast_geofence_event(
        asset_id, geofence_id, event_type, latitude, longitude, additional_data
    )


async def broadcast_metric_update(
    metric_name: str,
    value: Any,
    unit: Optional[str] = None,
    additional_data: Optional[Dict[str, Any]] = None,
):
    """Convenience function for broadcasting metric updates"""
    await DashboardHandler.broadcast_metric_update(
        metric_name, value, unit, additional_data
    )
