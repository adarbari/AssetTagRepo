"""
Seed data for assets, sites, geofences, and personnel
Migrated from frontend mockData.ts
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession

from modules.shared.database.models import Asset, Site, Geofence, User, Organization
from .helpers import generate_uuid_from_string, convert_frontend_date, parse_coordinates, parse_geofence_coordinates


async def seed_organizations(session: AsyncSession) -> Dict[str, uuid.UUID]:
    """Create test organization"""
    org_id = generate_uuid_from_string("ORG-001")
    
    # Check if organization already exists
    existing_org = await session.get(Organization, org_id)
    if existing_org:
        return {"Test Organization": org_id}
    
    organization = Organization(
        id=org_id,
        name="Test Organization",
        domain="test.example.com",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    session.add(organization)
    await session.flush()
    
    return {"Test Organization": org_id}


async def seed_users(session: AsyncSession, org_id: uuid.UUID) -> Dict[str, uuid.UUID]:
    """Create test users and personnel"""
    users_data = [
        {
            "id": "PERSON-001",
            "name": "John Smith",
            "email": "john.smith@example.com",
            "role": "site_manager"
        },
        {
            "id": "PERSON-002", 
            "name": "Sarah Connor",
            "email": "sarah.connor@example.com",
            "role": "warehouse_manager"
        },
        {
            "id": "PERSON-003",
            "name": "Mike Johnson", 
            "email": "mike.johnson@example.com",
            "role": "equipment_operator"
        },
        {
            "id": "PERSON-004",
            "name": "Tom Brady",
            "email": "tom.brady@example.com", 
            "role": "foreman"
        },
        {
            "id": "PERSON-005",
            "name": "Lisa Anderson",
            "email": "lisa.anderson@example.com",
            "role": "safety_inspector"
        }
    ]
    
    user_map = {}
    
    for user_data in users_data:
        user_id = generate_uuid_from_string(user_data["id"])
        
        # Check if user already exists
        existing_user = await session.get(User, user_id)
        if existing_user:
            user_map[user_data["name"]] = user_id
            continue
        
        user = User(
            id=user_id,
            username=user_data["email"].split("@")[0],
            email=user_data["email"],
            full_name=user_data["name"],
            hashed_password="$2b$12$dummy_hash_for_testing",  # Dummy hash
            organization_id=org_id,
            role=user_data["role"],
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(user)
        user_map[user_data["name"]] = user_id
    
    await session.flush()
    return user_map


async def seed_sites(session: AsyncSession, org_id: uuid.UUID, user_map: Dict[str, uuid.UUID]) -> Dict[str, uuid.UUID]:
    """Create sites from mockData.ts"""
    sites_data = [
        {
            "id": "SITE-001",
            "name": "Construction Site A",
            "address": "123 Main St, San Francisco, CA 94102",
            "coordinates": {"lat": 37.7749, "lng": -122.4194},
            "manager": "John Smith",
            "area": "50,000 sq ft",
            "tolerance": 50
        },
        {
            "id": "SITE-002", 
            "name": "Main Warehouse",
            "address": "456 Oak Ave, San Francisco, CA 94103",
            "coordinates": {"lat": 37.7849, "lng": -122.4094},
            "manager": "Sarah Connor",
            "area": "75,000 sq ft",
            "tolerance": 30
        },
        {
            "id": "SITE-003",
            "name": "Construction Site B", 
            "address": "789 Pine Blvd, Oakland, CA 94607",
            "coordinates": {"lat": 37.7649, "lng": -122.4294},
            "manager": "Mike Johnson",
            "area": "35,000 sq ft",
            "tolerance": 40
        },
        {
            "id": "SITE-004",
            "name": "Storage Depot",
            "address": "321 Elm Rd, Berkeley, CA 94704", 
            "coordinates": {"lat": 37.7549, "lng": -122.4394},
            "manager": "Tom Brady",
            "area": "25,000 sq ft",
            "tolerance": 25
        }
    ]
    
    site_map = {}
    
    for site_data in sites_data:
        site_id = generate_uuid_from_string(site_data["id"])
        
        # Check if site already exists
        existing_site = await session.get(Site, site_id)
        if existing_site:
            site_map[site_data["name"]] = site_id
            continue
        
        coords = parse_coordinates(site_data["coordinates"])
        manager_id = user_map.get(site_data["manager"])
        
        site = Site(
            id=site_id,
            name=site_data["name"],
            organization_id=org_id,
            address=site_data["address"],
            latitude=coords["latitude"] if coords else None,
            longitude=coords["longitude"] if coords else None,
            manager_user_id=manager_id,
            status="active",
            metadata={
                "area": site_data["area"],
                "tolerance": site_data["tolerance"],
                "description": f"Primary {site_data['name'].lower()} for operations"
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(site)
        site_map[site_data["name"]] = site_id
    
    await session.flush()
    return site_map


async def seed_assets(session: AsyncSession, org_id: uuid.UUID, site_map: Dict[str, uuid.UUID], user_map: Dict[str, uuid.UUID]) -> Dict[str, uuid.UUID]:
    """Create assets from mockData.ts"""
    assets_data = [
        {
            "id": "AT-42891",
            "name": "Excavator CAT 320",
            "type": "Heavy Equipment",
            "status": "checked-out",
            "site": "Construction Site A",
            "assignedTo": "John Smith",
            "serialNumber": "CAT320-2019-8472",
            "manufacturer": "Caterpillar",
            "model": "320 GC",
            "purchaseDate": "2019-03-15",
            "warrantyExpiry": "2025-03-15",
            "lastMaintenance": "2024-09-15",
            "nextMaintenance": "2025-03-15",
            "coordinates": [37.7749, -122.4194],
            "temperature": 72,
            "movement": "stationary",
            "hourlyRate": 125.0,
            "availability": "assigned",
            "battery": 87,
            "lastSeen": "2 min ago"
        },
        {
            "id": "AT-42892",
            "name": "Generator Diesel 50kW",
            "type": "Equipment",
            "status": "active",
            "site": "Main Warehouse",
            "assignedTo": "Unassigned",
            "serialNumber": "GEN50KW-2020-3421",
            "manufacturer": "Generac",
            "model": "RD50A",
            "purchaseDate": "2020-06-20",
            "warrantyExpiry": "2025-06-20",
            "lastMaintenance": "2024-08-20",
            "nextMaintenance": "2025-02-20",
            "coordinates": [37.7849, -122.4094],
            "temperature": 68,
            "movement": "stationary",
            "hourlyRate": 45.0,
            "availability": "available",
            "battery": 92,
            "lastSeen": "15 min ago"
        },
        {
            "id": "AT-42893",
            "name": "Concrete Mixer M400",
            "type": "Equipment",
            "status": "in-transit",
            "site": "In Transit",
            "assignedTo": "Mike Johnson",
            "serialNumber": "MIX400-2021-9823",
            "manufacturer": "Multiquip",
            "model": "M400H",
            "purchaseDate": "2021-01-10",
            "warrantyExpiry": "2026-01-10",
            "lastMaintenance": "2024-09-01",
            "nextMaintenance": "2025-03-01",
            "coordinates": [37.7949, -122.3994],
            "temperature": 75,
            "movement": "moving",
            "hourlyRate": 65.0,
            "availability": "in-use",
            "battery": 76,
            "lastSeen": "1 min ago"
        },
        {
            "id": "AT-42894",
            "name": "Tool Kit Professional",
            "type": "Tools",
            "status": "active",
            "site": "Construction Site B",
            "assignedTo": "Sarah Connor",
            "serialNumber": "TK-PRO-2022-5612",
            "manufacturer": "Milwaukee",
            "model": "PRO-KIT-200",
            "purchaseDate": "2022-04-12",
            "warrantyExpiry": "2027-04-12",
            "lastMaintenance": "2024-07-12",
            "nextMaintenance": "2025-01-12",
            "coordinates": [37.7649, -122.4294],
            "temperature": 70,
            "movement": "stationary",
            "hourlyRate": 15.0,
            "availability": "assigned",
            "battery": 45,
            "lastSeen": "5 min ago"
        },
        {
            "id": "AT-42895",
            "name": "Trailer Flatbed 20ft",
            "type": "Vehicle",
            "status": "active",
            "site": "Storage Depot",
            "assignedTo": "Unassigned",
            "serialNumber": "FLAT20-2018-7734",
            "manufacturer": "PJ Trailers",
            "model": "F8-20",
            "purchaseDate": "2018-08-22",
            "warrantyExpiry": "2023-08-22",
            "lastMaintenance": "2024-06-22",
            "nextMaintenance": "2024-12-22",
            "coordinates": [37.745, -122.45],
            "temperature": 65,
            "movement": "stationary",
            "hourlyRate": 35.0,
            "availability": "available",
            "battery": 12,
            "lastSeen": "1 hour ago"
        },
        {
            "id": "AT-42896",
            "name": "Air Compressor 185CFM",
            "type": "Equipment",
            "status": "active",
            "site": "Construction Site A",
            "assignedTo": "Tom Brady",
            "serialNumber": "AC185-2020-4421",
            "manufacturer": "Atlas Copco",
            "model": "XAHS 186",
            "purchaseDate": "2020-11-05",
            "warrantyExpiry": "2025-11-05",
            "lastMaintenance": "2024-09-05",
            "nextMaintenance": "2025-03-05",
            "coordinates": [37.79, -122.405],
            "temperature": 73,
            "movement": "stationary",
            "hourlyRate": 55.0,
            "availability": "maintenance",
            "battery": 98,
            "lastSeen": "3 min ago"
        },
        {
            "id": "AT-42897",
            "name": "Forklift Toyota 8FGU25",
            "type": "Vehicle",
            "status": "maintenance",
            "site": "Main Warehouse",
            "assignedTo": "Unassigned",
            "serialNumber": "FORK25-2017-2891",
            "manufacturer": "Toyota",
            "model": "8FGU25",
            "purchaseDate": "2017-05-18",
            "warrantyExpiry": "2022-05-18",
            "lastMaintenance": "2024-08-18",
            "nextMaintenance": "2024-11-18",
            "coordinates": [37.775, -122.4],
            "temperature": 66,
            "movement": "stationary",
            "hourlyRate": None,
            "availability": "maintenance",
            "battery": 5,
            "lastSeen": "3 hours ago"
        }
    ]
    
    asset_map = {}
    
    for asset_data in assets_data:
        asset_id = generate_uuid_from_string(asset_data["id"])
        
        # Check if asset already exists
        existing_asset = await session.get(Asset, asset_id)
        if existing_asset:
            asset_map[asset_data["name"]] = asset_id
            continue
        
        # Get site and user IDs
        site_id = site_map.get(asset_data["site"])
        assigned_user_id = user_map.get(asset_data["assignedTo"]) if asset_data["assignedTo"] != "Unassigned" else None
        
        # Parse coordinates
        coords = parse_coordinates(asset_data["coordinates"])
        
        asset = Asset(
            id=asset_id,
            name=asset_data["name"],
            serial_number=asset_data["serialNumber"],
            asset_type=asset_data["type"].lower().replace(" ", "_"),
            status=asset_data["status"],
            organization_id=org_id,
            current_site_id=site_id,
            assigned_to_user_id=assigned_user_id,
            battery_level=asset_data["battery"],
            last_seen=convert_frontend_date(asset_data["lastSeen"]),
            asset_metadata={
                "manufacturer": asset_data["manufacturer"],
                "model": asset_data["model"],
                "purchase_date": asset_data["purchaseDate"],
                "warranty_expiry": asset_data["warrantyExpiry"],
                "last_maintenance": asset_data["lastMaintenance"],
                "next_maintenance": asset_data["nextMaintenance"],
                "temperature": asset_data["temperature"],
                "movement": asset_data["movement"],
                "hourly_rate": asset_data["hourlyRate"],
                "availability": asset_data["availability"],
                "coordinates": asset_data["coordinates"]
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(asset)
        asset_map[asset_data["name"]] = asset_id
    
    await session.flush()
    return asset_map


async def seed_geofences(session: AsyncSession, org_id: uuid.UUID, site_map: Dict[str, uuid.UUID]) -> Dict[str, uuid.UUID]:
    """Create geofences from mockData.ts"""
    geofences_data = [
        {
            "id": "GEO-001",
            "name": "Construction Site A Perimeter",
            "type": "polygon",
            "status": "active",
            "coordinates": [
                [37.7749, -122.4194],
                [37.7759, -122.4194],
                [37.7759, -122.4184],
                [37.7749, -122.4184]
            ],
            "siteId": "SITE-001",
            "tolerance": 50,
            "alertOnEntry": True,
            "alertOnExit": True,
            "geofenceType": "authorized"
        },
        {
            "id": "GEO-002",
            "name": "Warehouse B Zone",
            "type": "circular",
            "status": "active",
            "center": [37.7849, -122.4094],
            "radius": 100,
            "siteId": "SITE-002",
            "tolerance": 30,
            "alertOnEntry": True,
            "alertOnExit": True,
            "geofenceType": "authorized"
        },
        {
            "id": "GEO-003",
            "name": "Job Site Beta Boundary",
            "type": "circular",
            "status": "active",
            "center": [37.7649, -122.4294],
            "radius": 150,
            "siteId": "SITE-003",
            "tolerance": 40,
            "alertOnEntry": True,
            "alertOnExit": False,
            "geofenceType": "authorized"
        },
        {
            "id": "GEO-004",
            "name": "Storage Depot Zone",
            "type": "circular",
            "status": "active",
            "center": [37.7549, -122.4394],
            "radius": 125,
            "siteId": "SITE-004",
            "tolerance": 25,
            "alertOnEntry": False,
            "alertOnExit": True,
            "geofenceType": "authorized"
        },
        {
            "id": "GEO-005",
            "name": "Restricted Zone - Airport",
            "type": "circular",
            "status": "active",
            "center": [37.8, -122.45],
            "radius": 3000,
            "tolerance": 100,
            "alertOnEntry": True,
            "alertOnExit": False,
            "geofenceType": "restricted"
        }
    ]
    
    geofence_map = {}
    
    for geofence_data in geofences_data:
        geofence_id = generate_uuid_from_string(geofence_data["id"])
        
        # Check if geofence already exists
        existing_geofence = await session.get(Geofence, geofence_id)
        if existing_geofence:
            geofence_map[geofence_data["name"]] = geofence_id
            continue
        
        # Get site ID
        site_id = site_map.get(geofence_data.get("siteId", ""))
        
        # Parse coordinates based on type
        if geofence_data["type"] == "polygon":
            coordinates = parse_geofence_coordinates(geofence_data["coordinates"])
            center_lat = None
            center_lng = None
            radius = None
        else:  # circular
            center = geofence_data["center"]
            center_lat = center[0]
            center_lng = center[1]
            radius = geofence_data["radius"]
            coordinates = None
        
        geofence = Geofence(
            id=geofence_id,
            name=geofence_data["name"],
            organization_id=org_id,
            site_id=site_id,
            geofence_type=geofence_data["geofenceType"],
            shape_type=geofence_data["type"],
            center_latitude=center_lat,
            center_longitude=center_lng,
            radius_meters=radius,
            coordinates=coordinates,
            tolerance_meters=geofence_data["tolerance"],
            alert_on_entry=geofence_data["alertOnEntry"],
            alert_on_exit=geofence_data["alertOnExit"],
            status=geofence_data["status"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(geofence)
        geofence_map[geofence_data["name"]] = geofence_id
    
    await session.flush()
    return geofence_map
