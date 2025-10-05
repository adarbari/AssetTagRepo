"""
Alert Pydantic schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class AlertBase(BaseModel):
    """Base alert schema"""
    alert_type: str = Field(..., min_length=1, max_length=100)
    severity: str = Field(..., max_length=50)
    status: Optional[str] = Field("active", max_length=50)
    asset_id: str = Field(..., min_length=1)
    asset_name: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    description: Optional[str] = None
    reason: Optional[str] = None
    suggested_action: Optional[str] = None
    location_description: Optional[str] = Field(None, max_length=500)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    geofence_id: Optional[str] = None
    geofence_name: Optional[str] = Field(None, max_length=255)
    triggered_at: str = Field(..., description="ISO timestamp")
    auto_resolvable: Optional[bool] = False
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class AlertCreate(AlertBase):
    """Schema for creating an alert"""
    pass


class AlertUpdate(BaseModel):
    """Schema for updating an alert"""
    status: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    reason: Optional[str] = None
    suggested_action: Optional[str] = None
    resolution_notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class AlertResponse(AlertBase):
    """Schema for alert response"""
    id: str
    organization_id: str
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    resolved_by_user_id: Optional[str] = None
    auto_resolved: Optional[bool] = False
    workflow_actions: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AlertStats(BaseModel):
    """Schema for alert statistics"""
    by_status: Dict[str, int]
    by_severity: Dict[str, int]
    total: int
