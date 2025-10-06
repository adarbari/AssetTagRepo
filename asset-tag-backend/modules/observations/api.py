"""
Observation API endpoints
"""

import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from config.database import get_db
from modules.observations.models import Observation, ObservationBatch
from modules.observations.schemas import (ObservationBatchCreate,
                                          ObservationBatchResponse,
                                          ObservationBatchUpdate,
                                          ObservationBulkCreate,
                                          ObservationBulkResponse,
                                          ObservationCreate,
                                          ObservationResponse,
                                          ObservationStatsResponse,
                                          ObservationUpdate)

router = APIRouter()


def _observation_to_response(observation: Observation) -> ObservationResponse:
    """Convert Observation model to ObservationResponse schema"""
    return ObservationResponse(
        id=str(observation.id),
        organization_id=str(observation.organization_id),
        asset_id=str(observation.asset_id),
        gateway_id=str(observation.gateway_id),
        rssi=observation.rssi,
        battery_level=observation.battery_level,
        temperature=observation.temperature,
        observed_at=observation.observed_at.isoformat(),
        received_at=observation.received_at.isoformat(),
        signal_quality=observation.signal_quality,
        noise_level=observation.noise_level,
        metadata=observation.observation_metadata or {},
        created_at=observation.created_at,
        updated_at=observation.updated_at,
    )


@router.get("/observations", response_model=List[ObservationResponse])
async def get_observations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    asset_id: Optional[str] = None,
    gateway_id: Optional[str] = None,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    min_rssi: Optional[int] = None,
    max_rssi: Optional[int] = None,
    signal_quality: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get list of observations with optional filtering"""
    try:
        query = select(Observation)

        # Apply filters
        if asset_id:
            query = query.where(Observation.asset_id == asset_id)
        if gateway_id:
            query = query.where(Observation.gateway_id == gateway_id)
        if start_time:
            start_dt = datetime.fromisoformat(start_time)
            query = query.where(Observation.observed_at >= start_dt)
        if end_time:
            end_dt = datetime.fromisoformat(end_time)
            query = query.where(Observation.observed_at <= end_dt)
        if min_rssi is not None:
            query = query.where(Observation.rssi >= min_rssi)
        if max_rssi is not None:
            query = query.where(Observation.rssi <= max_rssi)
        if signal_quality:
            query = query.where(Observation.signal_quality == signal_quality)

        # Apply pagination and ordering
        query = query.order_by(Observation.observed_at.desc()).offset(skip).limit(limit)

        result = await db.execute(query)
        observations = result.scalars().all()

        return [_observation_to_response(obs) for obs in observations]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching observations: {str(e)}"
        )


@router.get("/observations/{observation_id}", response_model=ObservationResponse)
async def get_observation(observation_id: str, db: AsyncSession = Depends(get_db)):
    """Get observation by ID"""
    try:
        result = await db.execute(
            select(Observation).where(Observation.id == observation_id)
        )
        observation = result.scalar_one_or_none()

        if not observation:
            raise HTTPException(status_code=404, detail="Observation not found")

        return _observation_to_response(observation)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching observation: {str(e)}"
        )


@router.post("/observations", response_model=ObservationResponse, status_code=201)
async def create_observation(
    observation_data: ObservationCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new observation"""
    try:
        # Parse timestamps
        # Handle ISO format with Z suffix
        observed_at_str = observation_data.observed_at.replace("Z", "+00:00")
        observed_at = datetime.fromisoformat(observed_at_str)

        if observation_data.received_at:
            received_at_str = observation_data.received_at.replace("Z", "+00:00")
            received_at = datetime.fromisoformat(received_at_str)
        else:
            received_at = datetime.now()

        # Create new observation
        observation = Observation(
            organization_id=uuid.UUID(
                "00000000-0000-0000-0000-000000000000"
            ),  # Default org for now
            asset_id=uuid.UUID(observation_data.asset_id),
            gateway_id=uuid.UUID(observation_data.gateway_id),
            rssi=observation_data.rssi,
            battery_level=observation_data.battery_level,
            temperature=observation_data.temperature,
            observed_at=observed_at,
            received_at=received_at,
            signal_quality=observation_data.signal_quality,
            noise_level=observation_data.noise_level,
            metadata=observation_data.metadata or {},
        )

        db.add(observation)
        await db.commit()
        await db.refresh(observation)

        return _observation_to_response(observation)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid timestamp format: {e}")
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error creating observation: {str(e)}"
        )


@router.post(
    "/observations/bulk", response_model=ObservationBulkResponse, status_code=201
)
async def create_observations_bulk(
    bulk_data: ObservationBulkCreate, db: AsyncSession = Depends(get_db)
):
    """Create multiple observations in bulk"""
    try:
        batch_id = bulk_data.batch_id or str(uuid.uuid4())
        created_count = 0
        failed_count = 0
        errors = []

        # Create batch record
        batch = ObservationBatch(
            organization_id="00000000-0000-0000-0000-000000000000",
            batch_id=batch_id,
            start_time=datetime.now(),
            end_time=datetime.now(),
            observation_count=len(bulk_data.observations),
            processing_status="processing",
        )
        db.add(batch)

        for i, obs_data in enumerate(bulk_data.observations):
            try:
                # Parse timestamps
                observed_at = datetime.fromisoformat(obs_data.observed_at)
                received_at = (
                    datetime.fromisoformat(obs_data.received_at)
                    if obs_data.received_at
                    else datetime.now()
                )

                observation = Observation(
                    organization_id="00000000-0000-0000-0000-000000000000",
                    asset_id=obs_data.asset_id,
                    gateway_id=obs_data.gateway_id,
                    rssi=obs_data.rssi,
                    battery_level=obs_data.battery_level,
                    temperature=obs_data.temperature,
                    observed_at=observed_at,
                    received_at=received_at,
                    signal_quality=obs_data.signal_quality,
                    noise_level=obs_data.noise_level,
                    metadata=obs_data.metadata or {},
                )

                db.add(observation)
                created_count += 1

            except Exception as e:
                failed_count += 1
                errors.append(
                    {"index": i, "error": str(e), "data": obs_data.model_dump()}
                )

        # Update batch status
        batch.end_time = datetime.now()
        batch.processing_status = (
            "completed" if failed_count == 0 else "completed_with_errors"
        )

        await db.commit()

        return ObservationBulkResponse(
            created_count=created_count,
            failed_count=failed_count,
            batch_id=batch_id,
            errors=errors,
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error creating bulk observations: {str(e)}"
        )


@router.put("/observations/{observation_id}", response_model=ObservationResponse)
async def update_observation(
    observation_id: str,
    observation_data: ObservationUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing observation"""
    try:
        # Get existing observation
        result = await db.execute(
            select(Observation).where(Observation.id == observation_id)
        )
        observation = result.scalar_one_or_none()

        if not observation:
            raise HTTPException(status_code=404, detail="Observation not found")

        # Update fields
        update_data = observation_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(observation, field, value)

        await db.commit()
        await db.refresh(observation)

        return _observation_to_response(observation)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error updating observation: {str(e)}"
        )


@router.get("/observations/asset/{asset_id}/latest")
async def get_latest_observation_for_asset(
    asset_id: str, db: AsyncSession = Depends(get_db)
):
    """Get the latest observation for a specific asset"""
    try:
        result = await db.execute(
            select(Observation)
            .where(Observation.asset_id == asset_id)
            .order_by(Observation.observed_at.desc())
            .limit(1)
        )
        observation = result.scalar_one_or_none()

        if not observation:
            raise HTTPException(
                status_code=404, detail="No observations found for asset"
            )

        return _observation_to_response(observation)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching latest observation: {str(e)}"
        )


@router.get("/observations/asset/{asset_id}/history")
async def get_asset_observation_history(
    asset_id: str,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get observation history for a specific asset"""
    try:
        query = select(Observation).where(Observation.asset_id == asset_id)

        # Apply time filters
        if start_time:
            start_dt = datetime.fromisoformat(start_time)
            query = query.where(Observation.observed_at >= start_dt)

        if end_time:
            end_dt = datetime.fromisoformat(end_time)
            query = query.where(Observation.observed_at <= end_dt)

        # Order by time and limit
        query = query.order_by(Observation.observed_at.desc()).limit(limit)

        result = await db.execute(query)
        observations = result.scalars().all()

        return [
            {
                "id": str(obs.id),
                "gateway_id": str(obs.gateway_id),
                "rssi": obs.rssi,
                "battery_level": obs.battery_level,
                "temperature": float(obs.temperature) if obs.temperature else None,
                "observed_at": obs.observed_at.isoformat(),
                "received_at": obs.received_at.isoformat(),
                "signal_quality": obs.signal_quality,
                "noise_level": obs.noise_level,
                "metadata": obs.metadata,
            }
            for obs in observations
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching asset observation history: {str(e)}",
        )


@router.get("/observations/gateway/{gateway_id}/recent")
async def get_recent_observations_for_gateway(
    gateway_id: str,
    hours: int = Query(24, ge=1, le=168),  # Default 24 hours, max 1 week
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get recent observations from a specific gateway"""
    try:
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=hours)

        query = (
            select(Observation)
            .where(
                and_(
                    Observation.gateway_id == gateway_id,
                    Observation.observed_at >= start_time,
                    Observation.observed_at <= end_time,
                )
            )
            .order_by(Observation.observed_at.desc())
            .limit(limit)
        )

        result = await db.execute(query)
        observations = result.scalars().all()

        return [
            {
                "id": str(obs.id),
                "asset_id": str(obs.asset_id),
                "rssi": obs.rssi,
                "battery_level": obs.battery_level,
                "temperature": float(obs.temperature) if obs.temperature else None,
                "observed_at": obs.observed_at.isoformat(),
                "signal_quality": obs.signal_quality,
                "metadata": obs.metadata,
            }
            for obs in observations
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching gateway observations: {str(e)}"
        )


@router.get("/observations/stats", response_model=ObservationStatsResponse)
async def get_observation_stats(
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    asset_id: Optional[str] = None,
    gateway_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get observation statistics"""
    try:
        # Build base query
        query = select(Observation)

        # Apply filters
        if start_time:
            start_dt = datetime.fromisoformat(start_time)
            query = query.where(Observation.observed_at >= start_dt)
        if end_time:
            end_dt = datetime.fromisoformat(end_time)
            query = query.where(Observation.observed_at <= end_dt)
        if asset_id:
            query = query.where(Observation.asset_id == asset_id)
        if gateway_id:
            query = query.where(Observation.gateway_id == gateway_id)

        # Get total count
        total_result = await db.execute(
            select(func.count(Observation.id)).select_from(query.subquery())
        )
        total_observations = total_result.scalar()

        # Get unique counts
        unique_assets_result = await db.execute(
            select(func.count(func.distinct(Observation.asset_id))).select_from(
                query.subquery()
            )
        )
        unique_assets = unique_assets_result.scalar()

        unique_gateways_result = await db.execute(
            select(func.count(func.distinct(Observation.gateway_id))).select_from(
                query.subquery()
            )
        )
        unique_gateways = unique_gateways_result.scalar()

        # Get RSSI statistics
        rssi_stats = await db.execute(
            select(
                func.avg(Observation.rssi).label("avg_rssi"),
                func.min(Observation.rssi).label("min_rssi"),
                func.max(Observation.rssi).label("max_rssi"),
            ).select_from(query.subquery())
        )
        rssi_data = rssi_stats.first()

        # Get battery and temperature averages
        other_stats = await db.execute(
            select(
                func.avg(Observation.battery_level).label("avg_battery"),
                func.avg(Observation.temperature).label("avg_temperature"),
            ).select_from(query.subquery())
        )
        other_data = other_stats.first()

        # Get signal quality distribution
        quality_dist = await db.execute(
            select(
                Observation.signal_quality, func.count(Observation.id).label("count")
            )
            .select_from(query.subquery())
            .group_by(Observation.signal_quality)
        )
        quality_distribution = {
            row.signal_quality or "unknown": row.count for row in quality_dist
        }

        # Get time range
        time_range_result = await db.execute(
            select(
                func.min(Observation.observed_at).label("min_time"),
                func.max(Observation.observed_at).label("max_time"),
            ).select_from(query.subquery())
        )
        time_range_data = time_range_result.first()

        return ObservationStatsResponse(
            total_observations=total_observations,
            unique_assets=unique_assets,
            unique_gateways=unique_gateways,
            avg_rssi=float(rssi_data.avg_rssi) if rssi_data.avg_rssi else None,
            min_rssi=rssi_data.min_rssi,
            max_rssi=rssi_data.max_rssi,
            avg_battery_level=(
                float(other_data.avg_battery) if other_data.avg_battery else None
            ),
            avg_temperature=(
                float(other_data.avg_temperature)
                if other_data.avg_temperature
                else None
            ),
            time_range={
                "start": (
                    time_range_data.min_time.isoformat()
                    if time_range_data.min_time
                    else None
                ),
                "end": (
                    time_range_data.max_time.isoformat()
                    if time_range_data.max_time
                    else None
                ),
            },
            signal_quality_distribution=quality_distribution,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching observation stats: {str(e)}"
        )


@router.get("/observations/batches", response_model=List[ObservationBatchResponse])
async def get_observation_batches(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    processing_status: Optional[str] = None,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get observation batches with optional filtering"""
    try:
        query = select(ObservationBatch)

        # Apply filters
        if processing_status:
            query = query.where(ObservationBatch.processing_status == processing_status)
        if start_time:
            start_dt = datetime.fromisoformat(start_time)
            query = query.where(ObservationBatch.start_time >= start_dt)
        if end_time:
            end_dt = datetime.fromisoformat(end_time)
            query = query.where(ObservationBatch.end_time <= end_dt)

        # Apply pagination and ordering
        query = (
            query.order_by(ObservationBatch.start_time.desc()).offset(skip).limit(limit)
        )

        result = await db.execute(query)
        batches = result.scalars().all()

        return [ObservationBatchResponse.from_orm(batch) for batch in batches]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching observation batches: {str(e)}"
        )


@router.get("/observations/batches/{batch_id}", response_model=ObservationBatchResponse)
async def get_observation_batch(batch_id: str, db: AsyncSession = Depends(get_db)):
    """Get observation batch by ID"""
    try:
        result = await db.execute(
            select(ObservationBatch).where(ObservationBatch.batch_id == batch_id)
        )
        batch = result.scalar_one_or_none()

        if not batch:
            raise HTTPException(status_code=404, detail="Observation batch not found")

        return ObservationBatchResponse.from_orm(batch)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching observation batch: {str(e)}"
        )


@router.put("/observations/batches/{batch_id}", response_model=ObservationBatchResponse)
async def update_observation_batch(
    batch_id: str,
    batch_data: ObservationBatchUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an observation batch"""
    try:
        result = await db.execute(
            select(ObservationBatch).where(ObservationBatch.batch_id == batch_id)
        )
        batch = result.scalar_one_or_none()

        if not batch:
            raise HTTPException(status_code=404, detail="Observation batch not found")

        # Update fields
        update_data = batch_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(batch, field, value)

        await db.commit()
        await db.refresh(batch)

        return ObservationBatchResponse.from_orm(batch)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error updating observation batch: {str(e)}"
        )
