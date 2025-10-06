"""
Maintenance models
"""
from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, Index, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON
from sqlalchemy.orm import relationship
from modules.shared.database.base import BaseModel, OrganizationMixin


class MaintenanceRecord(BaseModel, OrganizationMixin):
    """Maintenance record model"""
    __tablename__ = "maintenance_records"
    
    # Asset identification
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)
    asset_name = Column(String(255), nullable=False)  # Denormalized for performance
    
    # Maintenance details
    maintenance_type = Column(String(50), nullable=False)  # scheduled, unscheduled, inspection
    status = Column(String(50), default="pending", index=True)  # pending, in-progress, completed, overdue
    priority = Column(String(50), default="medium", index=True)  # low, medium, high, critical
    
    # Scheduling
    scheduled_date = Column(DateTime(timezone=True), nullable=True)
    completed_date = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    
    # Assignment
    assigned_to_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    assigned_to_user_name = Column(String(255), nullable=True)  # Denormalized for performance
    
    # Description and notes
    description = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    completion_notes = Column(Text, nullable=True)
    
    # Duration and cost
    estimated_duration = Column(String(100), nullable=True)  # e.g., "2 hours"
    actual_duration = Column(String(100), nullable=True)
    estimated_cost = Column(Numeric(10, 2), nullable=True)
    actual_cost = Column(Numeric(10, 2), nullable=True)
    
    # Location
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=True)
    site_name = Column(String(255), nullable=True)  # Denormalized for performance
    
    # Maintenance category
    category = Column(String(100), nullable=True)  # preventive, corrective, predictive
    subcategory = Column(String(100), nullable=True)  # oil_change, filter_replacement, etc.
    
    # Parts and materials
    parts_used = Column(JSON, nullable=True)  # List of parts with quantities and costs
    materials_used = Column(JSON, nullable=True)  # List of materials used
    
    # Quality and compliance
    quality_check_passed = Column(Boolean, nullable=True)
    compliance_verified = Column(Boolean, nullable=True)
    next_maintenance_due = Column(DateTime(timezone=True), nullable=True)
    
    # Documentation
    attachments = Column(JSON, nullable=True)  # List of file attachments
    work_order_number = Column(String(100), nullable=True)
    invoice_number = Column(String(100), nullable=True)
    
    # Metadata
    maintenance_metadata = Column(JSON, default={})
    
    # Relationships
    asset = relationship("Asset", back_populates="maintenance_records")
    assigned_to_user = relationship("User", foreign_keys=[assigned_to_user_id])
    site = relationship("Site", foreign_keys=[site_id])
    
    # Indexes
    __table_args__ = (
        Index('idx_maintenance_asset_time', 'asset_id', 'scheduled_date'),
        Index('idx_maintenance_org_status', 'organization_id', 'status'),
        Index('idx_maintenance_org_priority', 'organization_id', 'priority'),
        Index('idx_maintenance_assigned_user', 'assigned_to_user_id'),
        Index('idx_maintenance_site', 'site_id'),
        Index('idx_maintenance_due_date', 'due_date'),
        Index('idx_maintenance_type', 'maintenance_type'),
    )


class MaintenanceSchedule(BaseModel, OrganizationMixin):
    """Maintenance schedule template model"""
    __tablename__ = "maintenance_schedules"
    
    # Schedule identification
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    asset_type = Column(String(100), nullable=True)  # Apply to specific asset types
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=True)  # Apply to specific asset
    
    # Schedule details
    maintenance_type = Column(String(50), nullable=False)
    priority = Column(String(50), default="medium")
    
    # Frequency
    frequency_type = Column(String(50), nullable=False)  # daily, weekly, monthly, yearly, usage_based
    frequency_value = Column(Integer, nullable=False)  # e.g., every 30 days, every 1000 hours
    frequency_unit = Column(String(50), nullable=True)  # days, hours, miles, cycles
    
    # Scheduling
    is_active = Column(Boolean, default=True, index=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Assignment
    default_assignee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Duration and cost estimates
    estimated_duration_hours = Column(Numeric(5, 2), nullable=True)
    estimated_cost = Column(Numeric(10, 2), nullable=True)
    
    # Description template
    description_template = Column(Text, nullable=True)
    
    # Parts and materials template
    parts_template = Column(JSON, nullable=True)  # Default parts list
    materials_template = Column(JSON, nullable=True)  # Default materials list
    
    # Metadata
    maintenance_metadata = Column(JSON, default={})
    
    # Relationships
    asset = relationship("Asset", foreign_keys=[asset_id])
    default_assignee = relationship("User", foreign_keys=[default_assignee_id])
    
    # Indexes
    __table_args__ = (
        Index('idx_maintenance_schedule_org_name', 'organization_id', 'name'),
        Index('idx_maintenance_schedule_org_active', 'organization_id', 'is_active'),
        Index('idx_maintenance_schedule_asset_type', 'asset_type'),
        Index('idx_maintenance_schedule_asset', 'asset_id'),
    )
