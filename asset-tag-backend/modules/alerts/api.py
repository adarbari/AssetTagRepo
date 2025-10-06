"""
Alert API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List, Optional
import json
from datetime import datetime

from config.database import get_db
from modules.alerts.models import Alert
from modules.alerts.schemas import AlertCreate, AlertUpdate, AlertResponse

router = APIRouter()

# WebSocket connection manager for alerts
class AlertConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_alert_update(self, alert_data: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(alert_data))
            except:
                # Remove broken connections
                self.active_connections.remove(connection)

alert_manager = AlertConnectionManager()


@router.get("/alerts", response_model=List[AlertResponse])
async def get_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    alert_type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    asset_id: Optional[str] = None,
    geofence_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get list of alerts with optional filtering"""
    try:
        query = select(Alert)
        
        # Apply filters
        if alert_type:
            query = query.where(Alert.alert_type == alert_type)
        if severity:
            query = query.where(Alert.severity == severity)
        if status:
            query = query.where(Alert.status == status)
        if asset_id:
            query = query.where(Alert.asset_id == asset_id)
        if geofence_id:
            query = query.where(Alert.geofence_id == geofence_id)
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        alerts = result.scalars().all()
        
        return [AlertResponse.from_orm(alert) for alert in alerts]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")


@router.get("/alerts/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get alert by ID"""
    try:
        result = await db.execute(select(Alert).where(Alert.id == alert_id))
        alert = result.scalar_one_or_none()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return AlertResponse.from_orm(alert)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alert: {str(e)}")


@router.post("/alerts", response_model=AlertResponse)
async def create_alert(
    alert_data: AlertCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new alert"""
    try:
        alert = Alert(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org for now
            alert_type=alert_data.alert_type,
            severity=alert_data.severity,
            status=alert_data.status or "active",
            asset_id=alert_data.asset_id,
            asset_name=alert_data.asset_name,
            message=alert_data.message,
            description=alert_data.description,
            reason=alert_data.reason,
            suggested_action=alert_data.suggested_action,
            location_description=alert_data.location_description,
            latitude=alert_data.latitude,
            longitude=alert_data.longitude,
            geofence_id=alert_data.geofence_id,
            geofence_name=alert_data.geofence_name,
            triggered_at=datetime.fromisoformat(alert_data.triggered_at.replace('Z', '+00:00')),
            auto_resolvable=alert_data.auto_resolvable or False,
            metadata=alert_data.metadata or {}
        )
        
        db.add(alert)
        await db.commit()
        await db.refresh(alert)
        
        # Send real-time update via WebSocket
        await alert_manager.send_alert_update({
            "type": "new_alert",
            "alert": AlertResponse.from_orm(alert).dict()
        })
        
        return AlertResponse.from_orm(alert)
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating alert: {str(e)}")


@router.patch("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Acknowledge an alert"""
    try:
        result = await db.execute(select(Alert).where(Alert.id == alert_id))
        alert = result.scalar_one_or_none()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        alert.status = "acknowledged"
        alert.acknowledged_at = datetime.now()
        
        await db.commit()
        await db.refresh(alert)
        
        # Send real-time update via WebSocket
        await alert_manager.send_alert_update({
            "type": "alert_acknowledged",
            "alert": AlertResponse.from_orm(alert).dict()
        })
        
        return AlertResponse.from_orm(alert)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error acknowledging alert: {str(e)}")


@router.patch("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    resolution_notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Resolve an alert"""
    try:
        result = await db.execute(select(Alert).where(Alert.id == alert_id))
        alert = result.scalar_one_or_none()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        alert.status = "resolved"
        alert.resolved_at = datetime.now()
        if resolution_notes:
            alert.resolution_notes = resolution_notes
        
        await db.commit()
        await db.refresh(alert)
        
        # Send real-time update via WebSocket
        await alert_manager.send_alert_update({
            "type": "alert_resolved",
            "alert": AlertResponse.from_orm(alert).dict()
        })
        
        return AlertResponse.from_orm(alert)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error resolving alert: {str(e)}")


@router.get("/alerts/statistics")
async def get_alert_stats(
    db: AsyncSession = Depends(get_db)
):
    """Get alert statistics summary"""
    try:
        # Get counts by status
        active_count = await db.execute(
            select(Alert).where(Alert.status == "active")
        )
        active_alerts = active_count.scalars().all()
        
        acknowledged_count = await db.execute(
            select(Alert).where(Alert.status == "acknowledged")
        )
        acknowledged_alerts = acknowledged_count.scalars().all()
        
        resolved_count = await db.execute(
            select(Alert).where(Alert.status == "resolved")
        )
        resolved_alerts = resolved_count.scalars().all()
        
        # Get counts by severity
        critical_count = await db.execute(
            select(Alert).where(Alert.severity == "critical")
        )
        critical_alerts = critical_count.scalars().all()
        
        warning_count = await db.execute(
            select(Alert).where(Alert.severity == "warning")
        )
        warning_alerts = warning_count.scalars().all()
        
        return {
            "by_status": {
                "active": len(active_alerts),
                "acknowledged": len(acknowledged_alerts),
                "resolved": len(resolved_alerts)
            },
            "by_severity": {
                "critical": len(critical_alerts),
                "warning": len(warning_alerts)
            },
            "total": len(active_alerts) + len(acknowledged_alerts) + len(resolved_alerts)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alert stats: {str(e)}")


@router.websocket("/ws/alerts")
async def websocket_alert_updates(websocket: WebSocket):
    """WebSocket for real-time alert updates"""
    await alert_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle any incoming messages
            data = await websocket.receive_text()
            # Echo back any received data (could be used for commands)
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        alert_manager.disconnect(websocket)
