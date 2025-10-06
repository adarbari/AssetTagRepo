"""
Check-in/Check-out Pydantic schemas
"""

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class CheckInBase(BaseModel):
    """Base check-in schema"""

    asset_id: str = Field(..., min_length=1)
    user_id: str = Field(..., min_length=1)
    user_name: str = Field(..., min_length=1, max_length=255)
    check_in_location_lat: Optional[float] = Field(None, ge=-90, le=90)
    check_in_location_lng: Optional[float] = Field(None, ge=-180, le=180)
    check_in_location_description: Optional[str] = Field(None, max_length=500)
    purpose: Optional[str] = Field(None, max_length=255)
    expected_duration_hours: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None
    checkout_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class CheckInCreate(CheckInBase):
    """Schema for creating a check-in record"""

    pass


class CheckOutBase(BaseModel):
    """Base check-out schema"""

    asset_id: str = Field(..., min_length=1)
    check_out_location_lat: Optional[float] = Field(None, ge=-90, le=90)
    check_out_location_lng: Optional[float] = Field(None, ge=-180, le=180)
    check_out_location_description: Optional[str] = Field(None, max_length=500)
    actual_duration_hours: Optional[float] = Field(None, ge=0)
    condition_notes: Optional[str] = None
    return_notes: Optional[str] = None


class CheckOutCreate(CheckOutBase):
    """Schema for creating a check-out record"""

    pass


class CheckInOutResponse(BaseModel):
    """Schema for check-in/check-out response"""

    id: str
    organization_id: str
    asset_id: str
    user_id: str
    user_name: str
    check_in_time: datetime
    check_in_location_lat: Optional[float] = None
    check_in_location_lng: Optional[float] = None
    check_in_location_description: Optional[str] = None
    check_out_time: Optional[datetime] = None
    check_out_location_lat: Optional[float] = None
    check_out_location_lng: Optional[float] = None
    check_out_location_description: Optional[str] = None
    purpose: Optional[str] = None
    expected_duration_hours: Optional[float] = None
    actual_duration_hours: Optional[float] = None
    notes: Optional[str] = None
    condition_notes: Optional[str] = None
    return_notes: Optional[str] = None
    checkout_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}
        str_strip_whitespace = True


class CheckInStatus(BaseModel):
    """Schema for current check-in status"""

    asset_id: str
    status: str  # "checked_in" or "checked_out"
    check_in_time: Optional[datetime] = None
    user_name: Optional[str] = None
    purpose: Optional[str] = None
    expected_duration_hours: Optional[float] = None
    check_in_location: Optional[Dict[str, Any]] = None
