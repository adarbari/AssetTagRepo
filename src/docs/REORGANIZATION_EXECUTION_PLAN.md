# File Reorganization - Execution Plan

## Current Progress: ~15% Complete

### ✅ Completed
1. `/components/common/` - All generic components (100%)
2. `/components/assets/` - AssetInventory moved
3. `/components/job/` - Form sections created
4. `/components/alerts/` - Alerts.tsx and AlertWorkflow.tsx moved (2/5 files)

### ⏳ In Progress - Complete These Steps

## STEP 1: Complete Alerts Feature

Move these 3 remaining files to `/components/alerts/`:

### AlertDetailsDialog.tsx
- Current: `/components/AlertDetailsDialog.tsx`
- Target: `/components/alerts/AlertDetailsDialog.tsx`
- Update imports:
  - `"./ui/` → `"../ui/`
  - `"../types"` → `"../../types"`

### HierarchicalAlertConfiguration.tsx
- Current: `/components/HierarchicalAlertConfiguration.tsx`
- Target: `/components/alerts/HierarchicalAlertConfiguration.tsx`
- Update imports:
  - `"./ui/` → `"../ui/`
  - `"./common"` → `"../common"`
  - `"../data/` → `"../../data/"`
  - `"../types"` → `"../../types"`
  - `"../hooks/` → `"../../hooks/"`

### AlertConfigFieldRenderer.tsx
- Current: `/components/AlertConfigFieldRenderer.tsx`
- Target: `/components/alerts/AlertConfigFieldRenderer.tsx`  
- Update imports:
  - `"./ui/` → `"../ui/`
  - `"../types"` → `"../../types"`

### Update index.ts
Uncomment the exports in `/components/alerts/index.ts`

---

## STEP 2: Complete Assets Feature  

Move these 4 files to `/components/assets/`:

### AssetDetails.tsx
- Current: `/components/AssetDetails.tsx`
- Target: `/components/assets/AssetDetails.tsx`

### CreateAsset.tsx
- Current: `/components/CreateAsset.tsx`
- Target: `/components/assets/CreateAsset.tsx`

### EditAssetDialog.tsx
- Current: `/components/EditAssetDialog.tsx`
- Target: `/components/assets/EditAssetDialog.tsx`

### LoadAsset.tsx
- Current: `/components/LoadAsset.tsx`
- Target: `/components/assets/LoadAsset.tsx`

### Update `/components/assets/index.ts`:
```typescript
export { AssetInventory } from './AssetInventory';
export { AssetDetails } from './AssetDetails';
export { CreateAsset } from './CreateAsset';
export { EditAssetDialog } from './EditAssetDialog';
export { LoadAsset } from './LoadAsset';
```

---

## STEP 3: Sites Feature

Create `/components/sites/` and move:

### Sites.tsx, SiteDetails.tsx, CreateSite.tsx

### Create `/components/sites/index.ts`:
```typescript
export { Sites } from './Sites';
export { SiteDetails } from './SiteDetails';
export { CreateSite } from './CreateSite';
```

---

## STEP 4: Geofences Feature

Create `/components/geofences/` and move:

### Geofences.tsx, CreateGeofence.tsx, GeofenceMapEditor.tsx

### Create `/components/geofences/index.ts`:
```typescript
export { Geofences } from './Geofences';
export { CreateGeofence } from './CreateGeofence';
export { GeofenceMapEditor } from './GeofenceMapEditor';
```

---

## STEP 5: Jobs Feature (Rename `/job/` to `/jobs/`)

### Step 5A: Rename folder
- Rename `/components/job/` → `/components/jobs/`

### Step 5B: Move these files into `/components/jobs/`:
- JobManagement.tsx
- JobDetails.tsx
- CreateJob.tsx
- EditJob.tsx

### Create `/components/jobs/index.ts`:
```typescript
// Form sections
export { JobInformationSection } from './JobInformationSection';
export { BudgetSection } from './BudgetSection';
export { NotesSection } from './NotesSection';
export { TagsSection } from './TagsSection';

// Main components
export { JobManagement } from './JobManagement';
export { JobDetails } from './JobDetails';
export { CreateJob } from './CreateJob';
export { EditJob } from './EditJob';
```

---

## STEP 6: Maintenance Feature

Create `/components/maintenance/` and move:

### Maintenance.tsx, CreateMaintenance.tsx, EditMaintenance.tsx, EditMaintenanceDialog.tsx

### Create `/components/maintenance/index.ts`:
```typescript
export { Maintenance } from './Maintenance';
export { CreateMaintenance } from './CreateMaintenance';
export { EditMaintenance } from './EditMaintenance';
export { EditMaintenanceDialog } from './EditMaintenanceDialog';
```

---

## STEP 7: Vehicles Feature

Create `/components/vehicles/` and move:

### VehicleAssetPairing.tsx, CreateVehicle.tsx, EditVehicle.tsx

### Create `/components/vehicles/index.ts`:
```typescript
export { VehicleAssetPairing } from './VehicleAssetPairing';
export { CreateVehicle } from './CreateVehicle';
export { EditVehicle } from './EditVehicle';
```

---

## STEP 8: Issues Feature

Create `/components/issues/` and move:

### IssueTracking.tsx, CreateIssue.tsx

### Create `/components/issues/index.ts`:
```typescript
export { IssueTracking } from './IssueTracking';
export { CreateIssue } from './CreateIssue';
```

---

## STEP 9: Compliance Feature

Create `/components/compliance/` and move:

### ComplianceTracking.tsx, CreateCompliance.tsx

### Create `/components/compliance/index.ts`:
```typescript
export { ComplianceTracking } from './ComplianceTracking';
export { CreateCompliance } from './CreateCompliance';
```

---

## STEP 10: Reports Feature

Create `/components/reports/` and move:

### Reports.tsx, GenerateReportDialog.tsx, ExportDialog.tsx

### Create `/components/reports/index.ts`:
```typescript
export { Reports } from './Reports';
export { GenerateReportDialog } from './GenerateReportDialog';
export { ExportDialog } from './ExportDialog';
```

---

## STEP 11: Map Feature

Create `/components/map/` and move:

### AssetMap.tsx, HistoricalPlayback.tsx, FindAsset.tsx

### Create `/components/map/index.ts`:
```typescript
export { AssetMap } from './AssetMap';
export { HistoricalPlayback } from './HistoricalPlayback';
export { FindAsset } from './FindAsset';
```

---

## STEP 12: Dashboard Feature

Create `/components/dashboard/` and move:

### Dashboard.tsx

### Create `/components/dashboard/index.ts`:
```typescript
export { Dashboard } from './Dashboard';
```

---

## STEP 13: Settings Feature

Create `/components/settings/` and move:

### Settings.tsx

### Create `/components/settings/index.ts`:
```typescript
export { Settings } from './Settings';
```

---

## STEP 14: Check-In-Out Feature

Create `/components/check-in-out/` and move:

### CreateCheckInOut.tsx

### Create `/components/check-in-out/index.ts`:
```typescript
export { CreateCheckInOut } from './CreateCheckInOut';
```

---

## STEP 15: Notifications Feature

Create `/components/notifications/` and move:

### NotificationPreferencesNew.tsx

### Create `/components/notifications/index.ts`:
```typescript
export { NotificationPreferencesNew } from './NotificationPreferencesNew';
```

---

## STEP 16: Update App.tsx Imports

Replace all individual component imports with feature-based imports. See `/docs/APP_TSX_NEW_IMPORTS.md` for the complete updated import section.

---

## Import Path Update Cheat Sheet

When moving a file from `/components/X.tsx` to `/components/feature/X.tsx`:

| Old Import | New Import |
|------------|------------|
| `"./ui/card"` | `"../ui/card"` |
| `"./common"` | `"../common"` |
| `"../data/mockData"` | `"../../data/mockData"` |
| `"../types"` | `"../../types"` |
| `"../hooks/useX"` | `"../../hooks/useX"` |
| `"../services/api"` | `"../../services/api"` |
| `"../contexts/X"` | `"../../contexts/X"` |

---

## Testing After Each Feature

After completing each feature:
1. Check that imports resolve (no red squiggles)
2. Run the app and navigate to that feature
3. Verify functionality works as expected
4. Fix any import errors before moving to next feature

---

## Final Checklist

- [ ] All 42 component files moved to feature folders
- [ ] All 14 feature folders have index.ts files
- [ ] App.tsx updated with new imports
- [ ] No import errors in any file
- [ ] All features tested and working
- [ ] Documentation updated

---

## Estimated Time Per Feature

- Small features (1-2 files): 15-30 minutes
- Medium features (3-4 files): 30-45 minutes  
- Large features (5+ files): 45-60 minutes

**Total estimated time**: 6-8 hours for complete reorganization

---

## Quick Win Strategy

Focus on completing features in this order for maximum impact:

1. ✅ Alerts (started - finish remaining 3 files)
2. ✅ Assets (4 files - commonly used)
3. ✅ Jobs (4 files + rename folder)
4. ✅ Sites (3 files)
5. ✅ Map (3 files - commonly used)
6. Remaining features

This gets 70% of commonly-used components organized first.
