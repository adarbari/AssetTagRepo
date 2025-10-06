import React, { createContext, useContext, useState, ReactNode } from &apos;react&apos;;
import type { ViewType } from &apos;../App&apos;;
import type { Asset, Site, Alert } from &apos;../types&apos;;
import type { AlertFilter } from &apos;../components/alerts/Alerts&apos;;

interface GeofenceCreationData {
  siteId?: string;
  siteName?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  tolerance?: number;
  name?: string;
  alertOnEntry?: boolean;
  alertOnExit?: boolean;
}

interface NavigationState {
  view: ViewType;
  asset?: Asset | null;
  site?: Site | null;
  highlightAsset?: Asset | null;
  historicalPlaybackAsset?: Asset | null;
  alertFilter?: AlertFilter;
  geofenceData?: GeofenceCreationData;
  siteActiveTab?: string;
  filteredAssetIds?: string[];
  geofenceViolationMode?: boolean;
  violatingGeofenceId?: string;
  expectedAssetIds?: string[];
  actualAssetIds?: string[];
  selectedAlertForWorkflow?: Alert | null;
}

interface MaintenanceCreationData {
  preSelectedAsset?: string;
  preSelectedAssetName?: string;
  assetContext?: Asset;
}

interface MaintenanceEditData {
  maintenanceId: string;
  fromContext?: &apos;predictive-alert&apos; | &apos;maintenance-list&apos; | &apos;asset-details&apos;;
  sourceAssetContext?: Asset;
}

interface JobCreationData {
  onCreateJob?: (
    input: any
  ) => Promise<{ success: boolean; job?: any; error?: any }>;
}

interface JobEditData {
  jobId: string;
  job: any;
}

interface JobDetailsData {
  job: any;
}

interface AssetCreationData {
  onAssetCreated?: (asset: any) => void;
}

interface LoadAssetData {
  preselectedVehicleId?: string;
  onAssetsLoaded?: (data: { vehicleId: string; assetIds: string[] }) => void;
}

interface CheckInOutData {
  assetId: string;
  assetName: string;
  currentStatus: Asset[&apos;status&apos;];
  mode: &apos;check-in&apos; | &apos;check-out&apos;;
  assetContext?: Asset;
  onComplete?: (updates: Partial<Asset>) => void;
}

interface IssueData {
  assetId: string;
  assetName: string;
  assetContext?: Asset;
}

interface VehicleEditData {
  vehicleId: string;
  onVehicleUpdated?: (vehicle: any) => void;
}

interface NavigationContextType {
  // Current navigation state
  currentView: ViewType;
  selectedAsset: Asset | null;
  selectedSite: Site | null;
  highlightAsset: Asset | null;
  historicalPlaybackAsset: Asset | null;
  alertFilter: AlertFilter | undefined;
  geofenceCreationData: GeofenceCreationData | undefined;
  maintenanceCreationData: MaintenanceCreationData | undefined;
  maintenanceEditData: MaintenanceEditData | undefined;
  jobCreationData: JobCreationData | undefined;
  jobEditData: JobEditData | undefined;
  jobDetailsData: JobDetailsData | undefined;
  assetCreationData: AssetCreationData | undefined;
  loadAssetData: LoadAssetData | undefined;
  checkInOutData: CheckInOutData | undefined;
  issueData: IssueData | undefined;
  selectedIssueId: string | undefined;
  vehicleEditData: VehicleEditData | undefined;
  siteActiveTab: string;
  isEditingGeofence: boolean;
  editingGeofenceId: string | undefined;
  filteredAssetIds: string[] | undefined;
  geofenceViolationMode: boolean;
  violatingGeofenceId: string | undefined;
  expectedAssetIds: string[] | undefined;
  actualAssetIds: string[] | undefined;
  selectedAlertForWorkflow: Alert | null;

  // Navigation functions
  handleViewChange: (view: ViewType) => void;
  navigateToAlerts: (filter?: AlertFilter) => void;
  navigateToAssetDetails: (asset: Asset) => void;
  navigateToSiteDetails: (site: Site) => void;
  navigateToCreateGeofence: (
    data?: GeofenceCreationData,
    currentTab?: string
  ) => void;
  navigateToEditGeofence: (
    geofenceId: string,
    data?: GeofenceCreationData,
    currentTab?: string
  ) => void;
  navigateToAlertWorkflow: (alert: Alert) => void;
  navigateToAlertConfiguration: () => void;
  navigateToCreateSite: () => void;
  navigateToCreateMaintenance: (data?: MaintenanceCreationData) => void;
  navigateToEditMaintenance: (data: MaintenanceEditData) => void;
  navigateToEditIssue: (issueId: string) => void;
  navigateToCreateCompliance: () => void;
  navigateToCreateVehicle: () => void;
  navigateToEditVehicle: (data: VehicleEditData) => void;
  navigateToCreateJob: (data?: JobCreationData) => void;
  navigateToEditJob: (data: JobEditData) => void;
  navigateToJobDetails: (data: JobDetailsData) => void;
  navigateToCreateAsset: (data?: AssetCreationData) => void;
  navigateToLoadAsset: (data?: LoadAssetData) => void;
  navigateToCheckInOut: (data: CheckInOutData) => void;
  navigateToReportIssue: (data: IssueData) => void;
  handleShowOnMap: (asset: Asset) => void;
  handleViewHistoricalPlayback: (asset?: Asset) => void;
  handleViewViolatingAssets: (
    geofenceId: string,
    violatingAssetIds: string[],
    expectedAssetIds: string[],
    actualAssetIds: string[]
  ) => void;
  handleAlertTypeClick: (alertType: string) => void;

  // Back navigation functions
  handleBackFromAssetDetails: () => void;
  handleBackFromSiteDetails: () => void;
  handleBackFromMap: () => void;
  handleBackFromHistoricalPlayback: () => void;
  handleBackFromCreateGeofence: () => void;
  handleBackFromViolationMap: () => void;
  handleBackFromAlertWorkflow: () => void;
  handleBackFromAlertConfiguration: () => void;
  handleBackFromCreateSite: () => void;
  handleBackFromCreateMaintenance: () => void;
  handleBackFromEditMaintenance: () => void;
  handleBackFromEditIssue: () => void;
  handleBackFromCreateCompliance: () => void;
  handleBackFromCreateVehicle: () => void;
  handleBackFromEditVehicle: () => void;
  handleBackFromCreateJob: () => void;
  handleBackFromEditJob: () => void;
  handleBackFromJobDetails: () => void;
  handleBackFromCreateAsset: () => void;
  handleBackFromLoadAsset: () => void;
  handleBackFromCheckInOut: () => void;
  handleBackFromReportIssue: () => void;

  // State setters
  setSelectedAsset: (asset: Asset | null) => void;
  setSelectedSite: (site: Site | null) => void;
  setSiteActiveTab: (tab: string) => void;
  setAlertFilter: (filter: AlertFilter | undefined) => void;
  handleClearHighlight: () => void;
  handleSiteUpdate: (site: Site) => void;
  handleGeofenceCreated: (geofenceId: string, siteId?: string) => void;
  handleGeofenceUpdated: (geofenceId: string, siteId?: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>(&apos;dashboard&apos;);
  const [navigationStack, setNavigationStack] = useState<NavigationState[]>([]);
  const [alertFilter, setAlertFilter] = useState<AlertFilter | undefined>(
    undefined
  );
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [highlightAsset, setHighlightAsset] = useState<Asset | null>(null);
  const [historicalPlaybackAsset, setHistoricalPlaybackAsset] =
    useState<Asset | null>(null);
  const [geofenceCreationData, setGeofenceCreationData] = useState<
    GeofenceCreationData | undefined
  >(undefined);
  const [maintenanceCreationData, setMaintenanceCreationData] = useState<
    MaintenanceCreationData | undefined
  >(undefined);
  const [maintenanceEditData, setMaintenanceEditData] = useState<
    MaintenanceEditData | undefined
  >(undefined);
  const [jobCreationData, setJobCreationData] = useState<
    JobCreationData | undefined
  >(undefined);
  const [jobEditData, setJobEditData] = useState<JobEditData | undefined>(
    undefined
  );
  const [jobDetailsData, setJobDetailsData] = useState<
    JobDetailsData | undefined
  >(undefined);
  const [assetCreationData, setAssetCreationData] = useState<
    AssetCreationData | undefined
  >(undefined);
  const [loadAssetData, setLoadAssetData] = useState<LoadAssetData | undefined>(
    undefined
  );
  const [checkInOutData, setCheckInOutData] = useState<
    CheckInOutData | undefined
  >(undefined);
  const [issueData, setIssueData] = useState<IssueData | undefined>(undefined);
  const [selectedIssueId, setSelectedIssueId] = useState<string | undefined>(
    undefined
  );
  const [vehicleEditData, setVehicleEditData] = useState<
    VehicleEditData | undefined
  >(undefined);
  const [siteActiveTab, setSiteActiveTab] = useState<string>(&apos;overview&apos;);
  const [isEditingGeofence, setIsEditingGeofence] = useState(false);
  const [editingGeofenceId, setEditingGeofenceId] = useState<
    string | undefined
  >(undefined);
  const [filteredAssetIds, setFilteredAssetIds] = useState<
    string[] | undefined
  >(undefined);
  const [geofenceViolationMode, setGeofenceViolationMode] = useState(false);
  const [violatingGeofenceId, setViolatingGeofenceId] = useState<
    string | undefined
  >(undefined);
  const [expectedAssetIds, setExpectedAssetIds] = useState<
    string[] | undefined
  >(undefined);
  const [actualAssetIds, setActualAssetIds] = useState<string[] | undefined>(
    undefined
  );
  const [selectedAlertForWorkflow, setSelectedAlertForWorkflow] =
    useState<Alert | null>(null);

  const pushNavigationState = () => {
// // // // // // // console.log(&apos;📚 Pushing navigation state, current view:&apos;, currentView);
    setNavigationStack(prev => {
      const newStack = [
        ...prev,
        {
          view: currentView,
          asset: selectedAsset,
          site: selectedSite,
          highlightAsset: highlightAsset,
          historicalPlaybackAsset: historicalPlaybackAsset,
          alertFilter: alertFilter,
          geofenceData: geofenceCreationData,
          siteActiveTab: siteActiveTab,
          filteredAssetIds: filteredAssetIds,
          geofenceViolationMode: geofenceViolationMode,
          violatingGeofenceId: violatingGeofenceId,
          expectedAssetIds: expectedAssetIds,
          actualAssetIds: actualAssetIds,
          selectedAlertForWorkflow: selectedAlertForWorkflow,
        },
      ];
// // // // // // // console.log(
        &apos;📚 Navigation stack after push:&apos;,
        newStack.map(s => s.view)
      );
      return newStack;
    });
  };

  const popNavigationState = () => {
// // // // // // // console.log(
      &apos;📚 Popping navigation state, current stack:&apos;,
      navigationStack.map(s => s.view)
    );
    if (navigationStack.length === 0) {
// // // // // // // console.log(&apos;📚 Navigation stack is empty, going to dashboard&apos;);
      handleViewChange(&apos;dashboard&apos;);
      return;
    }

    const previousState = navigationStack[navigationStack.length - 1];
// // // // // // // console.log(&apos;📚 Restoring previous state:&apos;, previousState.view);
    setNavigationStack(prev => prev.slice(0, -1));

    setCurrentView(previousState.view);
    setSelectedAsset(previousState.asset || null);
    setSelectedSite(previousState.site || null);
    setHighlightAsset(previousState.highlightAsset || null);
    setHistoricalPlaybackAsset(previousState.historicalPlaybackAsset || null);
    setAlertFilter(previousState.alertFilter);
    setGeofenceCreationData(previousState.geofenceData);
    setSiteActiveTab(previousState.siteActiveTab || &apos;overview&apos;);
    setFilteredAssetIds(previousState.filteredAssetIds);
    setGeofenceViolationMode(previousState.geofenceViolationMode || false);
    setViolatingGeofenceId(previousState.violatingGeofenceId);
    setExpectedAssetIds(previousState.expectedAssetIds);
    setActualAssetIds(previousState.actualAssetIds);
    setSelectedAlertForWorkflow(previousState.selectedAlertForWorkflow || null);
  };

  const handleViewChange = (view: ViewType) => {
    if (view === &apos;alert-configuration&apos;) {
      navigateToAlertConfiguration();
      return;
    }

    if (view !== &apos;map&apos;) {
      setHighlightAsset(null);
      setFilteredAssetIds(undefined);
      setExpectedAssetIds(undefined);
      setActualAssetIds(undefined);
      setGeofenceViolationMode(false);
      setViolatingGeofenceId(undefined);
    }
    setCurrentView(view);
  };

  const navigateToAlerts = (filter?: AlertFilter) => {
    setAlertFilter(filter);
    handleViewChange(&apos;alerts&apos;);
  };

  const handleAlertTypeClick = (alertType: string) => {
    setAlertFilter({
      category: alertType,
      status: &apos;active&apos;,
    });
    handleViewChange(&apos;alerts&apos;);
  };

  const navigateToAssetDetails = (asset: Asset) => {
    pushNavigationState();
    setSelectedAsset(asset);
    handleViewChange(&apos;asset-details&apos;);
  };

  const handleBackFromAssetDetails = () => {
    popNavigationState();
  };

  const navigateToSiteDetails = (site: Site) => {
    pushNavigationState();
    setSelectedSite(site);
    handleViewChange(&apos;site-details&apos;);
  };

  const handleBackFromSiteDetails = () => {
    popNavigationState();
  };

  const handleSiteUpdate = (updatedSite: Site) => {
    setSelectedSite(updatedSite);

    import(&apos;../data/mockData&apos;).then(({ updateSite }) => {
      updateSite(updatedSite.id, updatedSite);
    });
  };

  const handleShowOnMap = (asset: Asset) => {
    pushNavigationState();
    setHighlightAsset(asset);
    setFilteredAssetIds([asset.id]); // Show only this asset on the map
    setCurrentView(&apos;map&apos;);
  };

  const handleBackFromMap = () => {
    popNavigationState();
  };

  const handleClearHighlight = () => {
    setHighlightAsset(null);
  };

  const handleViewHistoricalPlayback = (asset?: Asset) => {
    pushNavigationState();
    setHistoricalPlaybackAsset(asset || null);
    setCurrentView(&apos;historical-playback&apos;);
  };

  const handleBackFromHistoricalPlayback = () => {
    popNavigationState();
  };

  const navigateToCreateGeofence = (
    data?: GeofenceCreationData,
    currentTab?: string
  ) => {
    pushNavigationState();
    setGeofenceCreationData(data);
    setIsEditingGeofence(false);
    setEditingGeofenceId(undefined);
    if (currentTab) {
      setSiteActiveTab(currentTab);
    }
    setCurrentView(&apos;create-geofence&apos;);
  };

  const navigateToEditGeofence = (
    geofenceId: string,
    data?: GeofenceCreationData,
    currentTab?: string
  ) => {
    pushNavigationState();

    if (!data) {
      import(&apos;../data/mockData&apos;).then(({ getGeofenceById }) => {
        const geofence = getGeofenceById(geofenceId);
        if (geofence) {
          const geofenceData: GeofenceCreationData = {
            name: geofence.name,
            latitude: geofence.center?.[0],
            longitude: geofence.center?.[1],
            radius: geofence.radius,
            tolerance: geofence.tolerance,
            alertOnEntry: geofence.alertOnEntry,
            alertOnExit: geofence.alertOnExit,
            siteId: geofence.siteId,
          };
          setGeofenceCreationData(geofenceData);
        }
      });
    } else {
      setGeofenceCreationData(data);
    }

    setIsEditingGeofence(true);
    setEditingGeofenceId(geofenceId);
    if (currentTab) {
      setSiteActiveTab(currentTab);
    }
    setCurrentView(&apos;create-geofence&apos;);
  };

  const handleBackFromCreateGeofence = () => {
    setIsEditingGeofence(false);
    setEditingGeofenceId(undefined);
    popNavigationState();
  };

  const handleGeofenceCreated = (geofenceId: string, siteId?: string) => {
    if (siteId) {
      import(&apos;../data/mockData&apos;).then(({ updateSite, getSiteById }) => {
        const site = getSiteById(siteId);
        if (site) {
          const updatedSite = updateSite(siteId, { geofenceId });

          if (selectedSite && selectedSite.id === siteId) {
            setSelectedSite(updatedSite);
          }
        }
      });
    }
  };

  const handleGeofenceUpdated = (geofenceId: string, siteId?: string) => {
    if (siteId && selectedSite && selectedSite.id === siteId) {
      import(&apos;../data/mockData&apos;).then(({ getSiteById }) => {
        const site = getSiteById(siteId);
        if (site) {
          setSelectedSite(site);
        }
      });
    }
  };

  const handleViewViolatingAssets = (
    geofenceId: string,
    violatingAssetIds: string[],
    expectedAssetIds: string[],
    actualAssetIds: string[]
  ) => {
    pushNavigationState();
    setFilteredAssetIds(violatingAssetIds);
    setExpectedAssetIds(expectedAssetIds);
    setActualAssetIds(actualAssetIds);
    setGeofenceViolationMode(true);
    setViolatingGeofenceId(geofenceId);
    setCurrentView(&apos;map&apos;);
  };

  const handleBackFromViolationMap = () => {
    setFilteredAssetIds(undefined);
    setExpectedAssetIds(undefined);
    setActualAssetIds(undefined);
    setGeofenceViolationMode(false);
    setViolatingGeofenceId(undefined);
    popNavigationState();
  };

  const navigateToAlertWorkflow = (alert: Alert) => {
    pushNavigationState();
    setSelectedAlertForWorkflow(alert);
    setCurrentView(&apos;alert-workflow&apos;);
  };

  const handleBackFromAlertWorkflow = () => {
    setSelectedAlertForWorkflow(null);
    popNavigationState();
  };

  const navigateToAlertConfiguration = () => {
    pushNavigationState();
    setCurrentView(&apos;alert-configuration&apos;);
  };

  const handleBackFromAlertConfiguration = () => {
    popNavigationState();
  };

  const navigateToCreateSite = () => {
    pushNavigationState();
    setCurrentView(&apos;create-site&apos;);
  };

  const handleBackFromCreateSite = () => {
    popNavigationState();
  };

  const navigateToCreateMaintenance = (data?: MaintenanceCreationData) => {
// // // // // // // console.log(&apos;🚀 navigateToCreateMaintenance called with:&apos;, data);
    pushNavigationState();
    setMaintenanceCreationData(data);
    setCurrentView(&apos;create-maintenance&apos;);
// // // // // // // console.log(&apos;✅ Navigation state updated to create-maintenance&apos;);
  };

  const handleBackFromCreateMaintenance = () => {
    setMaintenanceCreationData(undefined);
    popNavigationState();
  };

  const navigateToEditMaintenance = (data: MaintenanceEditData) => {
    pushNavigationState();
    setMaintenanceEditData(data);
    setCurrentView(&apos;edit-maintenance&apos;);
  };

  const handleBackFromEditMaintenance = () => {
    setMaintenanceEditData(undefined);
    popNavigationState();
  };

  const navigateToEditIssue = (issueId: string) => {
    pushNavigationState();
    setSelectedIssueId(issueId);
    setCurrentView(&apos;issue-details&apos;);
  };

  const handleBackFromEditIssue = () => {
    setSelectedIssueId(undefined);
    popNavigationState();
  };

  const navigateToCreateCompliance = () => {
    pushNavigationState();
    setCurrentView(&apos;create-compliance&apos;);
  };

  const handleBackFromCreateCompliance = () => {
    popNavigationState();
  };

  const navigateToCreateVehicle = () => {
    pushNavigationState();
    setCurrentView(&apos;create-vehicle&apos;);
  };

  const handleBackFromCreateVehicle = () => {
    popNavigationState();
  };

  const navigateToEditVehicle = (data: VehicleEditData) => {
    pushNavigationState();
    setVehicleEditData(data);
    setCurrentView(&apos;edit-vehicle&apos;);
  };

  const handleBackFromEditVehicle = () => {
    setVehicleEditData(undefined);
    popNavigationState();
  };

  const navigateToCreateJob = (data?: JobCreationData) => {
    pushNavigationState();
    setJobCreationData(data);
    setCurrentView(&apos;create-job&apos;);
  };

  const handleBackFromCreateJob = () => {
    setJobCreationData(undefined);
    popNavigationState();
  };

  const navigateToEditJob = (data: JobEditData) => {
    pushNavigationState();
    setJobEditData(data);
    setCurrentView(&apos;edit-job&apos;);
  };

  const handleBackFromEditJob = () => {
    setJobEditData(undefined);
    popNavigationState();
  };

  const navigateToJobDetails = (data: JobDetailsData) => {
    pushNavigationState();
    setJobDetailsData(data);
    setCurrentView(&apos;job-details&apos;);
  };

  const handleBackFromJobDetails = () => {
    setJobDetailsData(undefined);
    popNavigationState();
  };

  const navigateToCreateAsset = (data?: AssetCreationData) => {
    pushNavigationState();
    setAssetCreationData(data);
    setCurrentView(&apos;create-asset&apos;);
  };

  const handleBackFromCreateAsset = () => {
    setAssetCreationData(undefined);
    popNavigationState();
  };

  const navigateToLoadAsset = (data?: LoadAssetData) => {
    pushNavigationState();
    setLoadAssetData(data);
    setCurrentView(&apos;load-asset&apos;);
  };

  const handleBackFromLoadAsset = () => {
    setLoadAssetData(undefined);
    popNavigationState();
  };

  const navigateToCheckInOut = (data: CheckInOutData) => {
// // // // // // // console.log(&apos;🚀 navigateToCheckInOut called with:&apos;, data);
    pushNavigationState();
    setCheckInOutData(data);
    setCurrentView(&apos;check-in-out&apos;);
// // // // // // // console.log(&apos;✅ Navigation state updated to check-in-out&apos;);
  };

  const handleBackFromCheckInOut = () => {
    setCheckInOutData(undefined);
    popNavigationState();
  };

  const navigateToReportIssue = (data: IssueData) => {
    pushNavigationState();
    setIssueData(data);
    setCurrentView(&apos;report-issue&apos;);
  };

  const handleBackFromReportIssue = () => {
    setIssueData(undefined);
    popNavigationState();
  };

  const value: NavigationContextType = {
    currentView,
    selectedAsset,
    selectedSite,
    highlightAsset,
    historicalPlaybackAsset,
    alertFilter,
    geofenceCreationData,
    maintenanceCreationData,
    maintenanceEditData,
    jobCreationData,
    jobEditData,
    jobDetailsData,
    assetCreationData,
    loadAssetData,
    checkInOutData,
    issueData,
    selectedIssueId,
    vehicleEditData,
    siteActiveTab,
    isEditingGeofence,
    editingGeofenceId,
    filteredAssetIds,
    geofenceViolationMode,
    violatingGeofenceId,
    expectedAssetIds,
    actualAssetIds,
    selectedAlertForWorkflow,

    handleViewChange,
    navigateToAlerts,
    navigateToAssetDetails,
    navigateToSiteDetails,
    navigateToCreateGeofence,
    navigateToEditGeofence,
    navigateToAlertWorkflow,
    navigateToAlertConfiguration,
    navigateToCreateSite,
    navigateToCreateMaintenance,
    navigateToEditMaintenance,
    navigateToEditIssue,
    navigateToCreateCompliance,
    navigateToCreateVehicle,
    navigateToEditVehicle,
    navigateToCreateJob,
    navigateToEditJob,
    navigateToJobDetails,
    navigateToCreateAsset,
    navigateToLoadAsset,
    navigateToCheckInOut,
    navigateToReportIssue,
    handleShowOnMap,
    handleViewHistoricalPlayback,
    handleViewViolatingAssets,
    handleAlertTypeClick,

    handleBackFromAssetDetails,
    handleBackFromSiteDetails,
    handleBackFromMap,
    handleBackFromHistoricalPlayback,
    handleBackFromCreateGeofence,
    handleBackFromViolationMap,
    handleBackFromAlertWorkflow,
    handleBackFromAlertConfiguration,
    handleBackFromCreateSite,
    handleBackFromCreateMaintenance,
    handleBackFromEditMaintenance,
    handleBackFromEditIssue,
    handleBackFromCreateCompliance,
    handleBackFromCreateVehicle,
    handleBackFromEditVehicle,
    handleBackFromCreateJob,
    handleBackFromEditJob,
    handleBackFromJobDetails,
    handleBackFromCreateAsset,
    handleBackFromLoadAsset,
    handleBackFromCheckInOut,
    handleBackFromReportIssue,

    setSelectedAsset,
    setSelectedSite,
    setSiteActiveTab,
    setAlertFilter,
    handleClearHighlight,
    handleSiteUpdate,
    handleGeofenceCreated,
    handleGeofenceUpdated,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error(&apos;useNavigation must be used within a NavigationProvider&apos;);
  }
  return context;
};
