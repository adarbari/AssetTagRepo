# App.tsx Import Updates

## Current Imports (Before Migration)

```typescript
import { Dashboard } from './components/Dashboard';
import { AssetMap } from './components/AssetMap';
import { AssetInventory } from './components/AssetInventory';
import { Sites } from './components/Sites';
import { Geofences } from './components/Geofences';
import { Alerts } from './components/Alerts';
import { AlertWorkflow } from './components/AlertWorkflow';
import { Reports } from './components/Reports';
import { AssetDetails } from './components/AssetDetails';
import { SiteDetails } from './components/SiteDetails';
import { Settings } from './components/Settings';
import { FindAsset } from './components/FindAsset';
import { Maintenance } from './components/Maintenance';
import { HierarchicalAlertConfiguration } from './components/HierarchicalAlertConfiguration';
import { HistoricalPlayback } from './components/HistoricalPlayback';
import { ComplianceTracking } from './components/ComplianceTracking';
import { VehicleAssetPairing } from './components/VehicleAssetPairing';
import { NotificationPreferencesNew as NotificationPreferences } from './components/NotificationPreferencesNew';
import { JobManagement } from './components/JobManagement';
import { CreateGeofence } from './components/CreateGeofence';
import { CreateSite } from './components/CreateSite';
import { CreateMaintenance } from './components/CreateMaintenance';
import { CreateCompliance } from './components/CreateCompliance';
import { CreateVehicle } from './components/CreateVehicle';
import { EditVehicle } from './components/EditVehicle';
import { CreateJob } from './components/CreateJob';
import { EditJob } from './components/EditJob';
import { JobDetails } from './components/JobDetails';
import { CreateAsset } from './components/CreateAsset';
import { LoadAsset } from './components/LoadAsset';
import { EditMaintenance } from './components/EditMaintenance';
import { CreateCheckInOut } from './components/CreateCheckInOut';
import { CreateIssue } from './components/CreateIssue';
import { IssueTracking } from './components/IssueTracking';
```

## New Imports (After Migration)

```typescript
// Dashboard
import { Dashboard } from './components/dashboard';

// Map
import { AssetMap } from './components/map';
import { FindAsset } from './components/map';
import { HistoricalPlayback } from './components/map';

// Assets
import { AssetInventory } from './components/assets';
import { AssetDetails } from './components/assets';
import { CreateAsset } from './components/assets';
import { LoadAsset } from './components/assets';

// Sites
import { Sites } from './components/sites';
import { SiteDetails } from './components/sites';
import { CreateSite } from './components/sites';

// Geofences
import { Geofences } from './components/geofences';
import { CreateGeofence } from './components/geofences';

// Alerts
import { Alerts } from './components/alerts';
import { AlertWorkflow } from './components/alerts';
import { HierarchicalAlertConfiguration } from './components/alerts';

// Reports
import { Reports } from './components/reports';

// Settings
import { Settings } from './components/settings';

// Maintenance
import { Maintenance } from './components/maintenance';
import { CreateMaintenance } from './components/maintenance';
import { EditMaintenance } from './components/maintenance';

// Compliance
import { ComplianceTracking } from './components/compliance';
import { CreateCompliance } from './components/compliance';

// Vehicles
import { VehicleAssetPairing } from './components/vehicles';
import { CreateVehicle } from './components/vehicles';
import { EditVehicle } from './components/vehicles';

// Notifications
import { NotificationPreferencesNew as NotificationPreferences } from './components/notifications';

// Jobs
import { JobManagement } from './components/jobs';
import { CreateJob } from './components/jobs';
import { EditJob } from './components/jobs';
import { JobDetails } from './components/jobs';

// Check-in/Check-out
import { CreateCheckInOut } from './components/check-in-out';

// Issues
import { CreateIssue } from './components/issues';
import { IssueTracking } from './components/issues';
```

## Complete Replacement

Replace the entire import block (lines 4-35 in current App.tsx) with the organized version above after ALL component migrations are complete.

## Verification

After updating imports:

1. Run `npm run dev` or equivalent
2. Check for TypeScript errors
3. Navigate through all views to ensure no broken imports
4. Verify all features work as expected
