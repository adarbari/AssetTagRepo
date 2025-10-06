import React from &apos;react&apos;;
import { useState, useRef } from &apos;react&apos;;
import { AppSidebar } from &apos;./components/AppSidebar&apos;;
import { SidebarProvider } from &apos;./components/ui/sidebar&apos;;
import { Button } from &apos;./components/ui/button&apos;;
import { Dashboard } from &apos;./components/dashboard/Dashboard&apos;;
import { AssetInventory } from &apos;./components/assets/AssetInventory&apos;;
import { AssetMap } from &apos;./components/map/AssetMap&apos;;
import { AssetDetails } from &apos;./components/assets/AssetDetails&apos;;
import { CreateAsset } from &apos;./components/assets/CreateAsset&apos;;
import { CreateCheckInOut } from &apos;./components/check-in-out/CreateCheckInOut&apos;;
import { CreateMaintenance } from &apos;./components/maintenance/CreateMaintenance&apos;;
import { EditMaintenance } from &apos;./components/maintenance/EditMaintenance&apos;;
import { CreateIssue } from &apos;./components/issues/CreateIssue&apos;;
import { EditIssue } from &apos;./components/issues/EditIssue&apos;;
import { IssueDetails } from &apos;./components/issues/IssueDetails&apos;;
import { JobManagement } from &apos;./components/job/JobManagement&apos;;
import { JobDetails } from &apos;./components/job/JobDetails&apos;;
import { CreateJob } from &apos;./components/job/CreateJob&apos;;
import { EditJob } from &apos;./components/job/EditJob&apos;;
import { useJobManagement } from &apos;./hooks/useJobManagement&apos;;
import { Maintenance } from &apos;./components/maintenance/Maintenance&apos;;
import { IssueTracking } from &apos;./components/issues/IssueTracking&apos;;
import {
  mockIssues,
  updateIssue,
  updateIssueStatus,
  deleteIssue,
} from &apos;./data/mockIssueData&apos;;
import { ComplianceTracking } from &apos;./components/compliance/ComplianceTracking&apos;;
import { CreateCompliance } from &apos;./components/compliance/CreateCompliance&apos;;
import { Geofences } from &apos;./components/geofences/Geofences&apos;;
import { Reports } from &apos;./components/reports/Reports&apos;;
import { Settings } from &apos;./components/settings/Settings&apos;;
import { Alerts, AlertsRef } from &apos;./components/alerts/Alerts&apos;;
import { AlertWorkflow } from &apos;./components/alerts/AlertWorkflow&apos;;
import { HierarchicalAlertConfiguration } from &apos;./components/alerts/HierarchicalAlertConfiguration&apos;;
import { HistoricalPlayback } from &apos;./components/map/HistoricalPlayback&apos;;
import { NotificationPreferencesNew } from &apos;./components/notifications/NotificationPreferencesNew&apos;;
import {
  NavigationProvider,
  useNavigation,
} from &apos;./contexts/NavigationContext&apos;;
import { Toaster } from &apos;./components/ui/sonner&apos;;
import { Sites } from &apos;./components/sites/Sites&apos;;
import { SiteDetails } from &apos;./components/sites/SiteDetails&apos;;
import { CreateSite } from &apos;./components/sites/CreateSite&apos;;
import { CreateGeofence } from &apos;./components/geofences/CreateGeofence&apos;;
import { VehicleAssetPairing } from &apos;./components/vehicles/VehicleAssetPairing&apos;;
import { CreateVehicle } from &apos;./components/vehicles/CreateVehicle&apos;;
import { EditVehicle } from &apos;./components/vehicles/EditVehicle&apos;;
import { AlertFilter } from &apos;./components/alerts/Alerts&apos;;
import type { Asset, Job } from &apos;./types&apos;;

export type ViewType =
  | &apos;dashboard&apos;
  | &apos;inventory&apos;
  | &apos;map&apos;
  | &apos;asset-details&apos;
  | &apos;site-details&apos;
  | &apos;sites&apos;
  | &apos;vehicle-pairing&apos;
  | &apos;jobs&apos;
  | &apos;job-details&apos;
  | &apos;maintenance&apos;
  | &apos;issues&apos;
  | &apos;compliance&apos;
  | &apos;geofences&apos;
  | &apos;reports&apos;
  | &apos;settings&apos;
  | &apos;alerts&apos;
  | &apos;alert-configuration&apos;
  | &apos;notifications&apos;
  | &apos;create-asset&apos;
  | &apos;check-in-out&apos;
  | &apos;create-maintenance&apos;
  | &apos;report-issue&apos;
  | &apos;historical-playback&apos;
  | &apos;create-geofence&apos;
  | &apos;create-site&apos;
  | &apos;create-compliance&apos;
  | &apos;create-vehicle&apos;
  | &apos;edit-vehicle&apos;
  | &apos;create-job&apos;
  | &apos;edit-job&apos;
  | &apos;edit-maintenance&apos;
  | &apos;edit-issue&apos;
  | &apos;issue-details&apos;
  | &apos;alert-workflow&apos;
  | &apos;violation-map&apos;
  | &apos;load-asset&apos;;

function AppContent() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const alertsRef = useRef<AlertsRef>(null);
  const [highlightedAsset, setHighlightedAsset] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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

  // const _handleBackToMap = () => {
  //   navigation.handleViewChange(&apos;map&apos;);
  //   setSelectedAsset(null);
  // };

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
    navigation.handleViewChange(&apos;dashboard&apos;);
    setSelectedAsset(null);
  };

  const handleNavigateToAlerts = (filter?: AlertFilter) => {
    if (filter) {
      navigation.navigateToAlerts(filter);
    } else {
      navigation.handleViewChange(&apos;alerts&apos;);
    }
  };

  const handleAlertTypeClick = (alertType: string) => {
    navigation.handleAlertTypeClick(alertType);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case &apos;dashboard&apos;:
        return (
          <Dashboard
            onViewChange={handleViewChange}
            onNavigateToAlerts={handleNavigateToAlerts}
          />
        );
      case &apos;inventory&apos;:
        return (
          <AssetInventory
            onAssetClick={handleAssetClick}
            onNavigateToCreateAsset={() =>
              navigation.handleViewChange(&apos;create-asset&apos;)
            }
          />
        );
      case &apos;map&apos;:
        return (
          <AssetMap
            onAssetClick={handleAssetClick}
            onTrackHistory={handleTrackHistory}
            highlightAsset={highlightedAsset}
            onClearHighlight={handleClearHighlight}
            onBack={handleBackToDashboard}
          />
        );
      case &apos;asset-details&apos;:
        return selectedAsset ? (
          <AssetDetails
            asset={selectedAsset}
            onBack={navigation.handleBackFromAssetDetails}
            onShowOnMap={handleShowOnMap}
            onViewHistoricalPlayback={handleTrackHistory}
            onAssetUpdate={handleAssetUpdate}
          />
        ) : null;
      case &apos;sites&apos;:
        return (
          <Sites onSiteClick={site => navigation.navigateToSiteDetails(site)} />
        );
      case &apos;site-details&apos;:
        return navigation.selectedSite ? (
          <SiteDetails
            site={navigation.selectedSite}
            onBack={navigation.handleBackFromSiteDetails}
            onCreateGeofence={(data, currentTab) =>
              navigation.navigateToCreateGeofence(data, currentTab)
            }
            onEditGeofence={(geofenceId, data, currentTab) =>
              navigation.navigateToEditGeofence(geofenceId, data, currentTab)
            }
            onSiteUpdate={navigation.handleSiteUpdate}
            initialTab={navigation.siteActiveTab}
            onTabChange={navigation.setSiteActiveTab}
          />
        ) : (
          <div className=&apos;p-6&apos;>
            <p>No site selected</p>
            <Button onClick={() => navigation.handleViewChange(&apos;sites&apos;)}>
              Back to Sites
            </Button>
          </div>
        );
      case &apos;create-site&apos;:
        return <CreateSite onBack={navigation.handleBackFromCreateSite} />;
      case &apos;create-geofence&apos;:
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
      case &apos;vehicle-pairing&apos;:
        return (
          <VehicleAssetPairing
            onBack={() => navigation.handleViewChange(&apos;dashboard&apos;)}
          />
        );
      case &apos;create-vehicle&apos;:
        return (
          <CreateVehicle
            onBack={() => navigation.handleViewChange(&apos;vehicle-pairing&apos;)}
            onVehicleCreated={_vehicle => {
              // Handle vehicle creation success
              navigation.handleViewChange(&apos;vehicle-pairing&apos;);
            }}
          />
        );
      case &apos;edit-vehicle&apos;:
        return navigation.vehicleEditData ? (
          <EditVehicle
            vehicleId={navigation.vehicleEditData.vehicleId}
            onBack={navigation.handleBackFromEditVehicle}
            onVehicleUpdated={navigation.vehicleEditData.onVehicleUpdated}
          />
        ) : (
          <div className=&apos;p-8&apos;>
            <h2>Edit Vehicle</h2>
            <p>No vehicle selected for editing</p>
            <Button
              onClick={() => navigation.handleViewChange(&apos;vehicle-pairing&apos;)}
            >
              Back to Vehicle Pairing
            </Button>
          </div>
        );
      case &apos;jobs&apos;:
        return (
          <JobManagement
            jobs={jobManagement.jobs}
            onCreateJob={jobManagement.createJob}
            onUpdateJob={jobManagement.updateJob}
            onDeleteJob={jobManagement.deleteJob}
            onAddAssetToJob={jobManagement.addAssetToJob}
            onRemoveAssetFromJob={jobManagement.removeAssetFromJob}
            jobAlerts={jobManagement.jobAlerts}
            onNavigateToCreateJob={() =>
              navigation.handleViewChange(&apos;create-job&apos;)
            }
            onNavigateToJobDetails={job => {
              setSelectedJob(job);
              navigation.navigateToJobDetails({ job });
            }}
          />
        );
      case &apos;create-job&apos;:
        return (
          <CreateJob
            onBack={() => navigation.handleViewChange(&apos;jobs&apos;)}
            onCreateJob={jobManagement.createJob}
          />
        );
      case &apos;edit-job&apos;:
        return selectedJob ? (
          <EditJob
            jobId={selectedJob.id}
            job={selectedJob}
            onBack={() => navigation.handleViewChange(&apos;job-details&apos;)}
            onUpdateJob={jobManagement.updateJob}
            onAddAssetToJob={jobManagement.addAssetToJob}
            onRemoveAssetFromJob={jobManagement.removeAssetFromJob}
          />
        ) : (
          <div className=&apos;p-6&apos;>
            <p>No job selected for editing</p>
            <Button onClick={() => navigation.handleViewChange(&apos;jobs&apos;)}>
              Back to Jobs
            </Button>
          </div>
        );
      case &apos;job-details&apos;:
        return selectedJob ? (
          <JobDetails
            job={selectedJob}
            onBack={() => navigation.handleViewChange(&apos;jobs&apos;)}
            onEdit={job => {
              setSelectedJob(job);
              navigation.handleViewChange(&apos;edit-job&apos;);
            }}
          />
        ) : (
          <div className=&apos;p-6&apos;>
            <p>No job selected</p>
            <Button onClick={() => navigation.handleViewChange(&apos;jobs&apos;)}>
              Back to Jobs
            </Button>
          </div>
        );
      case &apos;maintenance&apos;:
        return <Maintenance onAssetClick={handleAssetClick} />;
      case &apos;issues&apos;:
        return (
          <IssueTracking
            issues={mockIssues}
            onUpdateIssue={async (issueId, input) => {
              try {
                const updatedIssue = updateIssue(issueId, input);
                if (updatedIssue) {
                  return { success: true, issue: updatedIssue };
                } else {
                  return { success: false, error: &apos;Issue not found&apos; };
                }
              } catch (error) {
                return { success: false, error: error };
              }
            }}
            onUpdateStatus={async (issueId, status) => {
              try {
                const updatedIssue = updateIssueStatus(issueId, status);
                if (updatedIssue) {
                  return { success: true };
                } else {
                  return { success: false, error: &apos;Issue not found&apos; };
                }
              } catch (error) {
                return { success: false, error: error };
              }
            }}
            onDeleteIssue={async issueId => {
              try {
                const deleted = deleteIssue(issueId);
                return { success: deleted };
              } catch (error) {
                return { success: false, error: error };
              }
            }}
          />
        );
      case &apos;compliance&apos;:
        return <ComplianceTracking />;
      case &apos;create-compliance&apos;:
        return (
          <CreateCompliance
            onBack={navigation.handleBackFromCreateCompliance}
          />
        );
      case &apos;geofences&apos;:
        return (
          <Geofences
            onCreateGeofence={() => navigation.navigateToCreateGeofence()}
            onEditGeofence={geofenceId =>
              navigation.navigateToEditGeofence(geofenceId)
            }
            onViewViolatingAssets={(
              geofenceId,
              violatingAssetIds,
              expectedAssetIds,
              actualAssetIds
            ) => {
              navigation.handleViewViolatingAssets(
                geofenceId,
                violatingAssetIds,
                expectedAssetIds,
                actualAssetIds
              );
            }}
          />
        );
      case &apos;reports&apos;:
        return <Reports />;
      case &apos;settings&apos;:
        return <Settings />;
      case &apos;alerts&apos;:
        return (
          <Alerts
            ref={alertsRef}
            initialFilter={navigation.alertFilter}
            onTakeAction={alert => {
              // Navigate to alert workflow
              navigation.navigateToAlertWorkflow(alert);
            }}
            onNavigateToConfiguration={() => {
              // Handle navigation to alert configuration
              navigation.handleViewChange(&apos;alert-configuration&apos;);
            }}
          />
        );
      case &apos;alert-configuration&apos;:
        return (
          <HierarchicalAlertConfiguration
            alertConfigs={{}}
            jobs={{}}
            onSaveConfig={async _config => {
              // Handle saving alert configuration
              return { success: true };
            }}
            onDeleteConfig={async (_level, _entityId, _alertType) => {
              // Handle deleting alert configuration
              return { success: true };
            }}
            onBack={() => navigation.handleViewChange(&apos;dashboard&apos;)}
          />
        );
      case &apos;notifications&apos;:
        return (
          <NotificationPreferencesNew
            onBack={() => navigation.handleViewChange(&apos;dashboard&apos;)}
            preselectedLevel=&apos;user&apos;
            preselectedEntityId=&apos;current-user&apos;
            preselectedEntityName=&apos;Your Account&apos;
            notificationConfigs={{}}
            onSaveConfig={async _config => {
              // Handle saving notification configuration
              return { success: true };
            }}
            onDeleteConfig={async (_level, _entityId) => {
              // Handle deleting notification configuration
              return { success: true };
            }}
            onGetConfig={(level, entityId) => {
              // Handle getting notification configuration
              // Return a default configuration with correct structure
              return {
                id: `${level}-${entityId}`,
                level: level as string,
                entityId,
                entityName:
                  entityId === &apos;current-user&apos; ? &apos;Your Account&apos; : entityId,
                channels: {
                  email: {
                    enabled: true,
                    addresses: [&apos;user@example.com&apos;],
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
                  },
                },
                filters: {
                  types: [
                    &apos;theft&apos;,
                    &apos;battery&apos;,
                    &apos;compliance&apos;,
                    &apos;offline&apos;,
                    &apos;unauthorized-zone&apos;,
                    &apos;underutilized&apos;,
                    &apos;predictive-maintenance&apos;,
                  ],
                  severities: [&apos;low&apos;, &apos;medium&apos;, &apos;high&apos;, &apos;critical&apos;],
                },
                quietHours: {
                  enabled: false,
                  start: &apos;22:00&apos;,
                  end: &apos;08:00&apos;,
                  timezone: &apos;America/New_York&apos;,
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
      case &apos;create-asset&apos;:
        return (
          <CreateAsset
            onBack={() => navigation.handleViewChange(&apos;inventory&apos;)}
            onAssetCreated={_asset => {
              // Handle asset creation success
              navigation.handleViewChange(&apos;inventory&apos;);
            }}
          />
        );
      case &apos;check-in-out&apos;:
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
          <div className=&apos;p-8&apos;>
            <h2>Check In/Out</h2>
            <p>No check-in/out data available</p>
            <button
              onClick={() => navigation.handleViewChange(&apos;asset-details&apos;)}
            >
              Back
            </button>
          </div>
        );
      case &apos;create-maintenance&apos;:
        return (
          <CreateMaintenance
            onBack={navigation.handleBackFromCreateMaintenance}
            preSelectedAsset={
              navigation.maintenanceCreationData?.preSelectedAsset
            }
            preSelectedAssetName={
              navigation.maintenanceCreationData?.preSelectedAssetName
            }
            assetContext={navigation.maintenanceCreationData?.assetContext}
          />
        );
      case &apos;edit-maintenance&apos;:
        return navigation.maintenanceEditData ? (
          <EditMaintenance
            maintenanceId={navigation.maintenanceEditData.maintenanceId}
            onBack={navigation.handleBackFromEditMaintenance}
            fromContext={navigation.maintenanceEditData.fromContext}
            sourceAssetContext={
              navigation.maintenanceEditData.sourceAssetContext
            }
          />
        ) : (
          <div className=&apos;p-8&apos;>
            <h2>Edit Maintenance</h2>
            <p>No maintenance edit data available</p>
            <Button onClick={() => navigation.handleViewChange(&apos;maintenance&apos;)}>
              Back to Maintenance
            </Button>
          </div>
        );
      case &apos;edit-issue&apos;:
        return navigation.selectedIssueId ? (
          <EditIssue
            issueId={navigation.selectedIssueId}
            onBack={navigation.handleBackFromEditIssue}
            onUpdateIssue={async (issueId, input) => {
              try {
                const updatedIssue = updateIssue(issueId, input);
                if (updatedIssue) {
                  return { success: true, issue: updatedIssue };
                } else {
                  return { success: false, error: &apos;Issue not found&apos; };
                }
              } catch (error) {
                return { success: false, error: error };
              }
            }}
          />
        ) : (
          <div className=&apos;p-8&apos;>
            <h2>Edit Issue</h2>
            <p>No issue selected</p>
            <Button onClick={() => navigation.handleViewChange(&apos;issues&apos;)}>
              Back to Issues
            </Button>
          </div>
        );
      case &apos;issue-details&apos;:
        return navigation.selectedIssueId ? (
          <IssueDetails
            issueId={navigation.selectedIssueId}
            onBack={navigation.handleBackFromEditIssue}
            onUpdateIssue={async (issueId, input) => {
              try {
                const updatedIssue = updateIssue(issueId, input);
                if (updatedIssue) {
                  return { success: true, issue: updatedIssue };
                } else {
                  return { success: false, error: &apos;Issue not found&apos; };
                }
              } catch (error) {
                return { success: false, error: error };
              }
            }}
          />
        ) : (
          <div className=&apos;p-8&apos;>
            <h2>Issue Details</h2>
            <p>No issue selected</p>
            <Button onClick={() => navigation.handleViewChange(&apos;issues&apos;)}>
              Back to Issues
            </Button>
          </div>
        );
      case &apos;report-issue&apos;:
        return navigation.issueData ? (
          <CreateIssue
            onBack={() => navigation.handleViewChange(&apos;asset-details&apos;)}
            assetId={navigation.issueData.assetId}
            assetName={navigation.issueData.assetName}
            assetContext={navigation.issueData.assetContext}
            onCreateIssue={async issueInput => {
              // TODO: Backend integration - create issue
              return {
                success: true,
                issue: { id: &apos;ISSUE-001&apos;, ...issueInput },
              };
            }}
          />
        ) : null;
      case &apos;historical-playback&apos;:
        return (
          <HistoricalPlayback
            onBack={() => navigation.handleViewChange(&apos;asset-details&apos;)}
            preselectedAsset={selectedAsset || undefined}
          />
        );
      case &apos;alert-workflow&apos;:
        return navigation.selectedAlertForWorkflow ? (
          <AlertWorkflow
            alert={navigation.selectedAlertForWorkflow}
            onBack={navigation.handleBackFromAlertWorkflow}
            onActionComplete={async () => {
              // Refresh alerts to show updated status
              if (alertsRef.current) {
                await alertsRef.current.refresh();
              }
              // Navigate back to alerts
              navigation.handleBackFromAlertWorkflow();
            }}
          />
        ) : (
          <div className=&apos;p-8&apos;>
            <h2>Alert Workflow</h2>
            <p>No alert selected for workflow</p>
            <Button onClick={() => navigation.handleViewChange(&apos;alerts&apos;)}>
              Back to Alerts
            </Button>
          </div>
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
      <div className=&apos;flex h-screen bg-background&apos;>
        <AppSidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          onAlertTypeClick={handleAlertTypeClick}
        />
        <main className=&apos;flex-1 overflow-auto&apos;>{renderCurrentView()}</main>
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
