import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Mock data for testing
export const mockIssue = {
  id: 'ISS-001',
  title: 'Test Issue',
  description: 'This is a test issue description',
  type: 'maintenance',
  severity: 'medium',
  status: 'open' as const,
  assetId: 'AST-001',
  assetName: 'Test Asset',
  reportedBy: 'John Doe',
  reportedDate: '2024-01-01T00:00:00Z',
  assignedTo: 'Jane Smith',
  notes: 'Test notes',
  tags: ['urgent', 'equipment'],
  resolvedDate: null,
}

export const mockJob = {
  id: 'JOB-001',
  jobNumber: 'JOB-001',
  name: 'Test Job',
  description: 'This is a test job description',
  status: 'active' as const,
  priority: 'high' as const,
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T00:00:00Z',
  projectManager: 'John Doe',
  siteName: 'Test Site',
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
      id: 'AST-001',
      name: 'Test Asset',
      type: 'equipment',
      required: true,
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-31T00:00:00Z',
    }
  ],
  hasActiveAlerts: false,
  missingAssets: [],
}

export const mockIssues = [mockIssue]

export const mockJobs = { [mockJob.id]: mockJob }

export const mockJobAlerts = []

// Mock functions
export const mockOnUpdateIssue = vi.fn().mockResolvedValue({ success: true, issue: mockIssue })
export const mockOnUpdateStatus = vi.fn().mockResolvedValue({ success: true })
export const mockOnDeleteIssue = vi.fn().mockResolvedValue({ success: true })
export const mockOnCreateJob = vi.fn().mockResolvedValue({ success: true, job: mockJob })
export const mockOnUpdateJob = vi.fn().mockResolvedValue({ success: true, job: mockJob })
export const mockOnDeleteJob = vi.fn().mockResolvedValue({ success: true })
export const mockOnAddAssetToJob = vi.fn().mockResolvedValue({ success: true })
export const mockOnRemoveAssetFromJob = vi.fn().mockResolvedValue({ success: true })
export const mockOnBack = vi.fn()
export const mockOnNavigateToCreateJob = vi.fn()
export const mockOnNavigateToJobDetails = vi.fn()

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children}
    </div>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Helper function to create mock navigation context
export const createMockNavigation = () => ({
  currentView: 'dashboard',
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
})

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Helper to simulate user interactions
export const createUserEvent = () => {
  const user = userEvent.setup()
  return user
}

// Additional mock data for comprehensive testing
export const mockAsset = {
  id: 'AT-001',
  name: 'Excavator CAT 320',
  type: 'Heavy Equipment',
  status: 'active',
  coordinates: [30.2672, -97.7431],
  battery: 87,
  lastSeen: '2024-01-01T10:00:00Z',
  location: 'Main Warehouse',
  manager: 'John Smith',
  phone: '(555) 123-4567',
  email: 'john@example.com',
}

export const mockSite = {
  id: 'ST-001',
  name: 'Main Warehouse',
  address: '123 Main St, Austin, TX 78701',
  location: '123 Main St, Austin, TX 78701',
  area: '500 ft radius',
  tolerance: 50,
  assets: 150,
  status: 'active',
  coordinates: { lat: 30.2672, lng: -97.7431, radius: 500 },
  manager: 'John Smith',
  phone: '(555) 123-4567',
  email: 'john@example.com',
  geofenceId: 'GF-001',
}

export const mockGeofence = {
  id: 'GF-001',
  name: 'Main Warehouse Geofence',
  center: [30.2672, -97.7431],
  radius: 500,
  tolerance: 50,
  status: 'active',
  alertOnEntry: true,
  alertOnExit: true,
  type: 'circular',
}

export const mockVehicle = {
  id: 'VEH-001',
  name: 'Truck Alpha',
  licensePlate: 'ABC-123',
  type: 'Pickup Truck',
  driver: 'Mike Wilson',
  status: 'active',
  location: 'Construction Site A',
  capacity: 10,
  pairings: [],
}

export const mockMaintenanceTask = {
  id: 'MT-001',
  assetId: 'AT-001',
  assetName: 'Excavator CAT 320',
  type: 'scheduled',
  priority: 'high',
  status: 'pending',
  dueDate: '2024-01-15T10:00:00Z',
  description: 'Regular maintenance check',
  assignedTo: 'John Smith',
  estimatedDuration: 120,
  actualDuration: null,
  notes: '',
  auditLog: [
    {
      timestamp: '2024-01-01T10:00:00Z',
      user: 'John Smith',
      action: 'created',
      changes: [],
      notes: 'Maintenance task created',
    },
  ],
}

export const mockPredictiveAlert = {
  id: 'PA-001',
  assetId: 'AT-001',
  assetName: 'Excavator CAT 320',
  alertType: 'battery_degradation',
  severity: 'medium',
  predictedDate: '2024-01-20T10:00:00Z',
  confidence: 85,
  description: 'Battery performance declining',
  recommendations: ['Schedule battery replacement', 'Monitor usage patterns'],
}

// Mock dashboard data
export const mockDashboardStats = {
  totalAssets: 1500,
  assetsAddedThisMonth: 45,
  activeLocations: 12,
  trackingAccuracy: 98.5,
  systemStatus: 'online',
  alertsCount: 8,
  criticalAlerts: 2,
  maintenanceDue: 15,
  batteryLow: 23,
  utilizationRate: 76.2,
  efficiencyScore: 88.5,
}

// Mock chart data
export const mockChartData = [
  { time: '2024-01-01', assets: 10, personnel: 5 },
  { time: '2024-01-02', assets: 12, personnel: 6 },
  { time: '2024-01-03', assets: 8, personnel: 4 },
]

export const mockAssetTypeData = [
  { name: 'Equipment', value: 95, count: 95, color: '#3b82f6' },
  { name: 'Vehicles', value: 52, count: 52, color: '#22c55e' },
  { name: 'Tools', value: 67, count: 67, color: '#f59e0b' },
  { name: 'Containers', value: 20, count: 20, color: '#8b5cf6' },
]

// Enhanced mock functions for all components
export const mockOnAssetClick = vi.fn()
export const mockOnSiteClick = vi.fn()
export const mockOnGeofenceClick = vi.fn()
export const mockOnVehicleClick = vi.fn()
export const mockOnMaintenanceClick = vi.fn()
export const mockOnViewChange = vi.fn()
export const mockOnNavigateToAlerts = vi.fn()
export const mockOnCreateSite = vi.fn()
export const mockOnEditSite = vi.fn()
export const mockOnSiteUpdate = vi.fn()
export const mockOnCreateGeofence = vi.fn()
export const mockOnEditGeofence = vi.fn()
export const mockOnGeofenceCreated = vi.fn()
export const mockOnGeofenceUpdated = vi.fn()
export const mockOnCreateMaintenance = vi.fn()
export const mockOnEditMaintenance = vi.fn()
export const mockOnUpdateMaintenance = vi.fn()
export const mockOnDismissPredictiveAlert = vi.fn()
export const mockOnLoadAssets = vi.fn()
export const mockOnUnpairAssets = vi.fn()

// Mock service functions
export const mockFetchMaintenanceTasks = vi.fn().mockResolvedValue([mockMaintenanceTask])
export const mockFetchMaintenanceHistory = vi.fn().mockResolvedValue([])
export const mockFetchPredictiveAlerts = vi.fn().mockResolvedValue([mockPredictiveAlert])
export const mockGetMaintenanceStats = vi.fn().mockResolvedValue({
  overdue: 5,
  inProgress: 8,
  scheduled: 12,
  predictiveAlerts: 3,
})
export const mockUpdateMaintenanceTask = vi.fn().mockResolvedValue({ success: true })
export const mockDismissPredictiveAlert = vi.fn().mockResolvedValue({ success: true })

export const mockFetchSiteActivity = vi.fn().mockResolvedValue({
  data: mockChartData,
})
export const mockGetPresetDateRange = vi.fn().mockReturnValue({
  start: new Date('2024-01-01'),
  end: new Date('2024-01-02'),
  granularity: 'daily' as const,
})

export const mockGetDashboardStats = vi.fn().mockResolvedValue(mockDashboardStats)
export const mockGetLocationData = vi.fn().mockResolvedValue(mockChartData)
export const mockGetAssetsByType = vi.fn().mockResolvedValue(mockAssetTypeData)
export const mockGetBatteryStatus = vi.fn().mockResolvedValue([
  { range: '0-20%', count: 5, color: '#ef4444' },
  { range: '21-50%', count: 18, color: '#f59e0b' },
  { range: '51-80%', count: 45, color: '#3b82f6' },
  { range: '81-100%', count: 82, color: '#22c55e' },
])
export const mockGetRecentActivity = vi.fn().mockResolvedValue([
  {
    id: '1',
    type: 'asset_arrival',
    assetName: 'Excavator CAT 320',
    location: 'Main Warehouse',
    timestamp: '2 min ago',
    icon: 'Wrench',
  },
])
export const mockGetAlertBreakdown = vi.fn().mockResolvedValue([
  { type: 'Battery Low', count: 5, color: '#f59e0b' },
  { type: 'Geofence Violation', count: 2, color: '#ef4444' },
  { type: 'Maintenance Due', count: 1, color: '#3b82f6' },
])

// Utility functions for testing
export const createMockProps = (overrides = {}) => ({
  onBack: mockOnBack,
  onAssetClick: mockOnAssetClick,
  onSiteClick: mockOnSiteClick,
  onViewChange: mockOnViewChange,
  ...overrides,
})

export const createMockSiteProps = (overrides = {}) => ({
  site: mockSite,
  onBack: mockOnBack,
  onCreateGeofence: mockOnCreateGeofence,
  onEditGeofence: mockOnEditGeofence,
  onSiteUpdate: mockOnSiteUpdate,
  initialTab: 'overview',
  onTabChange: vi.fn(),
  ...overrides,
})

export const createMockMaintenanceProps = (overrides = {}) => ({
  onAssetClick: mockOnAssetClick,
  ...overrides,
})

export const createMockVehiclePairingProps = (overrides = {}) => ({
  onBack: mockOnBack,
  ...overrides,
})

// Helper to create mock form data
export const createMockFormData = (overrides = {}) => ({
  siteName: 'Test Site',
  address: '123 Test St',
  city: 'Test City',
  state: 'TX',
  zipCode: '12345',
  latitude: '30.2672',
  longitude: '-97.7431',
  boundaryType: 'radius',
  boundaryRadius: '500',
  tolerance: '50',
  contactName: 'John Doe',
  contactPhone: '(555) 123-4567',
  contactEmail: 'john@test.com',
  notes: 'Test notes',
  ...overrides,
})

// Helper to simulate async operations
export const simulateAsyncOperation = (delay = 100) => 
  new Promise(resolve => setTimeout(resolve, delay))

// Helper to create mock error responses
export const createMockError = (message = 'Test error') => 
  new Error(message)

// Helper to create mock success responses
export const createMockSuccessResponse = (data = {}) => ({
  success: true,
  data,
})

// Helper to create mock failure responses
export const createMockFailureResponse = (error = 'Operation failed') => ({
  success: false,
  error,
})

// Helper to wait for specific text to appear
export const waitForText = async (text: string, timeout = 1000) => {
  const { waitFor } = await import('@testing-library/react')
  return waitFor(() => {
    expect(screen.getByText(text)).toBeInTheDocument()
  }, { timeout })
}

// Helper to wait for element to be removed
export const waitForElementToBeRemoved = async (element: HTMLElement, timeout = 1000) => {
  const { waitForElementToBeRemoved } = await import('@testing-library/react')
  return waitForElementToBeRemoved(element, { timeout })
}

// Helper to find elements by test id
export const findByTestId = async (testId: string) => {
  const { findByTestId } = await import('@testing-library/react')
  return findByTestId(document.body, testId)
}

// Helper to find all elements by test id
export const findAllByTestId = async (testId: string) => {
  const { findAllByTestId } = await import('@testing-library/react')
  return findAllByTestId(document.body, testId)
}
