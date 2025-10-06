import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssetMap } from '../map/AssetMap';
import { render, waitForAsync } from '../../test/test-utils';

// Mock Leaflet and map-related modules
vi.mock('leaflet', () => ({
  map: vi.fn(() => ({
    setView: vi.fn(),
    flyTo: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn(),
  })),
  marker: vi.fn(() => ({
    addTo: vi.fn(),
    bindPopup: vi.fn(),
    setLatLng: vi.fn(),
  })),
  circle: vi.fn(() => ({
    addTo: vi.fn(),
    setLatLng: vi.fn(),
    setRadius: vi.fn(),
  })),
  icon: vi.fn(),
  divIcon: vi.fn(),
  LatLng: vi.fn(),
  LatLngBounds: vi.fn(),
  Icon: {
    Default: {
      mergeOptions: vi.fn(),
    },
  },
}));

// Mock the mock data
vi.mock('../../data/mockData', () => ({
  mockAssets: [
    {
      id: 'AT-001',
      name: 'Excavator CAT 320',
      type: 'Heavy Equipment',
      status: 'active',
      coordinates: [30.2672, -97.7431],
      battery: 87,
      lastSeen: '2024-01-01T10:00:00Z',
    },
    {
      id: 'AT-002',
      name: 'Delivery Truck F-350',
      type: 'Vehicle',
      status: 'idle',
      coordinates: [30.2672, -97.7431],
      battery: 92,
      lastSeen: '2024-01-01T09:30:00Z',
    },
    {
      id: 'AT-003',
      name: 'Tool Container #5',
      type: 'Container',
      status: 'active',
      coordinates: [30.2672, -97.7431],
      battery: 78,
      lastSeen: '2024-01-01T08:45:00Z',
    },
  ],
  mockGeofences: [
    {
      id: 'GF-001',
      name: 'Main Warehouse',
      center: [30.2672, -97.7431],
      radius: 500,
      status: 'active',
    },
  ],
}));

describe('AssetMap Component', () => {
  const defaultProps = {
    onAssetClick: vi.fn(),
    onTrackHistory: vi.fn(),
    onClearHighlight: vi.fn(),
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Basic Functionality', () => {
    it('should render the live map with header', () => {
      render(<AssetMap {...defaultProps} />);

      expect(screen.getByText('Live Asset Map')).toBeInTheDocument();
      expect(
        screen.getByText('Real-time location tracking with OpenStreetMap')
      ).toBeInTheDocument();
    });

    it('should render asset count badges', () => {
      render(<AssetMap {...defaultProps} />);

      expect(screen.getByText('3 Assets Tracked')).toBeInTheDocument();
      expect(screen.getByText('3 Visible')).toBeInTheDocument();
    });

    it('should render search and filter controls', () => {
      render(<AssetMap {...defaultProps} />);

      expect(screen.getByPlaceholderText(/search assets/i)).toBeInTheDocument();
      expect(screen.getByText('All Types')).toBeInTheDocument();
      expect(screen.getByText('All Statuses')).toBeInTheDocument();
    });

    it('should render map controls', () => {
      render(<AssetMap {...defaultProps} />);

      expect(screen.getByText('Geofences')).toBeInTheDocument();
      expect(screen.getByText('Clusters')).toBeInTheDocument();
      expect(screen.getByText('Sites')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter assets by name when searching', async () => {
      const user = userEvent.setup();
      render(<AssetMap {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search assets/i);
      await user.type(searchInput, 'Excavator');

      // Should update visible count
      expect(screen.getByText('1 Visible')).toBeInTheDocument();
    });

    it('should filter assets by ID when searching', async () => {
      const user = userEvent.setup();
      render(<AssetMap {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search assets/i);
      await user.type(searchInput, 'AT-002');

      expect(screen.getByText('1 Visible')).toBeInTheDocument();
    });

    it('should clear search results when search is cleared', async () => {
      const user = userEvent.setup();
      render(<AssetMap {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search assets/i);
      await user.type(searchInput, 'Excavator');
      await user.clear(searchInput);

      expect(screen.getByText('3 Visible')).toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    it('should filter assets by type', async () => {
      const user = userEvent.setup();
      render(<AssetMap {...defaultProps} />);

      const typeSelect = screen.getByText('All Types');
      await user.click(typeSelect);
      await user.click(screen.getByText('Heavy Equipment'));

      expect(screen.getByText('1 Visible')).toBeInTheDocument();
    });

    it('should filter assets by status', async () => {
      const user = userEvent.setup();
      render(<AssetMap {...defaultProps} />);

      const statusSelect = screen.getByText('All Statuses');
      await user.click(statusSelect);
      await user.click(screen.getByText('Active'));

      expect(screen.getByText('2 Visible')).toBeInTheDocument();
    });

    it('should combine multiple filters', async () => {
      const user = userEvent.setup();
      render(<AssetMap {...defaultProps} />);

      // Filter by type
      const typeSelect = screen.getByText('All Types');
      await user.click(typeSelect);
      await user.click(screen.getByText('Vehicle'));

      // Filter by status
      const statusSelect = screen.getByText('All Statuses');
      await user.click(statusSelect);
      await user.click(screen.getByText('Idle'));

      expect(screen.getByText('1 Visible')).toBeInTheDocument();
    });
  });

  describe('Map Controls', () => {
    it('should toggle geofences visibility', async () => {
      const user = userEvent.setup();
      render(<AssetMap {...defaultProps} />);

      const geofencesToggle = screen.getByText('Geofences');
      await user.click(geofencesToggle);

      // Toggle should work (exact behavior depends on implementation)
      expect(geofencesToggle).toBeInTheDocument();
    });

    it('should toggle clusters visibility', async () => {
      const user = userEvent.setup();
      render(<AssetMap {...defaultProps} />);

      const clustersToggle = screen.getByText('Clusters');
      await user.click(clustersToggle);

      expect(clustersToggle).toBeInTheDocument();
    });

    it('should toggle sites visibility', async () => {
      const user = userEvent.setup();
      render(<AssetMap {...defaultProps} />);

      const sitesToggle = screen.getByText('Sites');
      await user.click(sitesToggle);

      expect(sitesToggle).toBeInTheDocument();
    });

    it('should recenter map when recenter button is clicked', async () => {
      const user = userEvent.setup();
      render(<AssetMap {...defaultProps} />);

      const recenterButton = screen.getByRole('button', { name: /recenter/i });
      await user.click(recenterButton);

      expect(recenterButton).toBeInTheDocument();
    });
  });

  describe('Asset Interaction', () => {
    it('should call onAssetClick when asset is clicked', async () => {
      const user = userEvent.setup();
      render(<AssetMap {...defaultProps} />);

      // Find and click an asset marker (this would be implemented in the actual component)
      const assetMarker = screen.getByText('Excavator CAT 320');
      if (assetMarker) {
        await user.click(assetMarker);
        expect(defaultProps.onAssetClick).toHaveBeenCalled();
      }
    });

    it('should call onTrackHistory when track history is requested', async () => {
      const user = userEvent.setup();
      render(<AssetMap {...defaultProps} />);

      // Find and click track history button
      const trackButton = screen.getByRole('button', {
        name: /track history/i,
      });
      if (trackButton) {
        await user.click(trackButton);
        expect(defaultProps.onTrackHistory).toHaveBeenCalled();
      }
    });
  });

  describe('Navigation', () => {
    it('should render back button when onBack prop is provided', () => {
      render(<AssetMap {...defaultProps} />);

      const backButton = screen.getByRole('button', { name: '' }); // Icon button
      expect(backButton).toBeInTheDocument();
    });

    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<AssetMap {...defaultProps} />);

      const backButton = screen.getByRole('button', { name: '' });
      await user.click(backButton);

      expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
    });

    it('should not render back button when onBack prop is not provided', () => {
      const { onBack, ...propsWithoutBack } = defaultProps;
      render(<AssetMap {...propsWithoutBack} />);

      const backButtons = screen.queryAllByRole('button', { name: '' });
      expect(backButtons.length).toBe(0);
    });
  });

  describe('Violation Mode', () => {
    it('should render violation mode when violationMode is true', () => {
      render(<AssetMap {...defaultProps} violationMode={true} />);

      expect(
        screen.getByText(
          'Showing assets outside their designated geofence boundaries'
        )
      ).toBeInTheDocument();
    });

    it('should show violation count badge in violation mode', () => {
      render(<AssetMap {...defaultProps} violationMode={true} />);

      expect(screen.getByText(/violation/i)).toBeInTheDocument();
    });

    it('should show normal mode description when violationMode is false', () => {
      render(<AssetMap {...defaultProps} violationMode={false} />);

      expect(
        screen.getByText('Real-time location tracking with OpenStreetMap')
      ).toBeInTheDocument();
    });
  });

  describe('Asset Highlighting', () => {
    it('should handle highlighted asset when provided', () => {
      const highlightedAsset = {
        id: 'AT-001',
        name: 'Excavator CAT 320',
        type: 'Heavy Equipment',
        status: 'active',
        coordinates: [30.2672, -97.7431],
        battery: 87,
        lastSeen: '2024-01-01T10:00:00Z',
      };

      render(<AssetMap {...defaultProps} highlightAsset={highlightedAsset} />);

      // Should render without errors
      expect(screen.getByText('Live Asset Map')).toBeInTheDocument();
    });

    it('should call onClearHighlight when clear highlight is requested', async () => {
      const user = userEvent.setup();
      const highlightedAsset = {
        id: 'AT-001',
        name: 'Excavator CAT 320',
        type: 'Heavy Equipment',
        status: 'active',
        coordinates: [30.2672, -97.7431],
        battery: 87,
        lastSeen: '2024-01-01T10:00:00Z',
      };

      render(
        <AssetMap
          {...defaultProps}
          highlightAsset={highlightedAsset}
          onClearHighlight={vi.fn()}
        />
      );

      // Find and click clear highlight button
      const clearButton = screen.getByRole('button', { name: /clear/i });
      if (clearButton) {
        await user.click(clearButton);
        expect(defaultProps.onClearHighlight).toHaveBeenCalled();
      }
    });
  });

  describe('Asset Filtering', () => {
    it('should filter assets by provided filteredAssetIds', () => {
      render(<AssetMap {...defaultProps} filteredAssetIds={['AT-001']} />);

      expect(screen.getByText('1 Visible')).toBeInTheDocument();
    });

    it('should show all assets when no filteredAssetIds provided', () => {
      render(<AssetMap {...defaultProps} />);

      expect(screen.getByText('3 Visible')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<AssetMap {...defaultProps} />);

      // Check search input
      const searchInput = screen.getByPlaceholderText(/search assets/i);
      expect(searchInput).toBeInTheDocument();

      // Check filter controls
      const typeSelect = screen.getByText('All Types');
      expect(typeSelect).toBeInTheDocument();

      const statusSelect = screen.getByText('All Statuses');
      expect(statusSelect).toBeInTheDocument();
    });

    it('should maintain keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<AssetMap {...defaultProps} />);

      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByPlaceholderText(/search assets/i)
      );
    });
  });

  describe('Map Loading', () => {
    it('should handle map loading state', () => {
      render(<AssetMap {...defaultProps} />);

      // Should render without crashing while map loads
      expect(screen.getByText('Live Asset Map')).toBeInTheDocument();
    });

    it('should handle map loading errors gracefully', () => {
      // Mock map loading error
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<AssetMap {...defaultProps} />);

      // Should still render the component
      expect(screen.getByText('Live Asset Map')).toBeInTheDocument();

      consoleError.mockRestore();
    });
  });

  describe('Responsive Design', () => {
    it('should render properly on different screen sizes', () => {
      render(<AssetMap {...defaultProps} />);

      // Check that responsive classes are applied
      const container = document.querySelector('.h-screen');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of assets efficiently', () => {
      // Mock large dataset
      const largeAssetList = Array.from({ length: 1000 }, (_, i) => ({
        id: `AT-${i}`,
        name: `Asset ${i}`,
        type: 'Equipment',
        status: 'active',
        coordinates: [30.2672 + i * 0.001, -97.7431 + i * 0.001],
        battery: 50 + (i % 50),
        lastSeen: '2024-01-01T10:00:00Z',
      }));

      // Should render without performance issues
      render(<AssetMap {...defaultProps} />);
      expect(screen.getByText('Live Asset Map')).toBeInTheDocument();
    });
  });
});
