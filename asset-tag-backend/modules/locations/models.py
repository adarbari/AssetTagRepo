"""
Location estimation models
"""
from sqlalchemy import (JSON, Boolean, Column, DateTime, ForeignKey, Index,
                        Integer, Numeric, String, Text)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from modules.shared.database.base import BaseModel, OrganizationMixin


class EstimatedLocation(BaseModel, OrganizationMixin):
    """Estimated asset location model - TimescaleDB hypertable"""

    __tablename__ = "estimated_locations"

    # Asset identification
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)

    # Location coordinates
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    altitude = Column(Numeric(8, 2), nullable=True)  # meters above sea level

    # Estimation metadata
    uncertainty_radius = Column(Numeric(8, 2), nullable=False)  # meters
    confidence = Column(Numeric(5, 2), nullable=False)  # percentage
    algorithm = Column(String(50), nullable=False)  # TRILATERATION, SINGLE_GATEWAY, etc.

    # Timing
    estimated_at = Column(DateTime(timezone=True), nullable=False, index=True)

    # Gateway information used for estimation
    gateway_count = Column(Integer, nullable=False)  # Number of gateways used
    gateway_ids = Column(JSON, nullable=True)  # List of gateway IDs used

    # Movement analysis
    speed = Column(Numeric(8, 2), nullable=True)  # meters per second
    bearing = Column(Numeric(6, 2), nullable=True)  # degrees (0-360)
    distance_from_previous = Column(Numeric(8, 2), nullable=True)  # meters

    # Quality metrics
    signal_quality_score = Column(Numeric(5, 2), nullable=True)  # 0-100
    rssi_variance = Column(Numeric(8, 2), nullable=True)  # Signal strength variance

    # Metadata
    location_metadata = Column(JSON, default={})

    # Relationships
    asset = relationship("Asset", back_populates="estimated_locations")

    # Indexes for TimescaleDB
    __table_args__ = (
        Index("idx_estimated_location_asset_time", "asset_id", "estimated_at"),
        Index("idx_estimated_location_org_time", "organization_id", "estimated_at"),
        Index("idx_estimated_location_coords", "latitude", "longitude"),
        Index("idx_estimated_location_confidence", "confidence"),
    )


class LocationHistory(BaseModel, OrganizationMixin):
    """Location history for analytics and reporting"""

    __tablename__ = "location_history"

    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=True)

    # Time period
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    period_type = Column(String(20), nullable=False)  # hourly, daily, weekly, monthly

    # Aggregated metrics
    total_distance = Column(Numeric(10, 2), nullable=True)  # meters
    max_speed = Column(Numeric(8, 2), nullable=True)  # meters per second
    avg_speed = Column(Numeric(8, 2), nullable=True)  # meters per second
    unique_locations = Column(Integer, nullable=True)  # Number of distinct locations
    time_stationary = Column(Integer, nullable=True)  # seconds
    time_moving = Column(Integer, nullable=True)  # seconds

    # Location statistics
    center_latitude = Column(Numeric(10, 8), nullable=True)
    center_longitude = Column(Numeric(11, 8), nullable=True)
    location_variance = Column(Numeric(10, 4), nullable=True)  # Spatial variance

    # Relationships
    asset = relationship("Asset")
    site = relationship("Site")

    # Indexes
    __table_args__ = (
        Index("idx_location_history_asset_period", "asset_id", "period_start", "period_end"),
        Index("idx_location_history_org_period", "organization_id", "period_start", "period_end"),
        Index("idx_location_history_site_period", "site_id", "period_start", "period_end"),
    )
