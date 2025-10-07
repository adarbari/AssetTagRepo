"""
Seed data for issues
Migrated from frontend mockIssueData.ts
"""

import uuid
from datetime import datetime
from typing import Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession

from modules.shared.database.models import Issue, Asset, User
from .helpers import generate_uuid_from_string, convert_frontend_date


async def seed_issues(session: AsyncSession, org_id: uuid.UUID, asset_map: Dict[str, uuid.UUID], user_map: Dict[str, uuid.UUID]) -> Dict[str, uuid.UUID]:
    """Create issues from mockIssueData.ts"""
    issues_data = [
        {
            "id": "ISS-001",
            "assetId": "AST-001",
            "assetName": "Excavator CAT 320",
            "type": "mechanical",
            "severity": "high",
            "status": "in-progress",
            "title": "Hydraulic leak detected",
            "description": "Hydraulic fluid leaking from the boom cylinder. Noticed during routine inspection. Asset currently idle to prevent further damage.",
            "reportedBy": "John Smith",
            "reportedDate": "2025-10-02T14:30:00Z",
            "assignedTo": "Mike Wilson",
            "notes": "Ordered replacement seals. ETA 2 days.",
            "tags": ["hydraulic", "urgent"]
        },
        {
            "id": "ISS-002",
            "assetId": "AST-003",
            "assetName": "Generator GenSet 150",
            "type": "electrical",
            "severity": "critical",
            "status": "acknowledged",
            "title": "Power output fluctuating",
            "description": "Generator output voltage is unstable, fluctuating between 110-130V. Multiple equipment shutdowns reported at job site.",
            "reportedBy": "Sarah Connor",
            "reportedDate": "2025-10-03T08:15:00Z",
            "assignedTo": "Sarah Johnson",
            "tags": ["power", "critical", "job-site-alpha"]
        },
        {
            "id": "ISS-003",
            "assetId": "AST-007",
            "assetName": "Trailer PJ 20ft",
            "type": "damage",
            "severity": "medium",
            "status": "open",
            "title": "Damaged rear gate latch",
            "description": "Rear gate latch is bent and not securing properly. Gate opens during transport.",
            "reportedBy": "Mike Johnson",
            "reportedDate": "2025-10-03T16:45:00Z",
            "tags": ["transport", "safety"]
        },
        {
            "id": "ISS-004",
            "assetId": "AST-002",
            "assetName": "Forklift Toyota 5000",
            "type": "battery",
            "severity": "low",
            "status": "resolved",
            "title": "Battery not holding charge",
            "description": "Forklift battery depletes faster than normal. Requires charging every 3 hours instead of full shift.",
            "reportedBy": "David Brown",
            "reportedDate": "2025-09-28T11:20:00Z",
            "assignedTo": "Mike Wilson",
            "resolvedBy": "Mike Wilson",
            "resolvedDate": "2025-10-01T14:30:00Z",
            "notes": "Replaced battery. Tested for 8 hours, holding charge normally.",
            "tags": ["battery", "resolved"]
        },
        {
            "id": "ISS-005",
            "assetId": "AST-005",
            "assetName": "Compressor Atlas 185",
            "type": "connectivity",
            "severity": "low",
            "status": "open",
            "title": "GPS tracker intermittent",
            "description": "Asset location updates are inconsistent. Sometimes shows offline for hours then reconnects.",
            "reportedBy": "Maria Garcia",
            "reportedDate": "2025-10-04T09:00:00Z",
            "tags": ["gps", "tracking"]
        },
        {
            "id": "ISS-006",
            "assetId": "AST-001",
            "assetName": "Excavator CAT 320",
            "type": "software",
            "severity": "medium",
            "status": "in-progress",
            "title": "Display console showing error codes",
            "description": "Onboard computer displays recurring error code E-47. Manual suggests firmware update needed.",
            "reportedBy": "John Smith",
            "reportedDate": "2025-10-01T13:15:00Z",
            "assignedTo": "Sarah Johnson",
            "notes": "Contacted manufacturer for firmware update package.",
            "tags": ["firmware", "software"]
        },
        {
            "id": "ISS-007",
            "assetId": "AST-008",
            "assetName": "Scissor Lift JLG 2646",
            "type": "mechanical",
            "severity": "high",
            "status": "acknowledged",
            "title": "Platform won't extend fully",
            "description": "Scissor lift platform stops at 18ft instead of rated 26ft height. Safety concern for crew.",
            "reportedBy": "Robert Jones",
            "reportedDate": "2025-10-03T10:30:00Z",
            "assignedTo": "Mike Wilson",
            "tags": ["safety", "height", "urgent"]
        },
        {
            "id": "ISS-008",
            "assetId": "AST-004",
            "assetName": "Power Tools DeWalt Set",
            "type": "tracking",
            "severity": "high",
            "status": "open",
            "title": "Missing from job site",
            "description": "Complete DeWalt power tool set not found at job site during equipment check. Last seen 2 days ago at site Beta.",
            "reportedBy": "Emily Davis",
            "reportedDate": "2025-10-04T07:45:00Z",
            "tags": ["missing", "theft-possible", "investigation"]
        }
    ]
    
    issue_map = {}
    
    for issue_data in issues_data:
        issue_id = generate_uuid_from_string(issue_data["id"])
        
        # Check if issue already exists
        existing_issue = await session.get(Issue, issue_id)
        if existing_issue:
            issue_map[issue_data["id"]] = issue_id
            continue
        
        # Get asset ID - try to match by name
        asset_id = None
        for asset_name, aid in asset_map.items():
            if issue_data["assetName"] in asset_name or asset_name in issue_data["assetName"]:
                asset_id = aid
                break
        
        # Get user IDs
        reported_by_id = user_map.get(issue_data["reportedBy"])
        assigned_to_id = user_map.get(issue_data.get("assignedTo", ""))
        resolved_by_id = user_map.get(issue_data.get("resolvedBy", ""))
        
        # Map severity to backend enum
        severity_map = {
            "low": "low",
            "medium": "medium",
            "high": "high",
            "critical": "critical"
        }
        
        # Map status to backend enum
        status_map = {
            "open": "open",
            "acknowledged": "acknowledged",
            "in-progress": "in_progress",
            "resolved": "resolved",
            "closed": "closed"
        }
        
        # Map type to backend enum
        type_map = {
            "mechanical": "mechanical",
            "electrical": "electrical",
            "damage": "damage",
            "battery": "battery",
            "connectivity": "connectivity",
            "software": "software",
            "tracking": "tracking"
        }
        
        issue = Issue(
            id=issue_id,
            organization_id=org_id,
            asset_id=asset_id,
            asset_name=issue_data["assetName"],
            issue_type=type_map.get(issue_data["type"], "other"),
            severity=severity_map.get(issue_data["severity"], "medium"),
            status=status_map.get(issue_data["status"], "open"),
            title=issue_data["title"],
            description=issue_data["description"],
            reported_by_user_id=reported_by_id,
            reported_at=convert_frontend_date(issue_data["reportedDate"]),
            assigned_to_user_id=assigned_to_id,
            resolved_by_user_id=resolved_by_id,
            resolved_at=convert_frontend_date(issue_data.get("resolvedDate")) if issue_data.get("resolvedDate") else None,
            notes=issue_data.get("notes", ""),
            metadata={
                "tags": issue_data.get("tags", []),
                "original_asset_id": issue_data.get("assetId")
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(issue)
        issue_map[issue_data["id"]] = issue_id
    
    await session.flush()
    return issue_map
