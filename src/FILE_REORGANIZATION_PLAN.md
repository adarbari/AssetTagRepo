# File Reorganization Plan

## Current Issues
1. All components are in a flat `/components` directory
2. Generic/reusable components mixed with feature-specific components
3. Documentation files cluttering root directory
4. No clear separation of concerns

## Proposed Structure

```
/
├── App.tsx
├── docs/                          # All documentation files
│   ├── architecture/
│   ├── features/
│   ├── implementation/
│   └── guides/
├── components/
│   ├── features/                  # Feature-specific components
│   │   ├── alerts/
│   │   │   ├── AlertWorkflow.tsx
│   │   │   ├── Alerts.tsx
│   │   │   ├── AlertDetailsDialog.tsx
│   │   │   └── HierarchicalAlertConfiguration.tsx
│   │   ├── assets/
│   │   │   ├── AssetDetails.tsx
│   │   │   ├── AssetInventory.tsx
│   │   │   ├── AssetMap.tsx
│   │   │   ├── CreateAsset.tsx
│   │   │   ├── LoadAsset.tsx
│   │   │   ├── FindAsset.tsx
│   │   │   └── HistoricalPlayback.tsx
│   │   ├── sites/
│   │   │   ├── Sites.tsx
│   │   │   ├── SiteDetails.tsx
│   │   │   └── CreateSite.tsx
│   │   ├── geofences/
│   │   │   ├── Geofences.tsx
│   │   │   ├── CreateGeofence.tsx
│   │   │   └── GeofenceMapEditor.tsx
│   │   ├── jobs/
│   │   │   ├── JobManagement.tsx
│   │   │   ├── JobDetails.tsx
│   │   │   ├── CreateJob.tsx
│   │   │   ├── EditJob.tsx
│   │   │   └── sections/         # Job form sections (already exists)
│   │   ├── vehicles/
│   │   │   ├── VehicleAssetPairing.tsx
│   │   │   ├── CreateVehicle.tsx
│   │   │   └── EditVehicle.tsx
│   │   ├── maintenance/
│   │   │   ├── Maintenance.tsx
│   │   │   ├── CreateMaintenance.tsx
│   │   │   ├── EditMaintenance.tsx
│   │   │   └── EditMaintenanceDialog.tsx
│   │   ├── issues/
│   │   │   ├── IssueTracking.tsx
│   │   │   └── CreateIssue.tsx
│   │   ├── compliance/
│   │   │   ├── ComplianceTracking.tsx
│   │   │   └── CreateCompliance.tsx
│   │   ├── notifications/
│   │   │   └── NotificationPreferencesNew.tsx
│   │   └── workflows/
│   │       ├── CreateCheckInOut.tsx
│   │       └── TaskAuditLogDialog.tsx
│   ├── layout/                    # Layout components
│   │   ├── AppSidebar.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Settings.tsx
│   │   └── Reports.tsx
│   ├── shared/                    # Shared dialogs and utilities
│   │   ├── AlertConfigFieldRenderer.tsx
│   │   ├── ConfigurationInspector.tsx
│   │   ├── EditAssetDialog.tsx
│   │   ├── ExportDialog.tsx
│   │   ├── GenerateReportDialog.tsx
│   │   └── ErrorBoundary.tsx
│   ├── common/                    # Generic reusable components (exists)
│   ├── ui/                        # ShadCN components (exists)
│   └── figma/                     # Figma-specific (exists)
├── contexts/
├── data/
├── hooks/
├── services/
├── types/
├── utils/
├── styles/
├── examples/
└── guidelines/
```

## Benefits
1. **Better Organization**: Related components grouped together
2. **Easier Navigation**: Find components by feature area
3. **Clearer Dependencies**: Feature boundaries are visible
4. **Scalability**: Easy to add new features
5. **Maintenance**: Easier to understand component relationships

## Implementation Notes
- This is a PLAN document only
- Actual file moves should be done carefully with imports updated
- Consider doing this reorganization in phases
- Update all import statements after moving files
