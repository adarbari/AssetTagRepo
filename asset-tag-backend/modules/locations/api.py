"""
Location API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import json
import asyncio
from datetime import datetime, timedelta

from config.database import get_db
from modules.locations.models import EstimatedLocation

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, asset_id: str):
        await websocket.accept()
        if asset_id not in self.active_connections:
            self.active_connections[asset_id] = []
        self.active_connections[asset_id].append(websocket)

    def disconnect(self, websocket: WebSocket, asset_id: str):
        if asset_id in self.active_connections:
            self.active_connections[asset_id].remove(websocket)
            if not self.active_connections[asset_id]:
                del self.active_connections[asset_id]

    async def send_location_update(self, asset_id: str, location_data: dict):
        if asset_id in self.active_connections:
            for connection in self.active_connections[asset_id]:
                try:
                    await connection.send_text(json.dumps(location_data))
                except:
                    # Remove broken connections
                    self.active_connections[asset_id].remove(connection)

manager = ConnectionManager()


@router.get("/locations/{asset_id}/current")
async def get_current_location(
    asset_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get current location of an asset"""
    try:
        # Get latest location
        result = await db.execute(
            select(EstimatedLocation)
            .where(EstimatedLocation.asset_id == asset_id)
            .order_by(EstimatedLocation.estimated_at.desc())
            .limit(1)
        )
        location = result.scalar_one_or_none()
        
        if not location:
            raise HTTPException(status_code=404, detail="No location data found for asset")
        
        return {
            "asset_id": asset_id,
            "latitude": float(location.latitude),
            "longitude": float(location.longitude),
            "altitude": float(location.altitude) if location.altitude else None,
            "uncertainty_radius": float(location.uncertainty_radius),
            "confidence": float(location.confidence),
            "algorithm": location.algorithm,
            "estimated_at": location.estimated_at.isoformat(),
            "speed": float(location.speed) if location.speed else None,
            "bearing": float(location.bearing) if location.bearing else None,
            "distance_from_previous": float(location.distance_from_previous) if location.distance_from_previous else None,
            "signal_quality_score": float(location.signal_quality_score) if location.signal_quality_score else None,
            "gateway_count": location.gateway_count,
            "gateway_ids": location.gateway_ids
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching current location: {str(e)}")


@router.get("/locations/{asset_id}/history")
async def get_location_history(
    asset_id: str,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Get location history for an asset"""
    try:
        query = select(EstimatedLocation).where(EstimatedLocation.asset_id == asset_id)
        
        # Apply time filters
        if start_time:
            start_dt = datetime.fromisoformat(start_time)
            query = query.where(EstimatedLocation.estimated_at >= start_dt)
        
        if end_time:
            end_dt = datetime.fromisoformat(end_time)
            query = query.where(EstimatedLocation.estimated_at <= end_dt)
        
        # Order by time and limit
        query = query.order_by(EstimatedLocation.estimated_at.desc()).limit(limit)
        
        result = await db.execute(query)
        locations = result.scalars().all()
        
        return [
            {
                "latitude": float(loc.latitude),
                "longitude": float(loc.longitude),
                "altitude": float(loc.altitude) if loc.altitude else None,
                "uncertainty_radius": float(loc.uncertainty_radius),
                "confidence": float(loc.confidence),
                "algorithm": loc.algorithm,
                "estimated_at": loc.estimated_at.isoformat(),
                "speed": float(loc.speed) if loc.speed else None,
                "bearing": float(loc.bearing) if loc.bearing else None,
                "distance_from_previous": float(loc.distance_from_previous) if loc.distance_from_previous else None,
                "signal_quality_score": float(loc.signal_quality_score) if loc.signal_quality_score else None,
                "gateway_count": loc.gateway_count,
                "gateway_ids": loc.gateway_ids
            }
            for loc in locations
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching location history: {str(e)}")


@router.get("/locations/{asset_id}/track")
async def get_location_track(
    asset_id: str,
    hours: int = Query(24, ge=1, le=168),  # Default 24 hours, max 1 week
    db: AsyncSession = Depends(get_db)
):
    """Get location track for an asset over a time period"""
    try:
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=hours)
        
        query = select(EstimatedLocation).where(
            EstimatedLocation.asset_id == asset_id,
            EstimatedLocation.estimated_at >= start_time,
            EstimatedLocation.estimated_at <= end_time
        ).order_by(EstimatedLocation.estimated_at.asc())
        
        result = await db.execute(query)
        locations = result.scalars().all()
        
        return {
            "asset_id": asset_id,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "track": [
                {
                    "latitude": float(loc.latitude),
                    "longitude": float(loc.longitude),
                    "timestamp": loc.estimated_at.isoformat(),
                    "confidence": float(loc.confidence),
                    "speed": float(loc.speed) if loc.speed else None
                }
                for loc in locations
            ],
            "total_points": len(locations)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching location track: {str(e)}")


@router.websocket("/ws/locations/{asset_id}")
async def websocket_location_updates(websocket: WebSocket, asset_id: str):
    """WebSocket for real-time location updates"""
    await manager.connect(websocket, asset_id)
    try:
        while True:
            # Keep connection alive and handle any incoming messages
            data = await websocket.receive_text()
            # Echo back any received data (could be used for commands)
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, asset_id)


@router.get("/locations/bulk/current")
async def get_bulk_current_locations(
    asset_ids: str = Query(..., description="Comma-separated asset IDs"),
    db: AsyncSession = Depends(get_db)
):
    """Get current locations for multiple assets"""
    try:
        asset_id_list = [aid.strip() for aid in asset_ids.split(",")]
        
        # Get latest location for each asset
        locations = {}
        for asset_id in asset_id_list:
            result = await db.execute(
                select(EstimatedLocation)
                .where(EstimatedLocation.asset_id == asset_id)
                .order_by(EstimatedLocation.estimated_at.desc())
                .limit(1)
            )
            location = result.scalar_one_or_none()
            
            if location:
                locations[asset_id] = {
                    "latitude": float(location.latitude),
                    "longitude": float(location.longitude),
                    "altitude": float(location.altitude) if location.altitude else None,
                    "uncertainty_radius": float(location.uncertainty_radius),
                    "confidence": float(location.confidence),
                    "algorithm": location.algorithm,
                    "estimated_at": location.estimated_at.isoformat(),
                    "speed": float(location.speed) if location.speed else None,
                    "bearing": float(location.bearing) if location.bearing else None
                }
            else:
                locations[asset_id] = None
        
        return {
            "locations": locations,
            "requested_count": len(asset_id_list),
            "found_count": len([l for l in locations.values() if l is not None])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bulk locations: {str(e)}")
