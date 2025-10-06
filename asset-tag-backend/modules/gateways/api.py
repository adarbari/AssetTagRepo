"""
Gateway API endpoints
"""

import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from config.database import get_db
from modules.gateways.models import Gateway
from modules.gateways.schemas import (GatewayCreate, GatewayResponse,
                                      GatewayUpdate)

router = APIRouter()


@router.get("/gateways", response_model=List[GatewayResponse])
async def get_gateways(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    site_id: Optional[str] = None,
    is_online: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get list of gateways with optional filtering"""
    try:
        query = select(Gateway)

        # Apply filters
        if status:
            query = query.where(Gateway.status == status)
        if site_id:
            query = query.where(Gateway.site_id == site_id)
        if is_online is not None:
            query = query.where(Gateway.is_online == is_online)

        # Apply pagination
        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        gateways = result.scalars().all()

        return [GatewayResponse.from_orm(gateway) for gateway in gateways]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching gateways: {str(e)}"
        )


@router.get("/gateways/{gateway_id}", response_model=GatewayResponse)
async def get_gateway(gateway_id: str, db: AsyncSession = Depends(get_db)):
    """Get gateway by ID"""
    try:
        result = await db.execute(select(Gateway).where(Gateway.id == gateway_id))
        gateway = result.scalar_one_or_none()

        if not gateway:
            raise HTTPException(status_code=404, detail="Gateway not found")

        return GatewayResponse.from_orm(gateway)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching gateway: {str(e)}")


@router.post("/gateways", response_model=GatewayResponse)
async def create_gateway(
    gateway_data: GatewayCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new gateway"""
    try:
        # Check if gateway_id already exists
        existing = await db.execute(
            select(Gateway).where(Gateway.gateway_id == gateway_data.gateway_id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=400, detail="Gateway with this ID already exists"
            )

        # Create new gateway
        gateway = Gateway(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org for now
            name=gateway_data.name,
            gateway_id=gateway_data.gateway_id,
            status=gateway_data.status or "active",
            site_id=gateway_data.site_id,
            latitude=gateway_data.latitude,
            longitude=gateway_data.longitude,
            altitude=gateway_data.altitude,
            model=gateway_data.model,
            firmware_version=gateway_data.firmware_version,
            battery_level=gateway_data.battery_level,
            signal_strength=gateway_data.signal_strength,
            transmission_power=gateway_data.transmission_power,
            scan_interval=gateway_data.scan_interval,
            advertising_interval=gateway_data.advertising_interval,
            is_online=True,
            metadata=gateway_data.metadata or {},
        )

        db.add(gateway)
        await db.commit()
        await db.refresh(gateway)

        return GatewayResponse.from_orm(gateway)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating gateway: {str(e)}")


@router.put("/gateways/{gateway_id}", response_model=GatewayResponse)
async def update_gateway(
    gateway_id: str, gateway_data: GatewayUpdate, db: AsyncSession = Depends(get_db)
):
    """Update an existing gateway"""
    try:
        # Get existing gateway
        result = await db.execute(select(Gateway).where(Gateway.id == gateway_id))
        gateway = result.scalar_one_or_none()

        if not gateway:
            raise HTTPException(status_code=404, detail="Gateway not found")

        # Update fields
        update_data = gateway_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(gateway, field, value)

        await db.commit()
        await db.refresh(gateway)

        return GatewayResponse.from_orm(gateway)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating gateway: {str(e)}")


@router.delete("/gateways/{gateway_id}")
async def delete_gateway(gateway_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a gateway (soft delete)"""
    try:
        # Get existing gateway
        result = await db.execute(select(Gateway).where(Gateway.id == gateway_id))
        gateway = result.scalar_one_or_none()

        if not gateway:
            raise HTTPException(status_code=404, detail="Gateway not found")

        # Soft delete
        gateway.deleted_at = datetime.now()
        await db.commit()

        return {"message": "Gateway deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting gateway: {str(e)}")


@router.get("/gateways/{gateway_id}/observations")
async def get_gateway_observations(
    gateway_id: str,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get observations from a specific gateway"""
    try:
        from datetime import datetime

        from modules.observations.models import Observation

        query = select(Observation).where(Observation.gateway_id == gateway_id)

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
                "asset_id": str(obs.asset_id),
                "rssi": obs.rssi,
                "battery_level": obs.battery_level,
                "temperature": float(obs.temperature) if obs.temperature else None,
                "observed_at": obs.observed_at.isoformat(),
                "received_at": obs.received_at.isoformat(),
                "signal_quality": obs.signal_quality,
                "metadata": obs.metadata,
            }
            for obs in observations
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching gateway observations: {str(e)}"
        )
