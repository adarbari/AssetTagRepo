"""
Seed data for jobs and job-related entities
Migrated from frontend mockJobData.ts
"""

import uuid
from datetime import datetime
from typing import Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession

from modules.shared.database.models import Job, JobAsset, JobAlert, Site, User, Asset
from .helpers import generate_uuid_from_string, convert_frontend_date


async def seed_jobs(session: AsyncSession, org_id: uuid.UUID, site_map: Dict[str, uuid.UUID], user_map: Dict[str, uuid.UUID]) -> Dict[str, uuid.UUID]:
    """Create jobs from mockJobData.ts"""
    jobs_data = [
        {
            "id": "job-1",
            "jobNumber": "JOB-2025-001",
            "name": "Downtown Plaza Construction",
            "description": "Commercial construction project for new plaza development. Includes excavation, foundation work, and initial structural steel installation.",
            "siteId": "SITE-001",
            "siteName": "Downtown Construction Site",
            "clientId": "client-1",
            "clientName": "Metro Development Corp",
            "status": "active",
            "priority": "high",
            "startDate": "2025-10-01T08:00:00Z",
            "endDate": "2025-12-15T17:00:00Z",
            "estimatedDuration": 600,
            "actualDuration": 320,
            "budget": {
                "total": 285000,
                "labor": 120000,
                "equipment": 95000,
                "materials": 60000,
                "other": 10000
            },
            "actualCosts": {
                "total": 156780,
                "labor": 68400,
                "equipment": 52380,
                "materials": 32000,
                "other": 4000,
                "lastUpdated": "2025-10-04T12:00:00Z"
            },
            "projectManager": "pm-003",
            "assignedTeam": ["tm-001", "tm-002", "tm-003"],
            "createdAt": "2025-09-15T10:00:00Z",
            "updatedAt": "2025-10-04T12:00:00Z",
            "createdBy": "user-admin",
            "notes": "Client requested daily progress photos. Foundation inspection scheduled for 10/20.",
            "tags": ["construction", "high-priority", "commercial"]
        },
        {
            "id": "job-2",
            "jobNumber": "JOB-2025-002",
            "name": "Highway Repair - Route 45",
            "description": "Emergency pothole repair and resurfacing of 2.5 mile stretch on Route 45 between Mile Markers 18-20.5",
            "siteId": "SITE-002",
            "siteName": "Route 45 Work Zone",
            "clientId": "client-2",
            "clientName": "State Highway Department",
            "status": "active",
            "priority": "critical",
            "startDate": "2025-10-02T05:00:00Z",
            "endDate": "2025-10-10T20:00:00Z",
            "estimatedDuration": 192,
            "actualDuration": 56,
            "budget": {
                "total": 125000,
                "labor": 45000,
                "equipment": 38000,
                "materials": 40000,
                "other": 2000
            },
            "actualCosts": {
                "total": 42300,
                "labor": 16200,
                "equipment": 13800,
                "materials": 11500,
                "other": 800,
                "lastUpdated": "2025-10-04T08:00:00Z"
            },
            "hasActiveAlerts": True,
            "missingAssets": ["asset-7"],
            "projectManager": "pm-001",
            "assignedTeam": ["tm-004", "tm-005"],
            "createdAt": "2025-09-28T08:00:00Z",
            "updatedAt": "2025-10-04T08:00:00Z",
            "createdBy": "user-admin",
            "notes": "Weather permitting. Night work authorized for lanes closure.",
            "tags": ["emergency", "highway", "state-contract"]
        },
        {
            "id": "job-3",
            "jobNumber": "JOB-2025-003",
            "name": "Warehouse Floor Renovation",
            "description": "Complete floor resurfacing of 50,000 sq ft warehouse space including crack repair and epoxy coating.",
            "siteId": "SITE-003",
            "siteName": "Riverside Warehouse District",
            "clientId": "client-3",
            "clientName": "LogiCorp Warehousing",
            "status": "planning",
            "priority": "medium",
            "startDate": "2025-10-15T07:00:00Z",
            "endDate": "2025-11-05T18:00:00Z",
            "estimatedDuration": 480,
            "budget": {
                "total": 185000,
                "labor": 75000,
                "equipment": 45000,
                "materials": 58000,
                "other": 7000
            },
            "actualCosts": {
                "total": 0,
                "labor": 0,
                "equipment": 0,
                "materials": 0,
                "other": 0,
                "lastUpdated": "2025-10-04T00:00:00Z"
            },
            "hasActiveAlerts": False,
            "projectManager": "pm-002",
            "assignedTeam": ["tm-006", "tm-007", "tm-008"],
            "createdAt": "2025-09-20T14:00:00Z",
            "updatedAt": "2025-10-01T09:00:00Z",
            "createdBy": "user-admin",
            "notes": "Client requires work during off-hours only (6 PM - 6 AM). Material delivery scheduled for 10/12.",
            "tags": ["renovation", "warehouse", "night-shift"]
        },
        {
            "id": "job-4",
            "jobNumber": "JOB-2025-004",
            "name": "Municipal Park Landscaping",
            "description": "Landscape installation for new community park including irrigation system, pathways, and plantings.",
            "siteId": "SITE-004",
            "siteName": "Oakwood Community Park",
            "clientId": "client-4",
            "clientName": "City Parks & Recreation",
            "status": "completed",
            "priority": "low",
            "startDate": "2025-08-15T07:00:00Z",
            "endDate": "2025-09-30T17:00:00Z",
            "estimatedDuration": 320,
            "actualDuration": 340,
            "budget": {
                "total": 95000,
                "labor": 38000,
                "equipment": 22000,
                "materials": 32000,
                "other": 3000
            },
            "actualCosts": {
                "total": 102450,
                "labor": 42300,
                "equipment": 23200,
                "materials": 33950,
                "other": 3000,
                "lastUpdated": "2025-09-30T17:00:00Z"
            },
            "hasActiveAlerts": False,
            "projectManager": "pm-004",
            "assignedTeam": ["tm-009", "tm-010"],
            "createdAt": "2025-08-01T10:00:00Z",
            "updatedAt": "2025-09-30T17:00:00Z",
            "createdBy": "user-admin",
            "completedAt": "2025-09-30T17:00:00Z",
            "notes": "Project completed. Final inspection passed. Over budget due to additional irrigation zones requested by client mid-project.",
            "tags": ["landscaping", "municipal", "completed"]
        }
    ]
    
    job_map = {}
    
    for job_data in jobs_data:
        job_id = generate_uuid_from_string(job_data["id"])
        
        # Check if job already exists
        existing_job = await session.get(Job, job_id)
        if existing_job:
            job_map[job_data["name"]] = job_id
            continue
        
        # Get site ID
        site_id = site_map.get(job_data.get("siteName", ""))
        
        # Get project manager ID
        pm_id = user_map.get(job_data.get("projectManager", ""))
        
        # Map status to backend enum
        status_map = {
            "active": "active",
            "planning": "planning", 
            "completed": "completed",
            "on-hold": "on_hold",
            "cancelled": "cancelled"
        }
        
        # Map priority to backend enum
        priority_map = {
            "low": "low",
            "medium": "medium",
            "high": "high",
            "critical": "critical"
        }
        
        job = Job(
            id=job_id,
            job_number=job_data["jobNumber"],
            name=job_data["name"],
            description=job_data["description"],
            organization_id=org_id,
            site_id=site_id,
            client_id=job_data.get("clientId"),
            client_name=job_data.get("clientName"),
            status=status_map.get(job_data["status"], "planning"),
            priority=priority_map.get(job_data["priority"], "medium"),
            scheduled_start=convert_frontend_date(job_data["startDate"]),
            scheduled_end=convert_frontend_date(job_data["endDate"]),
            estimated_duration_hours=job_data.get("estimatedDuration"),
            actual_duration_hours=job_data.get("actualDuration"),
            budget_total=job_data["budget"]["total"],
            budget_labor=job_data["budget"]["labor"],
            budget_equipment=job_data["budget"]["equipment"],
            budget_materials=job_data["budget"]["materials"],
            budget_other=job_data["budget"]["other"],
            actual_cost_total=job_data["actualCosts"]["total"],
            actual_cost_labor=job_data["actualCosts"]["labor"],
            actual_cost_equipment=job_data["actualCosts"]["equipment"],
            actual_cost_materials=job_data["actualCosts"]["materials"],
            actual_cost_other=job_data["actualCosts"]["other"],
            project_manager_id=pm_id,
            has_active_alerts=job_data.get("hasActiveAlerts", False),
            notes=job_data.get("notes", ""),
            metadata={
                "tags": job_data.get("tags", []),
                "missing_assets": job_data.get("missingAssets", []),
                "assigned_team": job_data.get("assignedTeam", []),
                "created_by": job_data.get("createdBy")
            },
            created_at=convert_frontend_date(job_data.get("createdAt", "2025-01-01T00:00:00Z")),
            updated_at=convert_frontend_date(job_data.get("updatedAt", "2025-01-01T00:00:00Z")),
            completed_at=convert_frontend_date(job_data.get("completedAt")) if job_data.get("completedAt") else None
        )
        session.add(job)
        job_map[job_data["name"]] = job_id
    
    await session.flush()
    return job_map


async def seed_job_assets(session: AsyncSession, job_map: Dict[str, uuid.UUID], asset_map: Dict[str, uuid.UUID]) -> Dict[str, uuid.UUID]:
    """Create job-asset relationships"""
    job_assets_data = [
        {
            "jobName": "Downtown Plaza Construction",
            "assetName": "Excavator CAT 320",
            "required": True,
            "loadedOnVehicle": True,
            "loadedAt": "2025-10-04T06:15:00Z",
            "cost": 8500,
            "assignmentStartDate": "2025-10-01T08:00:00Z",
            "assignmentEndDate": "2025-12-15T17:00:00Z",
            "useFullJobDuration": True
        },
        {
            "jobName": "Downtown Plaza Construction",
            "assetName": "Generator Diesel 50kW",
            "required": True,
            "loadedOnVehicle": True,
            "loadedAt": "2025-10-04T06:20:00Z",
            "cost": 2200,
            "assignmentStartDate": "2025-10-01T08:00:00Z",
            "assignmentEndDate": "2025-11-15T17:00:00Z",
            "useFullJobDuration": False
        },
        {
            "jobName": "Downtown Plaza Construction",
            "assetName": "Concrete Mixer M400",
            "required": True,
            "loadedOnVehicle": True,
            "loadedAt": "2025-10-04T06:25:00Z",
            "cost": 1800,
            "assignmentStartDate": "2025-10-15T08:00:00Z",
            "assignmentEndDate": "2025-11-30T17:00:00Z",
            "useFullJobDuration": False
        }
    ]
    
    job_asset_map = {}
    
    for job_asset_data in job_assets_data:
        job_id = job_map.get(job_asset_data["jobName"])
        asset_id = asset_map.get(job_asset_data["assetName"])
        
        if not job_id or not asset_id:
            continue
        
        # Create a unique ID for this job-asset relationship
        relationship_id = generate_uuid_from_string(f"job-{job_id}-asset-{asset_id}")
        
        # Check if relationship already exists
        existing_relationship = await session.get(JobAsset, relationship_id)
        if existing_relationship:
            job_asset_map[f"{job_asset_data['jobName']}-{job_asset_data['assetName']}"] = relationship_id
            continue
        
        job_asset = JobAsset(
            id=relationship_id,
            job_id=job_id,
            asset_id=asset_id,
            is_required=job_asset_data["required"],
            is_loaded_on_vehicle=job_asset_data.get("loadedOnVehicle", False),
            loaded_at=convert_frontend_date(job_asset_data.get("loadedAt")) if job_asset_data.get("loadedAt") else None,
            cost=job_asset_data.get("cost"),
            assignment_start_date=convert_frontend_date(job_asset_data.get("assignmentStartDate")),
            assignment_end_date=convert_frontend_date(job_asset_data.get("assignmentEndDate")),
            use_full_job_duration=job_asset_data.get("useFullJobDuration", False),
            metadata={
                "description": f"Asset assignment for {job_asset_data['jobName']}"
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(job_asset)
        job_asset_map[f"{job_asset_data['jobName']}-{job_asset_data['assetName']}"] = relationship_id
    
    await session.flush()
    return job_asset_map


async def seed_job_alerts(session: AsyncSession, job_map: Dict[str, uuid.UUID]) -> Dict[str, uuid.UUID]:
    """Create job alerts from mockJobData.ts"""
    job_alerts_data = [
        {
            "id": "job-alert-1",
            "jobName": "Highway Repair - Route 45",
            "type": "missing-assets",
            "severity": "high",
            "message": "Vehicle departed for Highway Repair - Route 45 without 1 required asset(s)",
            "details": {
                "vehicleId": "vehicle-2",
                "vehicleName": "Flatbed #203",
                "missingAssets": ["Roller Compactor"]
            },
            "createdAt": "2025-10-03T04:50:00Z",
            "active": True
        },
        {
            "id": "job-alert-2",
            "jobName": "Municipal Park Landscaping",
            "type": "budget-exceeded",
            "severity": "medium",
            "message": "Job exceeded budget by $7,450",
            "details": {
                "budgetVariance": -7450
            },
            "createdAt": "2025-09-28T14:30:00Z",
            "resolvedAt": "2025-09-30T17:00:00Z",
            "active": False
        },
        {
            "id": "job-alert-3",
            "jobName": "Emergency Storm Cleanup",
            "type": "budget-exceeded",
            "severity": "low",
            "message": "Job exceeded budget by $3,230",
            "details": {
                "budgetVariance": -3230
            },
            "createdAt": "2025-09-21T16:00:00Z",
            "resolvedAt": "2025-09-22T20:00:00Z",
            "active": False
        }
    ]
    
    job_alert_map = {}
    
    for alert_data in job_alerts_data:
        alert_id = generate_uuid_from_string(alert_data["id"])
        
        # Check if alert already exists
        existing_alert = await session.get(JobAlert, alert_id)
        if existing_alert:
            job_alert_map[alert_data["id"]] = alert_id
            continue
        
        # Get job ID
        job_id = job_map.get(alert_data["jobName"])
        if not job_id:
            continue
        
        # Map severity to backend enum
        severity_map = {
            "low": "low",
            "medium": "medium",
            "high": "high",
            "critical": "critical"
        }
        
        job_alert = JobAlert(
            id=alert_id,
            job_id=job_id,
            alert_type=alert_data["type"],
            severity=severity_map.get(alert_data["severity"], "medium"),
            message=alert_data["message"],
            details=alert_data.get("details", {}),
            is_active=alert_data.get("active", True),
            created_at=convert_frontend_date(alert_data["createdAt"]),
            resolved_at=convert_frontend_date(alert_data.get("resolvedAt")) if alert_data.get("resolvedAt") else None,
            metadata={
                "description": f"Job alert for {alert_data['jobName']}"
            }
        )
        session.add(job_alert)
        job_alert_map[alert_data["id"]] = alert_id
    
    await session.flush()
    return job_alert_map
