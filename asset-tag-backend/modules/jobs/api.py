"""
Job API endpoints
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from config.database import get_db
from modules.jobs.models import Job, JobAsset
from modules.jobs.schemas import JobCreate, JobResponse, JobUpdate

router = APIRouter()


@router.get("/jobs", response_model=List[JobResponse])
async def get_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to_user_id: Optional[str] = None,
    site_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get list of jobs with optional filtering"""
    try:
        query = select(Job)

        # Apply filters
        if status:
            query = query.where(Job.status == status)
        if priority:
            query = query.where(Job.priority == priority)
        if assigned_to_user_id:
            query = query.where(Job.assigned_to_user_id == assigned_to_user_id)
        if site_id:
            query = query.where(Job.site_id == site_id)

        # Apply pagination
        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        jobs = result.scalars().all()

        return [JobResponse.from_orm(job) for job in jobs]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching jobs: {str(e)}")


@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    """Get job by ID"""
    try:
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()

        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        return JobResponse.from_orm(job)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching job: {str(e)}")


@router.post("/jobs", response_model=JobResponse)
async def create_job(job_data: JobCreate, db: AsyncSession = Depends(get_db)):
    """Create a new job"""
    try:
        job = Job(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org for now
            name=job_data.name,
            description=job_data.description,
            job_type=job_data.job_type,
            status=job_data.status or "pending",
            priority=job_data.priority or "medium",
            scheduled_start=(
                datetime.fromisoformat(job_data.scheduled_start)
                if job_data.scheduled_start
                else None
            ),
            scheduled_end=(
                datetime.fromisoformat(job_data.scheduled_end)
                if job_data.scheduled_end
                else None
            ),
            assigned_to_user_id=job_data.assigned_to_user_id,
            assigned_to_user_name=job_data.assigned_to_user_name,
            site_id=job_data.site_id,
            site_name=job_data.site_name,
            location_description=job_data.location_description,
            estimated_duration_hours=job_data.estimated_duration_hours,
            estimated_cost=job_data.estimated_cost,
            metadata=job_data.metadata or {},
        )

        db.add(job)
        await db.commit()
        await db.refresh(job)

        return JobResponse.from_orm(job)

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating job: {str(e)}")


@router.put("/jobs/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: str, job_data: JobUpdate, db: AsyncSession = Depends(get_db)
):
    """Update an existing job"""
    try:
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()

        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Update fields
        update_data = job_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field in ["scheduled_start", "scheduled_end"] and value:
                setattr(job, field, datetime.fromisoformat(value))
            else:
                setattr(job, field, value)

        await db.commit()
        await db.refresh(job)

        return JobResponse.from_orm(job)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating job: {str(e)}")


@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a job (soft delete)"""
    try:
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()

        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Soft delete
        job.deleted_at = datetime.now()
        await db.commit()

        return {"message": "Job deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting job: {str(e)}")


@router.post("/jobs/{job_id}/assign-asset")
async def assign_asset_to_job(
    job_id: str,
    asset_id: str,
    notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Assign an asset to a job"""
    try:
        # Check if job exists
        job_result = await db.execute(select(Job).where(Job.id == job_id))
        job = job_result.scalar_one_or_none()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Check if asset is already assigned to this job
        existing = await db.execute(
            select(JobAsset).where(
                JobAsset.job_id == job_id,
                JobAsset.asset_id == asset_id,
                JobAsset.unassigned_at.is_(None),
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=400, detail="Asset is already assigned to this job"
            )

        # Create job-asset assignment
        job_asset = JobAsset(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org
            job_id=job_id,
            asset_id=asset_id,
            assigned_at=datetime.now(),
            status="assigned",
            notes=notes,
        )

        db.add(job_asset)
        await db.commit()

        return {"message": "Asset assigned to job successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error assigning asset to job: {str(e)}"
        )


@router.delete("/jobs/{job_id}/unassign-asset/{asset_id}")
async def unassign_asset_from_job(
    job_id: str, asset_id: str, db: AsyncSession = Depends(get_db)
):
    """Unassign an asset from a job"""
    try:
        result = await db.execute(
            select(JobAsset).where(
                JobAsset.job_id == job_id,
                JobAsset.asset_id == asset_id,
                JobAsset.unassigned_at.is_(None),
            )
        )
        job_asset = result.scalar_one_or_none()

        if not job_asset:
            raise HTTPException(status_code=404, detail="Asset assignment not found")

        job_asset.unassigned_at = datetime.now()
        job_asset.status = "removed"

        await db.commit()

        return {"message": "Asset unassigned from job successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error unassigning asset from job: {str(e)}"
        )


@router.get("/jobs/{job_id}/assets")
async def get_job_assets(job_id: str, db: AsyncSession = Depends(get_db)):
    """Get assets assigned to a job"""
    try:
        result = await db.execute(
            select(JobAsset).where(
                JobAsset.job_id == job_id, JobAsset.unassigned_at.is_(None)
            )
        )
        job_assets = result.scalars().all()

        return [
            {
                "id": str(ja.id),
                "asset_id": str(ja.asset_id),
                "assigned_at": ja.assigned_at.isoformat(),
                "status": ja.status,
                "usage_start": ja.usage_start.isoformat() if ja.usage_start else None,
                "usage_end": ja.usage_end.isoformat() if ja.usage_end else None,
                "usage_hours": float(ja.usage_hours) if ja.usage_hours else None,
                "notes": ja.notes,
            }
            for ja in job_assets
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching job assets: {str(e)}"
        )
