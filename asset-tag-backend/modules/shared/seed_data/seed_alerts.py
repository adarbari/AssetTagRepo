"""
Seed data for alerts
Migrated from frontend mockData.ts
"""

import uuid
from datetime import datetime
from typing import Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession

from modules.shared.database.models import Alert, Asset
from .helpers import generate_uuid_from_string, convert_frontend_date


async def seed_alerts(session: AsyncSession, asset_map: Dict[str, uuid.UUID]) -> Dict[str, uuid.UUID]:
    """Create alerts from mockData.ts"""
    alerts_data = [
        # Theft Alerts
        {
            "id": "ALT-1001",
            "type": "theft",
            "severity": "critical",
            "asset": "Concrete Mixer M400",
            "assetId": "AT-42893",
            "message": "Asset movement detected outside operational hours",
            "timestamp": "2024-10-04T02:35:00",
            "status": "active",
            "location": "Route 95 North",
            "reason": "Movement detected at 2:35 AM (outside 6 AM - 8 PM operating hours)",
            "suggestedAction": "Contact security team and verify authorized access",
            "metadata": {
                "movementSpeed": "45 mph",
                "lastAuthorizedUser": "John Smith",
                "operatingHours": "6 AM - 8 PM"
            }
        },
        {
            "id": "ALT-1002",
            "type": "theft",
            "severity": "critical",
            "asset": "Generator 50kW",
            "assetId": "AT-42898",
            "message": "Unusual movement pattern detected",
            "timestamp": "2024-10-04T03:12:00",
            "status": "active",
            "location": "Unknown",
            "reason": "Asset moved 15 miles in unexpected direction from normal site",
            "suggestedAction": "Initiate theft protocol and notify law enforcement",
            "metadata": {
                "expectedLocation": "Construction Site A",
                "currentDistance": "15.3 miles",
                "normalPattern": "stationary at night"
            }
        },
        # Battery Alerts
        {
            "id": "ALT-1003",
            "type": "battery",
            "severity": "critical",
            "asset": "Trailer Flatbed 20ft",
            "assetId": "AT-42895",
            "message": "Battery level critically low (8%)",
            "timestamp": "2024-10-04T10:30:00",
            "status": "active",
            "location": "Depot C",
            "reason": "Battery below critical threshold of 10%",
            "suggestedAction": "Replace or recharge tracker battery immediately",
            "metadata": {
                "batteryLevel": 8,
                "threshold": 10,
                "estimatedTimeRemaining": "6 hours"
            }
        },
        {
            "id": "ALT-1004",
            "type": "battery",
            "severity": "warning",
            "asset": "Forklift Toyota 8FGU25",
            "assetId": "AT-42897",
            "message": "Battery level low (18%)",
            "timestamp": "2024-10-04T11:45:00",
            "status": "active",
            "location": "Warehouse B",
            "reason": "Battery below warning threshold of 20%",
            "suggestedAction": "Schedule battery replacement within 48 hours",
            "metadata": {
                "batteryLevel": 18,
                "threshold": 20,
                "estimatedTimeRemaining": "2 days"
            }
        },
        # Compliance Alerts
        {
            "id": "ALT-1005",
            "type": "compliance",
            "severity": "critical",
            "asset": "Excavator CAT 320",
            "assetId": "AT-42891",
            "message": "Asset outside designated geofence boundary",
            "timestamp": "2024-10-04T09:20:00",
            "status": "active",
            "location": "3.2 miles from Construction Zone A",
            "reason": "Required to be within Construction Zone A geofence",
            "suggestedAction": "Return asset to authorized zone or update compliance requirements",
            "metadata": {
                "geofenceName": "Construction Zone A",
                "distanceFromBoundary": "3.2 miles",
                "expectedLocation": "Construction Zone A"
            }
        },
        {
            "id": "ALT-1006",
            "type": "compliance",
            "severity": "warning",
            "asset": "Hydraulic Pump HP-500",
            "assetId": "AT-42896",
            "message": "Certification expiring in 7 days",
            "timestamp": "2024-10-04T08:00:00",
            "status": "acknowledged",
            "location": "Main Warehouse",
            "reason": "Safety certification expires on Oct 11, 2024",
            "suggestedAction": "Schedule recertification inspection before expiry",
            "metadata": {
                "certificationType": "Safety Inspection",
                "expiryDate": "2024-10-11",
                "daysRemaining": 7
            }
        },
        # Underutilized Alerts
        {
            "id": "ALT-1007",
            "type": "underutilized",
            "severity": "info",
            "asset": "Scissor Lift SL-30",
            "assetId": "AT-42892",
            "message": "Asset unused for 14 days",
            "timestamp": "2024-10-04T07:00:00",
            "status": "active",
            "location": "Warehouse A",
            "reason": "No movement or checkout activity in past 2 weeks",
            "suggestedAction": "Consider relocating to active site or scheduling for rental",
            "metadata": {
                "daysIdle": 14,
                "lastUsedDate": "2024-09-20",
                "utilizationRate": "12%",
                "potentialSavings": "$450/month"
            }
        },
        {
            "id": "ALT-1008",
            "type": "underutilized",
            "severity": "warning",
            "asset": "Compressor AC-200",
            "assetId": "AT-42899",
            "message": "Low utilization rate (8% over 30 days)",
            "timestamp": "2024-10-04T07:00:00",
            "status": "active",
            "location": "Storage Yard",
            "reason": "Asset active only 2.4 days in past month",
            "suggestedAction": "Review asset allocation or consider disposition",
            "metadata": {
                "utilizationRate": 8,
                "daysActive": 2.4,
                "periodDays": 30,
                "targetUtilization": 60
            }
        },
        # Offline/Not Reachable Alerts
        {
            "id": "ALT-1009",
            "type": "offline",
            "severity": "critical",
            "asset": "Welding Machine W-450",
            "assetId": "AT-42894",
            "message": "Asset offline for 6 hours",
            "timestamp": "2024-10-04T05:30:00",
            "status": "active",
            "location": "Last known: Construction Site B",
            "reason": "No GPS signal received since 11:30 PM",
            "suggestedAction": "Check tracker power/connectivity or physically locate asset",
            "metadata": {
                "lastSeen": "2024-10-03T23:30:00",
                "offlineDuration": "6 hours",
                "lastBatteryLevel": 45,
                "possibleCauses": [
                    "Dead tracker battery",
                    "Signal obstruction",
                    "Device tampered"
                ]
            }
        },
        {
            "id": "ALT-1010",
            "type": "offline",
            "severity": "warning",
            "asset": "Chainsaw Stihl MS-250",
            "assetId": "AT-42900",
            "message": "Intermittent connectivity issues",
            "timestamp": "2024-10-04T08:45:00",
            "status": "active",
            "location": "Last known: Forest Site",
            "reason": "GPS signal lost/regained 8 times in past 24 hours",
            "suggestedAction": "Check tracker mounting and antenna connection",
            "metadata": {
                "signalDrops": 8,
                "period": "24 hours",
                "averageSignalStrength": "weak"
            }
        },
        # Unauthorized Zone Entry Alerts
        {
            "id": "ALT-1011",
            "type": "unauthorized-zone",
            "severity": "critical",
            "asset": "Service Truck F-150",
            "assetId": "AT-42901",
            "message": "Asset entered restricted area",
            "timestamp": "2024-10-04T13:22:00",
            "status": "active",
            "location": "Hazardous Materials Zone",
            "reason": "Entered Hazardous Materials Zone without authorization",
            "suggestedAction": "Immediately contact driver and exit restricted area",
            "metadata": {
                "restrictedZone": "Hazardous Materials Zone",
                "entryTime": "2024-10-04T13:22:00",
                "authorizationRequired": True,
                "securityLevel": "high"
            }
        },
        {
            "id": "ALT-1012",
            "type": "unauthorized-zone",
            "severity": "warning",
            "asset": "Pallet Jack PJ-100",
            "assetId": "AT-42902",
            "message": "Asset in unauthorized zone",
            "timestamp": "2024-10-04T14:05:00",
            "status": "acknowledged",
            "location": "Competitor Site Boundary",
            "reason": "Asset detected within competitor facility boundary",
            "suggestedAction": "Verify asset location and retrieve if unauthorized",
            "metadata": {
                "zone": "Competitor Site",
                "alertThreshold": "immediate"
            }
        },
        # Predictive Maintenance Alerts
        {
            "id": "ALT-1013",
            "type": "predictive-maintenance",
            "severity": "warning",
            "asset": "Air Compressor AC-300",
            "assetId": "AT-42903",
            "message": "Vibration levels above normal threshold",
            "timestamp": "2024-10-04T12:30:00",
            "status": "active",
            "location": "Workshop",
            "reason": "Sensor detecting abnormal vibration patterns indicating bearing wear",
            "suggestedAction": "Schedule inspection within 7 days to prevent failure",
            "metadata": {
                "vibrationLevel": "high",
                "normalRange": "0.1-0.3 mm/s",
                "currentLevel": "0.8 mm/s",
                "predictedFailure": "14-21 days",
                "confidence": "82%"
            }
        },
        {
            "id": "ALT-1014",
            "type": "predictive-maintenance",
            "severity": "critical",
            "asset": "Hydraulic Press HP-1000",
            "assetId": "AT-42904",
            "message": "Temperature anomaly detected",
            "timestamp": "2024-10-04T15:10:00",
            "status": "active",
            "location": "Manufacturing Floor",
            "reason": "Operating temperature 15°C above normal, indicating potential hydraulic fluid issue",
            "suggestedAction": "Stop operations and inspect hydraulic system immediately",
            "metadata": {
                "currentTemp": 85,
                "normalTemp": 70,
                "threshold": 75,
                "possibleIssues": [
                    "Low hydraulic fluid",
                    "Cooling system failure",
                    "Pump malfunction"
                ],
                "recommendedAction": "immediate inspection"
            }
        },
        {
            "id": "ALT-1015",
            "type": "predictive-maintenance",
            "severity": "info",
            "asset": "Generator 50kW",
            "assetId": "AT-42898",
            "message": "Usage pattern suggests maintenance due soon",
            "timestamp": "2024-10-04T07:00:00",
            "status": "active",
            "location": "Remote Site",
            "reason": "Running hours approaching maintenance threshold",
            "suggestedAction": "Schedule preventive maintenance within 30 days",
            "metadata": {
                "runningHours": 980,
                "maintenanceInterval": 1000,
                "hoursRemaining": 20,
                "estimatedDays": 25
            }
        }
    ]
    
    alert_map = {}
    
    for alert_data in alerts_data:
        alert_id = generate_uuid_from_string(alert_data["id"])
        
        # Check if alert already exists
        existing_alert = await session.get(Alert, alert_id)
        if existing_alert:
            alert_map[alert_data["id"]] = alert_id
            continue
        
        # Get asset ID - try both asset name and asset ID
        asset_id = None
        if alert_data["asset"] in asset_map:
            asset_id = asset_map[alert_data["asset"]]
        elif alert_data.get("assetId"):
            # Try to find asset by the frontend ID
            asset_frontend_id = alert_data["assetId"]
            for name, aid in asset_map.items():
                # This is a simplified lookup - in practice you'd want a more robust mapping
                if asset_frontend_id in name or name in asset_frontend_id:
                    asset_id = aid
                    break
        
        # Map severity to backend enum values
        severity_map = {
            "critical": "critical",
            "warning": "warning", 
            "info": "info",
            "low": "low",
            "medium": "medium",
            "high": "high"
        }
        
        # Map alert type to backend enum values
        type_map = {
            "theft": "theft",
            "battery": "battery_low",
            "compliance": "compliance",
            "underutilized": "underutilized",
            "offline": "offline",
            "unauthorized-zone": "geofence_violation",
            "predictive-maintenance": "maintenance_due"
        }
        
        alert = Alert(
            id=alert_id,
            alert_type=type_map.get(alert_data["type"], "other"),
            severity=severity_map.get(alert_data["severity"], "medium"),
            asset_id=asset_id,
            asset_name=alert_data["asset"],
            message=alert_data["message"],
            description=alert_data.get("reason", ""),
            triggered_at=convert_frontend_date(alert_data["timestamp"]),
            status=alert_data["status"],
            location=alert_data.get("location", ""),
            suggested_action=alert_data.get("suggestedAction", ""),
            metadata=alert_data.get("metadata", {}),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(alert)
        alert_map[alert_data["id"]] = alert_id
    
    await session.flush()
    return alert_map
