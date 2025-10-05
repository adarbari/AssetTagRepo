"""
Geofence API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
import math

from config.database import get_db
from modules.geofences.models import Geofence, GeofenceEvent, Vehicle
from modules.geofences.schemas import (
    GeofenceCreate, GeofenceUpdate, GeofenceResponse,
    GeofenceEventCreate, GeofenceEventResponse,
    VehicleCreate, VehicleUpdate, VehicleResponse,
    GeofenceEvaluationRequest, GeofenceEvaluationResponse, GeofenceStatsResponse
)

router = APIRouter()


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on Earth in meters"""
    R = 6371000  # Earth's radius in meters
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat / 2) ** 2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def point_in_polygon(lat: float, lon: float, polygon: List[List[float]]) -> bool:
    """Check if a point is inside a polygon using ray casting algorithm"""
    x, y = lon, lat
    n = len(polygon)
    inside = False
    
    p1x, p1y = polygon[0]
    for i in range(1, n + 1):
        p2x, p2y = polygon[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    
    return inside


@router.get("/geofences", response_model=List[GeofenceResponse])
async def get_geofences(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    geofence_type: Optional[str] = None,
    site_id: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    asset_id: Optional[str] = None,
    attachment_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get list of geofences with optional filtering"""
    try:
        query = select(Geofence)
        
        # Apply filters
        if status:
            query = query.where(Geofence.status == status)
        if geofence_type:
            query = query.where(Geofence.geofence_type == geofence_type)
        if site_id:
            query = query.where(Geofence.site_id == site_id)
        if vehicle_id:
            query = query.where(Geofence.vehicle_id == vehicle_id)
        if asset_id:
            query = query.where(Geofence.asset_id == asset_id)
        if attachment_type:
            query = query.where(Geofence.attachment_type == attachment_type)
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        geofences = result.scalars().all()
        
        return [GeofenceResponse.from_orm(geofence) for geofence in geofences]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching geofences: {str(e)}")


@router.get("/geofences/{geofence_id}", response_model=GeofenceResponse)
async def get_geofence(
    geofence_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get geofence by ID"""
    try:
        result = await db.execute(select(Geofence).where(Geofence.id == geofence_id))
        geofence = result.scalar_one_or_none()
        
        if not geofence:
            raise HTTPException(status_code=404, detail="Geofence not found")
        
        return GeofenceResponse.from_orm(geofence)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching geofence: {str(e)}")


@router.post("/geofences", response_model=GeofenceResponse)
async def create_geofence(
    geofence_data: GeofenceCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new geofence"""
    try:
        # Check if geofence name already exists in organization
        existing = await db.execute(
            select(Geofence).where(
                Geofence.name == geofence_data.name,
                Geofence.organization_id == "00000000-0000-0000-0000-000000000000"  # Default org
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Geofence with this name already exists")
        
        # Create new geofence
        geofence = Geofence(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org for now
            name=geofence_data.name,
            description=geofence_data.description,
            geofence_type=geofence_data.geofence_type,
            status=geofence_data.status or "active",
            center_latitude=geofence_data.center_latitude,
            center_longitude=geofence_data.center_longitude,
            radius=geofence_data.radius,
            coordinates=geofence_data.coordinates,
            site_id=geofence_data.site_id,
            site_name=geofence_data.site_name,
            alert_on_entry=geofence_data.alert_on_entry,
            alert_on_exit=geofence_data.alert_on_exit,
            geofence_classification=geofence_data.geofence_classification,
            tolerance=geofence_data.tolerance,
            location_mode=geofence_data.location_mode,
            vehicle_id=geofence_data.vehicle_id,
            vehicle_name=geofence_data.vehicle_name,
            asset_id=geofence_data.asset_id,
            asset_name=geofence_data.asset_name,
            attachment_type=geofence_data.attachment_type,
            expected_asset_ids=geofence_data.expected_asset_ids,
            metadata=geofence_data.metadata or {}
        )
        
        db.add(geofence)
        await db.commit()
        await db.refresh(geofence)
        
        return GeofenceResponse.from_orm(geofence)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating geofence: {str(e)}")


@router.put("/geofences/{geofence_id}", response_model=GeofenceResponse)
async def update_geofence(
    geofence_id: str,
    geofence_data: GeofenceUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing geofence"""
    try:
        # Get existing geofence
        result = await db.execute(select(Geofence).where(Geofence.id == geofence_id))
        geofence = result.scalar_one_or_none()
        
        if not geofence:
            raise HTTPException(status_code=404, detail="Geofence not found")
        
        # Update fields
        update_data = geofence_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(geofence, field, value)
        
        await db.commit()
        await db.refresh(geofence)
        
        return GeofenceResponse.from_orm(geofence)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating geofence: {str(e)}")


@router.delete("/geofences/{geofence_id}")
async def delete_geofence(
    geofence_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a geofence (soft delete)"""
    try:
        # Get existing geofence
        result = await db.execute(select(Geofence).where(Geofence.id == geofence_id))
        geofence = result.scalar_one_or_none()
        
        if not geofence:
            raise HTTPException(status_code=404, detail="Geofence not found")
        
        # Check if geofence has events
        events_count = await db.execute(
            select(func.count(GeofenceEvent.id)).where(GeofenceEvent.geofence_id == geofence_id)
        )
        
        if events_count.scalar() > 0:
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete geofence with existing events. Please archive it instead."
            )
        
        # Soft delete
        geofence.deleted_at = datetime.now()
        await db.commit()
        
        return {"message": "Geofence deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting geofence: {str(e)}")


@router.post("/geofences/evaluate", response_model=GeofenceEvaluationResponse)
async def evaluate_geofences(
    evaluation_request: GeofenceEvaluationRequest,
    db: AsyncSession = Depends(get_db)
):
    """Evaluate if an asset location triggers any geofence events"""
    try:
        timestamp = evaluation_request.timestamp or datetime.now().isoformat()
        evaluations = []
        triggered_events = []
        
        # Build query for geofences to evaluate
        query = select(Geofence).where(Geofence.status == "active")
        
        if evaluation_request.geofence_ids:
            query = query.where(Geofence.id.in_(evaluation_request.geofence_ids))
        
        result = await db.execute(query)
        geofences = result.scalars().all()
        
        for geofence in geofences:
            is_inside = False
            distance = None
            
            if geofence.geofence_type == "circular":
                # Calculate distance from center
                distance = haversine_distance(
                    evaluation_request.latitude,
                    evaluation_request.longitude,
                    float(geofence.center_latitude),
                    float(geofence.center_longitude)
                )
                
                # Convert radius from feet to meters (1 foot = 0.3048 meters)
                radius_meters = geofence.radius * 0.3048 if geofence.radius else 0
                is_inside = distance <= radius_meters
                
            elif geofence.geofence_type == "polygon" and geofence.coordinates:
                # Check if point is inside polygon
                is_inside = point_in_polygon(
                    evaluation_request.latitude,
                    evaluation_request.longitude,
                    geofence.coordinates
                )
            
            evaluation = {
                "geofence_id": str(geofence.id),
                "geofence_name": geofence.name,
                "geofence_type": geofence.geofence_type,
                "is_inside": is_inside,
                "distance_meters": distance,
                "alert_on_entry": geofence.alert_on_entry,
                "alert_on_exit": geofence.alert_on_exit,
                "classification": geofence.geofence_classification
            }
            evaluations.append(evaluation)
            
            # Check for previous state to determine if this is an entry or exit
            # For now, we'll create events for all state changes
            # In a real implementation, you'd track previous states in Redis or database
            
            if is_inside and geofence.alert_on_entry:
                # Create entry event
                event = GeofenceEvent(
                    organization_id="00000000-0000-0000-0000-000000000000",
                    geofence_id=geofence.id,
                    asset_id=evaluation_request.asset_id,
                    event_type="entry",
                    timestamp=timestamp,
                    latitude=evaluation_request.latitude,
                    longitude=evaluation_request.longitude,
                    distance_from_geofence=distance
                )
                db.add(event)
                triggered_events.append({
                    "event_type": "entry",
                    "geofence_id": str(geofence.id),
                    "geofence_name": geofence.name,
                    "timestamp": timestamp
                })
            
            elif not is_inside and geofence.alert_on_exit:
                # Create exit event
                event = GeofenceEvent(
                    organization_id="00000000-0000-0000-0000-000000000000",
                    geofence_id=geofence.id,
                    asset_id=evaluation_request.asset_id,
                    event_type="exit",
                    timestamp=timestamp,
                    latitude=evaluation_request.latitude,
                    longitude=evaluation_request.longitude,
                    distance_from_geofence=distance
                )
                db.add(event)
                triggered_events.append({
                    "event_type": "exit",
                    "geofence_id": str(geofence.id),
                    "geofence_name": geofence.name,
                    "timestamp": timestamp
                })
        
        await db.commit()
        
        return GeofenceEvaluationResponse(
            asset_id=evaluation_request.asset_id,
            latitude=evaluation_request.latitude,
            longitude=evaluation_request.longitude,
            timestamp=timestamp,
            evaluations=evaluations,
            triggered_events=triggered_events
        )
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error evaluating geofences: {str(e)}")


@router.get("/geofences/{geofence_id}/events", response_model=List[GeofenceEventResponse])
async def get_geofence_events(
    geofence_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    event_type: Optional[str] = None,
    asset_id: Optional[str] = None,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get events for a specific geofence"""
    try:
        query = select(GeofenceEvent).where(GeofenceEvent.geofence_id == geofence_id)
        
        # Apply filters
        if event_type:
            query = query.where(GeofenceEvent.event_type == event_type)
        if asset_id:
            query = query.where(GeofenceEvent.asset_id == asset_id)
        if start_time:
            start_dt = datetime.fromisoformat(start_time)
            query = query.where(GeofenceEvent.created_at >= start_dt)
        if end_time:
            end_dt = datetime.fromisoformat(end_time)
            query = query.where(GeofenceEvent.created_at <= end_dt)
        
        # Apply pagination and ordering
        query = query.order_by(GeofenceEvent.created_at.desc()).offset(skip).limit(limit)
        
        result = await db.execute(query)
        events = result.scalars().all()
        
        return [GeofenceEventResponse.from_orm(event) for event in events]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching geofence events: {str(e)}")


@router.get("/geofences/stats", response_model=GeofenceStatsResponse)
async def get_geofence_stats(
    db: AsyncSession = Depends(get_db)
):
    """Get geofence statistics"""
    try:
        # Get counts by status
        total_count = await db.execute(select(func.count(Geofence.id)))
        active_count = await db.execute(select(func.count(Geofence.id)).where(Geofence.status == "active"))
        inactive_count = await db.execute(select(func.count(Geofence.id)).where(Geofence.status == "inactive"))
        
        # Get counts by type
        circular_count = await db.execute(select(func.count(Geofence.id)).where(Geofence.geofence_type == "circular"))
        polygon_count = await db.execute(select(func.count(Geofence.id)).where(Geofence.geofence_type == "polygon"))
        
        # Get today's events
        today = datetime.now().date()
        today_events = await db.execute(
            select(func.count(GeofenceEvent.id)).where(
                func.date(GeofenceEvent.created_at) == today
            )
        )
        today_entry_events = await db.execute(
            select(func.count(GeofenceEvent.id)).where(
                and_(
                    func.date(GeofenceEvent.created_at) == today,
                    GeofenceEvent.event_type == "entry"
                )
            )
        )
        today_exit_events = await db.execute(
            select(func.count(GeofenceEvent.id)).where(
                and_(
                    func.date(GeofenceEvent.created_at) == today,
                    GeofenceEvent.event_type == "exit"
                )
            )
        )
        
        # Get most active geofences (by event count)
        most_active = await db.execute(
            select(
                Geofence.id,
                Geofence.name,
                func.count(GeofenceEvent.id).label('event_count')
            )
            .join(GeofenceEvent, Geofence.id == GeofenceEvent.geofence_id)
            .group_by(Geofence.id, Geofence.name)
            .order_by(func.count(GeofenceEvent.id).desc())
            .limit(5)
        )
        
        return GeofenceStatsResponse(
            total_geofences=total_count.scalar(),
            active_geofences=active_count.scalar(),
            inactive_geofences=inactive_count.scalar(),
            circular_geofences=circular_count.scalar(),
            polygon_geofences=polygon_count.scalar(),
            total_events_today=today_events.scalar(),
            entry_events_today=today_entry_events.scalar(),
            exit_events_today=today_exit_events.scalar(),
            most_active_geofences=[
                {
                    "geofence_id": str(row.id),
                    "geofence_name": row.name,
                    "event_count": row.event_count
                }
                for row in most_active
            ]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching geofence stats: {str(e)}")


# Vehicle endpoints
@router.get("/vehicles", response_model=List[VehicleResponse])
async def get_vehicles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    assigned_driver_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get list of vehicles with optional filtering"""
    try:
        query = select(Vehicle)
        
        # Apply filters
        if status:
            query = query.where(Vehicle.status == status)
        if vehicle_type:
            query = query.where(Vehicle.vehicle_type == vehicle_type)
        if assigned_driver_id:
            query = query.where(Vehicle.assigned_driver_id == assigned_driver_id)
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        vehicles = result.scalars().all()
        
        return [VehicleResponse.from_orm(vehicle) for vehicle in vehicles]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching vehicles: {str(e)}")


@router.get("/vehicles/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(
    vehicle_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get vehicle by ID"""
    try:
        result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
        vehicle = result.scalar_one_or_none()
        
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        return VehicleResponse.from_orm(vehicle)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching vehicle: {str(e)}")


@router.post("/vehicles", response_model=VehicleResponse)
async def create_vehicle(
    vehicle_data: VehicleCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new vehicle"""
    try:
        # Check if vehicle name already exists in organization
        existing = await db.execute(
            select(Vehicle).where(
                Vehicle.name == vehicle_data.name,
                Vehicle.organization_id == "00000000-0000-0000-0000-000000000000"  # Default org
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Vehicle with this name already exists")
        
        # Create new vehicle
        vehicle = Vehicle(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org for now
            name=vehicle_data.name,
            vehicle_type=vehicle_data.vehicle_type,
            license_plate=vehicle_data.license_plate,
            status=vehicle_data.status or "active",
            current_latitude=vehicle_data.current_latitude,
            current_longitude=vehicle_data.current_longitude,
            last_seen=vehicle_data.last_seen,
            assigned_driver_id=vehicle_data.assigned_driver_id,
            assigned_driver_name=vehicle_data.assigned_driver_name,
            metadata=vehicle_data.metadata or {}
        )
        
        db.add(vehicle)
        await db.commit()
        await db.refresh(vehicle)
        
        return VehicleResponse.from_orm(vehicle)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating vehicle: {str(e)}")


@router.put("/vehicles/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: str,
    vehicle_data: VehicleUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing vehicle"""
    try:
        # Get existing vehicle
        result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
        vehicle = result.scalar_one_or_none()
        
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Update fields
        update_data = vehicle_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(vehicle, field, value)
        
        await db.commit()
        await db.refresh(vehicle)
        
        return VehicleResponse.from_orm(vehicle)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating vehicle: {str(e)}")


@router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a vehicle (soft delete)"""
    try:
        # Get existing vehicle
        result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
        vehicle = result.scalar_one_or_none()
        
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Check if vehicle has associated geofences
        geofences_count = await db.execute(
            select(func.count(Geofence.id)).where(Geofence.vehicle_id == vehicle_id)
        )
        
        if geofences_count.scalar() > 0:
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete vehicle with associated geofences. Please reassign them first."
            )
        
        # Soft delete
        vehicle.deleted_at = datetime.now()
        await db.commit()
        
        return {"message": "Vehicle deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting vehicle: {str(e)}")
