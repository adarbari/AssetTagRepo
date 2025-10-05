# Detailed File Reorganization Plan

## Overview
This document outlines the complete file reorganization for the asset tracking platform, implementing a feature-based folder structure.

## New Folder Structure

```
/components/
├── alerts/
│   ├── Alerts.tsx
│   ├── AlertWorkflow.tsx
│   ├── AlertDetailsDialog.tsx
│   ├── HierarchicalAlertConfiguration.tsx
│   ├── AlertConfigFieldRenderer.tsx
│   └── index.ts
├── assets/
│   ├── AssetInventory.tsx (already moved)
│   ├── AssetDetails.tsx
│   ├── CreateAsset.tsx
│   ├── EditAssetDialog.tsx
│   ├── LoadAsset.tsx
│   └── index.ts
├── sites/
│   ├── Sites.tsx
│   ├── SiteDetails.tsx
│   ├── CreateSite.tsx
│   └── index.ts
├── geofences/
│   ├── Geofences.tsx
│   ├── CreateGeofence.tsx
│   ├── GeofenceMapEditor.tsx
│   └── index.ts
├── jobs/
│   ├── JobManagement.tsx
│   ├── JobDetails.tsx
│   ├── CreateJob.tsx
│   ├── EditJob.tsx
│   ├── JobInformationSection.tsx (from /job/)
│   ├── BudgetSection.tsx (from /job/)
│   ├── NotesSection.tsx (from /job/)
│   ├── TagsSection.tsx (from /job/)
│   └── index.ts
├── maintenance/
│   ├── Maintenance.tsx
│   ├── CreateMaintenance.tsx
│   ├── EditMaintenance.tsx
│   ├── EditMaintenanceDialog.tsx
│   └── index.ts
├── vehicles/
│   ├── VehicleAssetPairing.tsx
│   ├── CreateVehicle.tsx
│   ├── EditVehicle.tsx
│   └── index.ts
├── issues/
│   ├── IssueTracking.tsx
│   ├── CreateIssue.tsx
│   └── index.ts
├── compliance/
│   ├── ComplianceTracking.tsx
│   ├── CreateCompliance.tsx
│   └── index.ts
├── reports/
│   ├── Reports.tsx
│   ├── GenerateReportDialog.tsx
│   ├── ExportDialog.tsx
│   └── index.ts
├── map/
│   ├── AssetMap.tsx
│   ├── HistoricalPlayback.tsx
│   ├── FindAsset.tsx
│   └── index.ts
├── dashboard/
│   ├── Dashboard.tsx
│   └── index.ts
├── settings/
│   ├── Settings.tsx
│   └── index.ts
├── check-in-out/
│   ├── CreateCheckInOut.tsx
│   └── index.ts
├── notifications/
│   ├── NotificationPreferencesNew.tsx
│   └── index.ts
├── common/ (already exists)
│   ├── AlertCard.tsx
│   ├── CapacityBar.tsx
│   ├── ConfigurationLevelWidget.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   ├── InfoRow.tsx
│   ├── LoadingState.tsx
│   ├── PageHeader.tsx
│   ├── PriorityBadge.tsx
│   ├── Section.tsx
│   ├── StatsCard.tsx
│   ├── StatusBadge.tsx
│   └── index.ts
├── ui/ (shadcn components - no changes)
├── figma/ (protected - no changes)
├── AppSidebar.tsx (keep in root)
├── ErrorBoundary.tsx (keep in root)
├── ConfigurationInspector.tsx (keep in root)
└── TaskAuditLogDialog.tsx (move to /common/ or keep in root)
```

## Import Path Mapping

### App.tsx New Imports
```typescript
// Feature-based imports
import { Dashboard } from "./components/dashboard";
import { AssetMap, HistoricalPlayback, FindAsset } from "./components/map";
import { AssetInventory, AssetDetails, CreateAsset, LoadAsset } from "./components/assets";
import { Sites, SiteDetails, CreateSite } from "./components/sites";
import { Geofences, CreateGeofence } from "./components/geofences";
import { Alerts, AlertWorkflow, HierarchicalAlertConfiguration } from "./components/alerts";
import { Reports } from "./components/reports";
import { Settings } from "./components/settings";
import { Maintenance, CreateMaintenance, EditMaintenance } from "./components/maintenance";
import { ComplianceTracking, CreateCompliance } from "./components/compliance";
import { VehicleAssetPairing, CreateVehicle, EditVehicle } from "./components/vehicles";
import { NotificationPreferencesNew as NotificationPreferences } from "./components/notifications";
import { JobManagement, CreateJob, EditJob, JobDetails } from "./components/jobs";
import { CreateCheckInOut } from "./components/check-in-out";
import { CreateIssue, IssueTracking } from "./components/issues";

// Root-level components
import { AppSidebar } from "./components/AppSidebar";
import { ErrorBoundary } from "./components/ErrorBoundary";

// UI components
import { SidebarProvider } from "./components/ui/sidebar";
import { Toaster } from "./components/ui/sonner";

// Context and hooks
import { NavigationProvider, useNavigation } from "./contexts/NavigationContext";
import { useNotificationConfig } from "./hooks/useNotificationConfig";
import { useAlertConfig } from "./hooks/useAlertConfig";
import { useJobManagement } from "./hooks/useJobManagement";
import { useIssueManagement } from "./hooks/useIssueManagement";

// Utils
import { initializeErrorHandlers } from "./utils/errorHandler";
```

## Benefits

1. **Clear Organization**: Each feature has its own folder
2. **Easy Navigation**: Related components are grouped together
3. **Scalability**: Easy to add new features
4. **Better Imports**: Clean barrel exports from each folder
5. **Maintainability**: Clear separation of concerns

## Implementation Steps

1. ✅ Create folder structure
2. ⏳ Move components to their respective folders
3. ⏳ Update imports within moved files (change `./ui/` to `../ui/`, etc.)
4. ⏳ Create index.ts for each feature folder
5. ⏳ Update App.tsx with new imports
6. ⏳ Test all functionality
7. ⏳ Clean up old files

## Index.ts Pattern

Each feature folder should have an index.ts that exports all components:

```typescript
// /components/alerts/index.ts
export { Alerts } from './Alerts';
export { AlertWorkflow } from './AlertWorkflow';
export { AlertDetailsDialog } from './AlertDetailsDialog';
export { HierarchicalAlertConfiguration } from './HierarchicalAlertConfiguration';
export { AlertConfigFieldRenderer } from './AlertConfigFieldRenderer';
```

This allows clean imports:
```typescript
import { Alerts, AlertWorkflow } from './components/alerts';
```

## Path Update Rules

When moving a file from `/components/X.tsx` to `/components/feature/X.tsx`:

1. UI imports: `"./ui/card"` → `"../ui/card"`
2. Common imports: `"./common"` → `"../common"`
3. Data imports: `"../data/mockData"` → `"../../data/mockData"`
4. Types imports: `"../types"` → `"../../types"`
5. Hooks imports: `"../hooks/useX"` → `"../../hooks/useX"`
6. Services imports: `"../services/api"` → `"../../services/api"`

## Status
- Started: Yes
- Completed: No
- Next: Continue moving components systematically
