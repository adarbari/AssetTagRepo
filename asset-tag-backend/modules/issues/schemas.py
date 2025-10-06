"""
Issue schemas
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator


class IssueBase(BaseModel):
    """Base issue schema"""

    title: str = Field(..., min_length=1, max_length=500, description="Issue title")
    description: Optional[str] = Field(None, description="Detailed issue description")
    issue_type: str = Field(
        ..., description="Type of issue (mechanical, electrical, damage, safety, etc.)"
    )
    severity: str = Field(
        ..., description="Issue severity (low, medium, high, critical)"
    )
    asset_id: Optional[UUID] = Field(None, description="Associated asset ID")
    assigned_to_user_id: Optional[UUID] = Field(
        None, description="User assigned to resolve the issue"
    )
    due_date: Optional[datetime] = Field(None, description="Due date for resolution")
    notes: Optional[str] = Field(None, description="Additional notes")
    tags: Optional[List[str]] = Field(default_factory=list, description="Issue tags")
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Additional metadata"
    )

    @validator("severity")
    def validate_severity(cls, v):
        allowed_severities = ["low", "medium", "high", "critical"]
        if v not in allowed_severities:
            raise ValueError(
                f'Severity must be one of: {", ".join(allowed_severities)}'
            )
        return v

    @validator("issue_type")
    def validate_issue_type(cls, v):
        allowed_types = [
            "mechanical",
            "electrical",
            "damage",
            "safety",
            "software",
            "other",
        ]
        if v not in allowed_types:
            raise ValueError(f'Issue type must be one of: {", ".join(allowed_types)}')
        return v


class IssueCreate(IssueBase):
    """Schema for creating a new issue"""

    pass


class IssueUpdate(BaseModel):
    """Schema for updating an issue"""

    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    issue_type: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    asset_id: Optional[UUID] = None
    assigned_to_user_id: Optional[UUID] = None
    due_date: Optional[datetime] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

    @validator("severity")
    def validate_severity(cls, v):
        if v is not None:
            allowed_severities = ["low", "medium", "high", "critical"]
            if v not in allowed_severities:
                raise ValueError(
                    f'Severity must be one of: {", ".join(allowed_severities)}'
                )
        return v

    @validator("status")
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = [
                "open",
                "acknowledged",
                "in-progress",
                "resolved",
                "closed",
                "cancelled",
            ]
            if v not in allowed_statuses:
                raise ValueError(
                    f'Status must be one of: {", ".join(allowed_statuses)}'
                )
        return v


class IssueStatusUpdate(BaseModel):
    """Schema for updating issue status only"""

    status: str = Field(..., description="New status")
    notes: Optional[str] = Field(None, description="Status change notes")

    @validator("status")
    def validate_status(cls, v):
        allowed_statuses = [
            "open",
            "acknowledged",
            "in-progress",
            "resolved",
            "closed",
            "cancelled",
        ]
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v


class IssueResponse(IssueBase):
    """Schema for issue response"""

    id: UUID
    status: str
    asset_name: Optional[str] = None
    reported_by_user_id: Optional[UUID] = None
    reported_by_name: Optional[str] = None
    assigned_to_name: Optional[str] = None
    reported_date: datetime
    acknowledged_date: Optional[datetime] = None
    resolved_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IssueCommentBase(BaseModel):
    """Base issue comment schema"""

    comment: str = Field(..., min_length=1, description="Comment text")
    comment_type: str = Field(default="comment", description="Type of comment")


class IssueCommentCreate(IssueCommentBase):
    """Schema for creating a new issue comment"""

    pass


class IssueCommentResponse(IssueCommentBase):
    """Schema for issue comment response"""

    id: UUID
    issue_id: UUID
    user_id: Optional[UUID] = None
    user_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IssueAttachmentBase(BaseModel):
    """Base issue attachment schema"""

    file_name: str = Field(..., description="Original file name")
    file_type: str = Field(..., description="MIME type")
    file_size: int = Field(..., gt=0, description="File size in bytes")
    file_url: str = Field(..., description="File URL")


class IssueAttachmentCreate(IssueAttachmentBase):
    """Schema for creating a new issue attachment"""

    pass


class IssueAttachmentResponse(IssueAttachmentBase):
    """Schema for issue attachment response"""

    id: UUID
    issue_id: UUID
    uploaded_by_user_id: Optional[UUID] = None
    uploaded_by_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IssueWithDetails(IssueResponse):
    """Schema for issue with full details including comments and attachments"""

    comments: List[IssueCommentResponse] = []
    attachments: List[IssueAttachmentResponse] = []

    class Config:
        from_attributes = True


class IssueStats(BaseModel):
    """Schema for issue statistics"""

    total_issues: int
    open_issues: int
    in_progress_issues: int
    resolved_issues: int
    closed_issues: int
    critical_issues: int
    high_priority_issues: int
    overdue_issues: int
    avg_resolution_time_hours: Optional[float] = None
