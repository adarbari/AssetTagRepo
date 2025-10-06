"""
Maintenance API endpoints
"""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from config.database import get_db
from modules.maintenance.models import MaintenanceRecord
from modules.maintenance.schemas import (
    MaintenanceCreate,
    MaintenanceResponse,
    MaintenanceUpdate,
)

router = APIRouter()


@router.get("/maintenance", response_model=List[MaintenanceResponse])
async def get_maintenance_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    asset_id: Optional[str] = None,
    maintenance_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get list of maintenance records with optional filtering"""
    try:
        query = select(MaintenanceRecord)

        # Apply filters
        if status:
            query = query.where(MaintenanceRecord.status == status)
        if priority:
            query = query.where(MaintenanceRecord.priority == priority)
        if asset_id:
            query = query.where(MaintenanceRecord.asset_id == asset_id)
        if maintenance_type:
            query = query.where(MaintenanceRecord.maintenance_type == maintenance_type)

        # Apply pagination
        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        records = result.scalars().all()

        return [MaintenanceResponse.from_orm(record) for record in records]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching maintenance records: {str(e)}"
        )


@router.get("/maintenance/{maintenance_id}", response_model=MaintenanceResponse)
async def get_maintenance_record(
    maintenance_id: str, db: AsyncSession = Depends(get_db)
):
    """Get maintenance record by ID"""
    try:
        result = await db.execute(
            select(MaintenanceRecord).where(MaintenanceRecord.id == maintenance_id)
        )
        record = result.scalar_one_or_none()

        if not record:
            raise HTTPException(status_code=404, detail="Maintenance record not found")

        return MaintenanceResponse.from_orm(record)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching maintenance record: {str(e)}"
        )


@router.post("/maintenance", response_model=MaintenanceResponse)
async def create_maintenance_record(
    maintenance_data: MaintenanceCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new maintenance record"""
    try:
        record = MaintenanceRecord(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org for now
            asset_id=maintenance_data.asset_id,
            maintenance_type=maintenance_data.maintenance_type,
            status=maintenance_data.status or "pending",
            priority=maintenance_data.priority or "medium",
            scheduled_date=datetime.fromisoformat(maintenance_data.scheduled_date),
            assigned_to_user_id=maintenance_data.assigned_to_user_id,
            assigned_to_user_name=maintenance_data.assigned_to_user_name,
            description=maintenance_data.description,
            estimated_duration_hours=maintenance_data.estimated_duration_hours,
            estimated_cost=maintenance_data.estimated_cost,
            notes=maintenance_data.notes,
            metadata=maintenance_data.metadata or {},
        )

        db.add(record)
        await db.commit()
        await db.refresh(record)

        return MaintenanceResponse.from_orm(record)

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error creating maintenance record: {str(e)}"
        )


@router.put("/maintenance/{maintenance_id}", response_model=MaintenanceResponse)
async def update_maintenance_record(
    maintenance_id: str,
    maintenance_data: MaintenanceUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing maintenance record"""
    try:
        result = await db.execute(
            select(MaintenanceRecord).where(MaintenanceRecord.id == maintenance_id)
        )
        record = result.scalar_one_or_none()

        if not record:
            raise HTTPException(status_code=404, detail="Maintenance record not found")

        # Update fields
        update_data = maintenance_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field in ["scheduled_date", "completed_date"] and value:
                setattr(record, field, datetime.fromisoformat(value))
            else:
                setattr(record, field, value)

        await db.commit()
        await db.refresh(record)

        return MaintenanceResponse.from_orm(record)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error updating maintenance record: {str(e)}"
        )


@router.delete("/maintenance/{maintenance_id}")
async def delete_maintenance_record(
    maintenance_id: str, db: AsyncSession = Depends(get_db)
):
    """Delete a maintenance record (soft delete)"""
    try:
        result = await db.execute(
            select(MaintenanceRecord).where(MaintenanceRecord.id == maintenance_id)
        )
        record = result.scalar_one_or_none()

        if not record:
            raise HTTPException(status_code=404, detail="Maintenance record not found")

        # Soft delete
        record.deleted_at = datetime.now()
        await db.commit()

        return {"message": "Maintenance record deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error deleting maintenance record: {str(e)}"
        )


@router.get("/maintenance/asset/{asset_id}")
async def get_asset_maintenance_history(
    asset_id: str,
    limit: int = Query(50, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get maintenance history for a specific asset"""
    try:
        query = (
            select(MaintenanceRecord)
            .where(MaintenanceRecord.asset_id == asset_id)
            .order_by(MaintenanceRecord.scheduled_date.desc())
            .limit(limit)
        )

        result = await db.execute(query)
        records = result.scalars().all()

        return [
            {
                "id": str(record.id),
                "maintenance_type": record.maintenance_type,
                "status": record.status,
                "priority": record.priority,
                "scheduled_date": record.scheduled_date.isoformat(),
                "completed_date": record.completed_date.isoformat()
                if record.completed_date
                else None,
                "assigned_to_user_name": record.assigned_to_user_name,
                "description": record.description,
                "estimated_duration_hours": float(record.estimated_duration_hours)
                if record.estimated_duration_hours
                else None,
                "estimated_cost": float(record.estimated_cost)
                if record.estimated_cost
                else None,
                "actual_duration_hours": float(record.actual_duration_hours)
                if record.actual_duration_hours
                else None,
                "actual_cost": float(record.actual_cost)
                if record.actual_cost
                else None,
                "notes": record.notes,
            }
            for record in records
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching asset maintenance history: {str(e)}",
        )


@router.get("/maintenance/overdue")
async def get_overdue_maintenance(db: AsyncSession = Depends(get_db)):
    """Get overdue maintenance records"""
    try:
        current_date = datetime.now().date()
        query = (
            select(MaintenanceRecord)
            .where(
                MaintenanceRecord.scheduled_date < current_date,
                MaintenanceRecord.status.in_(["pending", "scheduled"]),
            )
            .order_by(MaintenanceRecord.scheduled_date.asc())
        )

        result = await db.execute(query)
        records = result.scalars().all()

        return [
            {
                "id": str(record.id),
                "asset_id": str(record.asset_id),
                "maintenance_type": record.maintenance_type,
                "priority": record.priority,
                "scheduled_date": record.scheduled_date.isoformat(),
                "days_overdue": (current_date - record.scheduled_date).days,
                "assigned_to_user_name": record.assigned_to_user_name,
                "description": record.description,
            }
            for record in records
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching overdue maintenance: {str(e)}"
        )


@router.get("/maintenance/stats/summary")
async def get_maintenance_stats(db: AsyncSession = Depends(get_db)):
    """Get maintenance statistics summary"""
    try:
        # Get counts by status
        pending_count = await db.execute(
            select(MaintenanceRecord).where(MaintenanceRecord.status == "pending")
        )
        pending_records = pending_count.scalars().all()

        in_progress_count = await db.execute(
            select(MaintenanceRecord).where(MaintenanceRecord.status == "in_progress")
        )
        in_progress_records = in_progress_count.scalars().all()

        completed_count = await db.execute(
            select(MaintenanceRecord).where(MaintenanceRecord.status == "completed")
        )
        completed_records = completed_count.scalars().all()

        overdue_count = await db.execute(
            select(MaintenanceRecord).where(
                MaintenanceRecord.scheduled_date < datetime.now().date(),
                MaintenanceRecord.status.in_(["pending", "scheduled"]),
            )
        )
        overdue_records = overdue_count.scalars().all()

        return {
            "by_status": {
                "pending": len(pending_records),
                "in_progress": len(in_progress_records),
                "completed": len(completed_records),
            },
            "overdue": len(overdue_records),
            "total": len(pending_records)
            + len(in_progress_records)
            + len(completed_records),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching maintenance stats: {str(e)}"
        )
