"""
Issue models
"""

from sqlalchemy import (JSON, Boolean, Column, DateTime, ForeignKey, Index,
                        Integer, String, Text)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from modules.shared.database.base import (BaseModel, OrganizationMixin,
                                          SoftDeleteMixin)


class Issue(BaseModel, OrganizationMixin, SoftDeleteMixin):
    """Issue model for tracking problems and incidents"""

    __tablename__ = "issues"

    # Basic information
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    issue_type = Column(
        String(100), nullable=False, index=True
    )  # mechanical, electrical, damage, safety, etc.
    severity = Column(
        String(50), nullable=False, index=True
    )  # low, medium, high, critical
    status = Column(
        String(50), default="open", index=True
    )  # open, acknowledged, in-progress, resolved, closed, cancelled

    # Asset relationship
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=True)
    asset_name = Column(String(255), nullable=True)  # Denormalized for performance

    # Assignment
    reported_by_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    reported_by_name = Column(
        String(255), nullable=True
    )  # Denormalized for performance
    assigned_to_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    assigned_to_name = Column(
        String(255), nullable=True
    )  # Denormalized for performance

    # Dates
    reported_date = Column(DateTime(timezone=True), nullable=False)
    acknowledged_date = Column(DateTime(timezone=True), nullable=True)
    resolved_date = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)

    # Additional information
    notes = Column(Text, nullable=True)
    tags = Column(JSON, default=list)  # Array of strings
    issue_metadata = Column(JSON, default={})

    # Relationships
    asset = relationship("Asset", foreign_keys=[asset_id])
    reported_by_user = relationship("User", foreign_keys=[reported_by_user_id])
    assigned_to_user = relationship("User", foreign_keys=[assigned_to_user_id])
    comments = relationship(
        "IssueComment", back_populates="issue", cascade="all, delete-orphan"
    )
    attachments = relationship(
        "IssueAttachment", back_populates="issue", cascade="all, delete-orphan"
    )

    # Indexes
    __table_args__ = (
        Index("idx_issue_org_status", "organization_id", "status"),
        Index("idx_issue_org_severity", "organization_id", "severity"),
        Index("idx_issue_org_type", "organization_id", "issue_type"),
        Index("idx_issue_asset", "asset_id"),
        Index("idx_issue_assigned", "assigned_to_user_id"),
        Index("idx_issue_reported_date", "reported_date"),
    )


class IssueComment(BaseModel, OrganizationMixin):
    """Issue comment model for tracking issue updates and discussions"""

    __tablename__ = "issue_comments"

    # Issue relationship
    issue_id = Column(UUID(as_uuid=True), ForeignKey("issues.id"), nullable=False)

    # Comment details
    comment = Column(Text, nullable=False)
    comment_type = Column(
        String(50), default="comment"
    )  # comment, status_change, assignment_change, etc.

    # User who made the comment
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    user_name = Column(String(255), nullable=True)  # Denormalized for performance

    # Additional metadata
    issue_metadata = Column(JSON, default={})

    # Relationships
    issue = relationship("Issue", back_populates="comments")
    user = relationship("User", foreign_keys=[user_id])

    # Indexes
    __table_args__ = (
        Index("idx_issue_comment_issue", "issue_id", "created_at"),
        Index("idx_issue_comment_user", "user_id"),
    )


class IssueAttachment(BaseModel, OrganizationMixin):
    """Issue attachment model for file uploads"""

    __tablename__ = "issue_attachments"

    # Issue relationship
    issue_id = Column(UUID(as_uuid=True), ForeignKey("issues.id"), nullable=False)

    # File information
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(100), nullable=False)  # MIME type
    file_size = Column(Integer, nullable=False)  # Size in bytes
    file_url = Column(String(500), nullable=False)  # S3/MinIO URL

    # Upload information
    uploaded_by_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    uploaded_by_name = Column(
        String(255), nullable=True
    )  # Denormalized for performance

    # Additional metadata
    issue_metadata = Column(JSON, default={})

    # Relationships
    issue = relationship("Issue", back_populates="attachments")
    uploaded_by_user = relationship("User", foreign_keys=[uploaded_by_user_id])

    # Indexes
    __table_args__ = (
        Index("idx_issue_attachment_issue", "issue_id"),
        Index("idx_issue_attachment_type", "file_type"),
    )
