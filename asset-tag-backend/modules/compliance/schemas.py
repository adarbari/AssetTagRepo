"""
Compliance schemas
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator


class ComplianceBase(BaseModel):
    """Base compliance schema"""

    compliance_type: str = Field(..., description="Type of compliance requirement")
    title: str = Field(
        ..., min_length=1, max_length=500, description="Compliance title"
    )
    description: Optional[str] = Field(None, description="Detailed description")
    asset_id: Optional[UUID] = Field(None, description="Associated asset ID")
    assigned_to_user_id: Optional[UUID] = Field(
        None, description="User assigned to handle compliance"
    )
    due_date: datetime = Field(..., description="Due date for compliance")
    certification_type: Optional[str] = Field(None, description="Type of certification")
    certification_number: Optional[str] = Field(
        None, description="Certification number"
    )
    issuing_authority: Optional[str] = Field(None, description="Issuing authority")
    renewal_required: bool = Field(
        default=False, description="Whether renewal is required"
    )
    renewal_frequency_months: Optional[int] = Field(
        None, ge=1, description="Renewal frequency in months"
    )
    document_url: Optional[str] = Field(None, description="Link to compliance document")
    document_name: Optional[str] = Field(None, description="Document name")
    document_type: Optional[str] = Field(None, description="Type of document")
    notes: Optional[str] = Field(None, description="Additional notes")
    tags: Optional[List[str]] = Field(
        default_factory=list, description="Compliance tags"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Additional metadata"
    )

    @validator("compliance_type")
    def validate_compliance_type(cls, v):
        allowed_types = [
            "safety",
            "environmental",
            "regulatory",
            "quality",
            "security",
            "financial",
            "other",
        ]
        if v not in allowed_types:
            raise ValueError(
                f'Compliance type must be one of: {", ".join(allowed_types)}'
            )
        return v

    @validator("document_type")
    def validate_document_type(cls, v):
        if v is not None:
            allowed_types = [
                "certificate",
                "permit",
                "license",
                "inspection_report",
                "audit_report",
                "other",
            ]
            if v not in allowed_types:
                raise ValueError(
                    f'Document type must be one of: {", ".join(allowed_types)}'
                )
        return v


class ComplianceCreate(ComplianceBase):
    """Schema for creating a new compliance record"""

    pass


class ComplianceUpdate(BaseModel):
    """Schema for updating a compliance record"""

    compliance_type: Optional[str] = None
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    status: Optional[str] = None
    asset_id: Optional[UUID] = None
    assigned_to_user_id: Optional[UUID] = None
    due_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    certification_type: Optional[str] = None
    certification_number: Optional[str] = None
    issuing_authority: Optional[str] = None
    renewal_required: Optional[bool] = None
    renewal_frequency_months: Optional[int] = Field(None, ge=1)
    document_url: Optional[str] = None
    document_name: Optional[str] = None
    document_type: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

    @validator("status")
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = [
                "pending",
                "in-progress",
                "completed",
                "overdue",
                "cancelled",
            ]
            if v not in allowed_statuses:
                raise ValueError(
                    f'Status must be one of: {", ".join(allowed_statuses)}'
                )
        return v


class ComplianceResponse(ComplianceBase):
    """Schema for compliance response"""

    id: UUID
    status: str
    asset_name: Optional[str] = None
    assigned_to_name: Optional[str] = None
    completed_date: Optional[datetime] = None
    last_reminder_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ComplianceCheckBase(BaseModel):
    """Base compliance check schema"""

    check_type: str = Field(..., description="Type of compliance check")
    check_date: datetime = Field(..., description="Date when check was performed")
    result: str = Field(..., description="Check result")
    score: Optional[int] = Field(
        None, ge=0, le=100, description="Numeric score if applicable"
    )
    checked_by_user_id: Optional[UUID] = Field(
        None, description="User who performed the check"
    )
    checked_by_role: Optional[str] = Field(
        None, description="Role of person who performed check"
    )
    findings: Optional[str] = Field(None, description="Check findings")
    recommendations: Optional[str] = Field(None, description="Recommendations")
    corrective_actions: Optional[str] = Field(
        None, description="Corrective actions required"
    )
    next_check_date: Optional[datetime] = Field(
        None, description="Next scheduled check date"
    )
    document_url: Optional[str] = Field(None, description="Link to check report")
    document_name: Optional[str] = Field(None, description="Check report name")
    notes: Optional[str] = Field(None, description="Additional notes")
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Additional metadata"
    )

    @validator("check_type")
    def validate_check_type(cls, v):
        allowed_types = [
            "inspection",
            "audit",
            "review",
            "test",
            "assessment",
            "verification",
            "other",
        ]
        if v not in allowed_types:
            raise ValueError(f'Check type must be one of: {", ".join(allowed_types)}')
        return v

    @validator("result")
    def validate_result(cls, v):
        allowed_results = ["pass", "fail", "warning", "pending", "conditional"]
        if v not in allowed_results:
            raise ValueError(f'Result must be one of: {", ".join(allowed_results)}')
        return v


class ComplianceCheckCreate(ComplianceCheckBase):
    """Schema for creating a new compliance check"""

    pass


class ComplianceCheckResponse(ComplianceCheckBase):
    """Schema for compliance check response"""

    id: UUID
    compliance_id: UUID
    checked_by_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ComplianceWithChecks(ComplianceResponse):
    """Schema for compliance with checks"""

    checks: List[ComplianceCheckResponse] = []

    class Config:
        from_attributes = True


class ComplianceStats(BaseModel):
    """Schema for compliance statistics"""

    total_compliance: int
    pending_compliance: int
    in_progress_compliance: int
    completed_compliance: int
    overdue_compliance: int
    cancelled_compliance: int
    compliance_by_type: Dict[str, int]
    upcoming_due_dates: int  # Due within next 30 days
    avg_completion_time_days: Optional[float] = None
    compliance_rate: Optional[float] = None  # Percentage of completed vs total
