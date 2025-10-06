"""
Vehicle API endpoints
"""

import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from config.database import get_db
from modules.vehicles.models import Vehicle, VehicleAssetPairing
from modules.vehicles.schemas import (
    VehicleAssetPairingCreate,
    VehicleAssetPairingResponse,
    VehicleCreate,
    VehicleResponse,
    VehicleStats,
    VehicleUpdate,
    VehicleWithAssets,
)

router = APIRouter()


@router.get("/vehicles", response_model=List[VehicleResponse])
async def get_vehicles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    assigned_driver_id: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get list of vehicles with optional filtering"""
    try:
        query = select(Vehicle).where(Vehicle.deleted_at.is_(None))

        # Apply filters
        if status:
            query = query.where(Vehicle.status == status)
        if vehicle_type:
            query = query.where(Vehicle.vehicle_type == vehicle_type)
        if assigned_driver_id:
            query = query.where(Vehicle.assigned_driver_id == assigned_driver_id)
        if search:
            search_filter = or_(
                Vehicle.name.ilike(f"%{search}%"),
                Vehicle.license_plate.ilike(f"%{search}%"),
                Vehicle.assigned_driver_name.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)

        # Apply pagination
        query = query.order_by(Vehicle.created_at.desc()).offset(skip).limit(limit)

        result = await db.execute(query)
        vehicles = result.scalars().all()

        return [VehicleResponse.from_orm(vehicle) for vehicle in vehicles]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching vehicles: {str(e)}"
        )


@router.get("/vehicles/{vehicle_id}", response_model=VehicleWithAssets)
async def get_vehicle(vehicle_id: str, db: AsyncSession = Depends(get_db)):
    """Get vehicle by ID with paired assets"""
    try:
        result = await db.execute(
            select(Vehicle).where(
                and_(Vehicle.id == vehicle_id, Vehicle.deleted_at.is_(None))
            )
        )
        vehicle = result.scalar_one_or_none()

        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        return VehicleWithAssets.from_orm(vehicle)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching vehicle: {str(e)}")


@router.post("/vehicles", response_model=VehicleResponse, status_code=201)
async def create_vehicle(
    vehicle_data: VehicleCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new vehicle"""
    try:
        # Check if vehicle name already exists in organization
        existing = await db.execute(
            select(Vehicle).where(
                and_(
                    Vehicle.name == vehicle_data.name,
                    Vehicle.organization_id
                    == "00000000-0000-0000-0000-000000000000",  # Default org
                    Vehicle.deleted_at.is_(None),
                )
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=400, detail="Vehicle with this name already exists"
            )

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
            metadata=vehicle_data.metadata or {},
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
    vehicle_id: str, vehicle_data: VehicleUpdate, db: AsyncSession = Depends(get_db)
):
    """Update an existing vehicle"""
    try:
        # Get existing vehicle
        result = await db.execute(
            select(Vehicle).where(
                and_(Vehicle.id == vehicle_id, Vehicle.deleted_at.is_(None))
            )
        )
        vehicle = result.scalar_one_or_none()

        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        # Check for name conflicts
        if vehicle_data.name and vehicle_data.name != vehicle.name:
            existing = await db.execute(
                select(Vehicle).where(
                    and_(
                        Vehicle.name == vehicle_data.name,
                        Vehicle.organization_id == vehicle.organization_id,
                        Vehicle.id != vehicle_id,
                        Vehicle.deleted_at.is_(None),
                    )
                )
            )
            if existing.scalar_one_or_none():
                raise HTTPException(
                    status_code=400, detail="Vehicle with this name already exists"
                )

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
async def delete_vehicle(vehicle_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a vehicle (soft delete)"""
    try:
        result = await db.execute(
            select(Vehicle).where(
                and_(Vehicle.id == vehicle_id, Vehicle.deleted_at.is_(None))
            )
        )
        vehicle = result.scalar_one_or_none()

        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        # Soft delete
        vehicle.deleted_at = datetime.now()
        await db.commit()

        return {"message": "Vehicle deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting vehicle: {str(e)}")


@router.get(
    "/vehicles/{vehicle_id}/assets", response_model=List[VehicleAssetPairingResponse]
)
async def get_vehicle_assets(
    vehicle_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get assets paired with a vehicle"""
    try:
        # Check if vehicle exists
        vehicle_result = await db.execute(
            select(Vehicle).where(
                and_(Vehicle.id == vehicle_id, Vehicle.deleted_at.is_(None))
            )
        )
        vehicle = vehicle_result.scalar_one_or_none()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        # Get paired assets
        query = select(VehicleAssetPairing).where(
            VehicleAssetPairing.vehicle_id == vehicle_id
        )

        if status:
            query = query.where(VehicleAssetPairing.status == status)

        query = (
            query.order_by(VehicleAssetPairing.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        pairings = result.scalars().all()

        return [VehicleAssetPairingResponse.from_orm(pairing) for pairing in pairings]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching vehicle assets: {str(e)}"
        )


@router.post(
    "/vehicles/{vehicle_id}/pair-asset", response_model=VehicleAssetPairingResponse
)
async def pair_asset_to_vehicle(
    vehicle_id: str,
    pairing_data: VehicleAssetPairingCreate,
    db: AsyncSession = Depends(get_db),
):
    """Pair an asset to a vehicle"""
    try:
        # Check if vehicle exists
        vehicle_result = await db.execute(
            select(Vehicle).where(
                and_(Vehicle.id == vehicle_id, Vehicle.deleted_at.is_(None))
            )
        )
        vehicle = vehicle_result.scalar_one_or_none()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        # Check if asset is already paired to this vehicle
        existing = await db.execute(
            select(VehicleAssetPairing).where(
                and_(
                    VehicleAssetPairing.vehicle_id == vehicle_id,
                    VehicleAssetPairing.asset_id == pairing_data.asset_id,
                    VehicleAssetPairing.status == "active",
                )
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=400, detail="Asset is already paired to this vehicle"
            )

        # Create pairing
        pairing = VehicleAssetPairing(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org
            vehicle_id=vehicle_id,
            asset_id=pairing_data.asset_id,
            paired_at=datetime.now().isoformat(),
            paired_by_user_id=None,  # TODO: Get from authentication
            paired_by_name="System User",  # TODO: Get from authentication
            status="active",
            notes=pairing_data.notes,
            metadata=pairing_data.metadata or {},
        )

        db.add(pairing)
        await db.commit()
        await db.refresh(pairing)

        return VehicleAssetPairingResponse.from_orm(pairing)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error pairing asset to vehicle: {str(e)}"
        )


@router.delete("/vehicles/{vehicle_id}/unpair-asset/{asset_id}")
async def unpair_asset_from_vehicle(
    vehicle_id: str, asset_id: str, db: AsyncSession = Depends(get_db)
):
    """Unpair an asset from a vehicle"""
    try:
        result = await db.execute(
            select(VehicleAssetPairing).where(
                and_(
                    VehicleAssetPairing.vehicle_id == vehicle_id,
                    VehicleAssetPairing.asset_id == asset_id,
                    VehicleAssetPairing.status == "active",
                )
            )
        )
        pairing = result.scalar_one_or_none()

        if not pairing:
            raise HTTPException(status_code=404, detail="Asset pairing not found")

        # Update status to inactive
        pairing.status = "inactive"
        await db.commit()

        return {"message": "Asset unpaired from vehicle successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error unpairing asset from vehicle: {str(e)}"
        )


@router.get("/vehicles/stats", response_model=VehicleStats)
async def get_vehicle_stats(db: AsyncSession = Depends(get_db)):
    """Get vehicle statistics"""
    try:
        # Get total vehicles
        total_result = await db.execute(
            select(func.count(Vehicle.id)).where(Vehicle.deleted_at.is_(None))
        )
        total_vehicles = total_result.scalar()

        # Get status counts
        status_counts = {}
        for status in ["active", "inactive", "maintenance"]:
            result = await db.execute(
                select(func.count(Vehicle.id)).where(
                    and_(Vehicle.status == status, Vehicle.deleted_at.is_(None))
                )
            )
            status_counts[status] = result.scalar()

        # Get vehicles with/without drivers
        with_drivers_result = await db.execute(
            select(func.count(Vehicle.id)).where(
                and_(
                    Vehicle.assigned_driver_id.isnot(None), Vehicle.deleted_at.is_(None)
                )
            )
        )
        vehicles_with_drivers = with_drivers_result.scalar()
        vehicles_without_drivers = total_vehicles - vehicles_with_drivers

        # Get total paired assets
        paired_assets_result = await db.execute(
            select(func.count(VehicleAssetPairing.id)).where(
                VehicleAssetPairing.status == "active"
            )
        )
        total_paired_assets = paired_assets_result.scalar()

        # Calculate average assets per vehicle
        avg_assets_per_vehicle = None
        if total_vehicles > 0:
            avg_assets_per_vehicle = total_paired_assets / total_vehicles

        return VehicleStats(
            total_vehicles=total_vehicles,
            active_vehicles=status_counts.get("active", 0),
            inactive_vehicles=status_counts.get("inactive", 0),
            maintenance_vehicles=status_counts.get("maintenance", 0),
            vehicles_with_drivers=vehicles_with_drivers,
            vehicles_without_drivers=vehicles_without_drivers,
            total_paired_assets=total_paired_assets,
            avg_assets_per_vehicle=avg_assets_per_vehicle,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching vehicle stats: {str(e)}"
        )
