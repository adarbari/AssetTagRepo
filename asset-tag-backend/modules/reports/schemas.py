"""
Reports schemas
"""
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, validator


class ReportFormat(str, Enum):
    """Report format options"""

    CSV = "csv"
    PDF = "pdf"
    EXCEL = "excel"


class ReportStatusEnum(str, Enum):
    """Report status options"""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ScheduleFrequency(str, Enum):
    """Schedule frequency options"""

    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"


class ReportTemplate(BaseModel):
    """Report template schema"""

    id: str = Field(..., description="Template ID")
    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    category: str = Field(..., description="Report category")
    parameters: Dict[str, Any] = Field(..., description="Template parameters")


class ReportGenerationRequest(BaseModel):
    """Schema for report generation request"""

    template_id: str = Field(..., description="Report template ID")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Report parameters")
    format: ReportFormat = Field(default=ReportFormat.CSV, description="Output format")

    @validator("template_id")
    def validate_template_id(cls, v):
        # This would be validated against available templates
        return v


class ReportGenerationResponse(BaseModel):
    """Schema for report generation response"""

    report_id: str = Field(..., description="Generated report ID")
    status: str = Field(..., description="Generation status")
    message: str = Field(..., description="Status message")


class ReportStatus(BaseModel):
    """Schema for report status"""

    id: str = Field(..., description="Report ID")
    template_id: str = Field(..., description="Template ID used")
    status: ReportStatusEnum = Field(..., description="Current status")
    progress: int = Field(0, ge=0, le=100, description="Progress percentage")
    created_at: datetime = Field(..., description="Creation timestamp")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")
    failed_at: Optional[datetime] = Field(None, description="Failure timestamp")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    download_url: Optional[str] = Field(None, description="Download URL if completed")
    filename: Optional[str] = Field(None, description="Generated filename")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Report parameters")


class ReportDownloadResponse(BaseModel):
    """Schema for report download response"""

    report_id: str = Field(..., description="Report ID")
    download_url: str = Field(..., description="Download URL")
    filename: str = Field(..., description="Filename")
    expires_at: Optional[datetime] = Field(None, description="Download expiration")


class ScheduledReportRequest(BaseModel):
    """Schema for scheduling a report"""

    template_id: str = Field(..., description="Report template ID")
    schedule: ScheduleFrequency = Field(..., description="Schedule frequency")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Report parameters")
    format: ReportFormat = Field(default=ReportFormat.CSV, description="Output format")
    recipients: List[str] = Field(default_factory=list, description="Email recipients")
    enabled: bool = Field(default=True, description="Whether schedule is enabled")


class ScheduledReportResponse(BaseModel):
    """Schema for scheduled report response"""

    id: str = Field(..., description="Scheduled report ID")
    template_id: str = Field(..., description="Template ID")
    schedule: ScheduleFrequency = Field(..., description="Schedule frequency")
    parameters: Dict[str, Any] = Field(..., description="Report parameters")
    format: ReportFormat = Field(..., description="Output format")
    recipients: List[str] = Field(..., description="Email recipients")
    enabled: bool = Field(..., description="Whether schedule is enabled")
    created_at: datetime = Field(..., description="Creation timestamp")
    next_run: Optional[datetime] = Field(None, description="Next scheduled run")
    last_run: Optional[datetime] = Field(None, description="Last run timestamp")


class ExportRequest(BaseModel):
    """Schema for data export request"""

    export_type: str = Field(..., description="Export type (assets, jobs, maintenance, etc.)")
    format: str = Field(default="csv", description="Export format")
    filters: Dict[str, Any] = Field(default_factory=dict, description="Export filters")
    fields: Optional[List[str]] = Field(None, description="Specific fields to export")

    @validator("format")
    def validate_format(cls, v):
        allowed_formats = ["csv", "json", "excel"]
        if v not in allowed_formats:
            raise ValueError(f'Format must be one of: {", ".join(allowed_formats)}')
        return v


class ExportResponse(BaseModel):
    """Schema for export response"""

    export_id: str = Field(..., description="Export ID")
    filename: str = Field(..., description="Generated filename")
    content: str = Field(..., description="Export content")
    media_type: str = Field(..., description="Content media type")
    size: int = Field(..., description="Content size in bytes")


class ReportMetrics(BaseModel):
    """Schema for report metrics"""

    total_reports_generated: int
    reports_by_template: Dict[str, int]
    reports_by_format: Dict[str, int]
    avg_generation_time_seconds: Optional[float] = None
    success_rate: Optional[float] = None
    most_popular_template: Optional[str] = None
