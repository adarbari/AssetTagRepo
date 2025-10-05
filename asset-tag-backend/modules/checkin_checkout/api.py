"""
Check-in/Check-out API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List, Optional
from datetime import datetime

from config.database import get_db
from modules.checkin_checkout.models import CheckInOutRecord
from modules.checkin_checkout.schemas import CheckInCreate, CheckOutCreate, CheckInOutResponse

router = APIRouter()


@router.post("/checkin", response_model=CheckInOutResponse)
async def check_in_asset(
    checkin_data: CheckInCreate,
    db: AsyncSession = Depends(get_db)
):
    """Check in an asset"""
    try:
        # Check if asset is already checked in
        existing = await db.execute(
            select(CheckInOutRecord).where(
                CheckInOutRecord.asset_id == checkin_data.asset_id,
                CheckInOutRecord.check_out_time.is_(None)
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Asset is already checked in")
        
        # Create check-in record
        record = CheckInOutRecord(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org
            asset_id=checkin_data.asset_id,
            user_id=checkin_data.user_id,
            user_name=checkin_data.user_name,
            check_in_time=datetime.now(),
            check_in_location_lat=checkin_data.check_in_location_lat,
            check_in_location_lng=checkin_data.check_in_location_lng,
            check_in_location_description=checkin_data.check_in_location_description,
            purpose=checkin_data.purpose,
            expected_duration_hours=checkin_data.expected_duration_hours,
            notes=checkin_data.notes,
            metadata=checkin_data.metadata or {}
        )
        
        db.add(record)
        await db.commit()
        await db.refresh(record)
        
        return CheckInOutResponse.from_orm(record)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error checking in asset: {str(e)}")


@router.post("/checkout", response_model=CheckInOutResponse)
async def check_out_asset(
    checkout_data: CheckOutCreate,
    db: AsyncSession = Depends(get_db)
):
    """Check out an asset"""
    try:
        # Find the active check-in record
        result = await db.execute(
            select(CheckInOutRecord).where(
                CheckInOutRecord.asset_id == checkout_data.asset_id,
                CheckInOutRecord.check_out_time.is_(None)
            )
        )
        record = result.scalar_one_or_none()
        
        if not record:
            raise HTTPException(status_code=404, detail="No active check-in found for this asset")
        
        # Update with check-out information
        record.check_out_time = datetime.now()
        record.check_out_location_lat = checkout_data.check_out_location_lat
        record.check_out_location_lng = checkout_data.check_out_location_lng
        record.check_out_location_description = checkout_data.check_out_location_description
        record.actual_duration_hours = checkout_data.actual_duration_hours
        record.condition_notes = checkout_data.condition_notes
        record.return_notes = checkout_data.return_notes
        
        # Calculate actual duration if not provided
        if not record.actual_duration_hours:
            duration = record.check_out_time - record.check_in_time
            record.actual_duration_hours = duration.total_seconds() / 3600
        
        await db.commit()
        await db.refresh(record)
        
        return CheckInOutResponse.from_orm(record)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error checking out asset: {str(e)}")


@router.get("/checkin-checkout", response_model=List[CheckInOutResponse])
async def get_checkin_checkout_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    asset_id: Optional[str] = None,
    user_id: Optional[str] = None,
    status: Optional[str] = None,  # "checked_in", "checked_out"
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get check-in/check-out records with optional filtering"""
    try:
        query = select(CheckInOutRecord)
        
        # Apply filters
        if asset_id:
            query = query.where(CheckInOutRecord.asset_id == asset_id)
        if user_id:
            query = query.where(CheckInOutRecord.user_id == user_id)
        if status == "checked_in":
            query = query.where(CheckInOutRecord.check_out_time.is_(None))
        elif status == "checked_out":
            query = query.where(CheckInOutRecord.check_out_time.isnot(None))
        
        # Apply date filters
        if start_date:
            start_dt = datetime.fromisoformat(start_date)
            query = query.where(CheckInOutRecord.check_in_time >= start_dt)
        if end_date:
            end_dt = datetime.fromisoformat(end_date)
            query = query.where(CheckInOutRecord.check_in_time <= end_dt)
        
        # Apply pagination and ordering
        query = query.order_by(CheckInOutRecord.check_in_time.desc()).offset(skip).limit(limit)
        
        result = await db.execute(query)
        records = result.scalars().all()
        
        return [CheckInOutResponse.from_orm(record) for record in records]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching check-in/check-out records: {str(e)}")


@router.get("/checkin-checkout/{record_id}", response_model=CheckInOutResponse)
async def get_checkin_checkout_record(
    record_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get check-in/check-out record by ID"""
    try:
        result = await db.execute(select(CheckInOutRecord).where(CheckInOutRecord.id == record_id))
        record = result.scalar_one_or_none()
        
        if not record:
            raise HTTPException(status_code=404, detail="Check-in/check-out record not found")
        
        return CheckInOutResponse.from_orm(record)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching check-in/check-out record: {str(e)}")


@router.get("/checkin-checkout/asset/{asset_id}/current")
async def get_current_checkin_status(
    asset_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get current check-in status for an asset"""
    try:
        result = await db.execute(
            select(CheckInOutRecord).where(
                CheckInOutRecord.asset_id == asset_id,
                CheckInOutRecord.check_out_time.is_(None)
            ).order_by(CheckInOutRecord.check_in_time.desc()).limit(1)
        )
        record = result.scalar_one_or_none()
        
        if not record:
            return {
                "asset_id": asset_id,
                "status": "checked_out",
                "message": "Asset is currently checked out"
            }
        
        return {
            "asset_id": asset_id,
            "status": "checked_in",
            "check_in_time": record.check_in_time.isoformat(),
            "user_name": record.user_name,
            "purpose": record.purpose,
            "expected_duration_hours": float(record.expected_duration_hours) if record.expected_duration_hours else None,
            "check_in_location": {
                "latitude": float(record.check_in_location_lat) if record.check_in_location_lat else None,
                "longitude": float(record.check_in_location_lng) if record.check_in_location_lng else None,
                "description": record.check_in_location_description
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching current check-in status: {str(e)}")


@router.get("/checkin-checkout/overdue")
async def get_overdue_checkins(
    db: AsyncSession = Depends(get_db)
):
    """Get overdue check-ins (assets checked in longer than expected)"""
    try:
        current_time = datetime.now()
        
        # Find records where expected duration has passed but asset is still checked in
        query = select(CheckInOutRecord).where(
            CheckInOutRecord.check_out_time.is_(None),
            CheckInOutRecord.expected_duration_hours.isnot(None)
        )
        
        result = await db.execute(query)
        records = result.scalars().all()
        
        overdue_records = []
        for record in records:
            expected_end_time = record.check_in_time + timedelta(hours=record.expected_duration_hours)
            if current_time > expected_end_time:
                overdue_hours = (current_time - expected_end_time).total_seconds() / 3600
                overdue_records.append({
                    "record_id": str(record.id),
                    "asset_id": str(record.asset_id),
                    "user_name": record.user_name,
                    "check_in_time": record.check_in_time.isoformat(),
                    "expected_duration_hours": float(record.expected_duration_hours),
                    "overdue_hours": round(overdue_hours, 2),
                    "purpose": record.purpose
                })
        
        return {
            "overdue_count": len(overdue_records),
            "overdue_records": overdue_records
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching overdue check-ins: {str(e)}")


@router.get("/checkin-checkout/stats/summary")
async def get_checkin_checkout_stats(
    db: AsyncSession = Depends(get_db)
):
    """Get check-in/check-out statistics summary"""
    try:
        # Get counts
        total_records = await db.execute(select(CheckInOutRecord))
        all_records = total_records.scalars().all()
        
        checked_in_count = len([r for r in all_records if r.check_out_time is None])
        checked_out_count = len([r for r in all_records if r.check_out_time is not None])
        
        # Get today's activity
        today = datetime.now().date()
        today_records = [r for r in all_records if r.check_in_time.date() == today]
        today_checkins = len(today_records)
        today_checkouts = len([r for r in today_records if r.check_out_time is not None])
        
        return {
            "total_records": len(all_records),
            "currently_checked_in": checked_in_count,
            "currently_checked_out": checked_out_count,
            "today_checkins": today_checkins,
            "today_checkouts": today_checkouts
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching check-in/check-out stats: {str(e)}")
