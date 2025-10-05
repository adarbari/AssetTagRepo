"""
Job models
"""
from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, Index, Numeric, DateTime
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from modules.shared.database.base import BaseModel, OrganizationMixin, SoftDeleteMixin


class Job(BaseModel, OrganizationMixin, SoftDeleteMixin):
    """Job model"""
    __tablename__ = "jobs"
    
    # Basic information
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    job_type = Column(String(100), nullable=False)  # maintenance, inspection, repair, etc.
    status = Column(String(50), default="pending", index=True)  # pending, in-progress, completed, cancelled
    
    # Priority and scheduling
    priority = Column(String(50), default="medium", index=True)  # low, medium, high, critical
    scheduled_start = Column(DateTime(timezone=True), nullable=True)
    scheduled_end = Column(DateTime(timezone=True), nullable=True)
    actual_start = Column(DateTime(timezone=True), nullable=True)
    actual_end = Column(DateTime(timezone=True), nullable=True)
    
    # Assignment
    assigned_to_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    assigned_to_user_name = Column(String(255), nullable=True)  # Denormalized for performance
    
    # Location
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=True)
    site_name = Column(String(255), nullable=True)  # Denormalized for performance
    location_description = Column(String(500), nullable=True)
    
    # Duration and cost
    estimated_duration_hours = Column(Numeric(5, 2), nullable=True)
    actual_duration_hours = Column(Numeric(5, 2), nullable=True)
    estimated_cost = Column(Numeric(10, 2), nullable=True)
    actual_cost = Column(Numeric(10, 2), nullable=True)
    
    # Completion
    completion_notes = Column(Text, nullable=True)
    completion_percentage = Column(Integer, default=0)  # 0-100
    
    # Metadata
    metadata = Column(JSONB, default={})
    
    # Relationships
    assigned_to_user = relationship("User", foreign_keys=[assigned_to_user_id])
    site = relationship("Site", foreign_keys=[site_id])
    assigned_assets = relationship("JobAsset", back_populates="job")
    check_in_out_records = relationship("CheckInOutRecord", back_populates="job")
    
    # Indexes
    __table_args__ = (
        Index('idx_job_org_name', 'organization_id', 'name'),
        Index('idx_job_org_status', 'organization_id', 'status'),
        Index('idx_job_org_priority', 'organization_id', 'priority'),
        Index('idx_job_assigned_user', 'assigned_to_user_id'),
        Index('idx_job_site', 'site_id'),
        Index('idx_job_scheduled_start', 'scheduled_start'),
    )


class JobAsset(BaseModel, OrganizationMixin):
    """Job-Asset assignment model"""
    __tablename__ = "job_assets"
    
    # Assignment
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)
    
    # Assignment details
    assigned_at = Column(DateTime(timezone=True), nullable=False)
    unassigned_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="assigned", index=True)  # assigned, in-use, completed, removed
    
    # Usage tracking
    usage_start = Column(DateTime(timezone=True), nullable=True)
    usage_end = Column(DateTime(timezone=True), nullable=True)
    usage_hours = Column(Numeric(5, 2), nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Relationships
    job = relationship("Job", back_populates="assigned_assets")
    asset = relationship("Asset")
    
    # Indexes
    __table_args__ = (
        Index('idx_job_asset_job', 'job_id'),
        Index('idx_job_asset_asset', 'asset_id'),
        Index('idx_job_asset_status', 'status'),
        Index('idx_job_asset_assigned_at', 'assigned_at'),
    )


class CheckInOutRecord(BaseModel, OrganizationMixin):
    """Check-in/Check-out record model"""
    __tablename__ = "check_in_out_records"
    
    # Record identification
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Record details
    record_type = Column(String(50), nullable=False)  # check-in, check-out
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    location_description = Column(String(500), nullable=True)
    
    # Location coordinates
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Relationships
    asset = relationship("Asset")
    job = relationship("Job", back_populates="check_in_out_records")
    user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_checkinout_asset_time', 'asset_id', 'timestamp'),
        Index('idx_checkinout_job_time', 'job_id', 'timestamp'),
        Index('idx_checkinout_user_time', 'user_id', 'timestamp'),
        Index('idx_checkinout_type_time', 'record_type', 'timestamp'),
    )
