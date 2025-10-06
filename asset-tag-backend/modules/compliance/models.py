"""
Compliance models
"""
from sqlalchemy import (JSON, Boolean, Column, DateTime, ForeignKey, Index,
                        Integer, String, Text)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from modules.shared.database.base import (BaseModel, OrganizationMixin,
                                          SoftDeleteMixin)


class Compliance(BaseModel, OrganizationMixin, SoftDeleteMixin):
    """Compliance model for tracking regulatory requirements"""

    __tablename__ = "compliance"

    # Basic information
    compliance_type = Column(
        String(100), nullable=False, index=True
    )  # safety, environmental, regulatory, etc.
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        String(50), default="pending", index=True
    )  # pending, in-progress, completed, overdue, cancelled

    # Asset relationship
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=True)
    asset_name = Column(String(255), nullable=True)  # Denormalized for performance

    # Assignment
    assigned_to_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    assigned_to_name = Column(
        String(255), nullable=True
    )  # Denormalized for performance

    # Dates
    due_date = Column(DateTime(timezone=True), nullable=False, index=True)
    completed_date = Column(DateTime(timezone=True), nullable=True)
    last_reminder_date = Column(DateTime(timezone=True), nullable=True)

    # Compliance details
    certification_type = Column(String(100), nullable=True)  # ISO, OSHA, EPA, etc.
    certification_number = Column(String(100), nullable=True)
    issuing_authority = Column(String(255), nullable=True)
    renewal_required = Column(Boolean, default=False)
    renewal_frequency_months = Column(
        Integer, nullable=True
    )  # How often it needs renewal

    # Documentation
    document_url = Column(String(500), nullable=True)  # Link to compliance document
    document_name = Column(String(255), nullable=True)
    document_type = Column(
        String(100), nullable=True
    )  # certificate, permit, license, etc.

    # Additional information
    notes = Column(Text, nullable=True)
    tags = Column(JSON, default=list)  # Array of strings
    meta_data = Column(JSON, default={})

    # Relationships
    asset = relationship("Asset", foreign_keys=[asset_id])
    assigned_to_user = relationship("User", foreign_keys=[assigned_to_user_id])
    checks = relationship(
        "ComplianceCheck", back_populates="compliance", cascade="all, delete-orphan"
    )

    # Indexes
    __table_args__ = (
        Index("idx_compliance_org_type", "organization_id", "compliance_type"),
        Index("idx_compliance_org_status", "organization_id", "status"),
        Index("idx_compliance_org_due_date", "organization_id", "due_date"),
        Index("idx_compliance_asset", "asset_id"),
        Index("idx_compliance_assigned", "assigned_to_user_id"),
        Index("idx_compliance_overdue", "due_date", "status"),
    )


class ComplianceCheck(BaseModel, OrganizationMixin):
    """Compliance check model for tracking compliance verification activities"""

    __tablename__ = "compliance_checks"

    # Compliance relationship
    compliance_id = Column(
        UUID(as_uuid=True), ForeignKey("compliance.id"), nullable=False
    )

    # Check details
    check_type = Column(
        String(100), nullable=False
    )  # inspection, audit, review, test, etc.
    check_date = Column(DateTime(timezone=True), nullable=False)
    result = Column(String(50), nullable=False)  # pass, fail, warning, pending
    score = Column(Integer, nullable=True)  # Numeric score if applicable

    # Performed by
    checked_by_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    checked_by_name = Column(String(255), nullable=True)  # Denormalized for performance
    checked_by_role = Column(
        String(100), nullable=True
    )  # inspector, auditor, manager, etc.

    # Check details
    findings = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    corrective_actions = Column(Text, nullable=True)
    next_check_date = Column(DateTime(timezone=True), nullable=True)

    # Documentation
    document_url = Column(String(500), nullable=True)  # Link to check report
    document_name = Column(String(255), nullable=True)

    # Additional information
    notes = Column(Text, nullable=True)
    meta_data = Column(JSON, default={})

    # Relationships
    compliance = relationship("Compliance", back_populates="checks")
    checked_by_user = relationship("User", foreign_keys=[checked_by_user_id])

    # Indexes
    __table_args__ = (
        Index("idx_compliance_check_compliance", "compliance_id", "check_date"),
        Index("idx_compliance_check_result", "result"),
        Index("idx_compliance_check_date", "check_date"),
        Index("idx_compliance_check_type", "check_type"),
    )
