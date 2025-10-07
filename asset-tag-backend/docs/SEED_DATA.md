# Seed Data System

This document describes the seed data system that migrates frontend mock data to the backend database for test and beta environments.

## Overview

The seed data system provides comprehensive test data by migrating all frontend mock data files to backend database models. It supports two modes:

- **Test Environment**: Auto-nukes and reseeds data on every test run
- **Beta Environment**: Auto-seeds only on first startup (empty DB check), with manual refresh available

## Architecture

### Module Structure

```
modules/shared/seed_data/
├── __init__.py              # Module exports
├── helpers.py               # Utility functions
├── seeder.py                # Main orchestration
├── seed_assets.py           # Assets, sites, geofences, personnel
├── seed_alerts.py           # Alert data
├── seed_vehicles.py         # Vehicles and pairings
├── seed_jobs.py             # Jobs and job-related entities
├── seed_issues.py           # Issue tracking
├── seed_reports.py          # Reports and compliance
├── seed_dashboard.py        # Dashboard statistics
└── seed_settings.py         # Settings and team data
```

### Data Flow

1. **Frontend Mock Data** → **Backend Seed Data** → **Database Models**
2. **ID Conversion**: String IDs (e.g., "AT-42891") → Deterministic UUIDs
3. **Relationship Mapping**: Denormalized data → Foreign key relationships
4. **Date Conversion**: ISO strings/relative times → datetime objects

## Data Sources

The system migrates data from 7 frontend mock data files:

| Frontend File | Backend Module | Entities |
|---------------|----------------|----------|
| `mockData.ts` | `seed_assets.py` | Assets, Sites, Geofences, Personnel, Alerts |
| `mockVehicleData.ts` | `seed_vehicles.py` | Vehicles, Vehicle-Asset Pairings |
| `mockJobData.ts` | `seed_jobs.py` | Jobs, Job Assets, Job Alerts |
| `mockIssueData.ts` | `seed_issues.py` | Issues |
| `mockReportsData.ts` | `seed_reports.py` | Compliance Records |
| `mockDashboardData.ts` | `seed_dashboard.py` | Dashboard Statistics |
| `mockSettingsData.ts` | `seed_settings.py` | Team Members, Settings |

## Usage

### Test Environment

Test environment automatically uses the seeder:

```python
# In tests/conftest.py
from modules.shared.seed_data.seeder import seed_test_data

async def create_test_data():
    async with TestSessionLocal() as session:
        summary = await seed_test_data(session)  # Always nukes and reseeds
```

### Beta Environment

Beta environment auto-seeds on first startup:

```python
# In main.py lifespan
if settings.environment == Environment.BETA:
    from modules.shared.seed_data.seeder import seed_beta_data
    
    async with get_db() as session:
        summary = await seed_beta_data(session)  # Only if DB is empty
```

### Manual Refresh

Use the refresh script to manually reset beta data:

```bash
# Set environment
export ASSET_TAG_ENVIRONMENT=beta

# Run refresh script
python scripts/refresh_beta_data.py
```

The script will:
1. Show current data summary
2. Prompt for confirmation
3. Nuke all existing data
4. Reseed with fresh mock data
5. Show new data summary

## Key Features

### Deterministic ID Generation

Frontend string IDs are converted to deterministic UUIDs:

```python
def generate_uuid_from_string(id_str: str) -> uuid.UUID:
    return uuid.uuid5(NAMESPACE_OID, id_str)

# Example: "AT-42891" → deterministic UUID
```

### Relationship Mapping

Denormalized frontend data is converted to proper relationships:

```python
# Frontend: asset.site = "Construction Site A"
# Backend: asset.site_id = UUID (foreign key)

site_map = {"Construction Site A": site_uuid}
asset.site_id = site_map[asset_data["site"]]
```

### Date Handling

Various date formats are normalized:

```python
def convert_frontend_date(date_str: str) -> datetime:
    # Handles:
    # - ISO strings: "2024-10-04T02:35:00Z"
    # - Relative times: "2 min ago", "1 hour ago"
    # - Falls back to current time
```

### Database Nuke Order

Data is deleted in correct dependency order:

```python
delete_order = [
    "geofence_events", "alerts", "estimated_locations", "observations",
    "maintenance_records", "job_assets", "vehicle_asset_pairings", 
    "job_alerts", "issues", "compliance_records", "assets", "jobs", 
    "geofences", "sites", "vehicles", "users", "organizations", "audit_logs"
]
```

## Seeded Data Summary

The system seeds approximately:

- **7 Assets** (Excavator, Generator, Concrete Mixer, etc.)
- **4 Sites** (Construction Site A/B, Main Warehouse, Storage Depot)
- **5 Geofences** (Site perimeters, restricted zones)
- **8 Users** (Managers, operators, personnel)
- **4 Jobs** (Active, planning, completed projects)
- **15+ Alerts** (Battery, theft, compliance, maintenance)
- **8 Issues** (Mechanical, electrical, tracking issues)
- **8 Compliance Records** (Safety inspections, certifications)
- **5 Vehicles** (Trucks, vans, forklifts)
- **3 Vehicle-Asset Pairings** (Active transport assignments)

## Environment Configuration

### Test Environment
- **Database**: `asset_tag_test`
- **Behavior**: Always nuke and reseed
- **Purpose**: Isolated, consistent test data

### Beta Environment  
- **Database**: `asset_tag_beta`
- **Behavior**: Seed only if empty, preserve across restarts
- **Purpose**: Persistent demo data

### Local Environment
- **Database**: `asset_tag`
- **Behavior**: No auto-seeding
- **Purpose**: Development with real data

## Troubleshooting

### Common Issues

1. **Foreign Key Constraint Errors**
   - Ensure data is seeded in correct order
   - Check that referenced entities exist

2. **UUID Generation Inconsistency**
   - Use `generate_uuid_from_string()` for deterministic IDs
   - Don't use random UUIDs for seeded data

3. **Date Parsing Errors**
   - Use `convert_frontend_date()` for all date conversions
   - Handle both absolute and relative time formats

4. **Missing Relationships**
   - Create lookup maps (e.g., `site_map`, `user_map`)
   - Map frontend names to backend UUIDs

### Debugging

Enable debug logging to see seeding progress:

```python
import logging
logging.getLogger("modules.shared.seed_data").setLevel(logging.DEBUG)
```

Check seeded data:

```python
from modules.shared.seed_data.helpers import get_seed_data_summary

async with get_db() as session:
    summary = await get_seed_data_summary(session)
    print(summary)
```

## Adding New Seed Data

1. **Create seed module** (e.g., `seed_new_entity.py`)
2. **Add to seeder.py** orchestration
3. **Update delete order** for nuke operation
4. **Add to helpers.py** if new utilities needed
5. **Update documentation**

Example:

```python
# seed_new_entity.py
async def seed_new_entities(session: AsyncSession, org_id: uuid.UUID) -> Dict[str, uuid.UUID]:
    # Implementation here
    pass

# seeder.py
from .seed_new_entity import seed_new_entities

async def seed_all(session: AsyncSession, force: bool = False):
    # ... existing code ...
    
    # Step N: Create new entities
    logger.info("Seeding new entities...")
    new_entity_map = await seed_new_entities(session, org_id)
    
    # ... rest of code ...
```

## Performance Considerations

- **Test Environment**: Fast nuke/reseed (small dataset)
- **Beta Environment**: One-time seed, then persistent
- **Batch Operations**: Use `session.flush()` for large datasets
- **Transaction Management**: Proper commit/rollback handling

## Security Notes

- Seed data contains dummy/test information only
- No real credentials or sensitive data
- Deterministic IDs prevent data leakage between environments
- Manual refresh script requires explicit confirmation
