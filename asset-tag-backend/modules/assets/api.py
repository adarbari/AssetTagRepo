"""
Asset API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List, Optional
from datetime import datetime
import uuid

from config.database import get_db
from modules.assets.models import Asset
from modules.assets.schemas import AssetCreate, AssetUpdate, AssetResponse

router = APIRouter()


@router.get("/assets", response_model=List[AssetResponse])
async def get_assets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    asset_type: Optional[str] = None,
    status: Optional[str] = None,
    site_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get list of assets with optional filtering"""
    try:
        query = select(Asset)
        
        # Apply filters
        if asset_type:
            query = query.where(Asset.asset_type == asset_type)
        if status:
            query = query.where(Asset.status == status)
        if site_id:
            query = query.where(Asset.current_site_id == site_id)
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        assets = result.scalars().all()
        
        return [AssetResponse.from_orm(asset) for asset in assets]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching assets: {str(e)}")


@router.get("/assets/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get asset by ID"""
    try:
        result = await db.execute(select(Asset).where(Asset.id == asset_id))
        asset = result.scalar_one_or_none()
        
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        return AssetResponse.from_orm(asset)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching asset: {str(e)}")


@router.post("/assets", response_model=AssetResponse)
async def create_asset(
    asset_data: AssetCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new asset"""
    try:
        # Check if serial number already exists
        existing = await db.execute(
            select(Asset).where(Asset.serial_number == asset_data.serial_number)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Asset with this serial number already exists")
        
        # Create new asset
        asset = Asset(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org for now
            name=asset_data.name,
            serial_number=asset_data.serial_number,
            asset_type=asset_data.asset_type,
            status=asset_data.status or "active",
            location_description=asset_data.location_description,
            battery_level=asset_data.battery_level,
            temperature=asset_data.temperature,
            manufacturer=asset_data.manufacturer,
            model=asset_data.model,
            purchase_date=asset_data.purchase_date,
            warranty_expiry=asset_data.warranty_expiry,
            hourly_rate=asset_data.hourly_rate,
            availability=asset_data.availability or "available",
            asset_metadata=asset_data.asset_metadata or {}
        )
        
        db.add(asset)
        await db.commit()
        await db.refresh(asset)
        
        return AssetResponse.from_orm(asset)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating asset: {str(e)}")


@router.put("/assets/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: str,
    asset_data: AssetUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing asset"""
    try:
        # Get existing asset
        result = await db.execute(select(Asset).where(Asset.id == asset_id))
        asset = result.scalar_one_or_none()
        
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # Update fields
        update_data = asset_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(asset, field, value)
        
        await db.commit()
        await db.refresh(asset)
        
        return AssetResponse.from_orm(asset)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating asset: {str(e)}")


@router.delete("/assets/{asset_id}")
async def delete_asset(
    asset_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete an asset (soft delete)"""
    try:
        # Get existing asset
        result = await db.execute(select(Asset).where(Asset.id == asset_id))
        asset = result.scalar_one_or_none()
        
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # Soft delete
        asset.deleted_at = datetime.now()
        await db.commit()
        
        return {"message": "Asset deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting asset: {str(e)}")


@router.get("/assets/{asset_id}/current-location")
async def get_asset_current_location(
    asset_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get current location of an asset"""
    try:
        from modules.locations.models import EstimatedLocation
        
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
            "bearing": float(location.bearing) if location.bearing else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching asset location: {str(e)}")


@router.get("/assets/{asset_id}/location-history")
async def get_asset_location_history(
    asset_id: str,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Get location history for an asset"""
    try:
        from modules.locations.models import EstimatedLocation
        from datetime import datetime
        
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
                "distance_from_previous": float(loc.distance_from_previous) if loc.distance_from_previous else None
            }
            for loc in locations
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching location history: {str(e)}")


@router.get("/assets/search", response_model=List[AssetResponse])
async def search_assets(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Search assets by name or serial number"""
    try:
        # Search by name or serial number
        query = select(Asset).where(
            (Asset.name.ilike(f"%{q}%")) | 
            (Asset.serial_number.ilike(f"%{q}%"))
        ).limit(limit)
        
        result = await db.execute(query)
        assets = result.scalars().all()
        
        return [AssetResponse.from_orm(asset) for asset in assets]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching assets: {str(e)}")


@router.get("/assets/{asset_id}/battery-history")
async def get_asset_battery_history(
    asset_id: str,
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Get battery level history for an asset"""
    try:
        # For now, return a simple history based on the asset's current battery level
        # In a real implementation, this would query a battery_history table
        result = await db.execute(select(Asset).where(Asset.id == asset_id))
        asset = result.scalar_one_or_none()
        
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # Mock battery history data
        battery_history = []
        if asset.battery_level is not None:
            battery_history.append({
                "battery_level": asset.battery_level,
                "timestamp": asset.updated_at.isoformat(),
                "source": "current_reading"
            })
        
        return battery_history
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching battery history: {str(e)}")
