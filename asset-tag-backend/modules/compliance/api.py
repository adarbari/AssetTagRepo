"""
Compliance API endpoints
"""
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from config.database import get_db
from modules.compliance.models import Compliance, ComplianceCheck
from modules.compliance.schemas import (ComplianceCheckCreate,
                                        ComplianceCheckResponse,
                                        ComplianceCreate, ComplianceResponse,
                                        ComplianceStats, ComplianceUpdate,
                                        ComplianceWithChecks)

router = APIRouter()


@router.get("/compliance", response_model=List[ComplianceResponse])
async def get_compliance_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    compliance_type: Optional[str] = None,
    assigned_to_user_id: Optional[str] = None,
    asset_id: Optional[str] = None,
    overdue_only: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get list of compliance records with optional filtering"""
    try:
        query = select(Compliance).where(Compliance.deleted_at.is_(None))

        # Apply filters
        if status:
            query = query.where(Compliance.status == status)
        if compliance_type:
            query = query.where(Compliance.compliance_type == compliance_type)
        if assigned_to_user_id:
            query = query.where(Compliance.assigned_to_user_id == assigned_to_user_id)
        if asset_id:
            query = query.where(Compliance.asset_id == asset_id)
        if overdue_only:
            query = query.where(
                and_(
                    Compliance.due_date < datetime.now(),
                    Compliance.status.in_(["pending", "in-progress"]),
                )
            )
        if search:
            search_filter = or_(
                Compliance.title.ilike(f"%{search}%"),
                Compliance.description.ilike(f"%{search}%"),
                Compliance.asset_name.ilike(f"%{search}%"),
                Compliance.certification_type.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)

        # Apply pagination
        query = query.order_by(Compliance.due_date.asc()).offset(skip).limit(limit)

        result = await db.execute(query)
        compliance_records = result.scalars().all()

        return [ComplianceResponse.from_orm(record) for record in compliance_records]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching compliance records: {str(e)}"
        )


@router.get("/compliance/{compliance_id}", response_model=ComplianceWithChecks)
async def get_compliance_record(compliance_id: str, db: AsyncSession = Depends(get_db)):
    """Get compliance record by ID with checks"""
    try:
        result = await db.execute(
            select(Compliance).where(
                and_(Compliance.id == compliance_id, Compliance.deleted_at.is_(None))
            )
        )
        compliance = result.scalar_one_or_none()

        if not compliance:
            raise HTTPException(status_code=404, detail="Compliance record not found")

        return ComplianceWithChecks.from_orm(compliance)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching compliance record: {str(e)}"
        )


@router.post("/compliance", response_model=ComplianceResponse)
async def create_compliance_record(
    compliance_data: ComplianceCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new compliance record"""
    try:
        compliance = Compliance(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org for now
            compliance_type=compliance_data.compliance_type,
            title=compliance_data.title,
            description=compliance_data.description,
            asset_id=compliance_data.asset_id,
            asset_name=compliance_data.asset_name,
            assigned_to_user_id=compliance_data.assigned_to_user_id,
            assigned_to_name=compliance_data.assigned_to_name,
            due_date=compliance_data.due_date,
            certification_type=compliance_data.certification_type,
            certification_number=compliance_data.certification_number,
            issuing_authority=compliance_data.issuing_authority,
            renewal_required=compliance_data.renewal_required,
            renewal_frequency_months=compliance_data.renewal_frequency_months,
            document_url=compliance_data.document_url,
            document_name=compliance_data.document_name,
            document_type=compliance_data.document_type,
            notes=compliance_data.notes,
            tags=compliance_data.tags or [],
            metadata=compliance_data.metadata or {},
        )

        db.add(compliance)
        await db.commit()
        await db.refresh(compliance)

        return ComplianceResponse.from_orm(compliance)

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error creating compliance record: {str(e)}"
        )


@router.put("/compliance/{compliance_id}", response_model=ComplianceResponse)
async def update_compliance_record(
    compliance_id: str,
    compliance_data: ComplianceUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing compliance record"""
    try:
        result = await db.execute(
            select(Compliance).where(
                and_(Compliance.id == compliance_id, Compliance.deleted_at.is_(None))
            )
        )
        compliance = result.scalar_one_or_none()

        if not compliance:
            raise HTTPException(status_code=404, detail="Compliance record not found")

        # Update fields
        update_data = compliance_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(compliance, field, value)

        # Update status based on completion
        if "completed_date" in update_data and update_data["completed_date"]:
            compliance.status = "completed"
        elif (
            "status" in update_data
            and update_data["status"] == "completed"
            and not compliance.completed_date
        ):
            compliance.completed_date = datetime.now()

        # Check if overdue
        if compliance.due_date < datetime.now() and compliance.status in [
            "pending",
            "in-progress",
        ]:
            compliance.status = "overdue"

        await db.commit()
        await db.refresh(compliance)

        return ComplianceResponse.from_orm(compliance)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error updating compliance record: {str(e)}"
        )


@router.delete("/compliance/{compliance_id}")
async def delete_compliance_record(
    compliance_id: str, db: AsyncSession = Depends(get_db)
):
    """Delete a compliance record (soft delete)"""
    try:
        result = await db.execute(
            select(Compliance).where(
                and_(Compliance.id == compliance_id, Compliance.deleted_at.is_(None))
            )
        )
        compliance = result.scalar_one_or_none()

        if not compliance:
            raise HTTPException(status_code=404, detail="Compliance record not found")

        # Soft delete
        compliance.deleted_at = datetime.now()
        await db.commit()

        return {"message": "Compliance record deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error deleting compliance record: {str(e)}"
        )


@router.get("/compliance/stats", response_model=ComplianceStats)
async def get_compliance_stats(db: AsyncSession = Depends(get_db)):
    """Get compliance statistics"""
    try:
        # Get total compliance records
        total_result = await db.execute(
            select(func.count(Compliance.id)).where(Compliance.deleted_at.is_(None))
        )
        total_compliance = total_result.scalar()

        # Get status counts
        status_counts = {}
        for status in ["pending", "in-progress", "completed", "overdue", "cancelled"]:
            result = await db.execute(
                select(func.count(Compliance.id)).where(
                    and_(Compliance.status == status, Compliance.deleted_at.is_(None))
                )
            )
            status_counts[status] = result.scalar()

        # Get compliance by type
        type_result = await db.execute(
            select(Compliance.compliance_type, func.count(Compliance.id))
            .where(Compliance.deleted_at.is_(None))
            .group_by(Compliance.compliance_type)
        )
        compliance_by_type = {row[0]: row[1] for row in type_result.fetchall()}

        # Get upcoming due dates (next 30 days)
        upcoming_date = datetime.now() + timedelta(days=30)
        upcoming_result = await db.execute(
            select(func.count(Compliance.id)).where(
                and_(
                    Compliance.due_date <= upcoming_date,
                    Compliance.due_date >= datetime.now(),
                    Compliance.status.in_(["pending", "in-progress"]),
                    Compliance.deleted_at.is_(None),
                )
            )
        )
        upcoming_due_dates = upcoming_result.scalar()

        # Calculate compliance rate
        compliance_rate = None
        if total_compliance > 0:
            completed = status_counts.get("completed", 0)
            compliance_rate = (completed / total_compliance) * 100

        return ComplianceStats(
            total_compliance=total_compliance,
            pending_compliance=status_counts.get("pending", 0),
            in_progress_compliance=status_counts.get("in-progress", 0),
            completed_compliance=status_counts.get("completed", 0),
            overdue_compliance=status_counts.get("overdue", 0),
            cancelled_compliance=status_counts.get("cancelled", 0),
            compliance_by_type=compliance_by_type,
            upcoming_due_dates=upcoming_due_dates,
            avg_completion_time_days=None,  # TODO: Calculate from completed records
            compliance_rate=compliance_rate,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching compliance stats: {str(e)}"
        )


@router.get("/compliance/overdue", response_model=List[ComplianceResponse])
async def get_overdue_compliance(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get overdue compliance records"""
    try:
        query = (
            select(Compliance)
            .where(
                and_(
                    Compliance.due_date < datetime.now(),
                    Compliance.status.in_(["pending", "in-progress"]),
                    Compliance.deleted_at.is_(None),
                )
            )
            .order_by(Compliance.due_date.asc())
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        overdue_records = result.scalars().all()

        return [ComplianceResponse.from_orm(record) for record in overdue_records]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching overdue compliance: {str(e)}"
        )


@router.post(
    "/compliance/{compliance_id}/checks", response_model=ComplianceCheckResponse
)
async def add_compliance_check(
    compliance_id: str,
    check_data: ComplianceCheckCreate,
    db: AsyncSession = Depends(get_db),
):
    """Add a compliance check to a compliance record"""
    try:
        # Check if compliance record exists
        compliance_result = await db.execute(
            select(Compliance).where(
                and_(Compliance.id == compliance_id, Compliance.deleted_at.is_(None))
            )
        )
        compliance = compliance_result.scalar_one_or_none()
        if not compliance:
            raise HTTPException(status_code=404, detail="Compliance record not found")

        # Create check
        check = ComplianceCheck(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org
            compliance_id=compliance_id,
            check_type=check_data.check_type,
            check_date=check_data.check_date,
            result=check_data.result,
            score=check_data.score,
            checked_by_user_id=check_data.checked_by_user_id,
            checked_by_name=check_data.checked_by_name,
            checked_by_role=check_data.checked_by_role,
            findings=check_data.findings,
            recommendations=check_data.recommendations,
            corrective_actions=check_data.corrective_actions,
            next_check_date=check_data.next_check_date,
            document_url=check_data.document_url,
            document_name=check_data.document_name,
            notes=check_data.notes,
            metadata=check_data.metadata or {},
        )

        db.add(check)
        await db.commit()
        await db.refresh(check)

        return ComplianceCheckResponse.from_orm(check)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error adding compliance check: {str(e)}"
        )


@router.get(
    "/compliance/{compliance_id}/checks", response_model=List[ComplianceCheckResponse]
)
async def get_compliance_checks(
    compliance_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get compliance checks for a compliance record"""
    try:
        # Check if compliance record exists
        compliance_result = await db.execute(
            select(Compliance).where(
                and_(Compliance.id == compliance_id, Compliance.deleted_at.is_(None))
            )
        )
        compliance = compliance_result.scalar_one_or_none()
        if not compliance:
            raise HTTPException(status_code=404, detail="Compliance record not found")

        # Get checks
        query = (
            select(ComplianceCheck)
            .where(ComplianceCheck.compliance_id == compliance_id)
            .order_by(ComplianceCheck.check_date.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        checks = result.scalars().all()

        return [ComplianceCheckResponse.from_orm(check) for check in checks]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching compliance checks: {str(e)}"
        )
