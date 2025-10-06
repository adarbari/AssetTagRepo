"""
Vehicle schemas
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator


class VehicleBase(BaseModel):
    """Base vehicle schema"""

    name: str = Field(..., min_length=1, max_length=255, description="Vehicle name")
    vehicle_type: str = Field(..., min_length=1, max_length=100, description="Type of vehicle")
    license_plate: Optional[str] = Field(None, max_length=50, description="License plate number")
    status: Optional[str] = Field("active", description="Vehicle status")
    current_latitude: Optional[float] = Field(None, ge=-90, le=90, description="Current latitude")
    current_longitude: Optional[float] = Field(None, ge=-180, le=180, description="Current longitude")
    last_seen: Optional[str] = Field(None, description="Last seen timestamp (ISO format)")
    assigned_driver_id: Optional[UUID] = Field(None, description="Assigned driver user ID")
    assigned_driver_name: Optional[str] = Field(None, max_length=255, description="Assigned driver name")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")

    @validator("status")
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ["active", "inactive", "maintenance", "out_of_service"]
            if v not in allowed_statuses:
                raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v

    @validator("vehicle_type")
    def validate_vehicle_type(cls, v):
        allowed_types = ["truck", "van", "car", "trailer", "excavator", "loader", "crane", "other"]
        if v not in allowed_types:
            raise ValueError(f'Vehicle type must be one of: {", ".join(allowed_types)}')
        return v


class VehicleCreate(VehicleBase):
    """Schema for creating a vehicle"""

    pass


class VehicleUpdate(BaseModel):
    """Schema for updating a vehicle"""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    vehicle_type: Optional[str] = Field(None, min_length=1, max_length=100)
    license_plate: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=50)
    current_latitude: Optional[float] = Field(None, ge=-90, le=90)
    current_longitude: Optional[float] = Field(None, ge=-180, le=180)
    last_seen: Optional[str] = None
    assigned_driver_id: Optional[UUID] = None
    assigned_driver_name: Optional[str] = Field(None, max_length=255)
    metadata: Optional[Dict[str, Any]] = None

    @validator("status")
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ["active", "inactive", "maintenance", "out_of_service"]
            if v not in allowed_statuses:
                raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v


class VehicleResponse(VehicleBase):
    """Schema for vehicle response"""

    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VehicleAssetPairingBase(BaseModel):
    """Base vehicle asset pairing schema"""

    asset_id: UUID = Field(..., description="Asset ID to pair")
    notes: Optional[str] = Field(None, description="Pairing notes")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")


class VehicleAssetPairingCreate(VehicleAssetPairingBase):
    """Schema for creating a vehicle asset pairing"""

    pass


class VehicleAssetPairingResponse(VehicleAssetPairingBase):
    """Schema for vehicle asset pairing response"""

    id: UUID
    vehicle_id: UUID
    paired_at: str
    paired_by_user_id: Optional[UUID] = None
    paired_by_name: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VehicleWithAssets(VehicleResponse):
    """Schema for vehicle with paired assets"""

    paired_assets: List[VehicleAssetPairingResponse] = []

    class Config:
        from_attributes = True


class VehicleStats(BaseModel):
    """Schema for vehicle statistics"""

    total_vehicles: int
    active_vehicles: int
    inactive_vehicles: int
    maintenance_vehicles: int
    vehicles_with_drivers: int
    vehicles_without_drivers: int
    total_paired_assets: int
    avg_assets_per_vehicle: Optional[float] = None
