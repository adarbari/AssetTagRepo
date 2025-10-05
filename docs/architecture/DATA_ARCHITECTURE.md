# Data Architecture - Asset Tracking Platform

## Overview

This document describes the complete data architecture for the asset tracking platform, designed to make backend integration straightforward and maintain data consistency.

## Core Data Objects

### 1. Site Object

Sites are physical locations where assets and personnel are located.

**Type Definition:**
```typescript
interface Site {
  id: string;                    // Unique identifier (e.g., "SITE-001")
  name: string;                  // Display name
  location: string;              // Human-readable address
  assets: number;                // Computed from assetIds.length
  area: string;                  // Physical area (e.g., "50,000 sq ft")
  status: "active" | "inactive"; // Operational status
  manager?: string;              // Site manager name
  coordinates?: {
    lat: number;
    lng: number;
    radius: number;              // Boundary radius in feet
  };
  tolerance?: number;            // Buffer zone in feet
  address?: string;              // Full address
  phone?: string;                // Contact phone
  email?: string;                // Contact email
  description?: string;          // Site description
  geofenceId?: string;           // Associated geofence ID
  assetIds: string[];            // IDs of assets at this site
  personnelIds: string[];        // IDs of personnel at this site
}
```

**Key Relationships:**
- `assetIds[]` - Contains IDs of all assets currently at this site
- `personnelIds[]` - Contains IDs of all personnel currently at this site
- `geofenceId` - Links to associated geofence for boundary monitoring

### 2. Asset Object

Assets are tracked items (equipment, vehicles, tools, etc.).

**Type Definition:**
```typescript
interface Asset {
  id: string;                    // Unique identifier (e.g., "AT-42891")
  name: string;                  // Display name
  type: string;                  // Asset category
  status: "active" | "inactive" | "maintenance" | "in-transit" | "checked-out";
  location: string;              // Human-readable location
  lastSeen: string;              // Relative time string
  battery: number;               // Battery percentage
  site?: string;                 // Site name (links to Site via lookup)
  assignedTo?: string;           // Person assigned
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  coordinates?: [number, number]; // [lat, lng]
  temperature?: number;
  movement?: "stationary" | "moving";
}
```

**Key Relationships:**
- `site` - Name of the site (use `siteNameToIdMap` to get site ID)
- Asset ID is stored in the corresponding Site's `assetIds[]` array

### 3. Personnel Object

Personnel are people who work at sites.

**Type Definition:**
```typescript
interface Personnel {
  id: string;                    // Unique identifier (e.g., "PERSON-001")
  name: string;                  // Full name
  role: string;                  // Job role
  status: "on-duty" | "off-duty" | "on-break";
  currentSite?: string;          // Site ID where currently located
  activityHistory: ActivityEvent[]; // Historical movement data
}
```

**Key Relationships:**
- `currentSite` - Site ID where personnel is currently located
- Personnel ID is stored in the corresponding Site's `personnelIds[]` array

### 4. Activity Event Object

Activity events track movements of assets and personnel.

**Type Definition:**
```typescript
interface ActivityEvent {
  id: string;                    // Unique identifier
  timestamp: Date;               // When the event occurred
  siteId: string;                // Site ID
  siteName: string;              // Site name for display
  type: "arrival" | "departure"; // Event type
}
```

## Data Flow & Relationships

### Relationship Diagram

```
Site ──────┬──> assetIds[] ──> References Asset.id
           │
           └──> personnelIds[] ──> References Personnel.id

Asset.site ──> (via siteNameToIdMap) ──> Site.id

Personnel.currentSite ──> Site.id

Asset/Personnel ──> activityHistory[] ──> ActivityEvent[]
                                              │
                                              └──> siteId ──> Site.id
```

### Data Consistency

The `populateSiteRelationships()` function maintains consistency:

```typescript
function populateSiteRelationships() {
  // 1. Clear existing relationships
  mockSites.forEach(site => {
    site.assetIds = [];
    site.personnelIds = [];
  });

  // 2. Populate from assets
  mockAssets.forEach(asset => {
    if (asset.site) {
      const siteId = siteNameToIdMap[asset.site];
      const site = mockSites.find(s => s.id === siteId);
      if (site) site.assetIds.push(asset.id);
    }
  });

  // 3. Populate from personnel
  mockPersonnel.forEach(person => {
    if (person.currentSite) {
      const site = mockSites.find(s => s.id === person.currentSite);
      if (site) site.personnelIds.push(person.id);
    }
  });

  // 4. Update counts
  mockSites.forEach(site => {
    site.assets = site.assetIds.length;
  });
}
```

This function is called:
1. After `mockAssets` is defined (to populate asset relationships)
2. After `mockPersonnel` is defined (to populate personnel relationships)

## Helper Functions

### Query Functions

```typescript
// Get all assets at a specific site
getAssetsAtSite(siteId: string): Asset[]

// Get all personnel at a specific site
getPersonnelAtSite(siteId: string): Personnel[]

// Get asset by ID
getAssetById(assetId: string): Asset | undefined

// Get personnel by ID
getPersonnelById(personnelId: string): Personnel | undefined

// Get site by ID
getSiteById(siteId: string): Site | undefined

// Get activity history
getAssetActivity(assetId: string): ActivityEvent[]
getPersonnelActivity(personnelId: string): ActivityEvent[]
```

### Mutation Functions

```typescript
// Move asset to a different site
addAssetToSite(assetId: string, siteId: string): void
// - Removes asset from previous site's assetIds[]
// - Adds asset to new site's assetIds[]
// - Updates asset.site field
// - Updates site.assets count

// Move personnel to a different site
addPersonnelToSite(personnelId: string, siteId: string): void
// - Removes personnel from previous site's personnelIds[]
// - Adds personnel to new site's personnelIds[]
// - Updates personnel.currentSite field

// Update site data
updateSite(siteId: string, updates: Partial<Site>): Site

// Update geofence
updateGeofence(geofenceId: string, updates: Partial<Geofence>): Geofence
```

## Backend Integration Strategy

### 1. Database Schema

**Sites Table:**
```sql
CREATE TABLE sites (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  location VARCHAR,
  area VARCHAR,
  status VARCHAR,
  manager VARCHAR,
  lat DECIMAL,
  lng DECIMAL,
  radius INTEGER,
  tolerance INTEGER,
  address VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  description TEXT,
  geofence_id VARCHAR REFERENCES geofences(id)
);
```

**Assets Table:**
```sql
CREATE TABLE assets (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR,
  status VARCHAR,
  site_id VARCHAR REFERENCES sites(id),
  location VARCHAR,
  last_seen TIMESTAMP,
  battery INTEGER,
  assigned_to VARCHAR,
  -- ... other metadata fields
);

CREATE INDEX idx_assets_site_id ON assets(site_id);
```

**Personnel Table:**
```sql
CREATE TABLE personnel (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  role VARCHAR,
  status VARCHAR,
  current_site_id VARCHAR REFERENCES sites(id)
);

CREATE INDEX idx_personnel_site_id ON personnel(current_site_id);
```

**Activity Events Table:**
```sql
CREATE TABLE activity_events (
  id VARCHAR PRIMARY KEY,
  entity_id VARCHAR NOT NULL,     -- Asset or Personnel ID
  entity_type VARCHAR NOT NULL,   -- 'asset' or 'personnel'
  site_id VARCHAR REFERENCES sites(id),
  timestamp TIMESTAMP NOT NULL,
  event_type VARCHAR NOT NULL     -- 'arrival' or 'departure'
);

CREATE INDEX idx_activity_site_timestamp ON activity_events(site_id, timestamp);
CREATE INDEX idx_activity_entity ON activity_events(entity_id, timestamp);
```

### 2. API Endpoints

**Sites:**
```
GET    /api/sites                    - List all sites
GET    /api/sites/:id                - Get site details
GET    /api/sites/:id/assets         - Get assets at site
GET    /api/sites/:id/personnel      - Get personnel at site
GET    /api/sites/:id/activity       - Get site activity data
PUT    /api/sites/:id                - Update site
POST   /api/sites                    - Create site
DELETE /api/sites/:id                - Delete site
```

**Assets:**
```
GET    /api/assets                   - List all assets
GET    /api/assets/:id               - Get asset details
GET    /api/assets/:id/activity      - Get asset activity history
PUT    /api/assets/:id               - Update asset
PUT    /api/assets/:id/site          - Move asset to different site
POST   /api/assets                   - Create asset
DELETE /api/assets/:id               - Delete asset
```

**Personnel:**
```
GET    /api/personnel                - List all personnel
GET    /api/personnel/:id            - Get personnel details
GET    /api/personnel/:id/activity   - Get personnel activity history
PUT    /api/personnel/:id            - Update personnel
PUT    /api/personnel/:id/site       - Move personnel to different site
POST   /api/personnel                - Create personnel
DELETE /api/personnel/:id            - Delete personnel
```

### 3. Frontend Integration Points

**Replace Mock Data Imports:**

Current (Mock):
```typescript
import { mockAssets, mockSites, mockPersonnel } from './data/mockData';
```

Future (API):
```typescript
const sites = await fetch('/api/sites').then(r => r.json());
const assets = await fetch('/api/assets').then(r => r.json());
const personnel = await fetch('/api/personnel').then(r => r.json());
```

**Replace Helper Function Calls:**

Current (Mock):
```typescript
const siteAssets = getAssetsAtSite(siteId);
```

Future (API):
```typescript
const siteAssets = await fetch(`/api/sites/${siteId}/assets`).then(r => r.json());
```

## Benefits of This Architecture

### 1. **Clear Relationships**
- Sites contain IDs of their assets and personnel
- Easy to query "what's at this site?"
- Easy to query "where is this asset/person?"

### 2. **Data Consistency**
- Single source of truth for relationships
- Helper functions maintain consistency
- Computed fields (like `site.assets`) stay accurate

### 3. **Backend-Ready**
- Structure matches typical relational database design
- Clear foreign key relationships
- Easy to translate to SQL or NoSQL

### 4. **Efficient Queries**
- No need to scan all assets to find site assets
- Direct array lookups
- Indexed relationships

### 5. **Activity Tracking**
- Historical data separated from current state
- Easy to aggregate activity by site
- Supports time-based queries

## Usage Examples

### Example 1: Get all information about a site

```typescript
import { getSiteById, getAssetsAtSite, getPersonnelAtSite } from './data/mockData';

const siteId = 'SITE-001';
const site = getSiteById(siteId);
const assets = getAssetsAtSite(siteId);
const personnel = getPersonnelAtSite(siteId);

console.log(`${site.name} has ${assets.length} assets and ${personnel.length} personnel`);
```

### Example 2: Move an asset to a different site

```typescript
import { addAssetToSite, getSiteById } from './data/mockData';

// Move excavator to warehouse
addAssetToSite('AT-42891', 'SITE-002');

// Verify
const warehouse = getSiteById('SITE-002');
console.log(warehouse.assetIds); // Includes 'AT-42891'
console.log(warehouse.assets);    // Count updated
```

### Example 3: Get activity data for a site

```typescript
import { fetchSiteActivity } from './services/api';

const startDate = new Date('2024-10-01');
const endDate = new Date('2024-10-04');

const activityData = await fetchSiteActivity('SITE-001', startDate, endDate, 'daily');

activityData.data.forEach(day => {
  console.log(`${day.time}: ${day.assets} assets, ${day.personnel} personnel`);
});
```

### Example 4: List all assets and their sites

```typescript
import { mockAssets, mockSites } from './data/mockData';

mockAssets.forEach(asset => {
  const site = mockSites.find(s => s.assetIds.includes(asset.id));
  console.log(`${asset.name} is at ${site?.name || 'Unknown'}`);
});
```

## Migration from Old Structure

### Old Structure:
- Site had `assets: number` (just a count)
- No direct link from site to assets
- Had to scan all assets to find assets at a site

### New Structure:
- Site has `assetIds: string[]` and `personnelIds: string[]`
- Direct links enable efficient queries
- `assets` field is now computed from `assetIds.length`

### Migration Impact:
- **Components**: No changes needed - they still get the same data
- **Helper Functions**: New functions available for better queries
- **Backend Integration**: Much easier with explicit relationships

## Future Enhancements

### 1. Real-time Updates
- WebSocket connections for live asset/personnel movements
- Automatic site relationship updates
- Push notifications for arrivals/departures

### 2. Advanced Queries
- "Find all sites with assets needing maintenance"
- "Show personnel utilization across sites"
- "Track asset movements between sites over time"

### 3. Validation
- Ensure asset/personnel IDs in sites actually exist
- Validate site capacity limits
- Check for conflicting location data

### 4. Audit Trail
- Track all changes to relationships
- Record who moved assets/personnel when
- Maintain historical snapshots of site states