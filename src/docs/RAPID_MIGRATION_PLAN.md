# Rapid Migration Execution Plan

## Strategy

**Large Files (>500 lines)** - Use edit_tool to update imports, document for manual move
**Small/Medium Files (<500 lines)** - Full migration with write_tool

## Status: EXECUTING

### Batch 1: Jobs Feature (4 files) - IN PROGRESS
- [ ] JobManagement.tsx
- [ ] JobDetails.tsx  
- [ ] CreateJob.tsx
- [ ] EditJob.tsx

### Batch 2: Map Feature (3 files)
- [ ] AssetMap.tsx (LARGE ~800 lines)
- [ ] HistoricalPlayback.tsx
- [ ] FindAsset.tsx

### Batch 3: Geofences Feature (3 files)
- [ ] Geofences.tsx
- [ ] CreateGeofence.tsx
- [ ] GeofenceMapEditor.tsx (LARGE ~600 lines)

### Batch 4: Maintenance Feature (4 files)
- [ ] Maintenance.tsx
- [ ] CreateMaintenance.tsx
- [ ] EditMaintenance.tsx
- [ ] EditMaintenanceDialog.tsx

### Batch 5: Vehicles Feature (3 files)
- [ ] VehicleAssetPairing.tsx
- [ ] CreateVehicle.tsx
- [ ] EditVehicle.tsx

### Batch 6: Issues Feature (2 files)
- [ ] IssueTracking.tsx
- [ ] CreateIssue.tsx

### Batch 7: Compliance Feature (2 files)
- [ ] ComplianceTracking.tsx
- [ ] CreateCompliance.tsx

### Batch 8: Reports Feature (3 files)
- [ ] Reports.tsx
- [ ] GenerateReportDialog.tsx
- [ ] ExportDialog.tsx

### Batch 9: Single Component Features (4 files)
- [ ] Dashboard.tsx → `/components/dashboard/`
- [ ] Settings.tsx → `/components/settings/`
- [ ] CreateCheckInOut.tsx → `/components/check-in-out/`
- [ ] NotificationPreferencesNew.tsx → `/components/notifications/`

### Infrastructure Files - STAY IN ROOT
- ErrorBoundary.tsx ✅ (stays in `/components/`)
- AppSidebar.tsx ✅ (stays in `/components/`)
- ConfigurationInspector.tsx ✅ (stays in `/components/`)  
- TaskAuditLogDialog.tsx - TBD

## Large Files Needing Manual Move

These files have imports updated but need physical relocation:

1. **AssetDetails.tsx** → `/components/assets/` (imports ✅, ~1500 lines)
2. **SiteDetails.tsx** → `/components/sites/` (imports ✅, ~1000 lines)
3. **AssetMap.tsx** → `/components/map/` (TBD, ~800 lines)
4. **GeofenceMapEditor.tsx** → `/components/geofences/` (TBD, ~600 lines)

## Import Pattern Reference

```typescript
// FROM /components/Something.tsx TO /components/feature/Something.tsx

// UI Components
"./ui/" → "../ui/"

// Common Components  
"./common" → "../common"

// Other Features
"./alerts/" → "../alerts/"
"./assets/" → "../assets/"

// Root Level
"../data/" → "../../data/"
"../types" → "../../types"
"../contexts/" → "../../contexts/"
"../services/" → "../../services/"
"../hooks/" → "../../hooks/"
```
