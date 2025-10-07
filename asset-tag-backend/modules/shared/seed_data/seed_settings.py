"""
Seed data for settings and team management
Migrated from frontend mockSettingsData.ts

Note: Most settings are configuration-based and don't need to be seeded,
but we can create some baseline user preferences and team data.
"""

import uuid
from datetime import datetime
from typing import Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession

from modules.shared.database.models import User, Organization
from .helpers import generate_uuid_from_string


async def seed_additional_users(session: AsyncSession, org_id: uuid.UUID) -> Dict[str, uuid.UUID]:
    """Create additional team members from mockSettingsData.ts"""
    additional_users_data = [
        {
            "id": "tm-001",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "role": "admin",
            "department": "Operations",
            "status": "active",
            "lastActive": "2 min ago",
            "permissions": ["all"]
        },
        {
            "id": "tm-002",
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "role": "manager",
            "department": "Fleet Management",
            "status": "active",
            "lastActive": "15 min ago",
            "permissions": ["view_assets", "edit_assets", "view_reports"]
        },
        {
            "id": "tm-003",
            "name": "Mike Johnson",
            "email": "mike.johnson@example.com",
            "role": "operator",
            "department": "Field Operations",
            "status": "active",
            "lastActive": "1 hour ago",
            "permissions": ["view_assets", "check_in_out"]
        },
        {
            "id": "tm-004",
            "name": "Sarah Connor",
            "email": "sarah.connor@example.com",
            "role": "manager",
            "department": "Maintenance",
            "status": "active",
            "lastActive": "3 hours ago",
            "permissions": ["view_assets", "edit_assets", "schedule_maintenance"]
        }
    ]
    
    user_map = {}
    
    for user_data in additional_users_data:
        user_id = generate_uuid_from_string(user_data["id"])
        
        # Check if user already exists
        existing_user = await session.get(User, user_id)
        if existing_user:
            user_map[user_data["name"]] = user_id
            continue
        
        # Map role to backend enum
        role_map = {
            "admin": "admin",
            "manager": "manager",
            "operator": "operator",
            "viewer": "viewer"
        }
        
        user = User(
            id=user_id,
            username=user_data["email"].split("@")[0],
            email=user_data["email"],
            full_name=user_data["name"],
            hashed_password="$2b$12$dummy_hash_for_testing",  # Dummy hash
            organization_id=org_id,
            role=role_map.get(user_data["role"], "user"),
            is_active=user_data["status"] == "active",
            metadata={
                "department": user_data["department"],
                "permissions": user_data["permissions"],
                "last_active": user_data["lastActive"]
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(user)
        user_map[user_data["name"]] = user_id
    
    await session.flush()
    return user_map


async def create_sample_company_settings() -> Dict[str, Any]:
    """Create sample company settings data"""
    return {
        "name": "Acme Construction Co.",
        "industry": "Construction",
        "size": "500-1000 employees",
        "address": "123 Main Street",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94105",
        "country": "United States",
        "phone": "+1 (555) 987-6543",
        "website": "www.acmeconstruction.com"
    }


async def create_sample_system_preferences() -> Dict[str, Any]:
    """Create sample system preferences data"""
    return {
        "theme": "light",
        "notifications": {
            "email": True,
            "sms": True,
            "push": True,
            "inApp": True
        },
        "alerts": {
            "sound": True,
            "desktop": True,
            "volume": 75
        },
        "map": {
            "defaultView": "satellite",
            "defaultZoom": 12,
            "clusterMarkers": True,
            "showTrails": False
        },
        "dashboard": {
            "refreshInterval": 30,
            "defaultView": "overview",
            "compactMode": False
        },
        "privacy": {
            "shareAnalytics": True,
            "shareLocation": True,
            "allowCookies": True
        }
    }


async def create_sample_integration_settings() -> Dict[str, Any]:
    """Create sample integration settings data"""
    return {
        "erp": {
            "enabled": False,
            "provider": "SAP",
            "apiKey": "",
            "lastSync": "Never",
            "status": "disconnected"
        },
        "cmms": {
            "enabled": False,
            "provider": "Maximo",
            "apiKey": "",
            "lastSync": "Never",
            "status": "disconnected"
        },
        "gps": {
            "enabled": True,
            "provider": "Traccar",
            "apiKey": "trk_live_abc123xyz",
            "refreshRate": 30,
            "status": "connected"
        },
        "webhooks": {
            "enabled": True,
            "endpoints": [
                {
                    "id": "wh-001",
                    "name": "Slack Notifications",
                    "url": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX",
                    "events": ["geofence_violation", "battery_low", "asset_offline"],
                    "active": True
                }
            ]
        }
    }


async def create_sample_billing_info() -> Dict[str, Any]:
    """Create sample billing information data"""
    return {
        "plan": "professional",
        "billingCycle": "monthly",
        "nextBillingDate": "2025-02-01",
        "paymentMethod": {
            "type": "card",
            "last4": "4242",
            "expiry": "12/2026"
        },
        "usage": {
            "assets": 6211,
            "assetsLimit": 10000,
            "observations": 2847231,
            "observationsLimit": 5000000,
            "storage": 145,
            "storageLimit": 500
        }
    }
