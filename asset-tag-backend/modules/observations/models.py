"""
Observation models for Bluetooth signal data
"""
from modules.shared.database.base import BaseModel, OrganizationMixin
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class Observation(BaseModel, OrganizationMixin):
    """Bluetooth observation model - TimescaleDB hypertable"""

    __tablename__ = "observations"

    # Asset and Gateway identification
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)
    gateway_id = Column(UUID(as_uuid=True), ForeignKey("gateways.id"), nullable=False)

    # Signal data
    rssi = Column(Integer, nullable=False)  # Received Signal Strength Indicator
    battery_level = Column(Integer, nullable=True)  # Asset battery percentage
    temperature = Column(Numeric(5, 2), nullable=True)  # Asset temperature

    # Timing
    observed_at = Column(
        DateTime(timezone=True), nullable=False, index=True
    )  # When observation was made
    received_at = Column(DateTime(timezone=True), nullable=False)  # When we received it

    # Signal quality
    signal_quality = Column(String(50), nullable=True)  # excellent, good, fair, poor
    noise_level = Column(Integer, nullable=True)  # dBm

    # Metadata
    observation_metadata = Column(JSON, default={})

    # Relationships
    asset = relationship("Asset", back_populates="observations")
    gateway = relationship("Gateway", back_populates="observations")

    # Indexes for TimescaleDB
    __table_args__ = (
        Index("idx_observation_asset_time", "asset_id", "observed_at"),
        Index("idx_observation_gateway_time", "gateway_id", "observed_at"),
        Index("idx_observation_org_time", "organization_id", "observed_at"),
        Index("idx_observation_rssi", "rssi"),
    )


class ObservationBatch(BaseModel, OrganizationMixin):
    """Batch processing metadata for observations"""

    __tablename__ = "observation_batches"

    batch_id = Column(String(100), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    observation_count = Column(Integer, nullable=False)
    processing_status = Column(
        String(50), default="pending"
    )  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)

    # Indexes
    __table_args__ = (
        Index("idx_observation_batch_status", "processing_status"),
        Index("idx_observation_batch_time", "start_time", "end_time"),
    )
