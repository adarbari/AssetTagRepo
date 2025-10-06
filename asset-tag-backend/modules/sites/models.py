"""
Site models
"""
from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, Index, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON
from sqlalchemy.orm import relationship
from modules.shared.database.base import BaseModel, OrganizationMixin, SoftDeleteMixin


class Site(BaseModel, OrganizationMixin, SoftDeleteMixin):
    """Site model"""
    __tablename__ = "sites"
    
    # Basic information
    name = Column(String(255), nullable=False)
    location = Column(String(500), nullable=True)  # Human-readable address
    area = Column(String(100), nullable=True)  # e.g., "50,000 sq ft"
    status = Column(String(50), default="active", index=True)  # active, inactive
    
    # Management
    manager_name = Column(String(255), nullable=True)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Geographic information
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    radius = Column(Integer, nullable=True)  # Site boundary radius in feet
    tolerance = Column(Integer, nullable=True)  # Buffer zone tolerance in feet
    
    # Contact information
    address = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    
    # Geofencing
    geofence_id = Column(UUID(as_uuid=True), ForeignKey("geofences.id"), nullable=True)
    
    # Metadata
    site_metadata = Column(JSON, default={})
    
    # Relationships
    organization = relationship("Organization", back_populates="sites")
    manager = relationship("User", foreign_keys=[manager_id])
    geofence = relationship("Geofence", foreign_keys=[geofence_id])
    assets = relationship("Asset", foreign_keys="Asset.current_site_id", back_populates="current_site")
    personnel = relationship("Personnel", foreign_keys="Personnel.current_site_id", back_populates="current_site")
    gateways = relationship("Gateway", back_populates="site")
    
    # Indexes
    __table_args__ = (
        Index('idx_site_org_name', 'organization_id', 'name'),
        Index('idx_site_org_status', 'organization_id', 'status'),
        Index('idx_site_location', 'latitude', 'longitude'),
    )


class Personnel(BaseModel, OrganizationMixin, SoftDeleteMixin):
    """Personnel model"""
    __tablename__ = "personnel"
    
    # Basic information
    name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=False)
    status = Column(String(50), default="on-duty", index=True)  # on-duty, off-duty, on-break
    
    # Location
    current_site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=True)
    
    # Contact information
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    
    # Metadata
    site_metadata = Column(JSON, default={})
    
    # Relationships
    current_site = relationship("Site", foreign_keys=[current_site_id], back_populates="personnel")
    activity_history = relationship("PersonnelActivity", back_populates="personnel")
    
    # Indexes
    __table_args__ = (
        Index('idx_personnel_org_name', 'organization_id', 'name'),
        Index('idx_personnel_org_status', 'organization_id', 'status'),
        Index('idx_personnel_site', 'current_site_id'),
    )


class PersonnelActivity(BaseModel, OrganizationMixin):
    """Personnel activity tracking"""
    __tablename__ = "personnel_activities"
    
    personnel_id = Column(UUID(as_uuid=True), ForeignKey("personnel.id"), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    site_name = Column(String(255), nullable=False)  # Denormalized for performance
    activity_type = Column(String(50), nullable=False)  # arrival, departure
    timestamp = Column(String(100), nullable=False)  # ISO timestamp
    
    # Relationships
    personnel = relationship("Personnel", back_populates="activity_history")
    site = relationship("Site")
    
    # Indexes
    __table_args__ = (
        Index('idx_personnel_activity_personnel', 'personnel_id', 'timestamp'),
        Index('idx_personnel_activity_site', 'site_id', 'timestamp'),
    )
