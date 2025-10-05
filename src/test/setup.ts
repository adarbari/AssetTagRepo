import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
}

// Fix JSDOM compatibility issues with Radix UI
// Mock hasPointerCapture method
Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  writable: true,
  value: vi.fn().mockReturnValue(false),
})

// Mock setPointerCapture method
Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  writable: true,
  value: vi.fn(),
})

// Mock releasePointerCapture method
Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
  writable: true,
  value: vi.fn(),
})

// Mock getBoundingClientRect for better element positioning
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  writable: true,
  value: vi.fn().mockReturnValue({
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
    x: 0,
    y: 0,
    toJSON: vi.fn(),
  }),
})

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: vi.fn().mockReturnValue({
    getPropertyValue: vi.fn().mockReturnValue(''),
  }),
})

// Mock NavigationContext
vi.mock('../contexts/NavigationContext', () => ({
  useNavigation: () => ({
    view: 'dashboard',
    asset: null,
    site: null,
    highlightAsset: null,
    historicalPlaybackAsset: null,
    alertFilter: undefined,
    geofenceData: undefined,
    siteActiveTab: undefined,
    filteredAssetIds: undefined,
    geofenceViolationMode: false,
    violatingGeofenceId: undefined,
    expectedAssetIds: undefined,
    actualAssetIds: undefined,
    selectedAlertForWorkflow: null,
    handleViewChange: vi.fn(),
    navigateToAlerts: vi.fn(),
    navigateToAssetDetails: vi.fn(),
    navigateToSiteDetails: vi.fn(),
    navigateToCreateGeofence: vi.fn(),
    navigateToEditGeofence: vi.fn(),
    navigateToAlertWorkflow: vi.fn(),
    navigateToAlertConfiguration: vi.fn(),
    navigateToCreateSite: vi.fn(),
    navigateToCreateMaintenance: vi.fn(),
    navigateToEditMaintenance: vi.fn(),
    navigateToEditIssue: vi.fn(),
    navigateToCreateCompliance: vi.fn(),
    navigateToCreateVehicle: vi.fn(),
    navigateToEditVehicle: vi.fn(),
    navigateToCreateJob: vi.fn(),
    navigateToEditJob: vi.fn(),
    navigateToJobDetails: vi.fn(),
    navigateToCreateAsset: vi.fn(),
    navigateToLoadAsset: vi.fn(),
    navigateToCheckInOut: vi.fn(),
    navigateToReportIssue: vi.fn(),
    handleShowOnMap: vi.fn(),
    handleViewHistoricalPlayback: vi.fn(),
  }),
  NavigationProvider: ({ children }: { children: React.ReactNode }) => children,
}))
