"""
Helper functions for seed data operations
"""

import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from modules.shared.database.models import Asset, Site, User, Organization


# UUID namespace for deterministic ID generation
NAMESPACE_OID = uuid.UUID('6ba7b812-9dad-11d1-80b4-00c04fd430c8')


def generate_uuid_from_string(id_str: str) -> uuid.UUID:
    """Generate a deterministic UUID from a string ID"""
    return uuid.uuid5(NAMESPACE_OID, id_str)


def convert_frontend_date(date_str: str) -> datetime:
    """Convert frontend date strings to datetime objects"""
    if not date_str:
        return datetime.utcnow()
    
    # Handle relative times like "2 min ago", "1 hour ago"
    if "ago" in date_str.lower():
        now = datetime.utcnow()
        if "min" in date_str:
            minutes = int(''.join(filter(str.isdigit, date_str)))
            return now - timedelta(minutes=minutes)
        elif "hour" in date_str:
            hours = int(''.join(filter(str.isdigit, date_str)))
            return now - timedelta(hours=hours)
        elif "day" in date_str:
            days = int(''.join(filter(str.isdigit, date_str)))
            return now - timedelta(days=days)
        else:
            return now
    
    # Handle ISO format dates
    try:
        # Remove timezone info if present
        if date_str.endswith('Z'):
            date_str = date_str[:-1]
        return datetime.fromisoformat(date_str)
    except ValueError:
        # Fallback to current time
        return datetime.utcnow()


async def check_if_database_empty(session: AsyncSession) -> bool:
    """Check if the database is empty (no assets exist)"""
    result = await session.execute(select(func.count(Asset.id)))
    asset_count = result.scalar()
    return asset_count == 0


async def get_seed_data_summary(session: AsyncSession) -> Dict[str, int]:
    """Get a summary of all seeded entities"""
    from modules.shared.database.models import (
        Asset, Site, Geofence, Alert, Vehicle, Job, Issue, 
        MaintenanceRecord, User, Organization
    )
    
    summary = {}
    
    # Count each entity type
    entities = [
        (Asset, "assets"),
        (Site, "sites"), 
        (Geofence, "geofences"),
        (Alert, "alerts"),
        (Vehicle, "vehicles"),
        (Job, "jobs"),
        (Issue, "issues"),
        (MaintenanceRecord, "maintenance_records"),
        (User, "users"),
        (Organization, "organizations")
    ]
    
    for model, name in entities:
        try:
            result = await session.execute(select(func.count(model.id)))
            summary[name] = result.scalar()
        except Exception:
            # Table might not exist yet
            summary[name] = 0
    
    return summary


def parse_coordinates(coord_data: Any) -> Optional[Dict[str, float]]:
    """Parse coordinate data from various formats"""
    if not coord_data:
        return None
    
    if isinstance(coord_data, dict):
        if 'lat' in coord_data and 'lng' in coord_data:
            return {
                'latitude': float(coord_data['lat']),
                'longitude': float(coord_data['lng'])
            }
        elif 'latitude' in coord_data and 'longitude' in coord_data:
            return {
                'latitude': float(coord_data['latitude']),
                'longitude': float(coord_data['longitude'])
            }
    
    if isinstance(coord_data, list) and len(coord_data) >= 2:
        return {
            'latitude': float(coord_data[0]),
            'longitude': float(coord_data[1])
        }
    
    return None


def parse_geofence_coordinates(coord_data: Any) -> Optional[list]:
    """Parse geofence coordinate arrays"""
    if not coord_data:
        return None
    
    if isinstance(coord_data, list):
        # Handle both polygon and circular geofences
        if len(coord_data) > 0:
            if isinstance(coord_data[0], list):
                # Polygon: [[lat, lng], [lat, lng], ...]
                return [[float(coord[0]), float(coord[1])] for coord in coord_data]
            else:
                # Single point: [lat, lng]
                return [[float(coord_data[0]), float(coord_data[1])]]
    
    return None
