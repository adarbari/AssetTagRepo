import { useEffect } from "react";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { Dashboard } from "./components/Dashboard";
import { AssetMap } from "./components/AssetMap";
import { AssetInventory, CreateAsset, LoadAsset } from "./components/assets";
import { Sites, CreateSite } from "./components/sites";
import { Geofences } from "./components/Geofences";
import { Alerts, AlertWorkflow, HierarchicalAlertConfiguration } from "./components/alerts";
import { Reports } from "./components/Reports";
import { AssetDetails } from "./components/AssetDetails";
import { SiteDetails } from "./components/SiteDetails";
import { Settings } from "./components/Settings";
import { FindAsset } from "./components/FindAsset";
import { Maintenance } from "./components/Maintenance";
import { HistoricalPlayback } from "./components/HistoricalPlayback";
import { ComplianceTracking } from "./components/ComplianceTracking";
import { VehicleAssetPairing } from "./components/VehicleAssetPairing";
import { NotificationPreferencesNew as NotificationPreferences } from "./components/NotificationPreferencesNew";
import { CreateGeofence } from "./components/CreateGeofence";
import { CreateMaintenance } from "./components/CreateMaintenance";
import { CreateCompliance } from "./components/CreateCompliance";
import { CreateVehicle } from "./components/CreateVehicle";
import { EditVehicle } from "./components/EditVehicle";
import { CreateJob, EditJob, JobDetails, JobManagement } from "./components/jobs";
import { EditMaintenance } from "./components/EditMaintenance";
import { CreateCheckInOut } from "./components/CreateCheckInOut";
import { CreateIssue } from "./components/CreateIssue";
import { IssueTracking } from "./components/IssueTracking";
import { Toaster } from "./components/ui/sonner";
import { NavigationProvider, useNavigation } from "./contexts/NavigationContext";
import { initializeErrorHandlers } from "./utils/errorHandler";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useNotificationConfig } from "./hooks/useNotificationConfig";
import { useAlertConfig } from "./hooks/useAlertConfig";
import { useJobManagement } from "./hooks/useJobManagement";
import { useIssueManagement } from "./hooks/useIssueManagement";

export type ViewType = "dashboard" | "map" | "inventory" | "sites" | "geofences" | "alerts" | "reports" | "asset-details" | "site-details" | "settings" | "find-asset" | "maintenance" | "historical-playback" | "compliance" | "vehicle-pairing" | "notifications" | "job-costing" | "create-geofence" | "alert-workflow" | "alert-configuration" | "create-site" | "create-maintenance" | "edit-maintenance" | "create-compliance" | "create-vehicle" | "edit-vehicle" | "create-job" | "edit-job" | "job-details" | "create-asset" | "load-asset" | "check-in-out" | "report-issue" | "issue-tracking";

function AppContent() {
  const navigation = useNavigation();
  const notificationConfig = useNotificationConfig();
  const alertConfig = useAlertConfig();
  const jobManagement = useJobManagement();
  const issueManagement = useIssueManagement();

  const renderView = () => {
    switch (navigation.currentView) {
      case "dashboard":
        return <Dashboard onViewChange={navigation.handleViewChange} onNavigateToAlerts={navigation.navigateToAlerts} />;
      
      case "map":
        return (
          <AssetMap 
            onAssetClick={navigation.navigateToAssetDetails}
            onTrackHistory={navigation.handleViewHistoricalPlayback}
            highlightAsset={navigation.highlightAsset} 
            onClearHighlight={navigation.handleClearHighlight}
            onBack={navigation.highlightAsset || navigation.geofenceViolationMode ? (navigation.geofenceViolationMode ? navigation.handleBackFromViolationMap : navigation.handleBackFromMap) : undefined}
            filteredAssetIds={navigation.filteredAssetIds}
            violationMode={navigation.geofenceViolationMode}
            violatingGeofenceId={navigation.violatingGeofenceId}
            expectedAssetIds={navigation.expectedAssetIds}
            actualAssetIds={navigation.actualAssetIds}
          />
        );
      
      case "inventory":
        return <AssetInventory onAssetClick={navigation.navigateToAssetDetails} />;
      
      case "sites":
        return <Sites onSiteClick={navigation.navigateToSiteDetails} />;
      
      case "geofences":
        return (
          <Geofences 
            onCreateGeofence={navigation.navigateToCreateGeofence}
            onEditGeofence={navigation.navigateToEditGeofence}
            onViewViolatingAssets={navigation.handleViewViolatingAssets}
          />
        );
      
      case "alerts":
        return (
          <Alerts 
            initialFilter={navigation.alertFilter} 
            onTakeAction={navigation.navigateToAlertWorkflow}
            onNavigateToConfiguration={navigation.navigateToAlertConfiguration}
          />
        );
      
      case "reports":
        return <Reports />;
      
      case "asset-details":
        return navigation.selectedAsset ? (
          <AssetDetails 
            asset={navigation.selectedAsset} 
            onBack={navigation.handleBackFromAssetDetails}
            onShowOnMap={navigation.handleShowOnMap}
            onViewHistoricalPlayback={navigation.handleViewHistoricalPlayback}
          />
        ) : (
          <Dashboard onViewChange={navigation.handleViewChange} onNavigateToAlerts={navigation.navigateToAlerts} />
        );
      
      case "site-details":
        return navigation.selectedSite ? (
          <SiteDetails 
            site={navigation.selectedSite} 
            onBack={navigation.handleBackFromSiteDetails}
            onCreateGeofence={navigation.navigateToCreateGeofence}
            onEditGeofence={navigation.navigateToEditGeofence}
            onSiteUpdate={navigation.handleSiteUpdate}
            initialTab={navigation.siteActiveTab}
            onTabChange={navigation.setSiteActiveTab}
          />
        ) : (
          <Dashboard onViewChange={navigation.handleViewChange} onNavigateToAlerts={navigation.navigateToAlerts} />
        );
      
      case "settings":
        return <Settings />;
      
      case "find-asset":
        return <FindAsset onShowOnMap={navigation.handleShowOnMap} />;
      
      case "maintenance":
        return <Maintenance onAssetClick={navigation.navigateToAssetDetails} />;
      
      case "historical-playback":
        return (
          <HistoricalPlayback 
            preselectedAsset={navigation.historicalPlaybackAsset || undefined}
            onBack={navigation.historicalPlaybackAsset ? navigation.handleBackFromHistoricalPlayback : undefined}
          />
        );
      
      case "compliance":
        return <ComplianceTracking />;
      
      case "vehicle-pairing":
        return <VehicleAssetPairing />;
      
      case "notifications":
        return (
          <NotificationPreferences 
            notificationConfigs={notificationConfig.configs}
            onSaveConfig={notificationConfig.saveConfig}
            onDeleteConfig={notificationConfig.deleteConfig}
            onGetConfig={notificationConfig.getConfig}
          />
        );
      
      case "job-costing":
        return (
          <JobManagement 
            jobs={jobManagement.jobs}
            onCreateJob={jobManagement.createJob}
            onUpdateJob={jobManagement.updateJob}
            onDeleteJob={jobManagement.deleteJob}
            onAddAssetToJob={jobManagement.addAssetToJob}
            onRemoveAssetFromJob={jobManagement.removeAssetFromJob}
            jobAlerts={jobManagement.jobAlerts}
          />
        );
      
      case "create-geofence":
        return (
          <CreateGeofence 
            onBack={navigation.handleBackFromCreateGeofence}
            onGeofenceCreated={navigation.handleGeofenceCreated}
            onGeofenceUpdated={navigation.handleGeofenceUpdated}
            editMode={navigation.isEditingGeofence}
            existingGeofenceId={navigation.editingGeofenceId}
            initialData={navigation.geofenceCreationData}
          />
        );
      
      case "alert-workflow":
        return navigation.selectedAlertForWorkflow ? (
          <AlertWorkflow
            alert={navigation.selectedAlertForWorkflow}
            onBack={navigation.handleBackFromAlertWorkflow}
            onActionComplete={navigation.handleBackFromAlertWorkflow}
          />
        ) : (
          <Dashboard onViewChange={navigation.handleViewChange} onNavigateToAlerts={navigation.navigateToAlerts} />
        );
      
      case "alert-configuration":
        return (
          <HierarchicalAlertConfiguration 
            alertConfigs={alertConfig.configs}
            jobs={jobManagement.jobs}
            onSaveConfig={alertConfig.saveConfig}
            onDeleteConfig={alertConfig.deleteConfig}
            onBack={navigation.handleBackFromAlertConfiguration}
          />
        );
      
      case "create-site":
        return (
          <CreateSite onBack={navigation.handleBackFromCreateSite} />
        );
      
      case "create-maintenance":
        return (
          <CreateMaintenance 
            onBack={navigation.handleBackFromCreateMaintenance}
            preSelectedAsset={navigation.maintenanceCreationData?.preSelectedAsset}
            preSelectedAssetName={navigation.maintenanceCreationData?.preSelectedAssetName}
            assetContext={navigation.maintenanceCreationData?.assetContext}
          />
        );
      
      case "edit-maintenance":
        return navigation.maintenanceEditData ? (
          <EditMaintenance
            maintenanceId={navigation.maintenanceEditData.maintenanceId}
            onBack={navigation.handleBackFromEditMaintenance}
            fromContext={navigation.maintenanceEditData.fromContext}
            sourceAssetContext={navigation.maintenanceEditData.sourceAssetContext}
          />
        ) : (
          <Dashboard onViewChange={navigation.handleViewChange} onNavigateToAlerts={navigation.navigateToAlerts} />
        );
      
      case "create-compliance":
        return (
          <CreateCompliance onBack={navigation.handleBackFromCreateCompliance} />
        );
      
      case "create-vehicle":
        return (
          <CreateVehicle onBack={navigation.handleBackFromCreateVehicle} />
        );
      
      case "edit-vehicle":
        return navigation.vehicleEditData ? (
          <EditVehicle
            vehicleId={navigation.vehicleEditData.vehicleId}
            onBack={navigation.handleBackFromEditVehicle}
            onVehicleUpdated={navigation.vehicleEditData.onVehicleUpdated}
          />
        ) : (
          <Dashboard onViewChange={navigation.handleViewChange} onNavigateToAlerts={navigation.navigateToAlerts} />
        );
      
      case "create-job":
        return (
          <CreateJob 
            onBack={navigation.handleBackFromCreateJob}
            onCreateJob={navigation.jobCreationData?.onCreateJob || (async () => ({ success: false }))}
          />
        );
      
      case "edit-job":
        return navigation.jobEditData ? (
          <EditJob
            jobId={navigation.jobEditData.jobId}
            job={navigation.jobEditData.job}
            onBack={navigation.handleBackFromEditJob}
            onUpdateJob={jobManagement.updateJob}
            onAddAssetToJob={jobManagement.addAssetToJob}
            onRemoveAssetFromJob={jobManagement.removeAssetFromJob}
          />
        ) : (
          <Dashboard onViewChange={navigation.handleViewChange} onNavigateToAlerts={navigation.navigateToAlerts} />
        );
      
      case "job-details":
        return navigation.jobDetailsData ? (
          <JobDetails
            job={navigation.jobDetailsData.job}
            onBack={navigation.handleBackFromJobDetails}
            onEdit={(job) => navigation.navigateToEditJob({ jobId: job.id, job })}
          />
        ) : (
          <Dashboard onViewChange={navigation.handleViewChange} onNavigateToAlerts={navigation.navigateToAlerts} />
        );
      
      case "create-asset":
        return (
          <CreateAsset 
            onBack={navigation.handleBackFromCreateAsset}
            onAssetCreated={navigation.assetCreationData?.onAssetCreated}
          />
        );
      
      case "load-asset":
        return (
          <LoadAsset 
            onBack={navigation.handleBackFromLoadAsset}
            preselectedVehicleId={navigation.loadAssetData?.preselectedVehicleId}
            onAssetsLoaded={navigation.loadAssetData?.onAssetsLoaded}
          />
        );
      
      case "check-in-out":
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
          <Dashboard onViewChange={navigation.handleViewChange} onNavigateToAlerts={navigation.navigateToAlerts} />
        );
      
      case "report-issue":
        return navigation.issueData ? (
          <CreateIssue
            onBack={navigation.handleBackFromReportIssue}
            assetId={navigation.issueData.assetId}
            assetName={navigation.issueData.assetName}
            assetContext={navigation.issueData.assetContext}
            onCreateIssue={issueManagement.createIssue}
          />
        ) : (
          <Dashboard onViewChange={navigation.handleViewChange} onNavigateToAlerts={navigation.navigateToAlerts} />
        );
      
      case "issue-tracking":
        return (
          <IssueTracking
            issues={issueManagement.issues}
            onUpdateIssue={issueManagement.updateIssue}
            onUpdateStatus={issueManagement.updateIssueStatus}
            onDeleteIssue={issueManagement.deleteIssue}
          />
        );
      
      default:
        return <Dashboard onViewChange={navigation.handleViewChange} onNavigateToAlerts={navigation.navigateToAlerts} />;
    }
  };

  return (
    <>
      <AppSidebar 
        currentView={navigation.currentView} 
        onViewChange={navigation.handleViewChange}
        onAlertTypeClick={navigation.handleAlertTypeClick}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        {renderView()}
      </main>
    </>
  );
}

export default function App() {
  useEffect(() => {
    initializeErrorHandlers();
  }, []);

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <NavigationProvider>
          <div className="flex min-h-screen w-full">
            <AppContent />
          </div>
          <Toaster />
        </NavigationProvider>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
