import React, { ReactElement } from &apos;react&apos;;
import { render, RenderOptions } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { vi } from &apos;vitest&apos;;

// Mock data for testing
export const mockIssue = {
  id: &apos;ISS-001&apos;,
  title: &apos;Test Issue&apos;,
  description: &apos;This is a test issue description&apos;,
  type: &apos;maintenance&apos;,
  severity: &apos;medium&apos;,
  status: &apos;open&apos; as const,
  assetId: &apos;AST-001&apos;,
  assetName: &apos;Test Asset&apos;,
  reportedBy: &apos;John Doe&apos;,
  reportedDate: &apos;2024-01-01T00:00:00Z&apos;,
  assignedTo: &apos;Jane Smith&apos;,
  notes: &apos;Test notes&apos;,
  tags: [&apos;urgent&apos;, &apos;equipment&apos;],
  resolvedDate: null,
};

export const mockJob = {
  id: &apos;JOB-001&apos;,
  jobNumber: &apos;JOB-001&apos;,
  name: &apos;Test Job&apos;,
  description: &apos;This is a test job description&apos;,
  status: &apos;active&apos; as const,
  priority: &apos;high&apos; as const,
  startDate: &apos;2024-01-01T00:00:00Z&apos;,
  endDate: &apos;2024-01-31T00:00:00Z&apos;,
  projectManager: &apos;John Doe&apos;,
  siteName: &apos;Test Site&apos;,
  budget: {
    total: 10000,
    labor: 5000,
    materials: 3000,
    equipment: 2000,
  },
  actualCosts: {
    total: 8000,
    labor: 4000,
    materials: 2500,
    equipment: 1500,
  },
  variance: -2000,
  variancePercentage: -20,
  assets: [
    {
      id: &apos;AST-001&apos;,
      name: &apos;Test Asset&apos;,
      type: &apos;equipment&apos;,
      required: true,
      startDate: &apos;2024-01-01T00:00:00Z&apos;,
      endDate: &apos;2024-01-31T00:00:00Z&apos;,
    },
  ],
  hasActiveAlerts: false,
  missingAssets: [],
};

export const mockIssues = [mockIssue];

export const mockJobs = { [mockJob.id]: mockJob };

export const mockJobAlerts = [];

// Mock functions
export const mockOnUpdateIssue = vi
  .fn()
  .mockResolvedValue({ success: true, issue: mockIssue });
export const mockOnUpdateStatus = vi.fn().mockResolvedValue({ success: true });
export const mockOnDeleteIssue = vi.fn().mockResolvedValue({ success: true });
export const mockOnCreateJob = vi
  .fn()
  .mockResolvedValue({ success: true, job: mockJob });
export const mockOnUpdateJob = vi
  .fn()
  .mockResolvedValue({ success: true, job: mockJob });
export const mockOnDeleteJob = vi.fn().mockResolvedValue({ success: true });
export const mockOnAddAssetToJob = vi.fn().mockResolvedValue({ success: true });
export const mockOnRemoveAssetFromJob = vi
  .fn()
  .mockResolvedValue({ success: true });
export const mockOnBack = vi.fn();
export const mockOnNavigateToCreateJob = vi.fn();
export const mockOnNavigateToJobDetails = vi.fn();

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, &apos;wrapper&apos;>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from &apos;@testing-library/react&apos;;
export { customRender as render };

// Helper function to create mock navigation context
export const createMockNavigation = () => ({
  currentView: &apos;dashboard&apos;,
  navigateToDashboard: vi.fn(),
  navigateToAssets: vi.fn(),
  navigateToAssetDetails: vi.fn(),
  navigateToCreateAsset: vi.fn(),
  navigateToEditAsset: vi.fn(),
  navigateToVehicles: vi.fn(),
  navigateToVehicleDetails: vi.fn(),
  navigateToCreateVehicle: vi.fn(),
  navigateToEditVehicle: vi.fn(),
  navigateToJobs: vi.fn(),
  navigateToJobDetails: vi.fn(),
  navigateToCreateJob: vi.fn(),
  navigateToEditJob: vi.fn(),
  navigateToIssues: vi.fn(),
  navigateToIssueDetails: vi.fn(),
  navigateToCreateIssue: vi.fn(),
  navigateToEditIssue: vi.fn(),
  navigateToMaintenance: vi.fn(),
  navigateToMaintenanceDetails: vi.fn(),
  navigateToCreateMaintenance: vi.fn(),
  navigateToEditMaintenance: vi.fn(),
  navigateToReports: vi.fn(),
  navigateToSettings: vi.fn(),
  navigateToGeofences: vi.fn(),
  navigateToGeofenceDetails: vi.fn(),
  navigateToCreateGeofence: vi.fn(),
  navigateToEditGeofence: vi.fn(),
  navigateToCompliance: vi.fn(),
  navigateToComplianceDetails: vi.fn(),
  navigateToCreateCompliance: vi.fn(),
  navigateToEditCompliance: vi.fn(),
  navigateToCheckInOut: vi.fn(),
  navigateToCreateCheckInOut: vi.fn(),
  navigateToEditCheckInOut: vi.fn(),
  navigateToNotifications: vi.fn(),
  navigateToNotificationPreferences: vi.fn(),
  navigateToHistoricalPlayback: vi.fn(),
  navigateToAssetMap: vi.fn(),
  navigateToVehicleAssetPairing: vi.fn(),
  navigateToConfigurationInspector: vi.fn(),
  navigateToGenerateReport: vi.fn(),
  navigateToExportData: vi.fn(),
  navigateToTaskAuditLog: vi.fn(),
  navigateBack: vi.fn(),
  canGoBack: true,
  history: [],
  params: {},
  setParams: vi.fn(),
});

// Helper to wait for async operations
export const waitForAsync = () =>
  new Promise(resolve => setTimeout(resolve, 0));

// Helper to simulate user interactions
export const createUserEvent = () => {
  const user = userEvent.setup();
  return user;
};

// Additional mock data for comprehensive testing
export const mockAsset = {
  id: &apos;AT-001&apos;,
  name: &apos;Excavator CAT 320&apos;,
  type: &apos;Heavy Equipment&apos;,
  status: &apos;active&apos;,
  coordinates: [30.2672, -97.7431],
  battery: 87,
  lastSeen: &apos;2024-01-01T10:00:00Z&apos;,
  location: &apos;Main Warehouse&apos;,
  manager: &apos;John Smith&apos;,
  phone: &apos;(555) 123-4567&apos;,
  email: &apos;john@example.com&apos;,
};

export const mockSite = {
  id: &apos;ST-001&apos;,
  name: &apos;Main Warehouse&apos;,
  address: &apos;123 Main St, Austin, TX 78701&apos;,
  location: &apos;123 Main St, Austin, TX 78701&apos;,
  area: &apos;500 ft radius&apos;,
  tolerance: 50,
  assets: 150,
  status: &apos;active&apos;,
  coordinates: { lat: 30.2672, lng: -97.7431, radius: 500 },
  manager: &apos;John Smith&apos;,
  phone: &apos;(555) 123-4567&apos;,
  email: &apos;john@example.com&apos;,
  geofenceId: &apos;GF-001&apos;,
};

export const mockGeofence = {
  id: &apos;GF-001&apos;,
  name: &apos;Main Warehouse Geofence&apos;,
  center: [30.2672, -97.7431],
  radius: 500,
  tolerance: 50,
  status: &apos;active&apos;,
  alertOnEntry: true,
  alertOnExit: true,
  type: &apos;circular&apos;,
};

export const mockVehicle = {
  id: &apos;VEH-001&apos;,
  name: &apos;Truck Alpha&apos;,
  licensePlate: &apos;ABC-123&apos;,
  type: &apos;Pickup Truck&apos;,
  driver: &apos;Mike Wilson&apos;,
  status: &apos;active&apos;,
  location: &apos;Construction Site A&apos;,
  capacity: 10,
  pairings: [],
};

export const mockMaintenanceTask = {
  id: &apos;MT-001&apos;,
  assetId: &apos;AT-001&apos;,
  assetName: &apos;Excavator CAT 320&apos;,
  type: &apos;scheduled&apos;,
  priority: &apos;high&apos;,
  status: &apos;pending&apos;,
  dueDate: &apos;2024-01-15T10:00:00Z&apos;,
  description: &apos;Regular maintenance check&apos;,
  assignedTo: &apos;John Smith&apos;,
  estimatedDuration: 120,
  actualDuration: null,
  notes: &apos;&apos;,
  auditLog: [
    {
      timestamp: &apos;2024-01-01T10:00:00Z&apos;,
      user: &apos;John Smith&apos;,
      action: &apos;created&apos;,
      changes: [],
      notes: &apos;Maintenance task created&apos;,
    },
  ],
};

export const mockPredictiveAlert = {
  id: &apos;PA-001&apos;,
  assetId: &apos;AT-001&apos;,
  assetName: &apos;Excavator CAT 320&apos;,
  alertType: &apos;battery_degradation&apos;,
  severity: &apos;medium&apos;,
  predictedDate: &apos;2024-01-20T10:00:00Z&apos;,
  confidence: 85,
  description: &apos;Battery performance declining&apos;,
  recommendations: [&apos;Schedule battery replacement&apos;, &apos;Monitor usage patterns&apos;],
};

// Mock dashboard data
export const mockDashboardStats = {
  totalAssets: 1500,
  assetsAddedThisMonth: 45,
  activeLocations: 12,
  trackingAccuracy: 98.5,
  systemStatus: &apos;online&apos;,
  alertsCount: 8,
  criticalAlerts: 2,
  maintenanceDue: 15,
  batteryLow: 23,
  utilizationRate: 76.2,
  efficiencyScore: 88.5,
};

// Mock chart data
export const mockChartData = [
  { time: &apos;2024-01-01&apos;, assets: 10, personnel: 5 },
  { time: &apos;2024-01-02&apos;, assets: 12, personnel: 6 },
  { time: &apos;2024-01-03&apos;, assets: 8, personnel: 4 },
];

export const mockAssetTypeData = [
  { name: &apos;Equipment&apos;, value: 95, count: 95, color: &apos;#3b82f6&apos; },
  { name: &apos;Vehicles&apos;, value: 52, count: 52, color: &apos;#22c55e&apos; },
  { name: &apos;Tools&apos;, value: 67, count: 67, color: &apos;#f59e0b&apos; },
  { name: &apos;Containers&apos;, value: 20, count: 20, color: &apos;#8b5cf6&apos; },
];

// Enhanced mock functions for all components
export const mockOnAssetClick = vi.fn();
export const mockOnSiteClick = vi.fn();
export const mockOnGeofenceClick = vi.fn();
export const mockOnVehicleClick = vi.fn();
export const mockOnMaintenanceClick = vi.fn();
export const mockOnViewChange = vi.fn();
export const mockOnNavigateToAlerts = vi.fn();
export const mockOnCreateSite = vi.fn();
export const mockOnEditSite = vi.fn();
export const mockOnSiteUpdate = vi.fn();
export const mockOnCreateGeofence = vi.fn();
export const mockOnEditGeofence = vi.fn();
export const mockOnGeofenceCreated = vi.fn();
export const mockOnGeofenceUpdated = vi.fn();
export const mockOnCreateMaintenance = vi.fn();
export const mockOnEditMaintenance = vi.fn();
export const mockOnUpdateMaintenance = vi.fn();
export const mockOnDismissPredictiveAlert = vi.fn();
export const mockOnLoadAssets = vi.fn();
export const mockOnUnpairAssets = vi.fn();

// Mock service functions
export const mockFetchMaintenanceTasks = vi
  .fn()
  .mockResolvedValue([mockMaintenanceTask]);
export const mockFetchMaintenanceHistory = vi.fn().mockResolvedValue([]);
export const mockFetchPredictiveAlerts = vi
  .fn()
  .mockResolvedValue([mockPredictiveAlert]);
export const mockGetMaintenanceStats = vi.fn().mockResolvedValue({
  overdue: 5,
  inProgress: 8,
  scheduled: 12,
  predictiveAlerts: 3,
});
export const mockUpdateMaintenanceTask = vi
  .fn()
  .mockResolvedValue({ success: true });
export const mockDismissPredictiveAlert = vi
  .fn()
  .mockResolvedValue({ success: true });

export const mockFetchSiteActivity = vi.fn().mockResolvedValue({
  data: mockChartData,
});
export const mockGetPresetDateRange = vi.fn().mockReturnValue({
  start: new Date(&apos;2024-01-01&apos;),
  end: new Date(&apos;2024-01-02&apos;),
  granularity: &apos;daily&apos; as const,
});

export const mockGetDashboardStats = vi
  .fn()
  .mockResolvedValue(mockDashboardStats);
export const mockGetLocationData = vi.fn().mockResolvedValue(mockChartData);
export const mockGetAssetsByType = vi.fn().mockResolvedValue(mockAssetTypeData);
export const mockGetBatteryStatus = vi.fn().mockResolvedValue([
  { range: &apos;0-20%&apos;, count: 5, color: &apos;#ef4444&apos; },
  { range: &apos;21-50%&apos;, count: 18, color: &apos;#f59e0b&apos; },
  { range: &apos;51-80%&apos;, count: 45, color: &apos;#3b82f6&apos; },
  { range: &apos;81-100%&apos;, count: 82, color: &apos;#22c55e&apos; },
]);
export const mockGetRecentActivity = vi.fn().mockResolvedValue([
  {
    id: &apos;1&apos;,
    type: &apos;asset_arrival&apos;,
    assetName: &apos;Excavator CAT 320&apos;,
    location: &apos;Main Warehouse&apos;,
    timestamp: &apos;2 min ago&apos;,
    icon: &apos;Wrench&apos;,
  },
]);
export const mockGetAlertBreakdown = vi.fn().mockResolvedValue([
  { type: &apos;Battery Low&apos;, count: 5, color: &apos;#f59e0b&apos; },
  { type: &apos;Geofence Violation&apos;, count: 2, color: &apos;#ef4444&apos; },
  { type: &apos;Maintenance Due&apos;, count: 1, color: &apos;#3b82f6&apos; },
]);

// Utility functions for testing
export const createMockProps = (overrides = {}) => ({
  onBack: mockOnBack,
  onAssetClick: mockOnAssetClick,
  onSiteClick: mockOnSiteClick,
  onViewChange: mockOnViewChange,
  ...overrides,
});

export const createMockSiteProps = (overrides = {}) => ({
  site: mockSite,
  onBack: mockOnBack,
  onCreateGeofence: mockOnCreateGeofence,
  onEditGeofence: mockOnEditGeofence,
  onSiteUpdate: mockOnSiteUpdate,
  initialTab: &apos;overview&apos;,
  onTabChange: vi.fn(),
  ...overrides,
});

export const createMockMaintenanceProps = (overrides = {}) => ({
  onAssetClick: mockOnAssetClick,
  ...overrides,
});

export const createMockVehiclePairingProps = (overrides = {}) => ({
  onBack: mockOnBack,
  ...overrides,
});

// Helper to create mock form data
export const createMockFormData = (overrides = {}) => ({
  siteName: &apos;Test Site&apos;,
  address: &apos;123 Test St&apos;,
  city: &apos;Test City&apos;,
  state: &apos;TX&apos;,
  zipCode: &apos;12345&apos;,
  latitude: &apos;30.2672&apos;,
  longitude: &apos;-97.7431&apos;,
  boundaryType: &apos;radius&apos;,
  boundaryRadius: &apos;500&apos;,
  tolerance: &apos;50&apos;,
  contactName: &apos;John Doe&apos;,
  contactPhone: &apos;(555) 123-4567&apos;,
  contactEmail: &apos;john@test.com&apos;,
  notes: &apos;Test notes&apos;,
  ...overrides,
});

// Helper to simulate async operations
export const simulateAsyncOperation = (delay = 100) =>
  new Promise(resolve => setTimeout(resolve, delay));

// Helper to create mock error responses
export const createMockError = (message = &apos;Test error&apos;) => new Error(message);

// Helper to create mock success responses
export const createMockSuccessResponse = (data = {}) => ({
  success: true,
  data,
});

// Helper to create mock failure responses
export const createMockFailureResponse = (error = &apos;Operation failed&apos;) => ({
  success: false,
  error,
});

// Helper to wait for specific text to appear
export const waitForText = async (text: string, timeout = 1000) => {
  const { waitFor } = await import(&apos;@testing-library/react&apos;);
  return waitFor(
    () => {
      expect(screen.getByText(text)).toBeInTheDocument();
    },
    { timeout }
  );
};

// Helper to wait for element to be removed
export const waitForElementToBeRemoved = async (
  element: HTMLElement,
  timeout = 1000
) => {
  const { waitForElementToBeRemoved } = await import(&apos;@testing-library/react&apos;);
  return waitForElementToBeRemoved(element, { timeout });
};

// Helper to find elements by test id
export const findByTestId = async (testId: string) => {
  const { findByTestId } = await import(&apos;@testing-library/react&apos;);
  return findByTestId(document.body, testId);
};

// Helper to find all elements by test id
export const findAllByTestId = async (testId: string) => {
  const { findAllByTestId } = await import(&apos;@testing-library/react&apos;);
  return findAllByTestId(document.body, testId);
};
