# File Reorganization Status

## Overview
This document tracks the progress of reorganizing the codebase into a feature-based folder structure.

## Feature Directory Structure

### Completed
- `/components/common` - Generic reusable components (StatusBadge, PriorityBadge, InfoRow, etc.)
- `/components/ui` - ShadCN UI components
- `/components/job` - Job-specific reusable components (BudgetSection, JobInformationSection, etc.)
- `/components/figma` - Figma-specific components
- `/components/assets` - Asset inventory and management (IN PROGRESS)

### To Be Created

#### `/components/assets`
- [x] AssetInventory.tsx
- [ ] AssetDetails.tsx
- [ ] CreateAsset.tsx
- [ ] EditAssetDialog.tsx
- [ ] ExportDialog.tsx (shared with other features)

#### `/components/alerts`
- [ ] Alerts.tsx
- [ ] AlertWorkflow.tsx
- [ ] HierarchicalAlertConfiguration.tsx
- [ ] AlertDetailsDialog.tsx
- [ ] AlertConfigFieldRenderer.tsx

#### `/components/sites`
- [ ] Sites.tsx
- [ ] SiteDetails.tsx
- [ ] CreateSite.tsx

#### `/components/geofences`
- [ ] Geofences.tsx
- [ ] CreateGeofence.tsx
- [ ] GeofenceMapEditor.tsx

#### `/components/vehicles`
- [ ] VehicleAssetPairing.tsx
- [ ] CreateVehicle.tsx
- [ ] EditVehicle.tsx

#### `/components/maintenance`
- [ ] Maintenance.tsx
- [ ] CreateMaintenance.tsx
- [ ] EditMaintenance.tsx
- [ ] EditMaintenanceDialog.tsx

#### `/components/compliance`
- [ ] ComplianceTracking.tsx
- [ ] CreateCompliance.tsx

#### `/components/reports`
- [ ] Reports.tsx
- [ ] GenerateReportDialog.tsx

#### `/components/dashboard`
- [ ] Dashboard.tsx

#### `/components/map`
- [ ] AssetMap.tsx
- [ ] HistoricalPlayback.tsx
- [ ] FindAsset.tsx

#### `/components/issues`
- [ ] IssueTracking.tsx
- [ ] CreateIssue.tsx

#### `/components/jobs` (expand existing)
- [ ] JobManagement.tsx
- [ ] JobDetails.tsx
- [ ] CreateJob.tsx
- [ ] EditJob.tsx

#### `/components/workflows`
- [ ] CreateCheckInOut.tsx
- [ ] LoadAsset.tsx

#### `/components/settings`
- [ ] Settings.tsx

#### `/components/core`
- [ ] AppSidebar.tsx
- [ ] ErrorBoundary.tsx
- [ ] NotificationPreferencesNew.tsx
- [ ] ConfigurationInspector.tsx
- [ ] TaskAuditLogDialog.tsx

## Import Path Updates

When moving files, update import paths:
- UI components: `../ui/component` 
- Common components: `../common`
- Data: `../../data/mockData`
- Types: `../../types`
- Contexts: `../../contexts/NavigationContext`
- Hooks: `../../hooks/hookName`
- Services: `../../services/serviceName`

## Index Files

Each feature directory should have an `index.ts` that exports all components:
```typescript
export { ComponentName } from './ComponentName';
```

## App.tsx Updates

Update imports from:
```typescript
import { Component } from "./components/Component";
```

To:
```typescript
import { Component } from "./components/feature";
```

## Documentation Cleanup

Move all markdown files from root to `/docs` directory except:
- README.md (keep at root if exists)
- Guidelines.md (keep in `/guidelines`)

## Next Steps

1. Complete assets feature migration
2. Create all other feature directories
3. Move and update remaining components
4. Update App.tsx imports
5. Clean up old files
6. Clean up documentation files
