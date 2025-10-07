"""
Seed data for reports and compliance
Migrated from frontend mockReportsData.ts
"""

import uuid
from datetime import datetime
from typing import Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession

from modules.shared.database.models import ComplianceRecord, Asset
from .helpers import generate_uuid_from_string, convert_frontend_date


async def seed_compliance_records(session: AsyncSession, org_id: uuid.UUID, asset_map: Dict[str, uuid.UUID]) -> Dict[str, uuid.UUID]:
    """Create compliance records from mockReportsData.ts"""
    compliance_data = [
        {
            "id": "comp-001",
            "assetId": "AT-42891",
            "assetName": "Excavator CAT 320",
            "certificationType": "Annual Safety Inspection",
            "issueDate": "2024-03-15",
            "expiryDate": "2025-03-15",
            "status": "valid",
            "daysUntilExpiry": 162,
            "inspector": "John Smith (Certified Inspector #12345)",
            "notes": "All systems operational. Minor wear on hydraulic seals noted."
        },
        {
            "id": "comp-002",
            "assetId": "AT-42892",
            "assetName": "Generator Diesel 50kW",
            "certificationType": "Emissions Compliance",
            "issueDate": "2024-06-20",
            "expiryDate": "2024-12-20",
            "status": "expiring_soon",
            "daysUntilExpiry": 77,
            "inspector": "EPA Inspector",
            "notes": "Meets all current emission standards. Schedule renewal in November."
        },
        {
            "id": "comp-003",
            "assetId": "AT-42893",
            "assetName": "Concrete Mixer M400",
            "certificationType": "Operator Certification",
            "issueDate": "2023-09-10",
            "expiryDate": "2024-09-10",
            "status": "expired",
            "daysUntilExpiry": -24,
            "inspector": "Training Department",
            "notes": "URGENT: Recertification required immediately."
        },
        {
            "id": "comp-004",
            "assetId": "AT-42894",
            "assetName": "Tool Kit Professional",
            "certificationType": "Calibration Certificate",
            "issueDate": "2024-08-01",
            "expiryDate": "2025-08-01",
            "status": "valid",
            "daysUntilExpiry": 303,
            "inspector": "Calibration Lab Services",
            "notes": "All measuring tools calibrated to ISO standards."
        },
        {
            "id": "comp-005",
            "assetId": "AT-42895",
            "assetName": "Air Compressor 185CFM",
            "certificationType": "Pressure Vessel Inspection",
            "issueDate": "2024-01-10",
            "expiryDate": "2025-01-10",
            "status": "valid",
            "daysUntilExpiry": 98,
            "inspector": "Pressure Systems Safety Reg",
            "notes": "Tank integrity verified. No corrosion detected."
        },
        {
            "id": "comp-006",
            "assetId": "AT-42896",
            "assetName": "Forklift Toyota 5000lb",
            "certificationType": "Annual Safety Inspection",
            "issueDate": "2024-05-22",
            "expiryDate": "2025-05-22",
            "status": "valid",
            "daysUntilExpiry": 231,
            "inspector": "OSHA Certified Inspector",
            "notes": "Passed all safety checks. Fork tines in good condition."
        },
        {
            "id": "comp-007",
            "assetId": "AT-42897",
            "assetName": "Welding Equipment Pro",
            "certificationType": "Electrical Safety Test",
            "issueDate": "2024-07-15",
            "expiryDate": "2024-10-15",
            "status": "expiring_soon",
            "daysUntilExpiry": 11,
            "inspector": "Electrical Safety Compliance",
            "notes": "Schedule renewal test within 2 weeks."
        },
        {
            "id": "comp-008",
            "assetId": "AT-42898",
            "assetName": "Scissor Lift 26ft",
            "certificationType": "Load Test Certification",
            "issueDate": "2024-02-28",
            "expiryDate": "2025-02-28",
            "status": "valid",
            "daysUntilExpiry": 147,
            "inspector": "Lift Equipment Testing Ltd",
            "notes": "Platform tested to 125% of rated capacity."
        }
    ]
    
    compliance_map = {}
    
    for compliance_data_item in compliance_data:
        compliance_id = generate_uuid_from_string(compliance_data_item["id"])
        
        # Check if compliance record already exists
        existing_compliance = await session.get(ComplianceRecord, compliance_id)
        if existing_compliance:
            compliance_map[compliance_data_item["id"]] = compliance_id
            continue
        
        # Get asset ID - try to match by name
        asset_id = None
        for asset_name, aid in asset_map.items():
            if compliance_data_item["assetName"] in asset_name or asset_name in compliance_data_item["assetName"]:
                asset_id = aid
                break
        
        # Map status to backend enum
        status_map = {
            "valid": "valid",
            "expiring_soon": "expiring_soon",
            "expired": "expired"
        }
        
        compliance_record = ComplianceRecord(
            id=compliance_id,
            organization_id=org_id,
            asset_id=asset_id,
            asset_name=compliance_data_item["assetName"],
            certification_type=compliance_data_item["certificationType"],
            issue_date=convert_frontend_date(compliance_data_item["issueDate"]),
            expiry_date=convert_frontend_date(compliance_data_item["expiryDate"]),
            status=status_map.get(compliance_data_item["status"], "valid"),
            days_until_expiry=compliance_data_item["daysUntilExpiry"],
            inspector=compliance_data_item.get("inspector", ""),
            notes=compliance_data_item.get("notes", ""),
            metadata={
                "original_asset_id": compliance_data_item.get("assetId")
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(compliance_record)
        compliance_map[compliance_data_item["id"]] = compliance_id
    
    await session.flush()
    return compliance_map
