"""
Observation Pydantic schemas
"""
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ObservationBase(BaseModel):
    """Base observation schema"""

    asset_id: str = Field(..., description="Asset ID")
    gateway_id: str = Field(..., description="Gateway ID")
    rssi: int = Field(
        ..., ge=-120, le=0, description="Received Signal Strength Indicator in dBm"
    )
    battery_level: Optional[int] = Field(
        None, ge=0, le=100, description="Asset battery percentage"
    )
    temperature: Optional[float] = Field(
        None, ge=-50, le=100, description="Asset temperature in Celsius"
    )
    observed_at: str = Field(..., description="ISO timestamp when observation was made")
    received_at: Optional[str] = Field(
        None, description="ISO timestamp when we received it"
    )
    signal_quality: Optional[str] = Field(
        None, max_length=50, description="Signal quality assessment"
    )
    noise_level: Optional[int] = Field(
        None, ge=-120, le=0, description="Noise level in dBm"
    )
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ObservationCreate(ObservationBase):
    """Schema for creating an observation"""

    pass


class ObservationUpdate(BaseModel):
    """Schema for updating an observation"""

    rssi: Optional[int] = Field(None, ge=-120, le=0)
    battery_level: Optional[int] = Field(None, ge=0, le=100)
    temperature: Optional[float] = Field(None, ge=-50, le=100)
    signal_quality: Optional[str] = Field(None, max_length=50)
    noise_level: Optional[int] = Field(None, ge=-120, le=0)
    metadata: Optional[Dict[str, Any]] = None


class ObservationResponse(ObservationBase):
    """Schema for observation response"""

    id: str
    organization_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ObservationBatchBase(BaseModel):
    """Base observation batch schema"""

    batch_id: str = Field(..., min_length=1, max_length=100)
    start_time: str = Field(..., description="ISO timestamp")
    end_time: str = Field(..., description="ISO timestamp")
    observation_count: int = Field(..., ge=0)
    processing_status: Optional[str] = Field("pending", max_length=50)
    error_message: Optional[str] = None


class ObservationBatchCreate(ObservationBatchBase):
    """Schema for creating an observation batch"""

    pass


class ObservationBatchUpdate(BaseModel):
    """Schema for updating an observation batch"""

    processing_status: Optional[str] = Field(None, max_length=50)
    error_message: Optional[str] = None


class ObservationBatchResponse(ObservationBatchBase):
    """Schema for observation batch response"""

    id: str
    organization_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ObservationStatsResponse(BaseModel):
    """Schema for observation statistics"""

    total_observations: int
    unique_assets: int
    unique_gateways: int
    avg_rssi: Optional[float] = None
    min_rssi: Optional[int] = None
    max_rssi: Optional[int] = None
    avg_battery_level: Optional[float] = None
    avg_temperature: Optional[float] = None
    time_range: Dict[str, str]
    signal_quality_distribution: Dict[str, int]


class ObservationBulkCreate(BaseModel):
    """Schema for bulk creating observations"""

    observations: List[ObservationCreate] = Field(..., min_items=1, max_items=1000)
    batch_id: Optional[str] = Field(None, description="Optional batch ID for grouping")


class ObservationBulkResponse(BaseModel):
    """Schema for bulk observation response"""

    created_count: int
    failed_count: int
    batch_id: Optional[str] = None
    errors: List[Dict[str, Any]] = []
