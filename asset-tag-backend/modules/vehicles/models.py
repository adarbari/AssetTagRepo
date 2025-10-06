"""
Vehicle models
"""
from modules.shared.database.base import BaseModel, OrganizationMixin, SoftDeleteMixin
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class Vehicle(BaseModel, OrganizationMixin, SoftDeleteMixin):
    """Vehicle model for vehicle management and asset pairing"""

    __tablename__ = "vehicles"

    # Basic information
    name = Column(String(255), nullable=False)
    vehicle_type = Column(String(100), nullable=False)  # truck, van, car, etc.
    license_plate = Column(String(50), nullable=True)
    status = Column(
        String(50), default="active", index=True
    )  # active, inactive, maintenance

    # Location
    current_latitude = Column(Numeric(10, 8), nullable=True)
    current_longitude = Column(Numeric(11, 8), nullable=True)
    last_seen = Column(String(100), nullable=True)  # ISO timestamp

    # Assignment
    assigned_driver_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    assigned_driver_name = Column(
        String(255), nullable=True
    )  # Denormalized for performance

    # Metadata
    vehicle_metadata = Column(JSON, default={})

    # Relationships
    assigned_driver = relationship("User", foreign_keys=[assigned_driver_id])
    paired_assets = relationship(
        "VehicleAssetPairing", back_populates="vehicle", cascade="all, delete-orphan"
    )

    # Indexes
    __table_args__ = (
        Index("idx_vehicle_org_name", "organization_id", "name"),
        Index("idx_vehicle_org_status", "organization_id", "status"),
        Index("idx_vehicle_license", "license_plate"),
        Index("idx_vehicle_driver", "assigned_driver_id"),
    )


class VehicleAssetPairing(BaseModel, OrganizationMixin):
    """Model for pairing assets with vehicles"""

    __tablename__ = "vehicle_asset_pairings"

    # Relationships
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=False)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)

    # Pairing details
    paired_at = Column(String(100), nullable=False)  # ISO timestamp
    paired_by_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    paired_by_name = Column(String(255), nullable=True)  # Denormalized for performance

    # Status
    status = Column(String(50), default="active")  # active, inactive, removed
    notes = Column(Text, nullable=True)

    # Metadata
    vehicle_metadata = Column(JSON, default={})

    # Relationships
    vehicle = relationship("Vehicle", back_populates="paired_assets")
    asset = relationship("Asset")
    paired_by_user = relationship("User", foreign_keys=[paired_by_user_id])

    # Indexes
    __table_args__ = (
        Index("idx_vehicle_asset_pairing", "vehicle_id", "asset_id"),
        Index("idx_vehicle_asset_status", "status"),
    )
