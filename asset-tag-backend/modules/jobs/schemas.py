"""
Job Pydantic schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class JobBase(BaseModel):
    """Base job schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    job_type: str = Field(..., min_length=1, max_length=100)
    status: Optional[str] = Field("pending", max_length=50)
    priority: Optional[str] = Field("medium", max_length=50)
    scheduled_start: Optional[str] = Field(None, description="ISO timestamp")
    scheduled_end: Optional[str] = Field(None, description="ISO timestamp")
    assigned_to_user_id: Optional[str] = None
    assigned_to_user_name: Optional[str] = Field(None, max_length=255)
    site_id: Optional[str] = None
    site_name: Optional[str] = Field(None, max_length=255)
    location_description: Optional[str] = Field(None, max_length=500)
    estimated_duration_hours: Optional[float] = Field(None, ge=0)
    estimated_cost: Optional[float] = Field(None, ge=0)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class JobCreate(JobBase):
    """Schema for creating a job"""
    pass


class JobUpdate(BaseModel):
    """Schema for updating a job"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    job_type: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[str] = Field(None, max_length=50)
    priority: Optional[str] = Field(None, max_length=50)
    scheduled_start: Optional[str] = Field(None, description="ISO timestamp")
    scheduled_end: Optional[str] = Field(None, description="ISO timestamp")
    assigned_to_user_id: Optional[str] = None
    assigned_to_user_name: Optional[str] = Field(None, max_length=255)
    site_id: Optional[str] = None
    site_name: Optional[str] = Field(None, max_length=255)
    location_description: Optional[str] = Field(None, max_length=500)
    estimated_duration_hours: Optional[float] = Field(None, ge=0)
    estimated_cost: Optional[float] = Field(None, ge=0)
    actual_start: Optional[str] = Field(None, description="ISO timestamp")
    actual_end: Optional[str] = Field(None, description="ISO timestamp")
    actual_duration_hours: Optional[float] = Field(None, ge=0)
    actual_cost: Optional[float] = Field(None, ge=0)
    completion_notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class JobResponse(JobBase):
    """Schema for job response"""
    id: str
    organization_id: str
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    actual_duration_hours: Optional[float] = None
    actual_cost: Optional[float] = None
    completion_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class JobAssetAssignment(BaseModel):
    """Schema for job asset assignment"""
    asset_id: str
    notes: Optional[str] = None


class JobAssetResponse(BaseModel):
    """Schema for job asset response"""
    id: str
    asset_id: str
    assigned_at: datetime
    unassigned_at: Optional[datetime] = None
    status: str
    usage_start: Optional[datetime] = None
    usage_end: Optional[datetime] = None
    usage_hours: Optional[float] = None
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True
