"""
Site Pydantic schemas
"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class SiteBase(BaseModel):
    """Base site schema"""

    name: str = Field(..., min_length=1, max_length=255)
    location: Optional[str] = Field(None, max_length=500)
    area: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field("active", max_length=50)
    manager_name: Optional[str] = Field(None, max_length=255)
    manager_id: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    radius: Optional[int] = Field(None, ge=0)
    tolerance: Optional[int] = Field(None, ge=0)
    address: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    geofence_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class SiteCreate(SiteBase):
    """Schema for creating a site"""

    pass


class SiteUpdate(BaseModel):
    """Schema for updating a site"""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    location: Optional[str] = Field(None, max_length=500)
    area: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, max_length=50)
    manager_name: Optional[str] = Field(None, max_length=255)
    manager_id: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    radius: Optional[int] = Field(None, ge=0)
    tolerance: Optional[int] = Field(None, ge=0)
    address: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    geofence_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class SiteResponse(SiteBase):
    """Schema for site response"""

    id: uuid.UUID
    organization_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PersonnelBase(BaseModel):
    """Base personnel schema"""

    name: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=100)
    status: Optional[str] = Field("on-duty", max_length=50)
    current_site_id: Optional[str] = None
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class PersonnelCreate(PersonnelBase):
    """Schema for creating personnel"""

    pass


class PersonnelUpdate(BaseModel):
    """Schema for updating personnel"""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[str] = Field(None, max_length=50)
    current_site_id: Optional[str] = None
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    metadata: Optional[Dict[str, Any]] = None


class PersonnelResponse(PersonnelBase):
    """Schema for personnel response"""

    id: str
    organization_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PersonnelActivityResponse(BaseModel):
    """Schema for personnel activity response"""

    id: str
    personnel_id: str
    site_id: str
    site_name: str
    activity_type: str
    timestamp: str
    created_at: datetime

    class Config:
        from_attributes = True


class SiteWithAssetsResponse(SiteResponse):
    """Schema for site response with assets"""

    assets: List[Dict[str, Any]] = []
    personnel: List[Dict[str, Any]] = []
    gateways: List[Dict[str, Any]] = []
    asset_count: int = 0
    personnel_count: int = 0
    gateway_count: int = 0
