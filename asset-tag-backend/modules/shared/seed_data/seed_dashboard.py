"""
Seed data for dashboard statistics
Migrated from frontend mockDashboardData.ts

Note: Dashboard data is typically computed on-the-fly from other entities,
but we can create some baseline statistics for testing.
"""

import uuid
from datetime import datetime
from typing import Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession

from modules.shared.database.models import Asset, Site, Alert, User, Organization
from .helpers import generate_uuid_from_string


async def seed_dashboard_stats(session: AsyncSession, org_id: uuid.UUID) -> Dict[str, Any]:
    """
    Create dashboard statistics based on seeded data.
    This is typically computed from other entities, but we can set baseline values.
    """
    
    # Get counts from existing seeded data
    from sqlalchemy import select, func
    
    # Count assets
    asset_count_result = await session.execute(select(func.count(Asset.id)))
    total_assets = asset_count_result.scalar() or 0
    
    # Count sites
    site_count_result = await session.execute(select(func.count(Site.id)))
    total_sites = site_count_result.scalar() or 0
    
    # Count alerts
    alert_count_result = await session.execute(select(func.count(Alert.id)))
    total_alerts = alert_count_result.scalar() or 0
    
    # Count active alerts
    active_alert_count_result = await session.execute(
        select(func.count(Alert.id)).where(Alert.status == "active")
    )
    active_alerts = active_alert_count_result.scalar() or 0
    
    # Count critical alerts
    critical_alert_count_result = await session.execute(
        select(func.count(Alert.id)).where(Alert.severity == "critical")
    )
    critical_alerts = critical_alert_count_result.scalar() or 0
    
    # Count users
    user_count_result = await session.execute(select(func.count(User.id)))
    total_users = user_count_result.scalar() or 0
    
    # Calculate battery statistics
    battery_stats_result = await session.execute(
        select(
            func.avg(Asset.battery_level).label('avg_battery'),
            func.count(Asset.id).filter(Asset.battery_level < 20).label('low_battery_count')
        )
    )
    battery_stats = battery_stats_result.first()
    avg_battery = float(battery_stats.avg_battery) if battery_stats.avg_battery else 0
    low_battery_count = battery_stats.low_battery_count or 0
    
    # Create dashboard statistics summary
    dashboard_stats = {
        "total_assets": total_assets,
        "total_sites": total_sites,
        "total_alerts": total_alerts,
        "active_alerts": active_alerts,
        "critical_alerts": critical_alerts,
        "total_users": total_users,
        "avg_battery_level": round(avg_battery, 1),
        "low_battery_assets": low_battery_count,
        "system_status": "online",
        "last_updated": datetime.utcnow()
    }
    
    return dashboard_stats


async def create_sample_utilization_data() -> List[Dict[str, Any]]:
    """Create sample utilization data for reports"""
    return [
        {"month": "Jan", "utilization": 72, "idle": 24, "maintenance": 4},
        {"month": "Feb", "utilization": 78, "idle": 19, "maintenance": 3},
        {"month": "Mar", "utilization": 81, "idle": 16, "maintenance": 3},
        {"month": "Apr", "utilization": 76, "idle": 20, "maintenance": 4},
        {"month": "May", "utilization": 84, "idle": 13, "maintenance": 3},
        {"month": "Jun", "utilization": 88, "idle": 10, "maintenance": 2},
        {"month": "Jul", "utilization": 86, "idle": 11, "maintenance": 3},
        {"month": "Aug", "utilization": 82, "idle": 15, "maintenance": 3},
        {"month": "Sep", "utilization": 79, "idle": 17, "maintenance": 4},
        {"month": "Oct", "utilization": 85, "idle": 12, "maintenance": 3},
        {"month": "Nov", "utilization": 89, "idle": 9, "maintenance": 2},
        {"month": "Dec", "utilization": 91, "idle": 7, "maintenance": 2}
    ]


async def create_sample_cost_savings_data() -> List[Dict[str, Any]]:
    """Create sample cost savings data for reports"""
    return [
        {
            "month": "Jan",
            "theftPrevention": 12000,
            "laborSaved": 8500,
            "insurance": 3200,
            "maintenanceSavings": 4200
        },
        {
            "month": "Feb",
            "theftPrevention": 15000,
            "laborSaved": 9200,
            "insurance": 3200,
            "maintenanceSavings": 3800
        },
        {
            "month": "Mar",
            "theftPrevention": 8000,
            "laborSaved": 10100,
            "insurance": 3200,
            "maintenanceSavings": 5100
        },
        {
            "month": "Apr",
            "theftPrevention": 22000,
            "laborSaved": 9800,
            "insurance": 3200,
            "maintenanceSavings": 4500
        },
        {
            "month": "May",
            "theftPrevention": 5000,
            "laborSaved": 11200,
            "insurance": 3200,
            "maintenanceSavings": 4800
        },
        {
            "month": "Jun",
            "theftPrevention": 18000,
            "laborSaved": 12400,
            "insurance": 3200,
            "maintenanceSavings": 5200
        }
    ]


async def create_sample_asset_type_distribution() -> List[Dict[str, Any]]:
    """Create sample asset type distribution data"""
    return [
        {"name": "Tools", "value": 3240, "color": "var(--chart-1)"},
        {"name": "Vehicles", "value": 892, "color": "var(--chart-2)"},
        {"name": "Equipment", "value": 1456, "color": "var(--chart-3)"},
        {"name": "Containers", "value": 623, "color": "var(--chart-4)"}
    ]


async def create_sample_battery_status_distribution() -> List[Dict[str, Any]]:
    """Create sample battery status distribution data"""
    return [
        {"range": "80-100%", "count": 4280},
        {"range": "60-80%", "count": 1120},
        {"range": "40-60%", "count": 340},
        {"range": "20-40%", "count": 180},
        {"range": "<20%", "count": 91}
    ]


async def create_sample_recent_activity() -> List[Dict[str, Any]]:
    """Create sample recent activity data"""
    return [
        {
            "id": "act-001",
            "type": "geofence_violation",
            "asset": "Excavator CAT 320",
            "assetId": "AT-42891",
            "description": "Left authorized zone at Construction Site A",
            "time": "2 min ago",
            "severity": "high"
        },
        {
            "id": "act-002",
            "type": "battery_low",
            "asset": "Trailer Flatbed 20ft",
            "assetId": "AT-42895",
            "description": "Battery level dropped to 12%",
            "time": "15 min ago",
            "severity": "critical"
        },
        {
            "id": "act-003",
            "type": "asset_movement",
            "asset": "Concrete Mixer M400",
            "assetId": "AT-42893",
            "description": "Started moving on Route 95 North",
            "time": "1 hour ago",
            "severity": "low"
        },
        {
            "id": "act-004",
            "type": "maintenance_due",
            "asset": "Tool Kit Professional",
            "assetId": "AT-42894",
            "description": "Scheduled maintenance due in 5 days",
            "time": "2 hours ago",
            "severity": "medium"
        },
        {
            "id": "act-005",
            "type": "alert_triggered",
            "asset": "Generator Diesel 50kW",
            "assetId": "AT-42892",
            "description": "Temperature exceeded threshold (85°C)",
            "time": "3 hours ago",
            "severity": "high"
        }
    ]


async def create_sample_alert_breakdown() -> List[Dict[str, Any]]:
    """Create sample alert breakdown data"""
    return [
        {"type": "Geofence Violations", "count": 45, "severity": "high", "trend": "down"},
        {"type": "Battery Low", "count": 23, "severity": "critical", "trend": "up"},
        {"type": "Maintenance Due", "count": 18, "severity": "medium", "trend": "stable"},
        {"type": "Temperature Alert", "count": 12, "severity": "high", "trend": "down"},
        {"type": "Unauthorized Movement", "count": 8, "severity": "high", "trend": "up"},
        {"type": "Asset Offline", "count": 7, "severity": "medium", "trend": "stable"},
        {"type": "Compliance Issues", "count": 5, "severity": "medium", "trend": "down"}
    ]
