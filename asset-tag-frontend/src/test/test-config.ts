/**
 * Test Configuration for AssetTag Application
 *
 * This file contains configuration and setup for running comprehensive tests
 * across all application components.
 */

import { vi } from 'vitest';

// Global test configuration
export const TEST_CONFIG = {
  // Test timeouts
  DEFAULT_10000,
  ASYNC_5000,

  // Mock data settings
  MOCK_100,
  MOCK_SUCCESS_0.95,

  // Test environment
  ENVIRONMENT: 'test',

  // Component-specific settings
  COMPONENTS: {
    SITES: {
      MOCK_SITES_6,
      MOCK_GEOFENCES_3,
    },
    DASHBOARD: {
      MOCK_STATS_10,
      MOCK_CHART_7,
    },
    MAINTENANCE: {
      MOCK_TASKS_15,
      MOCK_ALERTS_5,
    },
    VEHICLE_{
      MOCK_VEHICLES_3,
      MOCK_ASSETS_10,
    },
    ASSET_{
      MOCK_ASSETS_20,
      MOCK_GEOFENCES_5,
    },
  },
};

// Global mocks that should be available in all tests
export const setupGlobalMocks = () => {
  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock scrollTo
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn(),
  });

  // Mock fetch
  global.fetch = vi.fn();

  // Mock URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => 'mock-url');
  global.URL.revokeObjectURL = vi.fn();

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });
};

// Test data generators
export const generateMockData = {
  // Generate mock sites
  sites: (count = TEST_CONFIG.COMPONENTS.SITES.MOCK_SITES_COUNT) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `ST-${String(i + 1).padStart(3, '0')}`,
      name: `Site ${i + 1}`,
      address: `${100 + i} Main St, City ${i + 1}, TX 7870${i + 1}`,
      location: `${100 + i} Main St, City ${i + 1}, TX 7870${i + 1}`,
      area: `${500 + i * 100} ft radius`,
      tolerance: 50 + i * 10,
      assets: 100 + i * 50,
      status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'maintenance' : 'inactive',
      coordinates: {
        lat: 30.2672 + i * 0.01,
        lng: -97.7431 + i * 0.01,
        radius: 500 + i * 100,
      },
      manager: `Manager ${i + 1}`,
      phone: `(555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i).padStart(4, '0')}`,
      email: `manager${i + 1}@example.com`,
      geofenceId:
        i % 2 === 0 ? `GF-${String(i + 1).padStart(3, '0')}` : undefined,
    }));
  },

  // Generate mock assets
  assets: (count = TEST_CONFIG.COMPONENTS.ASSET_MAP.MOCK_ASSETS_COUNT) => {
    const types = ['Heavy Equipment', 'Vehicle', 'Tool', 'Container'];
    const statuses = ['active', 'idle', 'in-transit', 'offline'];

    return Array.from({ length: count }, (_, i) => ({
      id: `AT-${String(i + 1).padStart(5, '0')}`,
      name: `Asset ${i + 1}`,
      type: types[i % types.length],
      status: statuses[i % statuses.length],
      coordinates: [30.2672 + i * 0.001, -97.7431 + i * 0.001],
      battery: 20 + ((i * 5) % 80),
      lastSeen: new Date(Date.now() - i * 60000).toISOString(),
      location: `Location ${i + 1}`,
      manager: `Manager ${i + 1}`,
      phone: `(555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i).padStart(4, '0')}`,
      email: `manager${i + 1}@example.com`,
    }));
  },

  // Generate mock vehicles
  vehicles: (
    count = TEST_CONFIG.COMPONENTS.VEHICLE_PAIRING.MOCK_VEHICLES_COUNT
  ) => {
    const types = ['Pickup Truck', 'Box Truck', 'Cargo Van', 'Delivery Truck'];
    const drivers = ['Mike Wilson', 'Sarah Johnson', 'John Smith', 'Jane Doe'];

    return Array.from({ length: count }, (_, i) => ({
      id: `VEH-${String(i + 1).padStart(3, '0')}`,
      name: `Vehicle ${i + 1}`,
      licensePlate: `ABC-${String(100 + i).padStart(3, '0')}`,
      type: types[i % types.length],
      driver: drivers[i % drivers.length],
      status: 'active',
      location: `Location ${i + 1}`,
      capacity: 10 + i * 5,
      pairings: [],
    }));
  },

  // Generate mock maintenance tasks
  maintenanceTasks: (
    count = TEST_CONFIG.COMPONENTS.MAINTENANCE.MOCK_TASKS_COUNT
  ) => {
    const types = ['scheduled', 'emergency', 'preventive', 'corrective'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['pending', 'in-progress', 'completed', 'cancelled'];

    return Array.from({ length: count }, (_, i) => ({
      id: `MT-${String(i + 1).padStart(3, '0')}`,
      assetId: `AT-${String(i + 1).padStart(5, '0')}`,
      assetName: `Asset ${i + 1}`,
      type: types[i % types.length],
      priority: priorities[i % priorities.length],
      status: statuses[i % statuses.length],
      dueDate: new Date(Date.now() + i * 86400000).toISOString(),
      description: `Maintenance task ${i + 1}`,
      assignedTo: `Technician ${i + 1}`,
      estimatedDuration: 60 + i * 30,
      actualDuration: i % 3 === 0 ? 60 + i * 30 : null,
      notes: i % 2 === 0 ? `Notes for task ${i + 1}` : '',
      auditLog: [
        {
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          user: `User ${i + 1}`,
          action: 'created',
          changes: [],
          notes: `Task ${i + 1} created`,
        },
      ],
    }));
  },

  // Generate mock dashboard stats
  dashboardStats: () => ({
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
  }),

  // Generate mock chart data
  chartData: (points = TEST_CONFIG.COMPONENTS.DASHBOARD.MOCK_CHART_POINTS) => {
    return Array.from({ length: points }, (_, i) => ({
      time: new Date(Date.now() - (points - i) * 86400000)
        .toISOString()
        .split('T')[0],
      assets: 10 + Math.floor(Math.random() * 20),
      personnel: 5 + Math.floor(Math.random() * 10),
    }));
  },
};

// Test utilities
export const testUtils = {
  // Wait for async operations
  waitFor: (ms = TEST_CONFIG.MOCK_DELAY) =>
    new Promise(resolve => setTimeout(resolve, ms)),

  // Create mock error
  createError: (message = 'Test error') => new Error(message),

  // Create mock success response
  createSuccessResponse: (data = {}) => ({ success: true, data }),

  // Create mock failure response
  createFailureResponse: (error = 'Operation failed') => ({
    success: false,
    error,
  }),

  // Mock async function with delay
  mockAsyncFunction: (result, delay = TEST_CONFIG.MOCK_DELAY) =>
    vi
      .fn()
      .mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(result), delay))
      ),

  // Mock async function that can fail
  mockAsyncFunctionWithFailure: (
    result,
    failureRate = 0.1,
    delay = TEST_CONFIG.MOCK_DELAY
  ) =>
    vi.fn().mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() < failureRate) {
              reject(new Error('Mock failure'));
            } else {
              resolve(result);
            }
          }, delay);
        })
    ),
};

// Component-specific test helpers
export const componentTestHelpers = {
  // Sites component helpers
  sites: {
    createMockSite: (overrides = {}) => ({
      id: 'ST-001',
      name: 'Test Site',
      address: '123 Test St, Test City, TX 12345',
      location: '123 Test St, Test City, TX 12345',
      area: '500 ft radius',
      tolerance: 50,
      assets: 100,
      status: 'active',
      coordinates: { lat: 30.2672, lng: -97.7431, radius: 500 },
      manager: 'Test Manager',
      phone: '(555) 123-4567',
      email: 'test@example.com',
      ...overrides,
    }),
  },

  // Dashboard component helpers
  dashboard: {
    createMockStats: (overrides = {}) => ({
      totalAssets: 1000,
      assetsAddedThisMonth: 25,
      activeLocations: 8,
      trackingAccuracy: 95.0,
      systemStatus: 'online',
      alertsCount: 5,
      criticalAlerts: 1,
      maintenanceDue: 10,
      batteryLow: 15,
      utilizationRate: 75.0,
      efficiencyScore: 85.0,
      ...overrides,
    }),
  },

  // Maintenance component helpers
  maintenance: {
    createMockTask: (overrides = {}) => ({
      id: 'MT-001',
      assetId: 'AT-001',
      assetName: 'Test Asset',
      type: 'scheduled',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      description: 'Test maintenance task',
      assignedTo: 'Test Technician',
      estimatedDuration: 120,
      actualDuration: null,
      notes: '',
      auditLog: [],
      ...overrides,
    }),
  },

  // Vehicle pairing component helpers
  vehiclePairing: {
    createMockVehicle: (overrides = {}) => ({
      id: 'VEH-001',
      name: 'Test Vehicle',
      licensePlate: 'TEST-001',
      type: 'Pickup Truck',
      driver: 'Test Driver',
      status: 'active',
      location: 'Test Location',
      capacity: 10,
      pairings: [],
      ...overrides,
    }),
  },
};

export default {
  TEST_CONFIG,
  setupGlobalMocks,
  generateMockData,
  testUtils,
  componentTestHelpers,
};
