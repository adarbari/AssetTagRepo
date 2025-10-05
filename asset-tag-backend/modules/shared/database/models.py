"""
Shared database models
"""
from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from modules.shared.database.base import BaseModel, OrganizationMixin, SoftDeleteMixin


class Organization(BaseModel, SoftDeleteMixin):
    """Organization model for multi-tenancy"""
    __tablename__ = "organizations"
    
    name = Column(String(255), nullable=False)
    domain = Column(String(255), unique=True, nullable=True)
    settings = Column(JSONB, default={})
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
    preferences = Column(JSONB, default={})
    
    # Foreign keys
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    
    # Indexes
    __table_args__ = (
        Index('idx_user_org_email', 'organization_id', 'email'),
        Index('idx_user_org_username', 'organization_id', 'username'),
    )


class AuditLog(BaseModel, OrganizationMixin):
    """Audit log for tracking changes"""
    __tablename__ = "audit_logs"
    
    entity_type = Column(String(100), nullable=False)  # asset, site, user, etc.
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    action = Column(String(50), nullable=False)  # create, update, delete
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    changes = Column(JSONB, nullable=True)  # before/after values
    metadata = Column(JSONB, default={})
    
    # Indexes
    __table_args__ = (
        Index('idx_audit_entity', 'entity_type', 'entity_id'),
        Index('idx_audit_org_time', 'organization_id', 'created_at'),
        Index('idx_audit_user', 'user_id', 'created_at'),
    )
