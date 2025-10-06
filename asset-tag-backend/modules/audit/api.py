"""
Audit API endpoints
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from config.database import get_db
from modules.shared.database.models import AuditLog

router = APIRouter()


@router.get("/audit/{entity_type}")
async def get_audit_trail(
    entity_type: str,
    entity_id: Optional[str] = Query(None, description="Specific entity ID"),
    action: Optional[str] = Query(None, description="Filter by action"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    limit: int = Query(100, ge=1, le=1000, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Starting offset"),
    db: AsyncSession = Depends(get_db),
):
    """Get audit trail for an entity type"""
    try:
        # Build query
        query = select(AuditLog).where(AuditLog.entity_type == entity_type)

        # Add filters
        if entity_id:
            query = query.where(AuditLog.entity_id == entity_id)

        if action:
            query = query.where(AuditLog.action == action)

        if user_id:
            query = query.where(AuditLog.user_id == user_id)

        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            query = query.where(AuditLog.created_at >= start_dt)

        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            query = query.where(AuditLog.created_at <= end_dt)

        # Order by creation time (newest first)
        query = query.order_by(AuditLog.created_at.desc())

        # Apply pagination
        query = query.offset(offset).limit(limit)

        # Execute query
        result = await db.execute(query)
        audit_logs = result.scalars().all()

        # Format results
        results = []
        for log in audit_logs:
            results.append(
                {
                    "id": str(log.id),
                    "entity_type": log.entity_type,
                    "entity_id": log.entity_id,
                    "action": log.action,
                    "user_id": log.user_id,
                    "changes": log.changes,
                    "metadata": log.metadata,
                    "created_at": log.created_at.isoformat(),
                    "organization_id": log.organization_id,
                }
            )

        return {
            "entity_type": entity_type,
            "filters": {
                "entity_id": entity_id,
                "action": action,
                "user_id": user_id,
                "start_date": start_date,
                "end_date": end_date,
            },
            "pagination": {"limit": limit, "offset": offset, "total": len(results)},
            "results": results,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting audit trail: {str(e)}"
        )


@router.get("/audit/{entity_type}/{entity_id}")
async def get_entity_audit_trail(
    entity_type: str,
    entity_id: str,
    limit: int = Query(50, ge=1, le=500, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Starting offset"),
    db: AsyncSession = Depends(get_db),
):
    """Get audit trail for a specific entity"""
    try:
        query = (
            select(AuditLog)
            .where(
                and_(
                    AuditLog.entity_type == entity_type, AuditLog.entity_id == entity_id
                )
            )
            .order_by(AuditLog.created_at.desc())
        )

        # Apply pagination
        query = query.offset(offset).limit(limit)

        # Execute query
        result = await db.execute(query)
        audit_logs = result.scalars().all()

        # Format results
        results = []
        for log in audit_logs:
            results.append(
                {
                    "id": str(log.id),
                    "action": log.action,
                    "user_id": log.user_id,
                    "changes": log.changes,
                    "metadata": log.metadata,
                    "created_at": log.created_at.isoformat(),
                }
            )

        return {
            "entity_type": entity_type,
            "entity_id": entity_id,
            "pagination": {"limit": limit, "offset": offset, "total": len(results)},
            "results": results,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting entity audit trail: {str(e)}"
        )


@router.get("/audit/user/{user_id}")
async def get_user_audit_trail(
    user_id: str,
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    action: Optional[str] = Query(None, description="Filter by action"),
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    limit: int = Query(100, ge=1, le=1000, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Starting offset"),
    db: AsyncSession = Depends(get_db),
):
    """Get audit trail for a specific user"""
    try:
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        # Build query
        query = select(AuditLog).where(
            and_(
                AuditLog.user_id == user_id,
                AuditLog.created_at >= start_date,
                AuditLog.created_at <= end_date,
            )
        )

        # Add filters
        if entity_type:
            query = query.where(AuditLog.entity_type == entity_type)

        if action:
            query = query.where(AuditLog.action == action)

        # Order by creation time (newest first)
        query = query.order_by(AuditLog.created_at.desc())

        # Apply pagination
        query = query.offset(offset).limit(limit)

        # Execute query
        result = await db.execute(query)
        audit_logs = result.scalars().all()

        # Format results
        results = []
        for log in audit_logs:
            results.append(
                {
                    "id": str(log.id),
                    "entity_type": log.entity_type,
                    "entity_id": log.entity_id,
                    "action": log.action,
                    "changes": log.changes,
                    "metadata": log.metadata,
                    "created_at": log.created_at.isoformat(),
                }
            )

        return {
            "user_id": user_id,
            "filters": {"entity_type": entity_type, "action": action, "days": days},
            "pagination": {"limit": limit, "offset": offset, "total": len(results)},
            "results": results,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting user audit trail: {str(e)}"
        )


@router.get("/audit/stats/summary")
async def get_audit_summary(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    organization_id: Optional[str] = Query(
        None, description="Filter by organization ID"
    ),
    db: AsyncSession = Depends(get_db),
):
    """Get audit statistics summary"""
    try:
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        # Build base query
        base_query = select(AuditLog).where(
            and_(AuditLog.created_at >= start_date, AuditLog.created_at <= end_date)
        )

        if organization_id:
            base_query = base_query.where(AuditLog.organization_id == organization_id)

        # Get total count
        total_result = await db.execute(
            select(text("COUNT(*)")).select_from(base_query.subquery())
        )
        total_count = total_result.scalar()

        # Get action breakdown
        action_query = text(
            """
            SELECT action, COUNT(*) as count
            FROM audit_logs
            WHERE created_at >= :start_date AND created_at <= :end_date
            AND (:organization_id IS NULL OR organization_id = :organization_id)
            GROUP BY action
            ORDER BY count DESC
        """
        )

        action_result = await db.execute(
            action_query,
            {
                "start_date": start_date,
                "end_date": end_date,
                "organization_id": organization_id,
            },
        )
        action_breakdown = [
            {"action": row.action, "count": row.count}
            for row in action_result.fetchall()
        ]

        # Get entity type breakdown
        entity_query = text(
            """
            SELECT entity_type, COUNT(*) as count
            FROM audit_logs
            WHERE created_at >= :start_date AND created_at <= :end_date
            AND (:organization_id IS NULL OR organization_id = :organization_id)
            GROUP BY entity_type
            ORDER BY count DESC
        """
        )

        entity_result = await db.execute(
            entity_query,
            {
                "start_date": start_date,
                "end_date": end_date,
                "organization_id": organization_id,
            },
        )
        entity_breakdown = [
            {"entity_type": row.entity_type, "count": row.count}
            for row in entity_result.fetchall()
        ]

        # Get daily activity
        daily_query = text(
            """
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM audit_logs
            WHERE created_at >= :start_date AND created_at <= :end_date
            AND (:organization_id IS NULL OR organization_id = :organization_id)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        """
        )

        daily_result = await db.execute(
            daily_query,
            {
                "start_date": start_date,
                "end_date": end_date,
                "organization_id": organization_id,
            },
        )
        daily_activity = [
            {"date": row.date.isoformat(), "count": row.count}
            for row in daily_result.fetchall()
        ]

        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days,
            },
            "organization_id": organization_id,
            "summary": {
                "total_audit_entries": total_count,
                "unique_actions": len(action_breakdown),
                "unique_entity_types": len(entity_breakdown),
            },
            "action_breakdown": action_breakdown,
            "entity_type_breakdown": entity_breakdown,
            "daily_activity": daily_activity,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting audit summary: {str(e)}"
        )


@router.get("/audit/export")
async def export_audit_logs(
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    format: str = Query("json", description="Export format: json or csv"),
    db: AsyncSession = Depends(get_db),
):
    """Export audit logs"""
    try:
        # Build query
        query = select(AuditLog)

        # Add filters
        if entity_type:
            query = query.where(AuditLog.entity_type == entity_type)

        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            query = query.where(AuditLog.created_at >= start_dt)

        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            query = query.where(AuditLog.created_at <= end_dt)

        # Order by creation time
        query = query.order_by(AuditLog.created_at.desc())

        # Execute query
        result = await db.execute(query)
        audit_logs = result.scalars().all()

        # Format results
        export_data = []
        for log in audit_logs:
            export_data.append(
                {
                    "id": str(log.id),
                    "entity_type": log.entity_type,
                    "entity_id": log.entity_id,
                    "action": log.action,
                    "user_id": log.user_id,
                    "organization_id": log.organization_id,
                    "changes": log.changes,
                    "metadata": log.metadata,
                    "created_at": log.created_at.isoformat(),
                }
            )

        if format.lower() == "csv":
            # Convert to CSV format
            import csv
            import io

            output = io.StringIO()
            if export_data:
                writer = csv.DictWriter(output, fieldnames=export_data[0].keys())
                writer.writeheader()
                writer.writerows(export_data)

            return {
                "format": "csv",
                "data": output.getvalue(),
                "count": len(export_data),
            }
        else:
            return {"format": "json", "data": export_data, "count": len(export_data)}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error exporting audit logs: {str(e)}"
        )
