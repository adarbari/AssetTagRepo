// import React from &apos;react&apos;;
import { describe, it, expect, vi, beforeEach } from &apos;vitest&apos;;
import { screen } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { SiteDetails } from &apos;../sites/SiteDetails&apos;;
import { render } from &apos;../../test/test-utils&apos;;

// Mock the services
vi.mock(&apos;../../services/api&apos;, () => ({
  fetchSiteActivity: vi.fn().mockResolvedValue({
    data: [
      { time: &apos;2024-01-01&apos;, assets: 10, personnel: 5 },
      { time: &apos;2024-01-02&apos;, assets: 12, personnel: 6 },
    ],
  }),
  getPresetDateRange: vi.fn().mockReturnValue({
    start: new Date(&apos;2024-01-01&apos;),
    end: new Date(&apos;2024-01-02&apos;),
    granularity: &apos;daily&apos; as const,
  }),
}));

// Mock the mock data
vi.mock(&apos;../../data/mockData&apos;, () => ({
  getGeofenceById: vi.fn().mockReturnValue({
    id: &apos;GF-001&apos;,
    name: &apos;Main Warehouse Geofence&apos;,
    status: &apos;active&apos;,
    center: [30.2672, -97.7431],
    radius: 500,
    tolerance: 50,
    alertOnEntry: true,
    alertOnExit: true,
  }),
}));

// Mock the GeofenceMapEditor component
vi.mock(&apos;../GeofenceMapEditor&apos;, () => ({
  GeofenceMapEditor: ({
    coordinates,
    tolerance,
    name,
    isEditing,
    onCoordinatesChange,
    onToleranceChange,
  }: any) => (
    <div data-testid=&apos;geofence-map-editor&apos;>
      <div>Map Editor for {name}</div>
      <div>
        Coordinates: {coordinates.lat}, {coordinates.lng}
      </div>
      <div>Tolerance: {tolerance}</div>
      <div>Editing: {isEditing ? &apos;Yes&apos; : &apos;No&apos;}</div>
      <button
        onClick={() =>
          onCoordinatesChange({ lat: 30.2672, lng: -97.7431, radius: 600 })
        }
        data-testid=&apos;change-coordinates&apos;
      >
        Change Coordinates
      </button>
      <button
        onClick={() => onToleranceChange(75)}
        data-testid=&apos;change-tolerance&apos;
      >
        Change Tolerance
      </button>
    </div>
  ),
}));

describe(&apos;SiteDetails Component&apos;, () => {
  const mockSite = {
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

  const defaultProps = {
    site: mockSite,
    onBack: vi.fn(),
    onCreateGeofence: vi.fn(),
    onEditGeofence: vi.fn(),
    onSiteUpdate: vi.fn(),
    initialTab: &apos;overview&apos;,
    onTabChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe(&apos;Rendering and Basic Functionality&apos;, () => {
    it(&apos;should render the site details page with header&apos;, () => {
      render(<SiteDetails {...defaultProps} />);

      expect(screen.getByText(&apos;Main Warehouse&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;ST-001&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;active&apos;)).toBeInTheDocument();
    });

    it(&apos;should render the back button&apos;, () => {
      render(<SiteDetails {...defaultProps} />);

      const backButton = screen.getByRole(&apos;button&apos;, { name: &apos;&apos; }); // Icon button
      expect(backButton).toBeInTheDocument();
    });

    it(&apos;should render stats cards&apos;, () => {
      render(<SiteDetails {...defaultProps} />);

      expect(screen.getByText(&apos;Assets On-Site&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;150&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Personnel&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Active Assets&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Utilization&apos;)).toBeInTheDocument();
    });

    it(&apos;should render tabs navigation&apos;, () => {
      render(<SiteDetails {...defaultProps} />);

      expect(screen.getByText(&apos;Overview&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Assets&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Location & Boundary&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Activity&apos;)).toBeInTheDocument();
    });

    it(&apos;should start with overview tab active by default&apos;, () => {
      render(<SiteDetails {...defaultProps} />);

      expect(screen.getByText(&apos;Site Information&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Asset Distribution&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Recent Events&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Tab Navigation&apos;, () => {
    it(&apos;should switch to assets tab when clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const assetsTab = screen.getByText(&apos;Assets&apos;);
      await user.click(assetsTab);

      expect(screen.getByText(&apos;Assets Currently at Site&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Asset ID&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Name&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Type&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Battery&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Status&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Duration&apos;)).toBeInTheDocument();
    });

    it(&apos;should switch to location tab when clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText(&apos;Location & Boundary&apos;);
      await user.click(locationTab);

      expect(screen.getByText(&apos;Site Location & Boundary&apos;)).toBeInTheDocument();
      expect(screen.getByTestId(&apos;geofence-map-editor&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Geofence&apos;)).toBeInTheDocument();
    });

    it(&apos;should switch to activity tab when clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const activityTab = screen.getByText(&apos;Activity&apos;);
      await user.click(activityTab);

      expect(screen.getByText(&apos;24-Hour Activity&apos;)).toBeInTheDocument();
    });

    it(&apos;should call onTabChange when tab is changed&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const assetsTab = screen.getByText(&apos;Assets&apos;);
      await user.click(assetsTab);

      expect(defaultProps.onTabChange).toHaveBeenCalledWith(&apos;assets&apos;);
    });
  });

  describe(&apos;Edit Functionality&apos;, () => {
    it(&apos;should enter edit mode when Edit Site button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit site/i });
      await user.click(editButton);

      expect(screen.getByText(&apos;Cancel&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Save Changes&apos;)).toBeInTheDocument();
      expect(screen.getByDisplayValue(&apos;Main Warehouse&apos;)).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(&apos;123 Main St, Austin, TX 78701&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;should exit edit mode when Cancel button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      // Enter edit mode
      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit site/i });
      await user.click(editButton);

      // Cancel edit
      const cancelButton = screen.getByRole(&apos;button&apos;, { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.getByText(&apos;Edit Site&apos;)).toBeInTheDocument();
      expect(screen.queryByText(&apos;Cancel&apos;)).not.toBeInTheDocument();
    });

    it(&apos;should save changes when Save Changes button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      // Enter edit mode
      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit site/i });
      await user.click(editButton);

      // Modify site name
      const nameInput = screen.getByDisplayValue(&apos;Main Warehouse&apos;);
      await user.clear(nameInput);
      await user.type(nameInput, &apos;Updated Warehouse&apos;);

      // Save changes
      const saveButton = screen.getByRole(&apos;button&apos;, { name: /save changes/i });
      await user.click(saveButton);

      expect(screen.getByText(&apos;Edit Site&apos;)).toBeInTheDocument();
      expect(screen.queryByText(&apos;Cancel&apos;)).not.toBeInTheDocument();
    });

    it(&apos;should update form fields in edit mode&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      // Enter edit mode
      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit site/i });
      await user.click(editButton);

      // Check that form fields are present
      expect(screen.getByDisplayValue(&apos;Main Warehouse&apos;)).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(&apos;123 Main St, Austin, TX 78701&apos;)
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue(&apos;50&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Location and Boundary Management&apos;, () => {
    it(&apos;should render geofence map editor in location tab&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText(&apos;Location & Boundary&apos;);
      await user.click(locationTab);

      expect(screen.getByTestId(&apos;geofence-map-editor&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Map Editor for Main Warehouse&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;should enter boundary editing mode when Edit Boundary button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText(&apos;Location & Boundary&apos;);
      await user.click(locationTab);

      const editBoundaryButton = screen.getByRole(&apos;button&apos;, {
        name: /edit boundary/i,
      });
      await user.click(editBoundaryButton);

      expect(screen.getByText(&apos;Editing: Yes&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Cancel&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Save Changes&apos;)).toBeInTheDocument();
    });

    it(&apos;should update coordinates when map editor calls onCoordinatesChange&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText(&apos;Location & Boundary&apos;);
      await user.click(locationTab);

      const editBoundaryButton = screen.getByRole(&apos;button&apos;, {
        name: /edit boundary/i,
      });
      await user.click(editBoundaryButton);

      const changeCoordinatesButton = screen.getByTestId(&apos;change-coordinates&apos;);
      await user.click(changeCoordinatesButton);

      expect(
        screen.getByText(&apos;Coordinates: 30.2672, -97.7431&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;should update tolerance when map editor calls onToleranceChange&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText(&apos;Location & Boundary&apos;);
      await user.click(locationTab);

      const editBoundaryButton = screen.getByRole(&apos;button&apos;, {
        name: /edit boundary/i,
      });
      await user.click(editBoundaryButton);

      const changeToleranceButton = screen.getByTestId(&apos;change-tolerance&apos;);
      await user.click(changeToleranceButton);

      expect(screen.getByText(&apos;Tolerance: 75&apos;)).toBeInTheDocument();
    });

    it(&apos;should save boundary changes when Save Changes is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText(&apos;Location & Boundary&apos;);
      await user.click(locationTab);

      const editBoundaryButton = screen.getByRole(&apos;button&apos;, {
        name: /edit boundary/i,
      });
      await user.click(editBoundaryButton);

      const saveButton = screen.getByRole(&apos;button&apos;, { name: /save changes/i });
      await user.click(saveButton);

      expect(defaultProps.onSiteUpdate).toHaveBeenCalled();
    });
  });

  describe(&apos;Geofence Management&apos;, () => {
    it(&apos;should display existing geofence information&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText(&apos;Location & Boundary&apos;);
      await user.click(locationTab);

      expect(screen.getByText(&apos;Main Warehouse Geofence&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;GF-001&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;500 feet&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;±50 feet&apos;)).toBeInTheDocument();
    });

    it(&apos;should show create geofence button when no geofence exists&apos;, async () => {
      const user = userEvent.setup();
      const siteWithoutGeofence = { ...mockSite, geofenceId: undefined };
      render(<SiteDetails {...defaultProps} site={siteWithoutGeofence} />);

      const locationTab = screen.getByText(&apos;Location & Boundary&apos;);
      await user.click(locationTab);

      expect(
        screen.getByText(&apos;No geofence configured for this site&apos;)
      ).toBeInTheDocument();
      expect(
        screen.getByRole(&apos;button&apos;, { name: /create geofence/i })
      ).toBeInTheDocument();
    });

    it(&apos;should call onCreateGeofence when Create Geofence button is clicked&apos;, async () => {
      const user = userEvent.setup();
      const siteWithoutGeofence = { ...mockSite, geofenceId: undefined };
      render(<SiteDetails {...defaultProps} site={siteWithoutGeofence} />);

      const locationTab = screen.getByText(&apos;Location & Boundary&apos;);
      await user.click(locationTab);

      const createButton = screen.getByRole(&apos;button&apos;, {
        name: /create geofence/i,
      });
      await user.click(createButton);

      expect(defaultProps.onCreateGeofence).toHaveBeenCalledWith(
        {
          siteId: &apos;ST-001&apos;,
          siteName: &apos;Main Warehouse&apos;,
          latitude: 30.2672,
          longitude: -97.7431,
          radius: 500,
          tolerance: 50,
        },
        &apos;location&apos;
      );
    });

    it(&apos;should call onEditGeofence when Edit button is clicked on existing geofence&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText(&apos;Location & Boundary&apos;);
      await user.click(locationTab);

      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit/i });
      await user.click(editButton);

      expect(defaultProps.onEditGeofence).toHaveBeenCalledWith(
        &apos;GF-001&apos;,
        {
          siteId: &apos;ST-001&apos;,
          siteName: &apos;Main Warehouse&apos;,
          latitude: 30.2672,
          longitude: -97.7431,
          radius: 500,
          tolerance: 50,
          name: &apos;Main Warehouse Geofence&apos;,
          alertOnEntry: true,
          alertOnExit: true,
        },
        &apos;location&apos;
      );
    });
  });

  describe(&apos;Activity Tab&apos;, () => {
    it(&apos;should render activity chart and controls&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const activityTab = screen.getByText(&apos;Activity&apos;);
      await user.click(activityTab);

      expect(screen.getByText(&apos;24-Hour Activity&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;24 Hours&apos;)).toBeInTheDocument();
    });

    it(&apos;should change time range when different option is selected&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const activityTab = screen.getByText(&apos;Activity&apos;);
      await user.click(activityTab);

      const timeRangeSelect = screen.getByRole(&apos;combobox&apos;);
      await user.click(timeRangeSelect);
      await user.click(screen.getByText(&apos;7 Days&apos;));

      expect(screen.getByText(&apos;7-Day Activity&apos;)).toBeInTheDocument();
    });

    it(&apos;should show custom date range controls when custom is selected&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const activityTab = screen.getByText(&apos;Activity&apos;);
      await user.click(activityTab);

      const timeRangeSelect = screen.getByRole(&apos;combobox&apos;);
      await user.click(timeRangeSelect);
      await user.click(screen.getByText(&apos;Custom Range&apos;));

      expect(screen.getByText(&apos;From:&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;To:&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Navigation&apos;, () => {
    it(&apos;should call onBack when back button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      const backButton = screen.getByRole(&apos;button&apos;, { name: &apos;&apos; }); // Icon button
      await user.click(backButton);

      expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Accessibility&apos;, () => {
    it(&apos;should have proper ARIA labels and roles&apos;, () => {
      render(<SiteDetails {...defaultProps} />);

      // Check tab navigation
      const tabs = screen.getAllByRole(&apos;tab&apos;);
      expect(tabs.length).toBe(4);

      // Check buttons
      const buttons = screen.getAllByRole(&apos;button&apos;);
      expect(buttons.length).toBeGreaterThan(0);

      // Check form elements in edit mode
      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit site/i });
      expect(editButton).toBeInTheDocument();
    });

    it(&apos;should maintain keyboard navigation&apos;, async () => {
      const user = userEvent.setup();
      render(<SiteDetails {...defaultProps} />);

      // Tab through elements
      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByRole(&apos;button&apos;, { name: &apos;&apos; })
      ); // Back button

      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByRole(&apos;button&apos;, { name: /edit site/i })
      );
    });
  });

  describe(&apos;Error Handling&apos;, () => {
    it(&apos;should handle missing geofence gracefully&apos;, async () => {
      const user = userEvent.setup();
      const { getGeofenceById } = await import(&apos;../../data/mockData&apos;);
      vi.mocked(getGeofenceById).mockReturnValueOnce(null);

      render(<SiteDetails {...defaultProps} />);

      const locationTab = screen.getByText(&apos;Location & Boundary&apos;);
      await user.click(locationTab);

      // Should not crash and should show create geofence option
      expect(
        screen.getByRole(&apos;button&apos;, { name: /create geofence/i })
      ).toBeInTheDocument();
    });
  });
});
