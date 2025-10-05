"""
Gateway Pydantic schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class GatewayBase(BaseModel):
    """Base gateway schema"""
    name: str = Field(..., min_length=1, max_length=255)
    gateway_id: str = Field(..., min_length=1, max_length=100)
    status: Optional[str] = Field("active", max_length=50)
    site_id: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    altitude: Optional[float] = Field(None, ge=-1000, le=10000)
    model: Optional[str] = Field(None, max_length=100)
    firmware_version: Optional[str] = Field(None, max_length=50)
    battery_level: Optional[int] = Field(None, ge=0, le=100)
    signal_strength: Optional[int] = Field(None, ge=-100, le=0)
    transmission_power: Optional[int] = Field(None, ge=-30, le=20)
    scan_interval: Optional[int] = Field(None, ge=1, le=3600)
    advertising_interval: Optional[int] = Field(None, ge=100, le=10000)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class GatewayCreate(GatewayBase):
    """Schema for creating a gateway"""
    pass


class GatewayUpdate(BaseModel):
    """Schema for updating a gateway"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[str] = Field(None, max_length=50)
    site_id: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    altitude: Optional[float] = Field(None, ge=-1000, le=10000)
    model: Optional[str] = Field(None, max_length=100)
    firmware_version: Optional[str] = Field(None, max_length=50)
    battery_level: Optional[int] = Field(None, ge=0, le=100)
    signal_strength: Optional[int] = Field(None, ge=-100, le=0)
    transmission_power: Optional[int] = Field(None, ge=-30, le=20)
    scan_interval: Optional[int] = Field(None, ge=1, le=3600)
    advertising_interval: Optional[int] = Field(None, ge=100, le=10000)
    metadata: Optional[Dict[str, Any]] = None


class GatewayResponse(GatewayBase):
    """Schema for gateway response"""
    id: str
    organization_id: str
    is_online: bool
    last_seen: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
