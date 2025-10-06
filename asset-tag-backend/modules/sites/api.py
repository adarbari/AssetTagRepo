"""
Site API endpoints
"""
import uuid
from datetime import datetime
from typing import List, Optional

from config.database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query
from modules.sites.models import Personnel, PersonnelActivity, Site
from modules.sites.schemas import (
    PersonnelActivityResponse,
    PersonnelCreate,
    PersonnelResponse,
    PersonnelUpdate,
    SiteCreate,
    SiteResponse,
    SiteUpdate,
    SiteWithAssetsResponse,
)
from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.get("/sites", response_model=List[SiteResponse])
async def get_sites(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    manager_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get list of sites with optional filtering"""
    try:
        query = select(Site)

        # Apply filters
        if status:
            query = query.where(Site.status == status)
        if manager_id:
            query = query.where(Site.manager_id == manager_id)

        # Apply pagination
        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        sites = result.scalars().all()

        return [SiteResponse.from_orm(site) for site in sites]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sites: {str(e)}")


@router.get("/sites/{site_id}", response_model=SiteWithAssetsResponse)
async def get_site(site_id: str, db: AsyncSession = Depends(get_db)):
    """Get site by ID with related data"""
    try:
        # Get site
        result = await db.execute(select(Site).where(Site.id == site_id))
        site = result.scalar_one_or_none()

        if not site:
            raise HTTPException(status_code=404, detail="Site not found")

        # Get related assets
        from modules.assets.models import Asset

        assets_result = await db.execute(
            select(Asset).where(Asset.current_site_id == site_id)
        )
        assets = assets_result.scalars().all()

        # Get related personnel
        personnel_result = await db.execute(
            select(Personnel).where(Personnel.current_site_id == site_id)
        )
        personnel = personnel_result.scalars().all()

        # Get related gateways
        from modules.gateways.models import Gateway

        gateways_result = await db.execute(
            select(Gateway).where(Gateway.site_id == site_id)
        )
        gateways = gateways_result.scalars().all()

        # Build response
        site_data = SiteResponse.from_orm(site).dict()
        site_data.update(
            {
                "assets": [
                    {
                        "id": str(asset.id),
                        "name": asset.name,
                        "asset_type": asset.asset_type,
                        "status": asset.status,
                        "battery_level": asset.battery_level,
                        "last_seen": asset.last_seen,
                    }
                    for asset in assets
                ],
                "personnel": [
                    {
                        "id": str(person.id),
                        "name": person.name,
                        "role": person.role,
                        "status": person.status,
                        "email": person.email,
                        "phone": person.phone,
                    }
                    for person in personnel
                ],
                "gateways": [
                    {
                        "id": str(gateway.id),
                        "name": gateway.name,
                        "gateway_id": gateway.gateway_id,
                        "status": gateway.status,
                        "is_online": gateway.is_online,
                        "battery_level": gateway.battery_level,
                    }
                    for gateway in gateways
                ],
                "asset_count": len(assets),
                "personnel_count": len(personnel),
                "gateway_count": len(gateways),
            }
        )

        return SiteWithAssetsResponse(**site_data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching site: {str(e)}")


@router.post("/sites", response_model=SiteResponse, status_code=201)
async def create_site(site_data: SiteCreate, db: AsyncSession = Depends(get_db)):
    """Create a new site"""
    try:
        # Check if site name already exists in organization
        default_org_id = uuid.UUID("00000000-0000-0000-0000-000000000000")
        existing = await db.execute(
            select(Site).where(
                Site.name == site_data.name,
                Site.organization_id == default_org_id,  # Default org
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=400, detail="Site with this name already exists"
            )

        # Create new site
        site = Site(
            organization_id=default_org_id,  # Default org for now
            name=site_data.name,
            location=site_data.location,
            area=site_data.area,
            status=site_data.status or "active",
            manager_name=site_data.manager_name,
            manager_id=site_data.manager_id,
            latitude=site_data.latitude,
            longitude=site_data.longitude,
            radius=site_data.radius,
            tolerance=site_data.tolerance,
            address=site_data.address,
            phone=site_data.phone,
            email=site_data.email,
            description=site_data.description,
            geofence_id=site_data.geofence_id,
            metadata=site_data.metadata or {},
        )

        db.add(site)
        await db.commit()
        await db.refresh(site)

        return SiteResponse.from_orm(site)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating site: {str(e)}")


@router.put("/sites/{site_id}", response_model=SiteResponse)
async def update_site(
    site_id: str, site_data: SiteUpdate, db: AsyncSession = Depends(get_db)
):
    """Update an existing site"""
    try:
        # Get existing site
        result = await db.execute(select(Site).where(Site.id == site_id))
        site = result.scalar_one_or_none()

        if not site:
            raise HTTPException(status_code=404, detail="Site not found")

        # Update fields
        update_data = site_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(site, field, value)

        await db.commit()
        await db.refresh(site)

        return SiteResponse.from_orm(site)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating site: {str(e)}")


@router.delete("/sites/{site_id}")
async def delete_site(site_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a site (soft delete)"""
    try:
        # Get existing site
        result = await db.execute(select(Site).where(Site.id == site_id))
        site = result.scalar_one_or_none()

        if not site:
            raise HTTPException(status_code=404, detail="Site not found")

        # Check if site has assets or personnel
        from modules.assets.models import Asset

        assets_count = await db.execute(
            select(func.count(Asset.id)).where(Asset.current_site_id == site_id)
        )
        personnel_count = await db.execute(
            select(func.count(Personnel.id)).where(Personnel.current_site_id == site_id)
        )

        if assets_count.scalar() > 0 or personnel_count.scalar() > 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete site with active assets or personnel. Please reassign them first.",
            )

        # Soft delete
        site.deleted_at = datetime.now()
        await db.commit()

        return {"message": "Site deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting site: {str(e)}")


@router.get("/sites/{site_id}/assets")
async def get_site_assets(
    site_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    asset_type: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get assets at a specific site"""
    try:
        from modules.assets.models import Asset

        query = select(Asset).where(Asset.current_site_id == site_id)

        # Apply filters
        if asset_type:
            query = query.where(Asset.asset_type == asset_type)
        if status:
            query = query.where(Asset.status == status)

        # Apply pagination
        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        assets = result.scalars().all()

        return [
            {
                "id": str(asset.id),
                "name": asset.name,
                "serial_number": asset.serial_number,
                "asset_type": asset.asset_type,
                "status": asset.status,
                "battery_level": asset.battery_level,
                "temperature": float(asset.temperature) if asset.temperature else None,
                "last_seen": asset.last_seen,
                "manufacturer": asset.manufacturer,
                "model": asset.model,
                "assigned_to_user_id": str(asset.assigned_to_user_id)
                if asset.assigned_to_user_id
                else None,
                "assigned_job_id": str(asset.assigned_job_id)
                if asset.assigned_job_id
                else None,
            }
            for asset in assets
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching site assets: {str(e)}"
        )


@router.get("/sites/{site_id}/personnel")
async def get_site_personnel(
    site_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    role: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get personnel at a specific site"""
    try:
        query = select(Personnel).where(Personnel.current_site_id == site_id)

        # Apply filters
        if status:
            query = query.where(Personnel.status == status)
        if role:
            query = query.where(Personnel.role == role)

        # Apply pagination
        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        personnel = result.scalars().all()

        return [
            {
                "id": str(person.id),
                "name": person.name,
                "role": person.role,
                "status": person.status,
                "email": person.email,
                "phone": person.phone,
                "current_site_id": str(person.current_site_id)
                if person.current_site_id
                else None,
                "created_at": person.created_at.isoformat(),
                "updated_at": person.updated_at.isoformat(),
            }
            for person in personnel
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching site personnel: {str(e)}"
        )


@router.get("/sites/{site_id}/activity")
async def get_site_activity(
    site_id: str,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get activity data for a site"""
    try:
        # Get personnel activity
        query = select(PersonnelActivity).where(PersonnelActivity.site_id == site_id)

        # Apply time filters
        if start_time:
            start_dt = datetime.fromisoformat(start_time)
            query = query.where(PersonnelActivity.created_at >= start_dt)

        if end_time:
            end_dt = datetime.fromisoformat(end_time)
            query = query.where(PersonnelActivity.created_at <= end_dt)

        # Order by time and limit
        query = query.order_by(PersonnelActivity.created_at.desc()).limit(limit)

        result = await db.execute(query)
        activities = result.scalars().all()

        return [
            {
                "id": str(activity.id),
                "personnel_id": str(activity.personnel_id),
                "site_id": str(activity.site_id),
                "site_name": activity.site_name,
                "activity_type": activity.activity_type,
                "timestamp": activity.timestamp,
                "created_at": activity.created_at.isoformat(),
            }
            for activity in activities
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching site activity: {str(e)}"
        )


@router.get("/sites/stats")
async def get_sites_stats(db: AsyncSession = Depends(get_db)):
    """Get sites statistics summary"""
    try:
        # Get counts by status
        active_count = await db.execute(
            select(func.count(Site.id)).where(Site.status == "active")
        )
        inactive_count = await db.execute(
            select(func.count(Site.id)).where(Site.status == "inactive")
        )

        # Get total counts
        total_sites = await db.execute(select(func.count(Site.id)))

        # Get asset and personnel counts
        from modules.assets.models import Asset

        total_assets = await db.execute(select(func.count(Asset.id)))
        total_personnel = await db.execute(select(func.count(Personnel.id)))

        return {
            "total_sites": total_sites.scalar(),
            "active_sites": active_count.scalar(),
            "total_assets": total_assets.scalar(),
            "total_personnel": total_personnel.scalar(),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching sites stats: {str(e)}"
        )


# Personnel endpoints
@router.get("/personnel", response_model=List[PersonnelResponse])
async def get_personnel(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    role: Optional[str] = None,
    site_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get list of personnel with optional filtering"""
    try:
        query = select(Personnel)

        # Apply filters
        if status:
            query = query.where(Personnel.status == status)
        if role:
            query = query.where(Personnel.role == role)
        if site_id:
            query = query.where(Personnel.current_site_id == site_id)

        # Apply pagination
        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        personnel = result.scalars().all()

        return [PersonnelResponse.from_orm(person) for person in personnel]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching personnel: {str(e)}"
        )


@router.get("/personnel/{personnel_id}", response_model=PersonnelResponse)
async def get_personnel_by_id(personnel_id: str, db: AsyncSession = Depends(get_db)):
    """Get personnel by ID"""
    try:
        result = await db.execute(select(Personnel).where(Personnel.id == personnel_id))
        person = result.scalar_one_or_none()

        if not person:
            raise HTTPException(status_code=404, detail="Personnel not found")

        return PersonnelResponse.from_orm(person)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching personnel: {str(e)}"
        )


@router.post("/personnel", response_model=PersonnelResponse)
async def create_personnel(
    personnel_data: PersonnelCreate, db: AsyncSession = Depends(get_db)
):
    """Create new personnel"""
    try:
        person = Personnel(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org
            name=personnel_data.name,
            role=personnel_data.role,
            status=personnel_data.status or "on-duty",
            current_site_id=personnel_data.current_site_id,
            email=personnel_data.email,
            phone=personnel_data.phone,
            metadata=personnel_data.metadata or {},
        )

        db.add(person)
        await db.commit()
        await db.refresh(person)

        return PersonnelResponse.from_orm(person)

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error creating personnel: {str(e)}"
        )


@router.put("/personnel/{personnel_id}", response_model=PersonnelResponse)
async def update_personnel(
    personnel_id: str,
    personnel_data: PersonnelUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update existing personnel"""
    try:
        result = await db.execute(select(Personnel).where(Personnel.id == personnel_id))
        person = result.scalar_one_or_none()

        if not person:
            raise HTTPException(status_code=404, detail="Personnel not found")

        # Update fields
        update_data = personnel_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(person, field, value)

        await db.commit()
        await db.refresh(person)

        return PersonnelResponse.from_orm(person)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error updating personnel: {str(e)}"
        )


@router.delete("/personnel/{personnel_id}")
async def delete_personnel(personnel_id: str, db: AsyncSession = Depends(get_db)):
    """Delete personnel (soft delete)"""
    try:
        result = await db.execute(select(Personnel).where(Personnel.id == personnel_id))
        person = result.scalar_one_or_none()

        if not person:
            raise HTTPException(status_code=404, detail="Personnel not found")

        # Soft delete
        person.deleted_at = datetime.now()
        await db.commit()

        return {"message": "Personnel deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error deleting personnel: {str(e)}"
        )


# Personnel endpoint aliases under sites namespace
@router.post("/sites/personnel", response_model=PersonnelResponse, status_code=201)
async def create_site_personnel(
    personnel_data: PersonnelCreate, db: AsyncSession = Depends(get_db)
):
    """Alias for creating personnel under sites namespace"""
    return await create_personnel(personnel_data, db)


@router.get("/sites/personnel", response_model=List[PersonnelResponse])
async def get_site_personnel_list(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    role: Optional[str] = None,
    site_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Alias for getting personnel under sites namespace"""
    return await get_personnel(skip, limit, status, role, site_id, db)
