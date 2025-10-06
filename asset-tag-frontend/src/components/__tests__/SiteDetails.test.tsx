import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteDetails } from '../sites/SiteDetails';
import { render, waitForAsync } from '../../test/test-utils';

// Mock the services
vi.mock('../../services/api', () => ({
  fetchSiteActivity: vi.fn().mockResolvedValue({
    data: [
      { time: '2024-01-01', assets: 10, personnel: 5 },
      { time: '2024-01-02', assets: 12, personnel: 6 },
    ],
  }),
  getPresetDateRange: vi.fn().mockReturnValue({
    start: new Date('2024-01-01'),
    end: new Date('2024-01-02'),
    granularity: 'daily' as const,
  }),
}));

// Mock the mock data
vi.mock('../../data/mockData', () => ({
  getGeofenceById: vi.fn().mockReturnValue({
    id: 'GF-001',
    name: 'Main Warehouse Geofence',
    status: 'active',
    center: [30.2672, -97.7431],
    radius: 500,
    tolerance: 50,
    alertOnEntry: true,
    alertOnExit: true,
  }),
}));

// Mock the GeofenceMapEditor component
vi.mock('../GeofenceMapEditor', () => ({
  GeofenceMapEditor: ({
    coordinates,
    tolerance,
    name,
    isEditing,
    onCoordinatesChange,
    onToleranceChange,
  }: any) => (
    <div data-testid='geofence-map-editor'>
      <div>Map Editor for {name}</div>
      <div>
        Coordinates: {coordinates.lat}, {coordinates.lng}
      </div>
      <div>Tolerance: {tolerance}</div>
      <div>Editing: {isEditing ? 'Yes' : 'No'}</div>
      <button
        onClick={() =>
          onCoordinatesChange({ lat: 30.2672, lng: -97.7431, radius: 600 })
        }
        data-testid='change-coordinates'
      >
        Change Coordinates
      </button>
      <button
        onClick={() => onToleranceChange(75)}
        data-testid='change-tolerance'
      >
        Change Tolerance
      </button>
    </div>
  ),
}));

describe('SiteDetails Component', () => {
  const mockSite = {
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
  };

  const defaultProps = {
    site: mockSite,
    onBack: vi.fn(),
    onCreateGeofence: vi.fn(),
    onEditGeofence: vi.fn(),
    onSiteUpdate: vi.fn(),
    initialTab: 'overview',
    onTabChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Basic Functionality', () => {
    it('should render the site details page with header', () => {
      render(<SiteDetails {...defaultProps} />);

      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
      expect(screen.getByText('ST-001')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('should render the back button', () => {
      render(<SiteDetails {...defaultProps} />);

      const backButton = screen.getByRole('button', { name: '' }); // Icon button
      expect(backButton).toBeInTheDocument();
    });

    it('should render stats cards', () => {
      render(<SiteDetails {...defaultProps} />);

      expect(screen.getByText('Assets On-Site')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Personnel')).toBeInTheDocument();
      expect(screen.getByText('Active Assets')).toBeInTheDocument();
      expect(screen.getByText('Utilization')).toBeInTheDocument();
    });

    it('should render tabs navigation', () => {
      render(<SiteDetails {...defaultProps} />);

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Assets')).toBeInTheDocument();
      expect(screen.getByText('Location & Boundary')).toBeInTheDocument();
      expect(screen.getByText('Activity')).toBeInTheDocument();
    });

    it('should start with overview tab active by default', () => {
      render(<SiteDetails {...defaultProps} />);

      expect(screen.getByText('Site Information')).toBeInTheDocument();
      expect(screen.getByText('Asset Distribution')).toBeInTheDocument();
      expect(screen.getByText('Recent Events')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to assets tab when clicked', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const assetsTab = screen.getByText('Assets');
      await user.click(assetsTab);

      expect(screen.getByText('Assets Currently at Site')).toBeInTheDocument();
      expect(screen.getByText('Asset ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Battery')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
    });

    it('should switch to location tab when clicked', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText('Location & Boundary');
      await user.click(locationTab);

      expect(screen.getByText('Site Location & Boundary')).toBeInTheDocument();
      expect(screen.getByTestId('geofence-map-editor')).toBeInTheDocument();
      expect(screen.getByText('Geofence')).toBeInTheDocument();
    });

    it('should switch to activity tab when clicked', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const activityTab = screen.getByText('Activity');
      await user.click(activityTab);

      expect(screen.getByText('24-Hour Activity')).toBeInTheDocument();
    });

    it('should call onTabChange when tab is changed', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const assetsTab = screen.getByText('Assets');
      await user.click(assetsTab);

      expect(defaultProps.onTabChange).toHaveBeenCalledWith('assets');
    });
  });

  describe('Edit Functionality', () => {
    it('should enter edit mode when Edit Site button is clicked', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit site/i });
      await user.click(editButton);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Main Warehouse')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('123 Main St, Austin, TX 78701')
      ).toBeInTheDocument();
    });

    it('should exit edit mode when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit site/i });
      await user.click(editButton);

      // Cancel edit
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.getByText('Edit Site')).toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('should save changes when Save Changes button is clicked', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit site/i });
      await user.click(editButton);

      // Modify site name
      const nameInput = screen.getByDisplayValue('Main Warehouse');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Warehouse');

      // Save changes
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(screen.getByText('Edit Site')).toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('should update form fields in edit mode', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit site/i });
      await user.click(editButton);

      // Check that form fields are present
      expect(screen.getByDisplayValue('Main Warehouse')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('123 Main St, Austin, TX 78701')
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    });
  });

  describe('Location and Boundary Management', () => {
    it('should render geofence map editor in location tab', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText('Location & Boundary');
      await user.click(locationTab);

      expect(screen.getByTestId('geofence-map-editor')).toBeInTheDocument();
      expect(
        screen.getByText('Map Editor for Main Warehouse')
      ).toBeInTheDocument();
    });

    it('should enter boundary editing mode when Edit Boundary button is clicked', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText('Location & Boundary');
      await user.click(locationTab);

      const editBoundaryButton = screen.getByRole('button', {
        name: /edit boundary/i,
      });
      await user.click(editBoundaryButton);

      expect(screen.getByText('Editing: Yes')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('should update coordinates when map editor calls onCoordinatesChange', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText('Location & Boundary');
      await user.click(locationTab);

      const editBoundaryButton = screen.getByRole('button', {
        name: /edit boundary/i,
      });
      await user.click(editBoundaryButton);

      const changeCoordinatesButton = screen.getByTestId('change-coordinates');
      await user.click(changeCoordinatesButton);

      expect(
        screen.getByText('Coordinates: 30.2672, -97.7431')
      ).toBeInTheDocument();
    });

    it('should update tolerance when map editor calls onToleranceChange', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText('Location & Boundary');
      await user.click(locationTab);

      const editBoundaryButton = screen.getByRole('button', {
        name: /edit boundary/i,
      });
      await user.click(editBoundaryButton);

      const changeToleranceButton = screen.getByTestId('change-tolerance');
      await user.click(changeToleranceButton);

      expect(screen.getByText('Tolerance: 75')).toBeInTheDocument();
    });

    it('should save boundary changes when Save Changes is clicked', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText('Location & Boundary');
      await user.click(locationTab);

      const editBoundaryButton = screen.getByRole('button', {
        name: /edit boundary/i,
      });
      await user.click(editBoundaryButton);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(defaultProps.onSiteUpdate).toHaveBeenCalled();
    });
  });

  describe('Geofence Management', () => {
    it('should display existing geofence information', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText('Location & Boundary');
      await user.click(locationTab);

      expect(screen.getByText('Main Warehouse Geofence')).toBeInTheDocument();
      expect(screen.getByText('GF-001')).toBeInTheDocument();
      expect(screen.getByText('500 feet')).toBeInTheDocument();
      expect(screen.getByText('±50 feet')).toBeInTheDocument();
    });

    it('should show create geofence button when no geofence exists', async () => {
      const siteWithoutGeofence = { ...mockSite, geofenceId: undefined };
      render(<SiteDetails {...defaultProps} site={siteWithoutGeofence} />);

      const locationTab = screen.getByText('Location & Boundary');
      await user.click(locationTab);

      expect(
        screen.getByText('No geofence configured for this site')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /create geofence/i })
      ).toBeInTheDocument();
    });

    it('should call onCreateGeofence when Create Geofence button is clicked', async () => {
      const user = userEvent.setup();
      const siteWithoutGeofence = { ...mockSite, geofenceId: undefined };
      render(<SiteDetails {...defaultProps} site={siteWithoutGeofence} />);

      const locationTab = screen.getByText('Location & Boundary');
      await user.click(locationTab);

      const createButton = screen.getByRole('button', {
        name: /create geofence/i,
      });
      await user.click(createButton);

      expect(defaultProps.onCreateGeofence).toHaveBeenCalledWith(
        {
          siteId: 'ST-001',
          siteName: 'Main Warehouse',
          latitude: 30.2672,
          longitude: -97.7431,
          radius: 500,
          tolerance: 50,
        },
        'location'
      );
    });

    it('should call onEditGeofence when Edit button is clicked on existing geofence', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText('Location & Boundary');
      await user.click(locationTab);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(defaultProps.onEditGeofence).toHaveBeenCalledWith(
        'GF-001',
        {
          siteId: 'ST-001',
          siteName: 'Main Warehouse',
          latitude: 30.2672,
          longitude: -97.7431,
          radius: 500,
          tolerance: 50,
          name: 'Main Warehouse Geofence',
          alertOnEntry: true,
          alertOnExit: true,
        },
        'location'
      );
    });
  });

  describe('Activity Tab', () => {
    it('should render activity chart and controls', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const activityTab = screen.getByText('Activity');
      await user.click(activityTab);

      expect(screen.getByText('24-Hour Activity')).toBeInTheDocument();
      expect(screen.getByText('24 Hours')).toBeInTheDocument();
    });

    it('should change time range when different option is selected', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const activityTab = screen.getByText('Activity');
      await user.click(activityTab);

      const timeRangeSelect = screen.getByRole('combobox');
      await user.click(timeRangeSelect);
      await user.click(screen.getByText('7 Days'));

      expect(screen.getByText('7-Day Activity')).toBeInTheDocument();
    });

    it('should show custom date range controls when custom is selected', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const activityTab = screen.getByText('Activity');
      await user.click(activityTab);

      const timeRangeSelect = screen.getByRole('combobox');
      await user.click(timeRangeSelect);
      await user.click(screen.getByText('Custom Range'));

      expect(screen.getByText('From:')).toBeInTheDocument();
      expect(screen.getByText('To:')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const backButton = screen.getByRole('button', { name: '' }); // Icon button
      await user.click(backButton);

      expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<SiteDetails {...defaultProps} />);

      // Check tab navigation
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(4);

      // Check buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Check form elements in edit mode
      const editButton = screen.getByRole('button', { name: /edit site/i });
      expect(editButton).toBeInTheDocument();
    });

    it('should maintain keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      // Tab through elements
      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: '' })
      ); // Back button

      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: /edit site/i })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle missing geofence gracefully', async () => {
      const { getGeofenceById } = await import('../../data/mockData');
      vi.mocked(getGeofenceById).mockReturnValueOnce(null);

      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText('Location & Boundary');
      await user.click(locationTab);

      // Should not crash and should show create geofence option
      expect(
        screen.getByRole('button', { name: /create geofence/i })
      ).toBeInTheDocument();
    });
  });
});
