import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock fetch globally with proper response structure
global.fetch = vi.fn((url: string) =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    json: async () => ({ data: 'mock data' }),
    text: async () => 'mock text',
    blob: async () => new Blob(),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    clone: vi.fn(),
  } as Response)
) as any;

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

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};

// Fix JSDOM compatibility issues with Radix UI
// Mock hasPointerCapture method
Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  writable: true,
  value: vi.fn().mockReturnValue(false),
});

// Mock setPointerCapture method
Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  writable: true,
  value: vi.fn(),
});

// Mock releasePointerCapture method
Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
  writable: true,
  value: vi.fn(),
});

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
});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: vi.fn().mockImplementation(element => ({
    getPropertyValue: vi.fn().mockImplementation(prop => {
      const styles = {
        'margin-left': '0px',
        'margin-right': '0px',
        'margin-top': '0px',
        'margin-bottom': '0px',
        'padding-left': '0px',
        'padding-right': '0px',
        'padding-top': '0px',
        'padding-bottom': '0px',
        visibility: 'visible',
        display: 'block',
        opacity: '1',
        position: 'static',
        'z-index': 'auto',
        width: '100px',
        height: '100px',
        color: 'rgb(0, 0, 0)',
        'background-color': 'rgb(255, 255, 255)',
        border: 'none',
        outline: 'none',
      };
      return styles[prop] || '';
    }),
    marginLeft: '0px',
    marginRight: '0px',
    marginTop: '0px',
    marginBottom: '0px',
    paddingLeft: '0px',
    paddingRight: '0px',
    paddingTop: '0px',
    paddingBottom: '0px',
    visibility: 'visible',
    display: 'block',
    opacity: '1',
    position: 'static',
    zIndex: 'auto',
  })),
});

// Mock scrollIntoView
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  writable: true,
  value: vi.fn(),
});

// Mock console methods for testing - but allow individual tests to override
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

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
}));

// Mock common layout components
vi.mock('../components/common/PageLayout', () => ({
  PageLayout: ({
    children,
    header,
  }: {
    children: React.ReactNode;
    header?: React.ReactNode;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'page-layout' },
      header,
      children
    ),
}));

vi.mock('../components/common/PageHeader', () => ({
  PageHeader: ({
    title,
    description,
    actions,
    onBack,
  }: {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    onBack?: () => void;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'page-header' },
      React.createElement('h1', null, title),
      description && React.createElement('p', null, description),
      actions &&
        React.createElement(
          'div',
          { 'data-testid': 'page-header-actions' },
          actions
        )
    ),
}));

vi.mock('../components/common/PageContainer', () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'page-container' }, children),
}));

// Mock react-remove-scroll-bar to prevent JSDOM issues
vi.mock('react-remove-scroll-bar', () => ({
  RemoveScrollBar: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock lucide-react icons globally with dynamic handling
vi.mock('lucide-react', () => {
  // Create a dynamic icon component that handles any icon name
  const createIconComponent = (iconName: string) => {
    return () =>
      React.createElement('div', {
        'data-testid': `${iconName.toLowerCase()}-icon`,
        'data-icon-name': iconName,
      });
  };

  // Common icons that are frequently used
  const commonIcons = [
    'FileText',
    'Download',
    'Calendar',
    'TrendingUp',
    'DollarSign',
    'Clock',
    'Activity',
    'Shield',
    'Battery',
    'AlertTriangle',
    'MapPin',
    'Building2',
    'Plus',
    'ChevronDown',
    'ChevronDownIcon',
    'X',
    'XIcon',
    'Search',
    'Filter',
    'MoreHorizontal',
    'Edit',
    'Trash2',
    'Settings',
    'Users',
    'Building',
    'Key',
    'Wrench',
    'RefreshCw',
    'ArrowLeft',
    'Eye',
    'Bell',
    'User',
    'Home',
    'BarChart3',
    'PieChart',
    'LineChart',
    'TrendingDown',
    'ArrowUp',
    'ArrowDown',
    'Check',
    'AlertCircle',
    'Info',
    'HelpCircle',
    'ExternalLink',
    'Copy',
    'Share',
    'Heart',
    'Star',
    'ThumbsUp',
    'ThumbsDown',
    'MessageCircle',
    'Mail',
    'Phone',
    'Globe',
    'Lock',
    'Unlock',
    'Wifi',
    'WifiOff',
    'Signal',
    'SignalZero',
    'SignalLow',
    'SignalMedium',
    'SignalHigh',
    'SignalMax',
    'Volume2',
    'VolumeX',
    'Play',
    'Pause',
    'Stop',
    'SkipBack',
    'SkipForward',
    'Repeat',
    'Shuffle',
    'Music',
    'Headphones',
    'Mic',
    'MicOff',
    'Video',
    'VideoOff',
    'Camera',
    'CameraOff',
    'Image',
    'ImageOff',
    'File',
    'FileImage',
    'FileVideo',
    'FileAudio',
    'FileArchive',
    'FileCode',
    'FileSpreadsheet',
    'FilePdf',
    'FileWord',
    'FileExcel',
    'FilePowerpoint',
    'Folder',
    'FolderOpen',
    'FolderPlus',
    'FolderMinus',
    'FolderX',
    'FolderCheck',
    'FolderLock',
    'FolderUnlock',
    'FolderHeart',
    'FolderStar',
    'FolderUp',
    'FolderDown',
    'FolderLeft',
    'FolderRight',
    'FolderInput',
    'FolderOutput',
    'FolderSync',
    'FolderGit',
    'FolderGit2',
    'FolderGitBranch',
    'FolderGitCommit',
    'FolderGitPullRequest',
    'FolderGitMerge',
    'FolderGitDiff',
    'FolderGitLog',
    'FolderGitRef',
    'FolderGitTag',
    'FolderGitTree',
    'FolderGitWorktree',
    'FolderGitSubmodule',
    'FolderGitLfs',
    'FolderGitIgnore',
    'FolderGitAttributes',
    'FolderGitConfig',
    'FolderGitHooks',
    'FolderGitInfo',
    'FolderGitLogs',
    'FolderGitObjects',
    'FolderGitRefs',
    'FolderGitRemotes',
    'FolderGitSparseCheckout',
    'FolderGitWorktrees',
  ];

  // Create the mock object with common icons
  const mockIcons: Record<string, any> = {};
  commonIcons.forEach(iconName => {
    mockIcons[iconName] = createIconComponent(iconName);
  });

  // Add a Proxy to handle any missing icons dynamically
  return new Proxy(mockIcons, {
    get(target, prop) {
      if (typeof prop === 'string' && target[prop]) {
        return target[prop];
      }
      // For any missing icon, create a dynamic component
      return createIconComponent(prop as string);
    },
  });
});
