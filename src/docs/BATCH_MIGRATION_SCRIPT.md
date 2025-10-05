# Batch Migration Script - Component File Reorganization

## Import Path Conversion Rules

When moving a file from `/components/` to `/components/[feature]/`:

### From Root to Feature Folder
```typescript
// BEFORE (in /components/ComponentName.tsx)
import { Something } from "./ui/button"
import { Thing } from "./common"
import { Data } from "../data/mockData"
import { Type } from "../types"

// AFTER (in /components/[feature]/ComponentName.tsx)
import { Something } from "../ui/button"
import { Thing } from "../common"
import { Data } from "../../data/mockData"
import { Type } from "../../types"
```

### Conversion Pattern
- `"./ui/` → `"../ui/`
- `"./common"` → `"../common"`
- `"./alerts"` → `"../alerts"` (feature imports)
- `"../` → `"../../` (going up to root - data, types, contexts, etc.)

## Files to Migrate (32 total)

### Batch 1: Assets (4 files) - PRIORITY
- [ ] AssetDetails.tsx → /components/assets/
- [ ] CreateAsset.tsx → /components/assets/
- [ ] EditAssetDialog.tsx → /components/assets/
- [ ] LoadAsset.tsx → /components/assets/

### Batch 2: Sites (3 files) - PRIORITY  
- [ ] Sites.tsx → /components/sites/
- [ ] SiteDetails.tsx → /components/sites/
- [ ] CreateSite.tsx → /components/sites/

### Batch 3: Jobs (4 files) - PRIORITY
- [ ] JobManagement.tsx → /components/jobs/
- [ ] JobDetails.tsx → /components/jobs/
- [ ] CreateJob.tsx → /components/jobs/
- [ ] EditJob.tsx → /components/jobs/

### Batch 4: Map (3 files) - PRIORITY
- [ ] AssetMap.tsx → /components/map/
- [ ] HistoricalPlayback.tsx → /components/map/
- [ ] FindAsset.tsx → /components/map/

### Batch 5: Geofences (3 files)
- [ ] Geofences.tsx → /components/geofences/
- [ ] CreateGeofence.tsx → /components/geofences/
- [ ] GeofenceMapEditor.tsx → /components/geofences/

### Batch 6: Maintenance (4 files)
- [ ] Maintenance.tsx → /components/maintenance/
- [ ] CreateMaintenance.tsx → /components/maintenance/
- [ ] EditMaintenance.tsx → /components/maintenance/
- [ ] EditMaintenanceDialog.tsx → /components/maintenance/

### Batch 7: Vehicles (3 files)
- [ ] VehicleAssetPairing.tsx → /components/vehicles/
- [ ] CreateVehicle.tsx → /components/vehicles/
- [ ] EditVehicle.tsx → /components/vehicles/

### Batch 8: Issues (2 files)
- [ ] IssueTracking.tsx → /components/issues/
- [ ] CreateIssue.tsx → /components/issues/

### Batch 9: Compliance (2 files)
- [ ] ComplianceTracking.tsx → /components/compliance/
- [ ] CreateCompliance.tsx → /components/compliance/

### Batch 10: Reports (3 files)
- [ ] Reports.tsx → /components/reports/
- [ ] GenerateReportDialog.tsx → /components/reports/
- [ ] ExportDialog.tsx → /components/reports/

### Batch 11: Single File Features (4 files)
- [ ] Dashboard.tsx → /components/dashboard/
- [ ] Settings.tsx → /components/settings/
- [ ] CreateCheckInOut.tsx → /components/check-in-out/
- [ ] NotificationPreferencesNew.tsx → /components/notifications/

## Post-Migration Tasks

After each batch:
1. ✅ Update index.ts exports
2. ✅ Delete old files
3. ✅ Update status document
4. ✅ Verify no broken imports

Final task:
1. ✅ Update App.tsx with new import structure
2. ✅ Test application
3. ✅ Update all documentation
