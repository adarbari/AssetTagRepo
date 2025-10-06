"""
WebSocket API endpoints for real-time communication
"""
import json
import logging
from typing import Any, Dict, Optional

from fastapi import (APIRouter, Depends, HTTPException, Query, WebSocket,
                     WebSocketDisconnect)

from modules.websocket.connection_manager import manager
from modules.websocket.handlers import (AlertHandler, DashboardHandler,
                                        GeofenceHandler, LocationHandler,
                                        SystemHandler)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws/locations")
async def websocket_locations(
    websocket: WebSocket,
    asset_ids: Optional[str] = Query(None, description="Comma-separated asset IDs to filter"),
    site_ids: Optional[str] = Query(None, description="Comma-separated site IDs to filter"),
):
    """WebSocket endpoint for real-time location updates"""
    # Parse filters
    filters = {}
    if asset_ids:
        filters["asset_ids"] = asset_ids.split(",")
    if site_ids:
        filters["site_ids"] = site_ids.split(",")

    await manager.connect(websocket, "locations", filters)

    try:
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            await manager.handle_client_message(websocket, data)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Location WebSocket disconnected")
    except Exception as e:
        logger.error(f"Error in location WebSocket: {e}")
        manager.disconnect(websocket)


@router.websocket("/ws/alerts")
async def websocket_alerts(
    websocket: WebSocket,
    alert_types: Optional[str] = Query(None, description="Comma-separated alert types to filter"),
    severity_levels: Optional[str] = Query(None, description="Comma-separated severity levels to filter"),
    asset_ids: Optional[str] = Query(None, description="Comma-separated asset IDs to filter"),
):
    """WebSocket endpoint for real-time alert notifications"""
    # Parse filters
    filters = {}
    if alert_types:
        filters["alert_types"] = alert_types.split(",")
    if severity_levels:
        filters["severity_levels"] = severity_levels.split(",")
    if asset_ids:
        filters["asset_ids"] = asset_ids.split(",")

    await manager.connect(websocket, "alerts", filters)

    try:
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            await manager.handle_client_message(websocket, data)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Alert WebSocket disconnected")
    except Exception as e:
        logger.error(f"Error in alert WebSocket: {e}")
        manager.disconnect(websocket)


@router.websocket("/ws/geofences")
async def websocket_geofences(
    websocket: WebSocket,
    geofence_ids: Optional[str] = Query(None, description="Comma-separated geofence IDs to filter"),
    asset_ids: Optional[str] = Query(None, description="Comma-separated asset IDs to filter"),
    event_types: Optional[str] = Query(None, description="Comma-separated event types (entry,exit) to filter"),
):
    """WebSocket endpoint for real-time geofence events"""
    # Parse filters
    filters = {}
    if geofence_ids:
        filters["geofence_ids"] = geofence_ids.split(",")
    if asset_ids:
        filters["asset_ids"] = asset_ids.split(",")
    if event_types:
        filters["event_types"] = event_types.split(",")

    await manager.connect(websocket, "geofences", filters)

    try:
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            await manager.handle_client_message(websocket, data)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Geofence WebSocket disconnected")
    except Exception as e:
        logger.error(f"Error in geofence WebSocket: {e}")
        manager.disconnect(websocket)


@router.websocket("/ws/dashboard")
async def websocket_dashboard(
    websocket: WebSocket,
    metrics: Optional[str] = Query(None, description="Comma-separated metric names to filter"),
    refresh_interval: Optional[int] = Query(30, description="Refresh interval in seconds"),
):
    """WebSocket endpoint for real-time dashboard metrics"""
    # Parse filters
    filters = {}
    if metrics:
        filters["metrics"] = metrics.split(",")
    filters["refresh_interval"] = refresh_interval

    await manager.connect(websocket, "dashboard", filters)

    try:
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            await manager.handle_client_message(websocket, data)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Dashboard WebSocket disconnected")
    except Exception as e:
        logger.error(f"Error in dashboard WebSocket: {e}")
        manager.disconnect(websocket)


@router.get("/ws/stats")
async def get_websocket_stats():
    """Get WebSocket connection statistics"""
    return manager.get_connection_stats()


@router.post("/ws/broadcast/location")
async def broadcast_location_update(
    asset_id: str, latitude: float, longitude: float, additional_data: Optional[Dict[str, Any]] = None
):
    """Manually broadcast a location update (for testing)"""
    try:
        await LocationHandler.broadcast_location_update(asset_id, latitude, longitude, additional_data)
        return {"message": "Location update broadcasted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error broadcasting location update: {str(e)}")


@router.post("/ws/broadcast/alert")
async def broadcast_alert_update(
    alert_id: str,
    alert_type: str,
    severity: str,
    asset_id: Optional[str] = None,
    message: str = "",
    additional_data: Optional[Dict[str, Any]] = None,
):
    """Manually broadcast an alert (for testing)"""
    try:
        await AlertHandler.broadcast_alert(alert_id, alert_type, severity, asset_id, message, additional_data)
        return {"message": "Alert broadcasted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error broadcasting alert: {str(e)}")


@router.post("/ws/broadcast/geofence")
async def broadcast_geofence_event(
    asset_id: str,
    geofence_id: str,
    event_type: str,
    latitude: float,
    longitude: float,
    additional_data: Optional[Dict[str, Any]] = None,
):
    """Manually broadcast a geofence event (for testing)"""
    try:
        await GeofenceHandler.broadcast_geofence_event(asset_id, geofence_id, event_type, latitude, longitude, additional_data)
        return {"message": "Geofence event broadcasted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error broadcasting geofence event: {str(e)}")


@router.post("/ws/broadcast/metric")
async def broadcast_metric_update(
    metric_name: str, value: Any, unit: Optional[str] = None, additional_data: Optional[Dict[str, Any]] = None
):
    """Manually broadcast a metric update (for testing)"""
    try:
        await DashboardHandler.broadcast_metric_update(metric_name, value, unit, additional_data)
        return {"message": "Metric update broadcasted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error broadcasting metric update: {str(e)}")


@router.post("/ws/broadcast/maintenance")
async def broadcast_maintenance_notification(
    asset_id: Optional[str] = None,
    maintenance_type: str = "scheduled",
    message: str = "",
    scheduled_time: Optional[str] = None,
):
    """Manually broadcast a maintenance notification (for testing)"""
    try:
        from datetime import datetime

        scheduled_dt = None
        if scheduled_time:
            scheduled_dt = datetime.fromisoformat(scheduled_time)

        await SystemHandler.broadcast_maintenance_notification(asset_id, maintenance_type, message, scheduled_dt)
        return {"message": "Maintenance notification broadcasted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error broadcasting maintenance notification: {str(e)}")


@router.post("/ws/broadcast/job")
async def broadcast_job_update(job_id: str, status: str, message: str = "", additional_data: Optional[Dict[str, Any]] = None):
    """Manually broadcast a job update (for testing)"""
    try:
        await SystemHandler.broadcast_job_update(job_id, status, message, additional_data)
        return {"message": "Job update broadcasted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error broadcasting job update: {str(e)}")


@router.post("/ws/broadcast/compliance")
async def broadcast_compliance_reminder(compliance_id: str, compliance_type: str, due_date: str, message: str = ""):
    """Manually broadcast a compliance reminder (for testing)"""
    try:
        from datetime import datetime

        due_dt = datetime.fromisoformat(due_date)

        await SystemHandler.broadcast_compliance_reminder(compliance_id, compliance_type, due_dt, message)
        return {"message": "Compliance reminder broadcasted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error broadcasting compliance reminder: {str(e)}")
