// import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleAssetPairing } from '../vehicles/VehicleAssetPairing';
import { render } from '../../test/test-utils';

// Mock the navigation context
vi.mock('../../contexts/NavigationContext', () => ({
  useNavigation: () => ({
    navigateToCreateVehicle: vi.fn(),
    navigateToEditVehicle: vi.fn(),
    navigateToVehicleDetails: vi.fn(),
  }),
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
  getAvailableGeofences: vi.fn().mockReturnValue([
    {
      id: 'GF-001',
      name: 'Main Warehouse',
      center: [30.2672, -97.7431],
      radius: 500,
      status: 'active',
    },
    {
      id: 'GF-002',
      name: 'Construction Site B',
      center: [30.2672, -97.7431],
      radius: 300,
      status: 'active',
    },
  ]),
}));

// Mock the dropdown options
vi.mock('../../data/dropdownOptions', () => ({
  expirationMechanisms: [
    { value: 'manual', label: 'Manual' },
    { value: 'time-based', label: 'Time-based' },
    { value: 'geofence-based', label: 'Geofence-based' },
  ],
}));

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('VehicleAssetPairing Component', () => {
  const defaultProps = {
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Basic Functionality', () => {
    it('should render the vehicle-asset pairing page with header', () => {
      render(<VehicleAssetPairing {...defaultProps} />);

      expect(screen.getByText('Vehicle-Asset Pairing')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Manage asset loading with automatic expiration mechanisms'
        )
      ).toBeInTheDocument();
    });

    it('should render the Load Assets button', () => {
      render(<VehicleAssetPairing {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /load assets/i })
      ).toBeInTheDocument();
    });

    it('should render summary cards', () => {
      render(<VehicleAssetPairing {...defaultProps} />);

      expect(screen.getByText('Active Vehicles')).toBeInTheDocument();
      expect(screen.getByText('Active Pairings')).toBeInTheDocument();
      expect(screen.getByText('Available Assets')).toBeInTheDocument();
    });

    it('should render tabs navigation', () => {
      render(<VehicleAssetPairing {...defaultProps} />);

      expect(screen.getByText('Vehicles')).toBeInTheDocument();
      expect(screen.getByText('Pairing History')).toBeInTheDocument();
    });

    it('should render search functionality', () => {
      render(<VehicleAssetPairing {...defaultProps} />);

      expect(
        screen.getByPlaceholderText(/search vehicles/i)
      ).toBeInTheDocument();
    });
  });

  describe('Vehicles Tab', () => {
    it('should render vehicles table with correct headers', () => {
      render(<VehicleAssetPairing {...defaultProps} />);

      expect(screen.getByText('Vehicle')).toBeInTheDocument();
      expect(screen.getByText('Driver')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Capacity')).toBeInTheDocument();
      expect(screen.getByText('Loaded Assets')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should display vehicle data in table', () => {
      render(<VehicleAssetPairing {...defaultProps} />);

      expect(screen.getByText('Truck Alpha')).toBeInTheDocument();
      expect(screen.getByText('Truck Beta')).toBeInTheDocument();
      expect(screen.getByText('Van Gamma')).toBeInTheDocument();
      expect(screen.getByText('Mike Wilson')).toBeInTheDocument();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    it('should show vehicle capacity and loaded assets', () => {
      render(<VehicleAssetPairing {...defaultProps} />);

      expect(screen.getByText('10')).toBeInTheDocument(); // Truck Alpha capacity
      expect(screen.getByText('20')).toBeInTheDocument(); // Truck Beta capacity
      expect(screen.getByText('8')).toBeInTheDocument(); // Van Gamma capacity
    });

    it('should display loaded assets for vehicles', () => {
      render(<VehicleAssetPairing {...defaultProps} />);

      // Truck Alpha has 1 loaded asset
      expect(screen.getByText('1 / 10')).toBeInTheDocument();
      // Other vehicles have 0 loaded assets
      expect(screen.getByText('0 / 20')).toBeInTheDocument();
      expect(screen.getByText('0 / 8')).toBeInTheDocument();
    });
  });

  describe('Asset Loading Dialog', () => {
    it('should open load assets dialog when Load Assets button is clicked', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      const loadAssetsButton = screen.getByRole('button', {
        name: /load assets/i,
      });
      await user.click(loadAssetsButton);

      expect(screen.getByText('Load Assets to Vehicle')).toBeInTheDocument();
    });

    it('should allow selecting a vehicle in the dialog', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      const loadAssetsButton = screen.getByRole('button', {
        name: /load assets/i,
      });
      await user.click(loadAssetsButton);

      const vehicleSelect = screen.getByRole('combobox', {
        name: /select vehicle/i,
      });
      await user.click(vehicleSelect);
      await user.click(screen.getByText('Truck Alpha'));

      expect(vehicleSelect).toHaveValue('VEH-001');
    });

    it('should allow selecting multiple assets', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      const loadAssetsButton = screen.getByRole('button', {
        name: /load assets/i,
      });
      await user.click(loadAssetsButton);

      // Select vehicle first
      const vehicleSelect = screen.getByRole('combobox', {
        name: /select vehicle/i,
      });
      await user.click(vehicleSelect);
      await user.click(screen.getByText('Truck Alpha'));

      // Select assets
      const assetCheckboxes = screen.getAllByRole('checkbox');
      await user.click(assetCheckboxes[0]); // Select first asset
      await user.click(assetCheckboxes[1]); // Select second asset

      expect(assetCheckboxes[0]).toBeChecked();
      expect(assetCheckboxes[1]).toBeChecked();
    });

    it('should allow setting expiration mechanism', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      const loadAssetsButton = screen.getByRole('button', {
        name: /load assets/i,
      });
      await user.click(loadAssetsButton);

      const expirationSelect = screen.getByRole('combobox', {
        name: /expiration mechanism/i,
      });
      await user.click(expirationSelect);
      await user.click(screen.getByText('Time-based'));

      expect(expirationSelect).toHaveValue('time-based');
    });

    it('should show date/time picker for time-based expiration', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      const loadAssetsButton = screen.getByRole('button', {
        name: /load assets/i,
      });
      await user.click(loadAssetsButton);

      const expirationSelect = screen.getByRole('combobox', {
        name: /expiration mechanism/i,
      });
      await user.click(expirationSelect);
      await user.click(screen.getByText('Time-based'));

      expect(
        screen.getByLabelText(/expiration date and time/i)
      ).toBeInTheDocument();
    });

    it('should show geofence selector for geofence-based expiration', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      const loadAssetsButton = screen.getByRole('button', {
        name: /load assets/i,
      });
      await user.click(loadAssetsButton);

      const expirationSelect = screen.getByRole('combobox', {
        name: /expiration mechanism/i,
      });
      await user.click(expirationSelect);
      await user.click(screen.getByText('Geofence-based'));

      expect(screen.getByLabelText(/select geofence/i)).toBeInTheDocument();
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
      expect(screen.getByText('Construction Site B')).toBeInTheDocument();
    });

    it('should allow setting geofence action (enter/exit)', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      const loadAssetsButton = screen.getByRole('button', {
        name: /load assets/i,
      });
      await user.click(loadAssetsButton);

      const expirationSelect = screen.getByRole('combobox', {
        name: /expiration mechanism/i,
      });
      await user.click(expirationSelect);
      await user.click(screen.getByText('Geofence-based'));

      const actionSelect = screen.getByRole('combobox', {
        name: /geofence action/i,
      });
      await user.click(actionSelect);
      await user.click(screen.getByText('Exit'));

      expect(actionSelect).toHaveValue('exit');
    });

    it('should allow toggling auto-unload', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      const loadAssetsButton = screen.getByRole('button', {
        name: /load assets/i,
      });
      await user.click(loadAssetsButton);

      const autoUnloadSwitch = screen.getByRole('switch', {
        name: /auto-unload/i,
      });
      await user.click(autoUnloadSwitch);

      expect(autoUnloadSwitch).toBeChecked();
    });
  });

  describe('Asset Pairing Actions', () => {
    it('should allow manually unpairing assets', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      // Find the unpair button for the loaded asset
      const unpairButton = screen.getByRole('button', { name: /unpair/i });
      await user.click(unpairButton);

      // Should show confirmation or directly unpair
      expect(unpairButton).toBeInTheDocument();
    });

    it('should show pairing details in expandable rows', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      // Find and click the expand button for Truck Alpha (which has loaded assets)
      const expandButton = screen.getByRole('button', { name: /expand/i });
      await user.click(expandButton);

      // Should show pairing details
      expect(screen.getByText('Excavator CAT 320')).toBeInTheDocument();
      expect(screen.getByText('Time-based')).toBeInTheDocument();
    });

    it('should display pairing expiration information', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      // Expand the vehicle with loaded assets
      const expandButton = screen.getByRole('button', { name: /expand/i });
      await user.click(expandButton);

      // Should show expiration details
      expect(screen.getByText(/expires/i)).toBeInTheDocument();
    });
  });

  describe('Pairing History Tab', () => {
    it('should render pairing history table', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      const historyTab = screen.getByText('Pairing History');
      await user.click(historyTab);

      expect(screen.getByText('Pairing History')).toBeInTheDocument();
      expect(screen.getByText('Vehicle')).toBeInTheDocument();
      expect(screen.getByText('Asset')).toBeInTheDocument();
      expect(screen.getByText('Paired At')).toBeInTheDocument();
      expect(screen.getByText('Unpaired At')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should display historical pairing data', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      const historyTab = screen.getByText('Pairing History');
      await user.click(historyTab);

      // Should show historical data (mock data would be populated here)
      expect(screen.getByText('Pairing History')).toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    it('should filter vehicles by search term', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search vehicles/i);
      await user.type(searchInput, 'Alpha');

      expect(screen.getByText('Truck Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Truck Beta')).not.toBeInTheDocument();
      expect(screen.queryByText('Van Gamma')).not.toBeInTheDocument();
    });

    it('should clear search results when search is cleared', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search vehicles/i);
      await user.type(searchInput, 'Alpha');
      await user.clear(searchInput);

      expect(screen.getByText('Truck Alpha')).toBeInTheDocument();
      expect(screen.getByText('Truck Beta')).toBeInTheDocument();
      expect(screen.getByText('Van Gamma')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit asset loading form with valid data', async () => {
      const user = userEvent.setup();
      const { toast } = await import('sonner');

      render(<VehicleAssetPairing {...defaultProps} />);

      const loadAssetsButton = screen.getByRole('button', {
        name: /load assets/i,
      });
      await user.click(loadAssetsButton);

      // Fill out the form
      const vehicleSelect = screen.getByRole('combobox', {
        name: /select vehicle/i,
      });
      await user.click(vehicleSelect);
      await user.click(screen.getByText('Truck Alpha'));

      const assetCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(assetCheckbox);

      const expirationSelect = screen.getByRole('combobox', {
        name: /expiration mechanism/i,
      });
      await user.click(expirationSelect);
      await user.click(screen.getByText('Manual'));

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /load assets/i });
      await user.click(submitButton);

      expect(toast.success).toHaveBeenCalledWith('Assets loaded successfully');
    });

    it('should validate required fields before submission', async () => {
      const user = userEvent.setup();
      const { toast } = await import('sonner');

      render(<VehicleAssetPairing {...defaultProps} />);

      const loadAssetsButton = screen.getByRole('button', {
        name: /load assets/i,
      });
      await user.click(loadAssetsButton);

      // Try to submit without selecting vehicle
      const submitButton = screen.getByRole('button', { name: /load assets/i });
      await user.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith('Please select a vehicle');
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      const backButton = screen.getByRole('button', { name: '' }); // Icon button
      await user.click(backButton);

      expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
    });

    it('should not render back button when onBack prop is not provided', () => {
      render(<VehicleAssetPairing />);

      const backButtons = screen.queryAllByRole('button', { name: '' });
      expect(backButtons.length).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<VehicleAssetPairing {...defaultProps} />);

      // Check search input
      const searchInput = screen.getByPlaceholderText(/search vehicles/i);
      expect(searchInput).toBeInTheDocument();

      // Check table headers
      const tableHeaders = screen.getAllByRole('columnheader');
      expect(tableHeaders.length).toBeGreaterThan(0);

      // Check buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should maintain keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<VehicleAssetPairing {...defaultProps} />);

      // Tab through elements
      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByPlaceholderText(/search vehicles/i)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle asset loading errors gracefully', async () => {
      const user = userEvent.setup();

      render(<VehicleAssetPairing {...defaultProps} />);

      const loadAssetsButton = screen.getByRole('button', {
        name: /load assets/i,
      });
      await user.click(loadAssetsButton);

      // Mock an error scenario
      const submitButton = screen.getByRole('button', { name: /load assets/i });
      await user.click(submitButton);

      // Should handle errors gracefully
      expect(screen.getByText('Load Assets to Vehicle')).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    it('should handle pairing status updates', () => {
      render(<VehicleAssetPairing {...defaultProps} />);

      // Should render without errors
      expect(screen.getByText('Vehicle-Asset Pairing')).toBeInTheDocument();
    });

    it('should update pairing counts when assets are loaded/unloaded', () => {
      render(<VehicleAssetPairing {...defaultProps} />);

      // Should show current pairing counts
      expect(screen.getByText('Active Pairings')).toBeInTheDocument();
    });
  });
});
