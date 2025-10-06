"""
Shared database models
"""
from sqlalchemy import (JSON, Boolean, Column, ForeignKey, Index, Integer,
                        String, Text)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from modules.alerts.models import Alert
# Import all models to ensure they're registered with SQLAlchemy
from modules.assets.models import Asset, AssetType
from modules.checkin_checkout.models import CheckInOutRecord
from modules.gateways.models import Gateway
from modules.geofences.models import Geofence, GeofenceEvent
from modules.jobs.models import Job
from modules.locations.models import EstimatedLocation
from modules.maintenance.models import MaintenanceRecord
from modules.observations.models import Observation
from modules.shared.database.base import (BaseModel, OrganizationMixin,
                                          SoftDeleteMixin)
from modules.sites.models import Site
from modules.vehicles.models import Vehicle, VehicleAssetPairing


class Organization(BaseModel, SoftDeleteMixin):
    """Organization model for multi-tenancy"""

    __tablename__ = "organizations"

    name = Column(String(255), nullable=False)
    domain = Column(String(255), unique=True, nullable=True)
    settings = Column(JSON, default={})
    is_active = Column(Boolean, default=True)

    # Relationships
    users = relationship("User", back_populates="organization")
    sites = relationship("Site", back_populates="organization")


class User(BaseModel, OrganizationMixin, SoftDeleteMixin):
    """User model"""

    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(String(50), default="user")  # user, admin, superuser
    preferences = Column(JSON, default={})

    # Foreign keys
    organization_id = Column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )

    # Relationships
    organization = relationship("Organization", back_populates="users")

    # Indexes
    __table_args__ = (
        Index("idx_user_org_email", "organization_id", "email"),
        Index("idx_user_org_username", "organization_id", "username"),
    )


class AuditLog(BaseModel, OrganizationMixin):
    """Audit log for tracking changes"""

    __tablename__ = "audit_logs"

    entity_type = Column(String(100), nullable=False)  # asset, site, user, etc.
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    action = Column(String(50), nullable=False)  # create, update, delete
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    changes = Column(JSON, nullable=True)  # before/after values
    model_metadata = Column(JSON, default={})

    # Indexes
    __table_args__ = (
        Index("idx_audit_entity", "entity_type", "entity_id"),
        Index("idx_audit_org_time", "organization_id", "created_at"),
        Index("idx_audit_user", "user_id", "created_at"),
    )
