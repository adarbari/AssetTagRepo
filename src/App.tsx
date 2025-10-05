import React, { useState } from "react";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import { Button } from "./components/ui/button";
import { Dashboard } from "./components/Dashboard";
import { AssetInventory } from "./components/AssetInventory";
import { AssetMap } from "./components/AssetMap";
import { AssetDetails } from "./components/AssetDetails";
import { CreateAsset } from "./components/assets/CreateAsset";
import { CreateCheckInOut } from "./components/CreateCheckInOut";
import { CreateMaintenance } from "./components/CreateMaintenance";
import { EditMaintenance } from "./components/EditMaintenance";
import { CreateIssue } from "./components/CreateIssue";
import { JobManagement } from "./components/JobManagement";
import { JobDetails } from "./components/JobDetails";
import { CreateJob } from "./components/CreateJob";
import { EditJob } from "./components/EditJob";
import { useJobManagement } from "./hooks/useJobManagement";
import { Maintenance } from "./components/Maintenance";
import { IssueTracking } from "./components/IssueTracking";
import { ComplianceTracking } from "./components/ComplianceTracking";
import { Geofences } from "./components/Geofences";
import { Reports } from "./components/Reports";
import { Settings } from "./components/Settings";
import { Alerts } from "./components/alerts/Alerts";
import { HierarchicalAlertConfiguration } from "./components/alerts/HierarchicalAlertConfiguration";
import { HistoricalPlayback } from "./components/HistoricalPlayback";
import { NotificationPreferencesNew } from "./components/NotificationPreferencesNew";
import { NavigationProvider, useNavigation } from "./contexts/NavigationContext";
import { Toaster } from "./components/ui/sonner";
import type { Asset } from "./types";

export type ViewType = 
  | "dashboard"
  | "inventory" 
  | "map"
  | "asset-details"
  | "site-details"
  | "jobs"
  | "job-details"
  | "maintenance"
  | "issues"
  | "compliance"
  | "geofences"
  | "reports"
  | "settings"
  | "alerts"
  | "alert-configuration"
  | "notifications"
  | "create-asset"
  | "check-in-out"
  | "create-maintenance"
  | "report-issue"
  | "historical-playback"
  | "create-geofence"
  | "create-site"
  | "create-compliance"
  | "create-vehicle"
  | "create-job"
  | "edit-job"
  | "edit-maintenance"
  | "alert-workflow"
  | "violation-map"
  | "load-asset";

function AppContent() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [highlightedAsset, setHighlightedAsset] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  
  // Job management hook
  const jobManagement = useJobManagement();
  const navigation = useNavigation();

  // Use the current view from navigation context instead of local state
  const currentView = navigation.currentView;

  const handleViewChange = (view: ViewType) => {
    navigation.handleViewChange(view);
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    navigation.navigateToAssetDetails(asset);
  };

  const handleAssetUpdate = (updates: Partial<Asset>) => {
    if (selectedAsset) {
      const updatedAsset = { ...selectedAsset, ...updates };
      setSelectedAsset(updatedAsset);
    }
  };

  const handleBackToMap = () => {
    navigation.handleViewChange("map");
    setSelectedAsset(null);
  };

  const handleShowOnMap = (asset: Asset) => {
    setHighlightedAsset(asset.id);
    navigation.handleShowOnMap(asset);
  };

  const handleClearHighlight = () => {
    setHighlightedAsset(null);
  };

  const handleTrackHistory = (asset: Asset) => {
    setSelectedAsset(asset);
    navigation.handleViewHistoricalPlayback(asset);
  };

  const handleBackToDashboard = () => {
    navigation.handleViewChange("dashboard");
    setSelectedAsset(null);
  };

  const handleNavigateToAlerts = (filter?: any) => {
    navigation.handleViewChange("alerts");
  };

  const renderCurrentView = () => {
    console.log("Rendering view:", currentView);
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard 
            onViewChange={handleViewChange}
            onNavigateToAlerts={handleNavigateToAlerts}
          />
        );
      case "inventory":
        return (
          <AssetInventory 
            onAssetClick={handleAssetClick}
            onNavigateToCreateAsset={() => navigation.handleViewChange("create-asset")}
          />
        );
      case "map":
        return (
          <AssetMap
            onAssetClick={handleAssetClick}
            onTrackHistory={handleTrackHistory}
            highlightAsset={highlightedAsset}
            onClearHighlight={handleClearHighlight}
            onBack={handleBackToDashboard}
          />
        );
      case "asset-details":
        return selectedAsset ? (
          <AssetDetails
            asset={selectedAsset}
            onBack={navigation.handleBackFromAssetDetails}
            onShowOnMap={handleShowOnMap}
            onViewHistoricalPlayback={handleTrackHistory}
            onAssetUpdate={handleAssetUpdate}
          />
        ) : null;
      case "jobs":
        return (
          <JobManagement 
            jobs={jobManagement.jobs}
            onCreateJob={jobManagement.createJob}
            onUpdateJob={jobManagement.updateJob}
            onDeleteJob={jobManagement.deleteJob}
            onAddAssetToJob={jobManagement.addAssetToJob}
            onRemoveAssetFromJob={jobManagement.removeAssetFromJob}
            jobAlerts={jobManagement.jobAlerts}
            onNavigateToCreateJob={() => navigation.handleViewChange("create-job")}
            onNavigateToJobDetails={(job) => {
              setSelectedJob(job);
              navigation.navigateToJobDetails({ job });
            }}
          />
        );
      case "create-job":
        return (
          <CreateJob 
            onBack={() => navigation.handleViewChange("jobs")}
            onCreateJob={jobManagement.createJob}
          />
        );
      case "edit-job":
        return selectedJob ? (
          <EditJob 
            jobId={selectedJob.id}
            job={selectedJob}
            onBack={() => navigation.handleViewChange("job-details")}
            onUpdateJob={jobManagement.updateJob}
            onAddAssetToJob={jobManagement.addAssetToJob}
            onRemoveAssetFromJob={jobManagement.removeAssetFromJob}
          />
        ) : (
          <div className="p-6">
            <p>No job selected for editing</p>
            <Button onClick={() => navigation.handleViewChange("jobs")}>
              Back to Jobs
            </Button>
          </div>
        );
      case "job-details":
        return selectedJob ? (
          <JobDetails 
            job={selectedJob}
            onBack={() => navigation.handleViewChange("jobs")}
            onEdit={(job) => {
              setSelectedJob(job);
              navigation.handleViewChange("edit-job");
            }}
          />
        ) : (
          <div className="p-6">
            <p>No job selected</p>
            <Button onClick={() => navigation.handleViewChange("jobs")}>
              Back to Jobs
            </Button>
          </div>
        );
      case "maintenance":
        return (
          <Maintenance 
            onAssetClick={handleAssetClick}
          />
        );
      case "issues":
        return (
          <IssueTracking 
            issues={[]}
            onUpdateIssue={async () => ({ success: true })}
            onUpdateStatus={async () => ({ success: true })}
            onDeleteIssue={async () => ({ success: true })}
          />
        );
      case "compliance":
        return <ComplianceTracking />;
      case "geofences":
        return (
          <Geofences 
            onCreateGeofence={() => {
              // Handle create geofence - could navigate to create geofence page
              console.log("Create geofence");
            }}
            onEditGeofence={(geofenceId) => {
              // Handle edit geofence
              console.log("Edit geofence:", geofenceId);
            }}
            onViewViolatingAssets={(geofenceId, violatingAssetIds, expectedAssetIds, actualAssetIds) => {
              // Handle view violating assets
              console.log("View violating assets for geofence:", geofenceId);
            }}
          />
        );
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings />;
      case "alerts":
        return (
          <Alerts 
            initialFilter={undefined}
            onTakeAction={(alert) => {
              // Handle alert action - could navigate to alert workflow
              console.log("Alert action taken:", alert);
            }}
            onNavigateToConfiguration={() => {
              // Handle navigation to alert configuration
              navigation.handleViewChange("alert-configuration");
            }}
          />
        );
      case "alert-configuration":
        return (
          <HierarchicalAlertConfiguration 
            alertConfigs={{}}
            jobs={{}}
            onSaveConfig={async (config) => {
              // Handle saving alert configuration
              console.log("Saving alert config:", config);
              return { success: true };
            }}
            onDeleteConfig={async (level, entityId, alertType) => {
              // Handle deleting alert configuration
              console.log("Deleting alert config:", level, entityId, alertType);
              return { success: true };
            }}
            onBack={() => navigation.handleViewChange("dashboard")}
          />
        );
      case "notifications":
        return (
          <NotificationPreferencesNew 
            onBack={() => navigation.handleViewChange("dashboard")}
            preselectedLevel="user"
            preselectedEntityId="current-user"
            preselectedEntityName="Your Account"
            notificationConfigs={{}}
            onSaveConfig={async (config) => {
              // Handle saving notification configuration
              console.log("Saving notification config:", config);
              return { success: true };
            }}
            onDeleteConfig={async (level, entityId) => {
              // Handle deleting notification configuration
              console.log("Deleting notification config:", level, entityId);
              return { success: true };
            }}
            onGetConfig={(level, entityId) => {
              // Handle getting notification configuration
              console.log("Getting notification config:", level, entityId);
              // Return a default configuration with correct structure
              return {
                id: `${level}-${entityId}`,
                level: level as any,
                entityId,
                entityName: entityId === "current-user" ? "Your Account" : entityId,
                channels: {
                  email: {
                    enabled: true,
                    addresses: ["user@example.com"],
                    verified: true,
                  },
                  sms: {
                    enabled: false,
                    phoneNumbers: [],
                    verified: false,
                  },
                  push: {
                    enabled: true,
                    devices: [],
                    verified: true,
                  },
                  webhook: {
                    enabled: false,
                    endpoints: [],
                    verified: false,
                  }
                },
                filters: {
                  types: ["theft", "battery", "compliance", "offline", "unauthorized-zone", "underutilized", "predictive-maintenance"],
                  severities: ["low", "medium", "high", "critical"],
                },
                quietHours: {
                  enabled: false,
                  start: "22:00",
                  end: "08:00",
                  timezone: "America/New_York",
                  excludeCritical: true,
                },
                frequency: {
                  maxPerHour: 10,
                  maxPerDay: 50,
                  digestMode: false,
                },
                isOverride: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
            }}
          />
        );
      case "create-asset":
        return (
          <CreateAsset 
            onBack={() => navigation.handleViewChange("inventory")}
            onAssetCreated={(asset) => {
              // Handle asset creation success
              console.log("Asset created:", asset);
              navigation.handleViewChange("inventory");
            }}
          />
        );
      case "check-in-out":
        console.log("Rendering check-in-out view, data:", navigation.checkInOutData);
        return navigation.checkInOutData ? (
          <CreateCheckInOut 
            onBack={navigation.handleBackFromCheckInOut}
            assetId={navigation.checkInOutData.assetId}
            assetName={navigation.checkInOutData.assetName}
            currentStatus={navigation.checkInOutData.currentStatus}
            mode={navigation.checkInOutData.mode}
            assetContext={navigation.checkInOutData.assetContext}
            onComplete={navigation.checkInOutData.onComplete}
          />
        ) : (
          <div className="p-8">
            <h2>Check In/Out</h2>
            <p>No check-in/out data available</p>
            <button onClick={() => navigation.handleViewChange("asset-details")}>Back</button>
          </div>
        );
      case "create-maintenance":
        console.log("🎯 Rendering create-maintenance view, data:", navigation.maintenanceCreationData);
        return (
          <CreateMaintenance 
            onBack={navigation.handleBackFromCreateMaintenance}
            preSelectedAsset={navigation.maintenanceCreationData?.preSelectedAsset}
            preSelectedAssetName={navigation.maintenanceCreationData?.preSelectedAssetName}
            assetContext={navigation.maintenanceCreationData?.assetContext}
          />
        );
      case "edit-maintenance":
        console.log("🎯 Rendering edit-maintenance view, data:", navigation.maintenanceEditData);
        return navigation.maintenanceEditData ? (
          <EditMaintenance 
            maintenanceId={navigation.maintenanceEditData.maintenanceId}
            onBack={navigation.handleBackFromEditMaintenance}
            fromContext={navigation.maintenanceEditData.fromContext}
            sourceAssetContext={navigation.maintenanceEditData.sourceAssetContext}
          />
        ) : (
          <div className="p-8">
            <h2>Edit Maintenance</h2>
            <p>No maintenance edit data available</p>
            <Button onClick={() => navigation.handleViewChange("maintenance")}>
              Back to Maintenance
            </Button>
          </div>
        );
      case "report-issue":
        return navigation.issueData ? (
          <CreateIssue 
            onBack={() => navigation.handleViewChange("asset-details")}
            assetId={navigation.issueData.assetId}
            assetName={navigation.issueData.assetName}
            assetContext={navigation.issueData.assetContext}
            onCreateIssue={async (issueInput) => {
              // TODO: Backend integration - create issue
              console.log("Creating issue:", issueInput);
              return { success: true, issue: { id: "ISSUE-001", ...issueInput } };
            }}
          />
        ) : null;
      case "historical-playback":
        return (
          <HistoricalPlayback 
            onBack={() => navigation.handleViewChange("asset-details")}
            preselectedAsset={selectedAsset || undefined}
          />
        );
      default:
        return (
          <Dashboard 
            onViewChange={handleViewChange}
            onNavigateToAlerts={handleNavigateToAlerts}
          />
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar 
          currentView={currentView}
          onViewChange={handleViewChange}
          onAlertTypeClick={handleNavigateToAlerts}
        />
        <main className="flex-1 overflow-auto">
          {renderCurrentView()}
        </main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}