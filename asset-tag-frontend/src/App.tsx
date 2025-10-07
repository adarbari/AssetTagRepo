import { useState, useRef } from 'react';
import { AppSidebar } from './components/AppSidebar';
import { SidebarProvider, SidebarInset } from './components/ui/sidebar';
import { Button } from './components/ui/button';
import { Dashboard } from './components/dashboard/Dashboard';
import { AssetInventory } from './components/assets/AssetInventory';
import { UnifiedAssetMap } from './components/map/UnifiedAssetMap';
import { AssetDetails } from './components/assets/AssetDetails';
import { CreateAsset } from './components/assets/CreateAsset';
import { CreateCheckInOut } from './components/check-in-out/CreateCheckInOut';
import { CreateMaintenance } from './components/maintenance/CreateMaintenance';
import { EditMaintenance } from './components/maintenance/EditMaintenance';
import { CreateIssue } from './components/issues/CreateIssue';
import { EditIssue } from './components/issues/EditIssue';
import { IssueDetails } from './components/issues/IssueDetails';
import { JobManagement } from './components/job/JobManagement';
import { JobDetails } from './components/job/JobDetails';
import { CreateJob } from './components/job/CreateJob';
import { EditJob } from './components/job/EditJob';
import { useJobManagement } from './hooks/useJobManagement';
import { Maintenance } from './components/maintenance/Maintenance';
import { IssueTracking } from './components/issues/IssueTracking';
import {
  mockIssues,
  updateIssue,
  updateIssueStatus,
  deleteIssue,
} from './data/mockIssueData';
import { ComplianceTracking } from './components/compliance/ComplianceTracking';
import { CreateCompliance } from './components/compliance/CreateCompliance';
import { Geofences } from './components/geofences/Geofences';
import { Reports } from './components/reports/Reports';
import { Settings } from './components/settings/Settings';
import { Alerts, AlertsRef } from './components/alerts/Alerts';
import { AlertWorkflow } from './components/alerts/AlertWorkflow';
import { HierarchicalAlertConfiguration } from './components/alerts/HierarchicalAlertConfiguration';
import { NotificationPreferencesNew } from './components/notifications/NotificationPreferencesNew';
import {
  NavigationProvider,
  useNavigation,
} from './contexts/NavigationContext';
import { Toaster } from './components/ui/sonner';
import { Sites } from './components/sites/Sites';
import { SiteDetails } from './components/sites/SiteDetails';
import { CreateSite } from './components/sites/CreateSite';
import { CreateGeofence } from './components/geofences/CreateGeofence';
import { VehicleAssetPairing } from './components/vehicles/VehicleAssetPairing';
import { CreateVehicle } from './components/vehicles/CreateVehicle';
import { EditVehicle } from './components/vehicles/EditVehicle';
import { AlertFilter } from './components/alerts/Alerts';
import type { Asset, Job } from './types';

export type ViewType =
  | 'dashboard'
  | 'inventory'
  | 'map'
  | 'asset-details'
  | 'site-details'
  | 'sites'
  | 'vehicle-pairing'
  | 'jobs'
  | 'job-details'
  | 'maintenance'
  | 'issues'
  | 'compliance'
  | 'geofences'
  | 'reports'
  | 'settings'
  | 'alerts'
  | 'alert-configuration'
  | 'notifications'
  | 'create-asset'
  | 'check-in-out'
  | 'create-maintenance'
  | 'report-issue'
  | 'historical-playback'
  | 'create-geofence'
  | 'create-site'
  | 'create-compliance'
  | 'create-vehicle'
  | 'edit-vehicle'
  | 'create-job'
  | 'edit-job'
  | 'edit-maintenance'
  | 'edit-issue'
  | 'issue-details'
  | 'alert-workflow'
  | 'violation-map'
  | 'load-asset';

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
  //   navigation.handleViewChange('map');
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
    navigation.handleViewChange('dashboard');
    setSelectedAsset(null);
  };

  const handleNavigateToAlerts = (filter?: AlertFilter) => {
    if (filter) {
      navigation.navigateToAlerts(filter);
    } else {
      navigation.handleViewChange('alerts');
    }
  };

  const handleAlertTypeClick = (alertType: string) => {
    navigation.handleAlertTypeClick(alertType);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            onViewChange={handleViewChange}
            onNavigateToAlerts={handleNavigateToAlerts}
          />
        );
      case 'inventory':
        return (
          <AssetInventory
            onAssetClick={handleAssetClick}
            onNavigateToCreateAsset={() =>
              navigation.handleViewChange('create-asset')
            }
          />
        );
      case 'map':
        return (
          <UnifiedAssetMap
            onAssetClick={handleAssetClick}
            onTrackHistory={handleTrackHistory}
            highlightAsset={navigation.highlightAsset}
            onClearHighlight={handleClearHighlight}
            onBack={handleBackToDashboard}
          />
        );
      case 'asset-details':
        return selectedAsset ? (
          <AssetDetails
            asset={selectedAsset}
            onBack={navigation.handleBackFromAssetDetails}
            onShowOnMap={handleShowOnMap}
            onViewHistoricalPlayback={handleTrackHistory}
            onAssetUpdate={handleAssetUpdate}
          />
        ) : null;
      case 'sites':
        return (
          <Sites onSiteClick={site => navigation.navigateToSiteDetails(site)} />
        );
      case 'site-details':
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
          <div className='p-6'>
            <p>No site selected</p>
            <Button onClick={() => navigation.handleViewChange('sites')}>
              Back to Sites
            </Button>
          </div>
        );
      case 'create-site':
        return <CreateSite onBack={navigation.handleBackFromCreateSite} />;
      case 'create-geofence':
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
      case 'vehicle-pairing':
        return (
          <VehicleAssetPairing
            onBack={() => navigation.handleViewChange('dashboard')}
          />
        );
      case 'create-vehicle':
        return (
          <CreateVehicle
            onBack={() => navigation.handleViewChange('vehicle-pairing')}
            onVehicleCreated={_vehicle => {
              // Handle vehicle creation success
              navigation.handleViewChange('vehicle-pairing');
            }}
          />
        );
      case 'edit-vehicle':
        return navigation.vehicleEditData ? (
          <EditVehicle
            vehicleId={navigation.vehicleEditData.vehicleId}
            onBack={navigation.handleBackFromEditVehicle}
            onVehicleUpdated={navigation.vehicleEditData.onVehicleUpdated}
          />
        ) : (
          <div className='p-8'>
            <h2>Edit Vehicle</h2>
            <p>No vehicle selected for editing</p>
            <Button
              onClick={() => navigation.handleViewChange('vehicle-pairing')}
            >
              Back to Vehicle Pairing
            </Button>
          </div>
        );
      case 'jobs':
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
              navigation.handleViewChange('create-job')
            }
            onNavigateToJobDetails={job => {
              setSelectedJob(job);
              navigation.navigateToJobDetails({ job });
            }}
          />
        );
      case 'create-job':
        return (
          <CreateJob
            onBack={() => navigation.handleViewChange('jobs')}
            onCreateJob={jobManagement.createJob}
          />
        );
      case 'edit-job':
        return selectedJob ? (
          <EditJob
            jobId={selectedJob.id}
            job={selectedJob}
            onBack={() => navigation.handleViewChange('job-details')}
            onUpdateJob={jobManagement.updateJob}
            onAddAssetToJob={jobManagement.addAssetToJob}
            onRemoveAssetFromJob={jobManagement.removeAssetFromJob}
          />
        ) : (
          <div className='p-6'>
            <p>No job selected for editing</p>
            <Button onClick={() => navigation.handleViewChange('jobs')}>
              Back to Jobs
            </Button>
          </div>
        );
      case 'job-details':
        return selectedJob ? (
          <JobDetails
            job={selectedJob}
            onBack={() => navigation.handleViewChange('jobs')}
            onEdit={job => {
              setSelectedJob(job);
              navigation.handleViewChange('edit-job');
            }}
          />
        ) : (
          <div className='p-6'>
            <p>No job selected</p>
            <Button onClick={() => navigation.handleViewChange('jobs')}>
              Back to Jobs
            </Button>
          </div>
        );
      case 'maintenance':
        return <Maintenance onAssetClick={handleAssetClick} />;
      case 'issues':
        return (
          <IssueTracking
            issues={mockIssues}
            onUpdateIssue={async (issueId, input) => {
              try {
                const updatedIssue = updateIssue(issueId, input);
                if (updatedIssue) {
                  return { success: true, issue: updatedIssue };
                } else {
                  return { success: false, error: 'Issue not found' };
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
                  return { success: false, error: 'Issue not found' };
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
      case 'compliance':
        return <ComplianceTracking />;
      case 'create-compliance':
        return (
          <CreateCompliance
            onBack={navigation.handleBackFromCreateCompliance}
          />
        );
      case 'geofences':
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
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'alerts':
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
              navigation.handleViewChange('alert-configuration');
            }}
          />
        );
      case 'alert-configuration':
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
            onBack={() => navigation.handleViewChange('dashboard')}
          />
        );
      case 'notifications':
        return (
          <NotificationPreferencesNew
            onBack={() => navigation.handleViewChange('dashboard')}
            preselectedLevel='user'
            preselectedEntityId='current-user'
            preselectedEntityName='Your Account'
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
                level: level as 'user' | 'site' | 'asset' | 'job',
                entityId,
                entityName:
                  entityId === 'current-user' ? 'Your Account' : entityId,
                channels: {
                  email: {
                    enabled: true,
                    addresses: ['user@example.com'],
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
                    'theft',
                    'battery',
                    'compliance',
                    'offline',
                    'unauthorized-zone',
                    'underutilized',
                    'predictive-maintenance',
                  ],
                  severities: ['low', 'medium', 'high', 'critical'],
                },
                quietHours: {
                  enabled: false,
                  start: '22:00',
                  end: '08:00',
                  timezone: 'America/New_York',
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
      case 'create-asset':
        return (
          <CreateAsset
            onBack={() => navigation.handleViewChange('inventory')}
            onAssetCreated={_asset => {
              // Handle asset creation success
              navigation.handleViewChange('inventory');
            }}
          />
        );
      case 'check-in-out':
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
          <div className='p-8'>
            <h2>Check In/Out</h2>
            <p>No check-in/out data available</p>
            <button
              onClick={() => navigation.handleViewChange('asset-details')}
            >
              Back
            </button>
          </div>
        );
      case 'create-maintenance':
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
      case 'edit-maintenance':
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
          <div className='p-8'>
            <h2>Edit Maintenance</h2>
            <p>No maintenance edit data available</p>
            <Button onClick={() => navigation.handleViewChange('maintenance')}>
              Back to Maintenance
            </Button>
          </div>
        );
      case 'edit-issue':
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
                  return { success: false, error: 'Issue not found' };
                }
              } catch (error) {
                return { success: false, error: error };
              }
            }}
          />
        ) : (
          <div className='p-8'>
            <h2>Edit Issue</h2>
            <p>No issue selected</p>
            <Button onClick={() => navigation.handleViewChange('issues')}>
              Back to Issues
            </Button>
          </div>
        );
      case 'issue-details':
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
                  return { success: false, error: 'Issue not found' };
                }
              } catch (error) {
                return { success: false, error: error };
              }
            }}
          />
        ) : (
          <div className='p-8'>
            <h2>Issue Details</h2>
            <p>No issue selected</p>
            <Button onClick={() => navigation.handleViewChange('issues')}>
              Back to Issues
            </Button>
          </div>
        );
      case 'report-issue':
        return navigation.issueData ? (
          <CreateIssue
            onBack={() => navigation.handleViewChange('asset-details')}
            assetId={navigation.issueData.assetId}
            assetName={navigation.issueData.assetName}
            assetContext={navigation.issueData.assetContext}
            onCreateIssue={async issueInput => {
              // TODO: Backend integration - create issue
              return {
                success: true,
                issue: { id: 'ISSUE-001', ...issueInput },
              };
            }}
          />
        ) : null;
      case 'alert-workflow':
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
          <div className='p-8'>
            <h2>Alert Workflow</h2>
            <p>No alert selected for workflow</p>
            <Button onClick={() => navigation.handleViewChange('alerts')}>
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
      <AppSidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        onAlertTypeClick={handleAlertTypeClick}
      />
      <SidebarInset>
        {renderCurrentView()}
      </SidebarInset>
      <Toaster />
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
