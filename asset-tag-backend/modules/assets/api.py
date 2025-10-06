"""
Asset API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, text
from typing import List, Optional
from datetime import datetime
import uuid
import json

from config.database import get_db
from modules.assets.models import Asset
from modules.assets.schemas import AssetCreate, AssetUpdate, AssetResponse


def asset_to_response(asset: Asset) -> AssetResponse:
    """Convert Asset SQLAlchemy model to AssetResponse manually to avoid serialization issues"""
    return AssetResponse(
        id=str(asset.id) if '-' in str(asset.id) else f"{str(asset.id)[:8]}-{str(asset.id)[8:12]}-{str(asset.id)[12:16]}-{str(asset.id)[16:20]}-{str(asset.id)[20:]}",
        organization_id=str(asset.organization_id) if '-' in str(asset.organization_id) else f"{str(asset.organization_id)[:8]}-{str(asset.organization_id)[8:12]}-{str(asset.organization_id)[12:16]}-{str(asset.organization_id)[16:20]}-{str(asset.organization_id)[20:]}",
        name=asset.name,
        serial_number=asset.serial_number,
        asset_type=asset.asset_type,
        status=asset.status,
        current_site_id=str(asset.current_site_id) if asset.current_site_id and '-' in str(asset.current_site_id) else (f"{str(asset.current_site_id)[:8]}-{str(asset.current_site_id)[8:12]}-{str(asset.current_site_id)[12:16]}-{str(asset.current_site_id)[16:20]}-{str(asset.current_site_id)[20:]}" if asset.current_site_id else None),
        location_description=asset.location_description,
        last_seen=asset.last_seen.isoformat() if asset.last_seen and hasattr(asset.last_seen, 'isoformat') else asset.last_seen,
        battery_level=asset.battery_level,
        temperature=asset.temperature,
        movement_status=asset.movement_status,
        assigned_to_user_id=str(asset.assigned_to_user_id) if asset.assigned_to_user_id and '-' in str(asset.assigned_to_user_id) else (f"{str(asset.assigned_to_user_id)[:8]}-{str(asset.assigned_to_user_id)[8:12]}-{str(asset.assigned_to_user_id)[12:16]}-{str(asset.assigned_to_user_id)[16:20]}-{str(asset.assigned_to_user_id)[20:]}" if asset.assigned_to_user_id else None),
        assigned_job_id=str(asset.assigned_job_id) if asset.assigned_job_id and '-' in str(asset.assigned_job_id) else (f"{str(asset.assigned_job_id)[:8]}-{str(asset.assigned_job_id)[8:12]}-{str(asset.assigned_job_id)[12:16]}-{str(asset.assigned_job_id)[16:20]}-{str(asset.assigned_job_id)[20:]}" if asset.assigned_job_id else None),
        assignment_start_date=asset.assignment_start_date.isoformat() if asset.assignment_start_date and hasattr(asset.assignment_start_date, 'isoformat') else asset.assignment_start_date,
        assignment_end_date=asset.assignment_end_date.isoformat() if asset.assignment_end_date and hasattr(asset.assignment_end_date, 'isoformat') else asset.assignment_end_date,
        manufacturer=asset.manufacturer,
        model=asset.model,
        purchase_date=asset.purchase_date.isoformat() if asset.purchase_date and hasattr(asset.purchase_date, 'isoformat') else asset.purchase_date,
        warranty_expiry=asset.warranty_expiry.isoformat() if asset.warranty_expiry and hasattr(asset.warranty_expiry, 'isoformat') else asset.warranty_expiry,
        last_maintenance=asset.last_maintenance.isoformat() if asset.last_maintenance and hasattr(asset.last_maintenance, 'isoformat') else asset.last_maintenance,
        next_maintenance=asset.next_maintenance.isoformat() if asset.next_maintenance and hasattr(asset.next_maintenance, 'isoformat') else asset.next_maintenance,
        hourly_rate=asset.hourly_rate,
        availability=asset.availability,
        asset_metadata=json.loads(asset.asset_metadata) if isinstance(asset.asset_metadata, str) else (asset.asset_metadata or {}),
        created_at=asset.created_at.isoformat() if hasattr(asset.created_at, 'isoformat') else str(asset.created_at),
        updated_at=asset.updated_at.isoformat() if hasattr(asset.updated_at, 'isoformat') else str(asset.updated_at)
    )


router = APIRouter()


@router.get("/assets", response_model=List[AssetResponse])
async def get_assets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    page: Optional[int] = Query(None, ge=1),
    size: Optional[int] = Query(None, ge=1, le=1000),
    asset_type: Optional[str] = None,
    status: Optional[str] = None,
    site_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get list of assets with optional filtering"""
    try:
        # Handle page/size parameters if provided
        if page is not None and size is not None:
            skip = (page - 1) * size
            limit = size
        
        # Use raw SQL to avoid UUID serialization issues with SQLite
        raw_query = """
        SELECT id, organization_id, name, serial_number, asset_type, status, current_site_id, 
               location_description, last_seen, battery_level, temperature, movement_status, 
               assigned_to_user_id, assigned_job_id, assignment_start_date, assignment_end_date, 
               manufacturer, model, purchase_date, warranty_expiry, last_maintenance, 
               next_maintenance, hourly_rate, availability, asset_metadata, created_at, updated_at
        FROM assets
        WHERE deleted_at IS NULL
        """
        
        # Add WHERE clauses for filters
        where_conditions = ["deleted_at IS NULL"]  # Always filter out soft-deleted assets
        params = {}
        
        if asset_type:
            where_conditions.append("asset_type = :asset_type")
            params["asset_type"] = asset_type
        if status:
            where_conditions.append("status = :status")
            params["status"] = status
        if site_id:
            where_conditions.append("current_site_id = :site_id")
            params["site_id"] = site_id
        
        raw_query += " AND " + " AND ".join(where_conditions[1:]) if len(where_conditions) > 1 else ""
        
        # Add pagination
        raw_query += f" LIMIT {limit} OFFSET {skip}"
        
        result = await db.execute(text(raw_query), params)
        rows = result.fetchall()
        
        # Convert rows to Asset objects manually
        assets = []
        for row in rows:
            asset = Asset()
            asset.id = row[0]
            asset.organization_id = row[1]
            asset.name = row[2]
            asset.serial_number = row[3]
            asset.asset_type = row[4]
            asset.status = row[5]
            asset.current_site_id = row[6]
            asset.location_description = row[7]
            asset.last_seen = row[8]
            asset.battery_level = row[9]
            asset.temperature = row[10]
            asset.movement_status = row[11]
            asset.assigned_to_user_id = row[12]
            asset.assigned_job_id = row[13]
            asset.assignment_start_date = row[14]
            asset.assignment_end_date = row[15]
            asset.manufacturer = row[16]
            asset.model = row[17]
            asset.purchase_date = row[18]
            asset.warranty_expiry = row[19]
            asset.last_maintenance = row[20]
            asset.next_maintenance = row[21]
            asset.hourly_rate = row[22]
            asset.availability = row[23]
            asset.asset_metadata = row[24]
            asset.created_at = row[25]
            asset.updated_at = row[26]
            assets.append(asset)
        
        return [asset_to_response(asset) for asset in assets]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching assets: {str(e)}")


@router.get("/assets/search", response_model=List[AssetResponse])
async def search_assets(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Search assets by name or serial number"""
    try:
        # Use raw SQL to avoid UUID serialization issues with SQLite
        raw_query = """
        SELECT id, organization_id, name, serial_number, asset_type, status, current_site_id, 
               location_description, last_seen, battery_level, temperature, movement_status, 
               assigned_to_user_id, assigned_job_id, assignment_start_date, assignment_end_date, 
               manufacturer, model, purchase_date, warranty_expiry, last_maintenance, 
               next_maintenance, hourly_rate, availability, asset_metadata, created_at, updated_at
        FROM assets
        WHERE deleted_at IS NULL
        AND (name LIKE :search_query OR serial_number LIKE :search_query)
        LIMIT :limit
        """
        
        search_query = f"%{q}%"
        result = await db.execute(text(raw_query), {
            "search_query": search_query,
            "limit": limit
        })
        rows = result.fetchall()
        
        # Convert rows to Asset objects manually
        assets = []
        for row in rows:
            asset = Asset()
            asset.id = row[0]
            asset.organization_id = row[1]
            asset.name = row[2]
            asset.serial_number = row[3]
            asset.asset_type = row[4]
            asset.status = row[5]
            asset.current_site_id = row[6]
            asset.location_description = row[7]
            asset.last_seen = row[8]
            asset.battery_level = row[9]
            asset.temperature = row[10]
            asset.movement_status = row[11]
            asset.assigned_to_user_id = row[12]
            asset.assigned_job_id = row[13]
            asset.assignment_start_date = row[14]
            asset.assignment_end_date = row[15]
            asset.manufacturer = row[16]
            asset.model = row[17]
            asset.purchase_date = row[18]
            asset.warranty_expiry = row[19]
            asset.last_maintenance = row[20]
            asset.next_maintenance = row[21]
            asset.hourly_rate = row[22]
            asset.availability = row[23]
            asset.asset_metadata = row[24]
            asset.created_at = row[25]
            asset.updated_at = row[26]
            assets.append(asset)
        
        return [asset_to_response(asset) for asset in assets]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching assets: {str(e)}")


@router.get("/assets/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get asset by ID"""
    try:
        # Use raw SQL to avoid UUID serialization issues with SQLite
        # Handle both UUID formats (with and without hyphens)
        raw_query = """
        SELECT id, organization_id, name, serial_number, asset_type, status, current_site_id, 
               location_description, last_seen, battery_level, temperature, movement_status, 
               assigned_to_user_id, assigned_job_id, assignment_start_date, assignment_end_date, 
               manufacturer, model, purchase_date, warranty_expiry, last_maintenance, 
               next_maintenance, hourly_rate, availability, asset_metadata, created_at, updated_at
        FROM assets
        WHERE (id = :asset_id OR REPLACE(id, '-', '') = REPLACE(:asset_id, '-', ''))
        AND deleted_at IS NULL
        """
        
        result = await db.execute(text(raw_query), {"asset_id": asset_id})
        row = result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # Convert row to Asset object manually
        asset = Asset()
        asset.id = row[0]
        asset.organization_id = row[1]
        asset.name = row[2]
        asset.serial_number = row[3]
        asset.asset_type = row[4]
        asset.status = row[5]
        asset.current_site_id = row[6]
        asset.location_description = row[7]
        asset.last_seen = row[8]
        asset.battery_level = row[9]
        asset.temperature = row[10]
        asset.movement_status = row[11]
        asset.assigned_to_user_id = row[12]
        asset.assigned_job_id = row[13]
        asset.assignment_start_date = row[14]
        asset.assignment_end_date = row[15]
        asset.manufacturer = row[16]
        asset.model = row[17]
        asset.purchase_date = row[18]
        asset.warranty_expiry = row[19]
        asset.last_maintenance = row[20]
        asset.next_maintenance = row[21]
        asset.hourly_rate = row[22]
        asset.availability = row[23]
        asset.asset_metadata = row[24]
        asset.created_at = row[25]
        asset.updated_at = row[26]
        
        return asset_to_response(asset)
        
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
            organization_id=uuid.UUID("00000000-0000-0000-0000-000000000000"),  # Default org for now
            name=asset_data.name,
            serial_number=asset_data.serial_number,
            asset_type=asset_data.asset_type,
            status=asset_data.status or "active",
            current_site_id=uuid.UUID(asset_data.current_site_id) if asset_data.current_site_id else None,
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
        # Skip refresh due to SQLite UUID compatibility issues
        
        return asset_to_response(asset)
        
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
        # Use raw SQL to update the asset
        update_data = asset_data.model_dump(exclude_unset=True)
        
        if not update_data:
            # No fields to update, just return the existing asset
            raw_query = """
            SELECT id, organization_id, name, serial_number, asset_type, status, current_site_id, 
                   location_description, last_seen, battery_level, temperature, movement_status, 
                   assigned_to_user_id, assigned_job_id, assignment_start_date, assignment_end_date, 
                   manufacturer, model, purchase_date, warranty_expiry, last_maintenance, 
                   next_maintenance, hourly_rate, availability, asset_metadata, created_at, updated_at
            FROM assets
            WHERE id = :asset_id OR REPLACE(id, '-', '') = REPLACE(:asset_id, '-', '')
            """
            
            result = await db.execute(text(raw_query), {"asset_id": asset_id})
            row = result.fetchone()
            
            if not row:
                raise HTTPException(status_code=404, detail="Asset not found")
            
            # Convert row to Asset object manually
            asset = Asset()
            asset.id = row[0]
            asset.organization_id = row[1]
            asset.name = row[2]
            asset.serial_number = row[3]
            asset.asset_type = row[4]
            asset.status = row[5]
            asset.current_site_id = row[6]
            asset.location_description = row[7]
            asset.last_seen = row[8]
            asset.battery_level = row[9]
            asset.temperature = row[10]
            asset.movement_status = row[11]
            asset.assigned_to_user_id = row[12]
            asset.assigned_job_id = row[13]
            asset.assignment_start_date = row[14]
            asset.assignment_end_date = row[15]
            asset.manufacturer = row[16]
            asset.model = row[17]
            asset.purchase_date = row[18]
            asset.warranty_expiry = row[19]
            asset.last_maintenance = row[20]
            asset.next_maintenance = row[21]
            asset.hourly_rate = row[22]
            asset.availability = row[23]
            asset.asset_metadata = row[24]
            asset.created_at = row[25]
            asset.updated_at = row[26]
            
            return asset_to_response(asset)
        
        # Build dynamic UPDATE query
        set_clauses = []
        params = {"asset_id": asset_id}
        
        for field, value in update_data.items():
            if field == "asset_metadata" and isinstance(value, dict):
                set_clauses.append(f"{field} = :{field}")
                params[field] = json.dumps(value)
            else:
                set_clauses.append(f"{field} = :{field}")
                params[field] = value
        
        set_clauses.append("updated_at = :updated_at")
        params["updated_at"] = datetime.now()
        
        update_query = f"""
        UPDATE assets 
        SET {', '.join(set_clauses)}
        WHERE id = :asset_id OR REPLACE(id, '-', '') = REPLACE(:asset_id, '-', '')
        """
        
        result = await db.execute(text(update_query), params)
        
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        await db.commit()
        
        # Fetch the updated asset using raw SQL
        fetch_query = """
        SELECT id, organization_id, name, serial_number, asset_type, status, current_site_id, 
               location_description, last_seen, battery_level, temperature, movement_status, 
               assigned_to_user_id, assigned_job_id, assignment_start_date, assignment_end_date, 
               manufacturer, model, purchase_date, warranty_expiry, last_maintenance, 
               next_maintenance, hourly_rate, availability, asset_metadata, created_at, updated_at
        FROM assets
        WHERE id = :asset_id OR REPLACE(id, '-', '') = REPLACE(:asset_id, '-', '')
        """
        
        fetch_result = await db.execute(text(fetch_query), {"asset_id": asset_id})
        row = fetch_result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # Convert row to Asset object manually
        asset = Asset()
        asset.id = row[0]
        asset.organization_id = row[1]
        asset.name = row[2]
        asset.serial_number = row[3]
        asset.asset_type = row[4]
        asset.status = row[5]
        asset.current_site_id = row[6]
        asset.location_description = row[7]
        asset.last_seen = row[8]
        asset.battery_level = row[9]
        asset.temperature = row[10]
        asset.movement_status = row[11]
        asset.assigned_to_user_id = row[12]
        asset.assigned_job_id = row[13]
        asset.assignment_start_date = row[14]
        asset.assignment_end_date = row[15]
        asset.manufacturer = row[16]
        asset.model = row[17]
        asset.purchase_date = row[18]
        asset.warranty_expiry = row[19]
        asset.last_maintenance = row[20]
        asset.next_maintenance = row[21]
        asset.hourly_rate = row[22]
        asset.availability = row[23]
        asset.asset_metadata = row[24]
        asset.created_at = row[25]
        asset.updated_at = row[26]
        
        return asset_to_response(asset)
        
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
        # Use raw SQL to soft delete the asset
        update_query = """
        UPDATE assets 
        SET deleted_at = :deleted_at,
            updated_at = :updated_at
        WHERE id = :asset_id OR REPLACE(id, '-', '') = REPLACE(:asset_id, '-', '')
        """
        
        now = datetime.now()
        result = await db.execute(text(update_query), {
            "asset_id": asset_id,
            "deleted_at": now,
            "updated_at": now
        })
        
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Asset not found")
        
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


@router.get("/assets/{asset_id}/battery-history")
async def get_asset_battery_history(
    asset_id: str,
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Get battery level history for an asset"""
    try:
        # Use raw SQL to avoid UUID serialization issues with SQLite
        raw_query = """
        SELECT id, battery_level, updated_at
        FROM assets
        WHERE (id = :asset_id OR REPLACE(id, '-', '') = REPLACE(:asset_id, '-', ''))
        AND deleted_at IS NULL
        """
        
        result = await db.execute(text(raw_query), {"asset_id": asset_id})
        row = result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        asset_id_db = row[0]
        battery_level = row[1]
        updated_at = row[2]
        
        # Mock battery history data
        battery_history = []
        if battery_level is not None:
            battery_history.append({
                "battery_level": battery_level,
                "timestamp": updated_at.isoformat() if hasattr(updated_at, 'isoformat') else str(updated_at),
                "source": "current_reading"
            })
        
        return battery_history
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching battery history: {str(e)}")
