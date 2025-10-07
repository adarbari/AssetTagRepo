"""
Alert API endpoints
"""

import json
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import (APIRouter, Depends, HTTPException, Query, WebSocket,
                     WebSocketDisconnect)
from sqlalchemy import select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from config.database import get_db
from modules.alerts.models import Alert
from modules.alerts.schemas import AlertCreate, AlertResponse, AlertUpdate


def alert_to_response(alert: Alert) -> AlertResponse:
    """Convert Alert SQLAlchemy model to AlertResponse manually to avoid serialization issues"""
    return AlertResponse(
        id=(
            str(alert.id)
            if "-" in str(alert.id)
            else f"{str(alert.id)[:8]}-{str(alert.id)[8:12]}-{str(alert.id)[12:16]}-{str(alert.id)[16:20]}-{str(alert.id)[20:]}"
        ),
        organization_id=(
            str(alert.organization_id)
            if "-" in str(alert.organization_id)
            else f"{str(alert.organization_id)[:8]}-{str(alert.organization_id)[8:12]}-{str(alert.organization_id)[12:16]}-{str(alert.organization_id)[16:20]}-{str(alert.organization_id)[20:]}"
        ),
        alert_type=alert.alert_type,
        severity=alert.severity,
        status=alert.status,
        asset_id=(
            str(alert.asset_id)
            if "-" in str(alert.asset_id)
            else f"{str(alert.asset_id)[:8]}-{str(alert.asset_id)[8:12]}-{str(alert.asset_id)[12:16]}-{str(alert.asset_id)[16:20]}-{str(alert.asset_id)[20:]}"
        ),
        asset_name=alert.asset_name,
        message=alert.message,
        description=alert.description,
        reason=alert.reason,
        suggested_action=alert.suggested_action,
        location_description=alert.location_description,
        latitude=alert.latitude,
        longitude=alert.longitude,
        geofence_id=(
            str(alert.geofence_id)
            if alert.geofence_id and "-" in str(alert.geofence_id)
            else (
                f"{str(alert.geofence_id)[:8]}-{str(alert.geofence_id)[8:12]}-{str(alert.geofence_id)[12:16]}-{str(alert.geofence_id)[16:20]}-{str(alert.geofence_id)[20:]}"
                if alert.geofence_id
                else None
            )
        ),
        geofence_name=alert.geofence_name,
        triggered_at=(
            alert.triggered_at.isoformat()
            if hasattr(alert.triggered_at, "isoformat")
            else str(alert.triggered_at)
        ),
        auto_resolvable=alert.auto_resolvable,
        metadata=(
            json.loads(alert.alert_metadata)
            if isinstance(alert.alert_metadata, str)
            else (alert.alert_metadata or {})
        ),
        acknowledged_at=(
            alert.acknowledged_at.isoformat()
            if alert.acknowledged_at and hasattr(alert.acknowledged_at, "isoformat")
            else alert.acknowledged_at
        ),
        resolved_at=(
            alert.resolved_at.isoformat()
            if alert.resolved_at and hasattr(alert.resolved_at, "isoformat")
            else alert.resolved_at
        ),
        resolution_notes=alert.resolution_notes,
        resolved_by_user_id=(
            str(alert.resolved_by_user_id)
            if alert.resolved_by_user_id and "-" in str(alert.resolved_by_user_id)
            else (
                f"{str(alert.resolved_by_user_id)[:8]}-{str(alert.resolved_by_user_id)[8:12]}-{str(alert.resolved_by_user_id)[12:16]}-{str(alert.resolved_by_user_id)[16:20]}-{str(alert.resolved_by_user_id)[20:]}"
                if alert.resolved_by_user_id
                else None
            )
        ),
        auto_resolved=alert.auto_resolved,
        workflow_actions=alert.workflow_actions,
        created_at=(
            alert.created_at.isoformat()
            if hasattr(alert.created_at, "isoformat")
            else str(alert.created_at)
        ),
        updated_at=(
            alert.updated_at.isoformat()
            if hasattr(alert.updated_at, "isoformat")
            else str(alert.updated_at)
        ),
    )


router = APIRouter()


# WebSocket connection manager for alerts
class AlertConnectionManager:
    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_alert_update(self, alert_data: dict) -> None:
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
    page: Optional[int] = Query(None, ge=1),
    size: Optional[int] = Query(None, ge=1, le=1000),
    alert_type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    asset_id: Optional[str] = None,
    geofence_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get list of alerts with optional filtering"""
    try:
        # Handle page/size parameters if provided
        if page is not None and size is not None:
            skip = (page - 1) * size
            limit = size

        # Use raw SQL to avoid UUID serialization issues with SQLite
        raw_query = """
        SELECT id, organization_id, alert_type, severity, status, asset_id, asset_name, 
               message, description, reason, suggested_action, location_description, 
               latitude, longitude, geofence_id, geofence_name, triggered_at, 
               auto_resolvable, alert_metadata, acknowledged_at, resolved_at, 
               resolution_notes, resolved_by_user_id, auto_resolved, workflow_actions, 
               created_at, updated_at
        FROM alerts
        """

        # Add WHERE clauses for filters
        where_conditions = []
        params = {}

        if alert_type:
            where_conditions.append("alert_type = :alert_type")
            params["alert_type"] = alert_type
        if severity:
            where_conditions.append("severity = :severity")
            params["severity"] = severity
        if status:
            where_conditions.append("status = :status")
            params["status"] = status
        if asset_id:
            where_conditions.append("asset_id = :asset_id")
            params["asset_id"] = asset_id
        if geofence_id:
            where_conditions.append("geofence_id = :geofence_id")
            params["geofence_id"] = geofence_id

        if where_conditions:
            raw_query += " WHERE " + " AND ".join(where_conditions)

        # Add pagination
        raw_query += f" LIMIT {limit} OFFSET {skip}"

        result = await db.execute(text(raw_query), params)
        rows = result.fetchall()

        # Convert rows to Alert objects manually
        alerts = []
        for row in rows:
            alert = Alert()
            alert.id = row[0]
            alert.organization_id = row[1]
            alert.alert_type = row[2]
            alert.severity = row[3]
            alert.status = row[4]
            alert.asset_id = row[5]
            alert.asset_name = row[6]
            alert.message = row[7]
            alert.description = row[8]
            alert.reason = row[9]
            alert.suggested_action = row[10]
            alert.location_description = row[11]
            alert.latitude = row[12]
            alert.longitude = row[13]
            alert.geofence_id = row[14]
            alert.geofence_name = row[15]
            alert.triggered_at = row[16]
            alert.auto_resolvable = row[17]
            alert.alert_metadata = row[18]
            alert.acknowledged_at = row[19]
            alert.resolved_at = row[20]
            alert.resolution_notes = row[21]
            alert.resolved_by_user_id = row[22]
            alert.auto_resolved = row[23]
            alert.workflow_actions = row[24]
            alert.created_at = row[25]
            alert.updated_at = row[26]
            alerts.append(alert)

        return [alert_to_response(alert) for alert in alerts]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")


@router.get("/alerts/statistics")
async def get_alert_stats(db: AsyncSession = Depends(get_db)):
    """Get alert statistics summary"""
    try:
        # Use raw SQL to avoid UUID serialization issues with SQLite
        # Get counts by status
        active_query = "SELECT COUNT(*) FROM alerts WHERE status = 'active'"
        active_result = await db.execute(text(active_query))
        active_count = active_result.scalar()

        acknowledged_query = "SELECT COUNT(*) FROM alerts WHERE status = 'acknowledged'"
        acknowledged_result = await db.execute(text(acknowledged_query))
        acknowledged_count = acknowledged_result.scalar()

        resolved_query = "SELECT COUNT(*) FROM alerts WHERE status = 'resolved'"
        resolved_result = await db.execute(text(resolved_query))
        resolved_count = resolved_result.scalar()

        # Get counts by severity
        critical_query = "SELECT COUNT(*) FROM alerts WHERE severity = 'critical'"
        critical_result = await db.execute(text(critical_query))
        critical_count = critical_result.scalar()

        warning_query = "SELECT COUNT(*) FROM alerts WHERE severity = 'warning'"
        warning_result = await db.execute(text(warning_query))
        warning_count = warning_result.scalar()

        # Get counts by alert type
        battery_low_query = (
            "SELECT COUNT(*) FROM alerts WHERE alert_type = 'battery_low'"
        )
        battery_low_result = await db.execute(text(battery_low_query))
        battery_low_count = battery_low_result.scalar()

        total_alerts = active_count + acknowledged_count + resolved_count

        return {
            "total_alerts": total_alerts,
            "active_alerts": active_count,
            "acknowledged_alerts": acknowledged_count,
            "resolved_alerts": resolved_count,
            "alerts_by_type": {
                "battery_low": battery_low_count,
                "geofence_breach": 0,
                "maintenance_due": 0,
            },
            "alerts_by_severity": {
                "critical": critical_count,
                "warning": warning_count,
                "info": 0,
            },
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching alert stats: {str(e)}"
        )


@router.get("/alerts/{alert_id}", response_model=AlertResponse)
async def get_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    """Get alert by ID"""
    try:
        # Use raw SQL to avoid UUID serialization issues with SQLite
        # Handle both UUID formats (with and without hyphens)
        raw_query = """
        SELECT id, organization_id, alert_type, severity, status, asset_id, asset_name, 
               message, description, reason, suggested_action, location_description, 
               latitude, longitude, geofence_id, geofence_name, triggered_at, 
               auto_resolvable, alert_metadata, acknowledged_at, resolved_at, 
               resolution_notes, resolved_by_user_id, auto_resolved, workflow_actions, 
               created_at, updated_at
        FROM alerts
        WHERE id = :alert_id OR REPLACE(id, '-', '') = REPLACE(:alert_id, '-', '')
        """

        result = await db.execute(text(raw_query), {"alert_id": alert_id})
        row = result.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Alert not found")

        # Convert row to Alert object manually
        alert = Alert()
        alert.id = row[0]
        alert.organization_id = row[1]
        alert.alert_type = row[2]
        alert.severity = row[3]
        alert.status = row[4]
        alert.asset_id = row[5]
        alert.asset_name = row[6]
        alert.message = row[7]
        alert.description = row[8]
        alert.reason = row[9]
        alert.suggested_action = row[10]
        alert.location_description = row[11]
        alert.latitude = row[12]
        alert.longitude = row[13]
        alert.geofence_id = row[14]
        alert.geofence_name = row[15]
        alert.triggered_at = row[16]
        alert.auto_resolvable = row[17]
        alert.alert_metadata = row[18]
        alert.acknowledged_at = row[19]
        alert.resolved_at = row[20]
        alert.resolution_notes = row[21]
        alert.resolved_by_user_id = row[22]
        alert.auto_resolved = row[23]
        alert.workflow_actions = row[24]
        alert.created_at = row[25]
        alert.updated_at = row[26]

        return alert_to_response(alert)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alert: {str(e)}")


@router.post("/alerts", response_model=AlertResponse, status_code=201)
async def create_alert(alert_data: AlertCreate, db: AsyncSession = Depends(get_db)):
    """Create a new alert"""
    try:
        # Parse triggered_at
        if isinstance(alert_data.triggered_at, datetime):
            triggered_at = alert_data.triggered_at
        else:
            triggered_at = datetime.fromisoformat(
                str(alert_data.triggered_at).replace("Z", "+00:00")
            )

        alert = Alert(
            organization_id=(
                uuid.UUID(alert_data.organization_id)
                if alert_data.organization_id
                else uuid.UUID("00000000-0000-0000-0000-000000000000")
            ),
            alert_type=alert_data.alert_type,
            severity=alert_data.severity,
            status=alert_data.status or "active",
            asset_id=uuid.UUID(alert_data.asset_id),
            asset_name=alert_data.asset_name,
            message=alert_data.message,
            description=alert_data.description,
            reason=alert_data.reason,
            suggested_action=alert_data.suggested_action,
            location_description=alert_data.location_description,
            latitude=alert_data.latitude,
            longitude=alert_data.longitude,
            geofence_id=(
                uuid.UUID(alert_data.geofence_id) if alert_data.geofence_id else None
            ),
            geofence_name=alert_data.geofence_name,
            triggered_at=triggered_at,
            auto_resolvable=alert_data.auto_resolvable or False,
            alert_metadata=alert_data.metadata or {},
        )

        db.add(alert)
        await db.commit()
        # Skip refresh for now due to SQLite UUID compatibility issues
        # await db.refresh(alert)

        # Create response using helper function
        alert_response = alert_to_response(alert)

        try:
            await alert_manager.send_alert_update(
                {"type": "new_alert", "alert": alert_response.model_dump()}
            )
        except Exception as e:
            # Don't raise here, just log the error
            pass

        return alert_response

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating alert: {str(e)}")


@router.patch("/alerts/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    """Acknowledge an alert"""
    try:
        # Use raw SQL to update the alert
        update_query = """
        UPDATE alerts 
        SET status = 'acknowledged', 
            acknowledged_at = :acknowledged_at,
            updated_at = :updated_at
        WHERE id = :alert_id OR REPLACE(id, '-', '') = REPLACE(:alert_id, '-', '')
        """

        now = datetime.now()
        result = await db.execute(
            text(update_query),
            {"alert_id": alert_id, "acknowledged_at": now, "updated_at": now},
        )

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Alert not found")

        await db.commit()

        # Fetch the updated alert using raw SQL
        fetch_query = """
        SELECT id, organization_id, alert_type, severity, status, asset_id, asset_name, 
               message, description, reason, suggested_action, location_description, 
               latitude, longitude, geofence_id, geofence_name, triggered_at, 
               auto_resolvable, alert_metadata, acknowledged_at, resolved_at, 
               resolution_notes, resolved_by_user_id, auto_resolved, workflow_actions, 
               created_at, updated_at
        FROM alerts
        WHERE id = :alert_id OR REPLACE(id, '-', '') = REPLACE(:alert_id, '-', '')
        """

        fetch_result = await db.execute(text(fetch_query), {"alert_id": alert_id})
        row = fetch_result.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Alert not found")

        # Convert row to Alert object manually
        alert = Alert()
        alert.id = row[0]
        alert.organization_id = row[1]
        alert.alert_type = row[2]
        alert.severity = row[3]
        alert.status = row[4]
        alert.asset_id = row[5]
        alert.asset_name = row[6]
        alert.message = row[7]
        alert.description = row[8]
        alert.reason = row[9]
        alert.suggested_action = row[10]
        alert.location_description = row[11]
        alert.latitude = row[12]
        alert.longitude = row[13]
        alert.geofence_id = row[14]
        alert.geofence_name = row[15]
        alert.triggered_at = row[16]
        alert.auto_resolvable = row[17]
        alert.alert_metadata = row[18]
        alert.acknowledged_at = row[19]
        alert.resolved_at = row[20]
        alert.resolution_notes = row[21]
        alert.resolved_by_user_id = row[22]
        alert.auto_resolved = row[23]
        alert.workflow_actions = row[24]
        alert.created_at = row[25]
        alert.updated_at = row[26]

        # Send real-time update via WebSocket
        alert_response = alert_to_response(alert)
        await alert_manager.send_alert_update(
            {"type": "alert_acknowledged", "alert": alert_response.model_dump()}
        )

        return alert_response

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error acknowledging alert: {str(e)}"
        )


@router.patch("/alerts/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    alert_id: str,
    resolution_notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Resolve an alert"""
    try:
        # Use raw SQL to update the alert
        update_query = """
        UPDATE alerts 
        SET status = 'resolved', 
            resolved_at = :resolved_at,
            resolution_notes = :resolution_notes,
            updated_at = :updated_at
        WHERE id = :alert_id OR REPLACE(id, '-', '') = REPLACE(:alert_id, '-', '')
        """

        now = datetime.now()
        result = await db.execute(
            text(update_query),
            {
                "alert_id": alert_id,
                "resolved_at": now,
                "resolution_notes": resolution_notes,
                "updated_at": now,
            },
        )

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Alert not found")

        await db.commit()

        # Fetch the updated alert using raw SQL
        fetch_query = """
        SELECT id, organization_id, alert_type, severity, status, asset_id, asset_name, 
               message, description, reason, suggested_action, location_description, 
               latitude, longitude, geofence_id, geofence_name, triggered_at, 
               auto_resolvable, alert_metadata, acknowledged_at, resolved_at, 
               resolution_notes, resolved_by_user_id, auto_resolved, workflow_actions, 
               created_at, updated_at
        FROM alerts
        WHERE id = :alert_id OR REPLACE(id, '-', '') = REPLACE(:alert_id, '-', '')
        """

        fetch_result = await db.execute(text(fetch_query), {"alert_id": alert_id})
        row = fetch_result.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Alert not found")

        # Convert row to Alert object manually
        alert = Alert()
        alert.id = row[0]
        alert.organization_id = row[1]
        alert.alert_type = row[2]
        alert.severity = row[3]
        alert.status = row[4]
        alert.asset_id = row[5]
        alert.asset_name = row[6]
        alert.message = row[7]
        alert.description = row[8]
        alert.reason = row[9]
        alert.suggested_action = row[10]
        alert.location_description = row[11]
        alert.latitude = row[12]
        alert.longitude = row[13]
        alert.geofence_id = row[14]
        alert.geofence_name = row[15]
        alert.triggered_at = row[16]
        alert.auto_resolvable = row[17]
        alert.alert_metadata = row[18]
        alert.acknowledged_at = row[19]
        alert.resolved_at = row[20]
        alert.resolution_notes = row[21]
        alert.resolved_by_user_id = row[22]
        alert.auto_resolved = row[23]
        alert.workflow_actions = row[24]
        alert.created_at = row[25]
        alert.updated_at = row[26]

        # Send real-time update via WebSocket
        alert_response = alert_to_response(alert)
        await alert_manager.send_alert_update(
            {"type": "alert_resolved", "alert": alert_response.model_dump()}
        )

        return alert_response

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error resolving alert: {str(e)}")


@router.websocket("/ws/alerts")
async def websocket_alert_updates(websocket: WebSocket) -> None:
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
