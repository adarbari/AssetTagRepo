# File Reorganization Progress

## Status: IN PROGRESS

## Completed:
- ✅ Created `/docs` directory
- ✅ Moved AssetInventory to `/components/assets/`
- ✅ Created generic components in `/components/common/`
- ✅ Created job components in `/components/job/`
- ✅ Started alerts folder: Created `/components/alerts/Alerts.tsx`

## In Progress - Feature Folder Structure:

### Alerts Feature (`/components/alerts/`)
- ✅ Alerts.tsx
- ⏳ AlertWorkflow.tsx
- ⏳ AlertDetailsDialog.tsx
- ⏳ HierarchicalAlertConfiguration.tsx
- ⏳ AlertConfigFieldRenderer.tsx
- ⏳ index.ts

### Sites Feature (`/components/sites/`)
- ⏳ Sites.tsx
- ⏳ SiteDetails.tsx
- ⏳ CreateSite.tsx
- ⏳ index.ts

### Geofences Feature (`/components/geofences/`)
- ⏳ Geofences.tsx
- ⏳ CreateGeofence.tsx
- ⏳ GeofenceMapEditor.tsx
- ⏳ index.ts

### Jobs Feature (`/components/jobs/`) - Merge with existing /job/
- ⏳ JobManagement.tsx
- ⏳ JobDetails.tsx
- ⏳ CreateJob.tsx
- ⏳ EditJob.tsx
- ✅ JobInformationSection.tsx (already in /job/)
- ✅ BudgetSection.tsx (already in /job/)
- ✅ NotesSection.tsx (already in /job/)
- ✅ TagsSection.tsx (already in /job/)
- ⏳ index.ts

### Maintenance Feature (`/components/maintenance/`)
- ⏳ Maintenance.tsx
- ⏳ CreateMaintenance.tsx
- ⏳ EditMaintenance.tsx
- ⏳ EditMaintenanceDialog.tsx
- ⏳ index.ts

### Vehicles Feature (`/components/vehicles/`)
- ⏳ VehicleAssetPairing.tsx
- ⏳ CreateVehicle.tsx
- ⏳ EditVehicle.tsx
- ⏳ index.ts

### Issues Feature (`/components/issues/`)
- ⏳ IssueTracking.tsx
- ⏳ CreateIssue.tsx
- ⏳ index.ts

### Compliance Feature (`/components/compliance/`)
- ⏳ ComplianceTracking.tsx
- ⏳ CreateCompliance.tsx
- ⏳ index.ts

### Reports Feature (`/components/reports/`)
- ⏳ Reports.tsx
- ⏳ GenerateReportDialog.tsx
- ⏳ ExportDialog.tsx
- ⏳ index.ts

### Map Feature (`/components/map/`)
- ⏳ AssetMap.tsx
- ⏳ HistoricalPlayback.tsx
- ⏳ FindAsset.tsx
- ⏳ index.ts

### Dashboard Feature (`/components/dashboard/`)
- ⏳ Dashboard.tsx
- ⏳ index.ts

### Settings Feature (`/components/settings/`)
- ⏳ Settings.tsx
- ⏳ index.ts

### Other Components
- ⏳ AssetDetails.tsx (keep in /components root or move to /assets?)
- ⏳ CreateAsset.tsx (move to /assets/)
- ⏳ LoadAsset.tsx (move to /assets/)
- ⏳ CreateCheckInOut.tsx (keep in /components root or create /check-in-out/?)
- ⏳ NotificationPreferencesNew.tsx (keep in /components root or create /notifications/?)

## TODO:
1. Complete moving all components to feature folders
2. Create index.ts export files for each feature folder
3. Update all imports in App.tsx
4. Test that everything still works
5. Clean up old files from /components root

## Notes:
- Cannot delete protected markdown files in root (Attributions.md, etc.) - they will remain
- Focus on component reorganization and import updates
- Maintain backward compatibility during transition
