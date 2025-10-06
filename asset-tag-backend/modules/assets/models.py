"""
Asset models
"""
from sqlalchemy import (JSON, Boolean, Column, ForeignKey, Index, Integer,
                        Numeric, String, Text)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from modules.shared.database.base import (BaseModel, OrganizationMixin,
                                          SoftDeleteMixin)


class Asset(BaseModel, OrganizationMixin, SoftDeleteMixin):
    """Asset model"""

    __tablename__ = "assets"

    # Basic information
    name = Column(String(255), nullable=False)
    serial_number = Column(String(100), unique=True, nullable=False, index=True)
    asset_type = Column(String(100), nullable=False, index=True)
    status = Column(String(50), default="active", index=True)  # active, inactive, maintenance, in-transit, checked-out

    # Location information
    current_site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=True)
    location_description = Column(String(500), nullable=True)
    last_seen = Column(String(100), nullable=True)  # Relative time string for display

    # Physical properties
    battery_level = Column(Integer, nullable=True)  # Percentage
    temperature = Column(Numeric(5, 2), nullable=True)  # Celsius
    movement_status = Column(String(50), default="stationary")  # stationary, moving

    # Assignment
    assigned_to_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    assigned_job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=True)
    assignment_start_date = Column(String(100), nullable=True)  # ISO timestamp
    assignment_end_date = Column(String(100), nullable=True)  # ISO timestamp

    # Asset details
    manufacturer = Column(String(255), nullable=True)
    model = Column(String(255), nullable=True)
    purchase_date = Column(String(100), nullable=True)  # ISO date
    warranty_expiry = Column(String(100), nullable=True)  # ISO date

    # Maintenance
    last_maintenance = Column(String(100), nullable=True)  # ISO timestamp
    next_maintenance = Column(String(100), nullable=True)  # ISO timestamp

    # Pricing and availability
    hourly_rate = Column(Numeric(10, 2), nullable=True)
    availability = Column(String(50), default="available")  # available, assigned, in-use, maintenance, reserved, unavailable

    # Metadata
    asset_metadata = Column(JSON, default={})

    # Relationships
    current_site = relationship("Site", foreign_keys=[current_site_id])
    assigned_to_user = relationship("User", foreign_keys=[assigned_to_user_id])
    assigned_job = relationship("Job", foreign_keys=[assigned_job_id])
    observations = relationship("Observation", back_populates="asset")
    estimated_locations = relationship("EstimatedLocation", back_populates="asset")
    alerts = relationship("Alert", back_populates="asset")
    maintenance_records = relationship("MaintenanceRecord", back_populates="asset")

    # Indexes
    __table_args__ = (
        Index("idx_asset_org_type", "organization_id", "asset_type"),
        Index("idx_asset_org_status", "organization_id", "status"),
        Index("idx_asset_site", "current_site_id"),
        Index("idx_asset_assigned_user", "assigned_to_user_id"),
        Index("idx_asset_assigned_job", "assigned_job_id"),
        Index("idx_asset_serial", "serial_number"),
    )


class AssetType(BaseModel, OrganizationMixin):
    """Asset type definitions"""

    __tablename__ = "asset_types"

    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)  # equipment, vehicle, tool, etc.
    default_hourly_rate = Column(Numeric(10, 2), nullable=True)
    maintenance_interval_days = Column(Integer, nullable=True)
    battery_threshold = Column(Integer, default=20)  # Low battery alert threshold
    asset_type_metadata = Column(JSON, default={})

    # Indexes
    __table_args__ = (Index("idx_asset_type_org_name", "organization_id", "name"),)
