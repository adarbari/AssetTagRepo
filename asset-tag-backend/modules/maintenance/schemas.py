"""
Maintenance Pydantic schemas
"""
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class MaintenanceBase(BaseModel):
    """Base maintenance schema"""

    asset_id: str = Field(..., min_length=1)
    maintenance_type: str = Field(..., min_length=1, max_length=100)
    status: Optional[str] = Field("pending", max_length=50)
    priority: Optional[str] = Field("medium", max_length=50)
    scheduled_date: str = Field(..., description="ISO date")
    assigned_to_user_id: Optional[str] = None
    assigned_to_user_name: Optional[str] = Field(None, max_length=255)
    description: str = Field(..., min_length=1)
    estimated_duration_hours: Optional[float] = Field(None, ge=0)
    estimated_cost: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class MaintenanceCreate(MaintenanceBase):
    """Schema for creating a maintenance record"""

    pass


class MaintenanceUpdate(BaseModel):
    """Schema for updating a maintenance record"""

    maintenance_type: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[str] = Field(None, max_length=50)
    priority: Optional[str] = Field(None, max_length=50)
    scheduled_date: Optional[str] = Field(None, description="ISO date")
    assigned_to_user_id: Optional[str] = None
    assigned_to_user_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    estimated_duration_hours: Optional[float] = Field(None, ge=0)
    estimated_cost: Optional[float] = Field(None, ge=0)
    actual_duration_hours: Optional[float] = Field(None, ge=0)
    actual_cost: Optional[float] = Field(None, ge=0)
    completed_date: Optional[str] = Field(None, description="ISO date")
    completion_notes: Optional[str] = None
    notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class MaintenanceResponse(MaintenanceBase):
    """Schema for maintenance response"""

    id: str
    organization_id: str
    actual_duration_hours: Optional[float] = None
    actual_cost: Optional[float] = None
    completed_date: Optional[datetime] = None
    completion_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MaintenanceStats(BaseModel):
    """Schema for maintenance statistics"""

    by_status: Dict[str, int]
    overdue: int
    total: int
