"""
Issue API endpoints
"""
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from config.database import get_db
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from modules.issues.models import Issue, IssueAttachment, IssueComment
from modules.issues.schemas import (
    IssueAttachmentCreate,
    IssueAttachmentResponse,
    IssueCommentCreate,
    IssueCommentResponse,
    IssueCreate,
    IssueResponse,
    IssueStats,
    IssueStatusUpdate,
    IssueUpdate,
    IssueWithDetails,
)
from sqlalchemy import and_, delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.get("/issues", response_model=List[IssueResponse])
async def get_issues(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    issue_type: Optional[str] = None,
    assigned_to_user_id: Optional[str] = None,
    asset_id: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get list of issues with optional filtering"""
    try:
        query = select(Issue).where(Issue.deleted_at.is_(None))

        # Apply filters
        if status:
            query = query.where(Issue.status == status)
        if severity:
            query = query.where(Issue.severity == severity)
        if issue_type:
            query = query.where(Issue.issue_type == issue_type)
        if assigned_to_user_id:
            query = query.where(Issue.assigned_to_user_id == assigned_to_user_id)
        if asset_id:
            query = query.where(Issue.asset_id == asset_id)
        if search:
            search_filter = or_(
                Issue.title.ilike(f"%{search}%"),
                Issue.description.ilike(f"%{search}%"),
                Issue.asset_name.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)

        # Apply pagination
        query = query.order_by(Issue.created_at.desc()).offset(skip).limit(limit)

        result = await db.execute(query)
        issues = result.scalars().all()

        return [IssueResponse.from_orm(issue) for issue in issues]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching issues: {str(e)}")


@router.get("/issues/{issue_id}", response_model=IssueWithDetails)
async def get_issue(issue_id: str, db: AsyncSession = Depends(get_db)):
    """Get issue by ID with full details"""
    try:
        result = await db.execute(
            select(Issue).where(and_(Issue.id == issue_id, Issue.deleted_at.is_(None)))
        )
        issue = result.scalar_one_or_none()

        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")

        return IssueWithDetails.from_orm(issue)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching issue: {str(e)}")


@router.post("/issues", response_model=IssueResponse)
async def create_issue(issue_data: IssueCreate, db: AsyncSession = Depends(get_db)):
    """Create a new issue"""
    try:
        issue = Issue(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org for now
            title=issue_data.title,
            description=issue_data.description,
            issue_type=issue_data.issue_type,
            severity=issue_data.severity,
            status="open",
            asset_id=issue_data.asset_id,
            asset_name=issue_data.asset_name,
            assigned_to_user_id=issue_data.assigned_to_user_id,
            assigned_to_name=issue_data.assigned_to_name,
            reported_date=datetime.now(),
            due_date=issue_data.due_date,
            notes=issue_data.notes,
            tags=issue_data.tags or [],
            metadata=issue_data.metadata or {},
        )

        db.add(issue)
        await db.commit()
        await db.refresh(issue)

        return IssueResponse.from_orm(issue)

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating issue: {str(e)}")


@router.put("/issues/{issue_id}", response_model=IssueResponse)
async def update_issue(
    issue_id: str, issue_data: IssueUpdate, db: AsyncSession = Depends(get_db)
):
    """Update an existing issue"""
    try:
        result = await db.execute(
            select(Issue).where(and_(Issue.id == issue_id, Issue.deleted_at.is_(None)))
        )
        issue = result.scalar_one_or_none()

        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")

        # Update fields
        update_data = issue_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(issue, field, value)

        # Update timestamps based on status changes
        if "status" in update_data:
            if update_data["status"] == "acknowledged" and not issue.acknowledged_date:
                issue.acknowledged_date = datetime.now()
            elif (
                update_data["status"] in ["resolved", "closed"]
                and not issue.resolved_date
            ):
                issue.resolved_date = datetime.now()

        await db.commit()
        await db.refresh(issue)

        return IssueResponse.from_orm(issue)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating issue: {str(e)}")


@router.patch("/issues/{issue_id}/status", response_model=IssueResponse)
async def update_issue_status(
    issue_id: str, status_data: IssueStatusUpdate, db: AsyncSession = Depends(get_db)
):
    """Update issue status only"""
    try:
        result = await db.execute(
            select(Issue).where(and_(Issue.id == issue_id, Issue.deleted_at.is_(None)))
        )
        issue = result.scalar_one_or_none()

        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")

        # Update status
        issue.status = status_data.status

        # Update timestamps based on status
        if status_data.status == "acknowledged" and not issue.acknowledged_date:
            issue.acknowledged_date = datetime.now()
        elif status_data.status in ["resolved", "closed"] and not issue.resolved_date:
            issue.resolved_date = datetime.now()

        # Add status change note if provided
        if status_data.notes:
            if issue.notes:
                issue.notes += (
                    f"\n\nStatus changed to {status_data.status}: {status_data.notes}"
                )
            else:
                issue.notes = (
                    f"Status changed to {status_data.status}: {status_data.notes}"
                )

        await db.commit()
        await db.refresh(issue)

        return IssueResponse.from_orm(issue)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error updating issue status: {str(e)}"
        )


@router.delete("/issues/{issue_id}")
async def delete_issue(issue_id: str, db: AsyncSession = Depends(get_db)):
    """Delete an issue (soft delete)"""
    try:
        result = await db.execute(
            select(Issue).where(and_(Issue.id == issue_id, Issue.deleted_at.is_(None)))
        )
        issue = result.scalar_one_or_none()

        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")

        # Soft delete
        issue.deleted_at = datetime.now()
        await db.commit()

        return {"message": "Issue deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting issue: {str(e)}")


@router.post("/issues/{issue_id}/comments", response_model=IssueCommentResponse)
async def add_issue_comment(
    issue_id: str, comment_data: IssueCommentCreate, db: AsyncSession = Depends(get_db)
):
    """Add a comment to an issue"""
    try:
        # Check if issue exists
        issue_result = await db.execute(
            select(Issue).where(and_(Issue.id == issue_id, Issue.deleted_at.is_(None)))
        )
        issue = issue_result.scalar_one_or_none()
        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")

        # Create comment
        comment = IssueComment(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org
            issue_id=issue_id,
            comment=comment_data.comment,
            comment_type=comment_data.comment_type,
            user_id=None,  # TODO: Get from authentication
            user_name="System User",  # TODO: Get from authentication
        )

        db.add(comment)
        await db.commit()
        await db.refresh(comment)

        return IssueCommentResponse.from_orm(comment)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding comment: {str(e)}")


@router.get("/issues/{issue_id}/comments", response_model=List[IssueCommentResponse])
async def get_issue_comments(
    issue_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get comments for an issue"""
    try:
        # Check if issue exists
        issue_result = await db.execute(
            select(Issue).where(and_(Issue.id == issue_id, Issue.deleted_at.is_(None)))
        )
        issue = issue_result.scalar_one_or_none()
        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")

        # Get comments
        query = (
            select(IssueComment)
            .where(IssueComment.issue_id == issue_id)
            .order_by(IssueComment.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        comments = result.scalars().all()

        return [IssueCommentResponse.from_orm(comment) for comment in comments]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching comments: {str(e)}"
        )


@router.post("/issues/{issue_id}/attachments", response_model=IssueAttachmentResponse)
async def upload_issue_attachment(
    issue_id: str, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)
):
    """Upload an attachment to an issue"""
    try:
        # Check if issue exists
        issue_result = await db.execute(
            select(Issue).where(and_(Issue.id == issue_id, Issue.deleted_at.is_(None)))
        )
        issue = issue_result.scalar_one_or_none()
        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")

        # TODO: Implement file upload to S3/MinIO
        # For now, create a placeholder URL
        file_url = f"https://storage.example.com/issues/{issue_id}/{file.filename}"

        # Create attachment record
        attachment = IssueAttachment(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org
            issue_id=issue_id,
            file_name=file.filename,
            file_type=file.content_type or "application/octet-stream",
            file_size=0,  # TODO: Get actual file size
            file_url=file_url,
            uploaded_by_user_id=None,  # TODO: Get from authentication
            uploaded_by_name="System User",  # TODO: Get from authentication
        )

        db.add(attachment)
        await db.commit()
        await db.refresh(attachment)

        return IssueAttachmentResponse.from_orm(attachment)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error uploading attachment: {str(e)}"
        )


@router.get("/issues/stats", response_model=IssueStats)
async def get_issue_stats(db: AsyncSession = Depends(get_db)):
    """Get issue statistics"""
    try:
        # Get basic counts
        total_result = await db.execute(
            select(func.count(Issue.id)).where(Issue.deleted_at.is_(None))
        )
        total_issues = total_result.scalar()

        # Get status counts
        status_counts = {}
        for status in ["open", "in-progress", "resolved", "closed"]:
            result = await db.execute(
                select(func.count(Issue.id)).where(
                    and_(Issue.status == status, Issue.deleted_at.is_(None))
                )
            )
            status_counts[status] = result.scalar()

        # Get severity counts
        critical_result = await db.execute(
            select(func.count(Issue.id)).where(
                and_(Issue.severity == "critical", Issue.deleted_at.is_(None))
            )
        )
        critical_issues = critical_result.scalar()

        high_priority_result = await db.execute(
            select(func.count(Issue.id)).where(
                and_(
                    Issue.severity.in_(["high", "critical"]), Issue.deleted_at.is_(None)
                )
            )
        )
        high_priority_issues = high_priority_result.scalar()

        # Get overdue issues
        overdue_result = await db.execute(
            select(func.count(Issue.id)).where(
                and_(
                    Issue.due_date < datetime.now(),
                    Issue.status.in_(["open", "acknowledged", "in-progress"]),
                    Issue.deleted_at.is_(None),
                )
            )
        )
        overdue_issues = overdue_result.scalar()

        return IssueStats(
            total_issues=total_issues,
            open_issues=status_counts.get("open", 0),
            in_progress_issues=status_counts.get("in-progress", 0),
            resolved_issues=status_counts.get("resolved", 0),
            closed_issues=status_counts.get("closed", 0),
            critical_issues=critical_issues,
            high_priority_issues=high_priority_issues,
            overdue_issues=overdue_issues,
            avg_resolution_time_hours=None,  # TODO: Calculate from resolved issues
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching issue stats: {str(e)}"
        )
