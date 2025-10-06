"""
Gateway models for Bluetooth gateways
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


class Gateway(BaseModel, OrganizationMixin, SoftDeleteMixin):
    """Bluetooth gateway model"""

    __tablename__ = "gateways"

    # Basic information
    name = Column(String(255), nullable=False)
    gateway_id = Column(
        String(100), unique=True, nullable=False, index=True
    )  # Hardware ID
    status = Column(
        String(50), default="active", index=True
    )  # active, inactive, maintenance

    # Location
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=True)
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    altitude = Column(Numeric(8, 2), nullable=True)  # meters above sea level

    # Technical specifications
    model = Column(String(100), nullable=True)
    firmware_version = Column(String(50), nullable=True)
    battery_level = Column(Integer, nullable=True)  # Percentage
    signal_strength = Column(Integer, nullable=True)  # dBm

    # Configuration
    transmission_power = Column(Integer, nullable=True)  # dBm
    scan_interval = Column(Integer, nullable=True)  # seconds
    advertising_interval = Column(Integer, nullable=True)  # milliseconds

    # Status tracking
    last_seen = Column(String(100), nullable=True)  # ISO timestamp
    is_online = Column(Boolean, default=True, index=True)

    # Metadata
    gateway_metadata = Column(JSON, default={})

    # Relationships
    site = relationship("Site", back_populates="gateways")
    observations = relationship("Observation", back_populates="gateway")

    # Indexes
    __table_args__ = (
        Index("idx_gateway_org_id", "organization_id", "gateway_id"),
        Index("idx_gateway_org_status", "organization_id", "status"),
        Index("idx_gateway_site", "site_id"),
        Index("idx_gateway_location", "latitude", "longitude"),
        Index("idx_gateway_online", "is_online"),
    )
