"""
Asset Pydantic schemas
"""

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class AssetBase(BaseModel):
    """Base asset schema"""

    name: str = Field(..., min_length=1, max_length=255)
    serial_number: str = Field(..., min_length=1, max_length=100)
    asset_type: str = Field(..., min_length=1, max_length=100)
    status: Optional[str] = Field("active", max_length=50)
    current_site_id: Optional[str] = Field(None, max_length=100)
    location_description: Optional[str] = Field(None, max_length=500)
    battery_level: Optional[int] = Field(None, ge=0, le=100)
    temperature: Optional[float] = Field(None, ge=-50, le=100)
    manufacturer: Optional[str] = Field(None, max_length=255)
    model: Optional[str] = Field(None, max_length=255)
    purchase_date: Optional[str] = Field(None, max_length=100)
    warranty_expiry: Optional[str] = Field(None, max_length=100)
    hourly_rate: Optional[float] = Field(None, ge=0)
    availability: Optional[str] = Field("available", max_length=50)
    asset_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class AssetCreate(AssetBase):
    """Schema for creating an asset"""

    organization_id: Optional[str] = Field(None, max_length=100)


class AssetUpdate(BaseModel):
    """Schema for updating an asset"""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    asset_type: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[str] = Field(None, max_length=50)
    location_description: Optional[str] = Field(None, max_length=500)
    battery_level: Optional[int] = Field(None, ge=0, le=100)
    temperature: Optional[float] = Field(None, ge=-50, le=100)
    manufacturer: Optional[str] = Field(None, max_length=255)
    model: Optional[str] = Field(None, max_length=255)
    purchase_date: Optional[str] = Field(None, max_length=100)
    warranty_expiry: Optional[str] = Field(None, max_length=100)
    hourly_rate: Optional[float] = Field(None, ge=0)
    availability: Optional[str] = Field(None, max_length=50)
    asset_metadata: Optional[Dict[str, Any]] = None


class AssetResponse(AssetBase):
    """Schema for asset response"""

    id: str
    organization_id: str
    current_site_id: Optional[str] = None
    assigned_to_user_id: Optional[str] = None
    assigned_job_id: Optional[str] = None
    assignment_start_date: Optional[str] = None
    assignment_end_date: Optional[str] = None
    last_maintenance: Optional[str] = None
    next_maintenance: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
