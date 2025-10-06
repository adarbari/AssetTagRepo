"""
Geofence models
"""
from modules.shared.database.base import BaseModel, OrganizationMixin, SoftDeleteMixin
from sqlalchemy import (
    ARRAY,
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


class Geofence(BaseModel, OrganizationMixin, SoftDeleteMixin):
    """Geofence model"""

    __tablename__ = "geofences"

    # Basic information
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    geofence_type = Column(String(50), nullable=False)  # circular, polygon
    status = Column(String(50), default="active", index=True)  # active, inactive

    # Geometric definition
    center_latitude = Column(Numeric(10, 8), nullable=True)  # For circular geofences
    center_longitude = Column(Numeric(11, 8), nullable=True)  # For circular geofences
    radius = Column(Integer, nullable=True)  # Radius in feet for circular geofences
    coordinates = Column(
        JSON, nullable=True
    )  # Array of [lat, lng] pairs for polygon geofences

    # Site association
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=True)
    site_name = Column(String(255), nullable=True)  # Denormalized for performance

    # Alert configuration
    alert_on_entry = Column(Boolean, default=True)
    alert_on_exit = Column(Boolean, default=True)
    geofence_classification = Column(
        String(50), default="authorized"
    )  # authorized, restricted

    # Tolerance and buffer
    tolerance = Column(Integer, nullable=True)  # Buffer zone tolerance in feet

    # Vehicle-based geofencing
    location_mode = Column(String(50), default="static")  # static, vehicle-based
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=True)
    vehicle_name = Column(String(255), nullable=True)  # Denormalized for performance

    # Asset attachment
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=True)
    asset_name = Column(String(255), nullable=True)  # Denormalized for performance
    attachment_type = Column(String(50), default="site")  # site, vehicle, asset, none

    # Expected assets
    expected_asset_ids = Column(
        JSON, nullable=True
    )  # Array of asset IDs that should be within this geofence

    # Metadata
    geofence_metadata = Column(JSON, default={})

    # Relationships
    site = relationship("Site", foreign_keys=[site_id])
    vehicle = relationship("Vehicle", foreign_keys=[vehicle_id])
    asset = relationship("Asset", foreign_keys=[asset_id])
    geofence_events = relationship("GeofenceEvent", back_populates="geofence")

    # Indexes
    __table_args__ = (
        Index("idx_geofence_org_name", "organization_id", "name"),
        Index("idx_geofence_org_status", "organization_id", "status"),
        Index("idx_geofence_site", "site_id"),
        Index("idx_geofence_vehicle", "vehicle_id"),
        Index("idx_geofence_asset", "asset_id"),
        Index("idx_geofence_center", "center_latitude", "center_longitude"),
    )


class GeofenceEvent(BaseModel, OrganizationMixin):
    """Geofence entry/exit events"""

    __tablename__ = "geofence_events"

    # Event identification
    geofence_id = Column(UUID(as_uuid=True), ForeignKey("geofences.id"), nullable=False)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)

    # Event details
    event_type = Column(String(50), nullable=False)  # entry, exit
    timestamp = Column(String(100), nullable=False)  # ISO timestamp

    # Location at time of event
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)

    # Event metadata
    confidence = Column(Numeric(5, 2), nullable=True)  # Location confidence percentage
    distance_from_geofence = Column(Numeric(8, 2), nullable=True)  # meters

    # Relationships
    geofence = relationship("Geofence", back_populates="geofence_events")
    asset = relationship("Asset")

    # Indexes
    __table_args__ = (
        Index("idx_geofence_event_geofence_time", "geofence_id", "timestamp"),
        Index("idx_geofence_event_asset_time", "asset_id", "timestamp"),
        Index("idx_geofence_event_org_time", "organization_id", "timestamp"),
        Index("idx_geofence_event_type", "event_type"),
    )
