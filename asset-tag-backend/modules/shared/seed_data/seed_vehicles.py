"""
Seed data for vehicles and vehicle-asset pairings
Migrated from frontend mockVehicleData.ts
"""

import uuid
from datetime import datetime
from typing import Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession

from modules.shared.database.models import Vehicle, VehicleAssetPairing, Asset, User
from .helpers import generate_uuid_from_string, convert_frontend_date, parse_coordinates


async def seed_vehicles(session: AsyncSession, org_id: uuid.UUID, user_map: Dict[str, uuid.UUID]) -> Dict[str, uuid.UUID]:
    """Create vehicles from mockVehicleData.ts"""
    vehicles_data = [
        {
            "id": "veh-001",
            "name": "Truck F-350",
            "type": "Pickup Truck",
            "licensePlate": "ABC-123",
            "status": "active",
            "location": {
                "lat": 37.7749,
                "lng": -122.4194
            },
            "assignedDriver": "John Smith",
            "lastSeen": "2 min ago"
        },
        {
            "id": "veh-002",
            "name": "Van Transit 250",
            "type": "Cargo Van",
            "licensePlate": "XYZ-789",
            "status": "active",
            "location": {
                "lat": 37.7849,
                "lng": -122.4094
            },
            "assignedDriver": "Jane Doe",
            "lastSeen": "5 min ago"
        },
        {
            "id": "veh-003",
            "name": "Flatbed Truck",
            "type": "Flatbed",
            "licensePlate": "FLT-456",
            "status": "active",
            "location": {
                "lat": 37.7649,
                "lng": -122.4294
            },
            "assignedDriver": "Mike Johnson",
            "lastSeen": "1 min ago"
        },
        {
            "id": "veh-004",
            "name": "SUV Explorer",
            "type": "SUV",
            "licensePlate": "SUV-321",
            "status": "maintenance",
            "lastSeen": "2 hours ago"
        },
        {
            "id": "veh-005",
            "name": "Box Truck",
            "type": "Box Truck",
            "licensePlate": "BOX-654",
            "status": "inactive",
            "lastSeen": "1 day ago"
        }
    ]
    
    vehicle_map = {}
    
    for vehicle_data in vehicles_data:
        vehicle_id = generate_uuid_from_string(vehicle_data["id"])
        
        # Check if vehicle already exists
        existing_vehicle = await session.get(Vehicle, vehicle_id)
        if existing_vehicle:
            vehicle_map[vehicle_data["name"]] = vehicle_id
            continue
        
        # Get driver ID
        driver_id = user_map.get(vehicle_data.get("assignedDriver", ""))
        
        # Parse location
        location = parse_coordinates(vehicle_data.get("location"))
        
        vehicle = Vehicle(
            id=vehicle_id,
            name=vehicle_data["name"],
            vehicle_type=vehicle_data["type"],
            license_plate=vehicle_data["licensePlate"],
            status=vehicle_data["status"],
            organization_id=org_id,
            assigned_driver_id=driver_id,
            current_latitude=location["latitude"] if location else None,
            current_longitude=location["longitude"] if location else None,
            last_seen=convert_frontend_date(vehicle_data["lastSeen"]),
            metadata={
                "description": f"{vehicle_data['type']} vehicle for asset transport"
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(vehicle)
        vehicle_map[vehicle_data["name"]] = vehicle_id
    
    await session.flush()
    return vehicle_map


async def seed_vehicle_asset_pairings(session: AsyncSession, vehicle_map: Dict[str, uuid.UUID], asset_map: Dict[str, uuid.UUID], user_map: Dict[str, uuid.UUID]) -> Dict[str, uuid.UUID]:
    """Create vehicle-asset pairings from mockVehicleData.ts"""
    pairings_data = [
        {
            "id": "pair-001",
            "vehicleId": "veh-001",
            "vehicleName": "Truck F-350",
            "assetIds": ["AT-42891", "AT-42894"],
            "assetNames": ["Excavator CAT 320", "Tool Kit Professional"],
            "pairedAt": "2025-01-04T08:00:00Z",
            "pairedBy": "John Smith",
            "purpose": "Construction Job",
            "jobId": "job-001",
            "jobName": "Downtown Construction",
            "active": True
        },
        {
            "id": "pair-002",
            "vehicleId": "veh-002",
            "vehicleName": "Van Transit 250",
            "assetIds": ["AT-42892"],
            "assetNames": ["Generator Diesel 50kW"],
            "pairedAt": "2025-01-04T07:30:00Z",
            "pairedBy": "Jane Doe",
            "purpose": "Emergency Power Supply",
            "active": True
        },
        {
            "id": "pair-003",
            "vehicleId": "veh-003",
            "vehicleName": "Flatbed Truck",
            "assetIds": ["AT-42893"],
            "assetNames": ["Concrete Mixer M400"],
            "pairedAt": "2025-01-04T09:00:00Z",
            "pairedBy": "Mike Johnson",
            "purpose": "Site Delivery",
            "active": True
        }
    ]
    
    pairing_map = {}
    
    for pairing_data in pairings_data:
        pairing_id = generate_uuid_from_string(pairing_data["id"])
        
        # Check if pairing already exists
        existing_pairing = await session.get(VehicleAssetPairing, pairing_id)
        if existing_pairing:
            pairing_map[pairing_data["id"]] = pairing_id
            continue
        
        # Get vehicle ID
        vehicle_id = vehicle_map.get(pairing_data["vehicleName"])
        if not vehicle_id:
            continue
        
        # Get paired by user ID
        paired_by_id = user_map.get(pairing_data["pairedBy"])
        
        # Create pairing record
        pairing = VehicleAssetPairing(
            id=pairing_id,
            vehicle_id=vehicle_id,
            paired_at=convert_frontend_date(pairing_data["pairedAt"]),
            paired_by_user_id=paired_by_id,
            purpose=pairing_data.get("purpose", ""),
            job_id=pairing_data.get("jobId"),
            job_name=pairing_data.get("jobName"),
            is_active=pairing_data.get("active", True),
            metadata={
                "asset_count": len(pairing_data.get("assetIds", [])),
                "asset_names": pairing_data.get("assetNames", [])
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(pairing)
        pairing_map[pairing_data["id"]] = pairing_id
    
    await session.flush()
    return pairing_map
