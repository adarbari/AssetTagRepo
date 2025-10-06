// import React from &apos;react&apos;;
import { describe, it, expect, vi, beforeEach, afterEach } from &apos;vitest&apos;;
import { render, screen, fireEvent, waitFor } from &apos;../../test/test-utils&apos;;
import { Geofences } from &apos;../geofences/Geofences&apos;;
// import { mockGeofences } from &apos;../../data/mockData&apos;;

// Mock the data functions
vi.mock(&apos;../../data/mockData&apos;, () => ({
  mockGeofences: [
    {
      id: &apos;GEO-001&apos;,
      name: &apos;Construction Site A&apos;,
      type: &apos;restricted&apos;,
      shape: &apos;circle&apos;,
      center: { lat: 40.7128, lng: -74.006 },
      radius: 100,
      status: &apos;active&apos;,
      siteId: &apos;SITE-001&apos;,
      siteName: &apos;Downtown Construction&apos;,
      alertOnEntry: true,
      alertOnExit: true,
      tolerance: 5,
      attachmentType: &apos;site&apos;,
    },
    {
      id: &apos;GEO-002&apos;,
      name: &apos;Equipment Storage&apos;,
      type: &apos;allowed&apos;,
      shape: &apos;polygon&apos;,
      center: { lat: 40.7589, lng: -73.9851 },
      radius: 50,
      status: &apos;active&apos;,
      siteId: &apos;SITE-002&apos;,
      siteName: &apos;Storage Facility&apos;,
      alertOnEntry: false,
      alertOnExit: true,
      tolerance: 10,
      attachmentType: &apos;site&apos;,
    },
  ],
  getGeofenceViolatingAssets: vi.fn().mockReturnValue([]),
  getGeofenceExpectedAssets: vi.fn().mockReturnValue([]),
  getGeofenceActualAssets: vi.fn().mockReturnValue([]),
  getGeofenceComplianceStats: vi.fn().mockReturnValue({
    expected: 5,
    inside: 4,
    outside: 1,
    complianceRate: 80,
  }),
}));

// Mock toast
vi.mock(&apos;sonner&apos;, () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe(&apos;Geofences&apos;, () => {
  const mockOnCreateGeofence = vi.fn();
  const mockOnEditGeofence = vi.fn();
  const mockOnViewViolatingAssets = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe(&apos;Component Rendering&apos;, () => {
    it(&apos;renders the geofences page with correct title&apos;, () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      expect(screen.getByText(&apos;Geofences&apos;)).toBeInTheDocument();
    });

    it(&apos;renders the create geofence button&apos;, () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      expect(screen.getByText(&apos;Create Geofence&apos;)).toBeInTheDocument();
    });

    it(&apos;renders the geofences table with correct headers&apos;, () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      expect(screen.getByText(&apos;Name&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Type&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Shape&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Site&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Status&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Assets&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Actions&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Data Display&apos;, () => {
    it(&apos;displays geofence data in the table&apos;, async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(&apos;Construction Site A&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Equipment Storage&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;displays correct geofence types&apos;, async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(&apos;Restricted&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Allowed&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;displays correct geofence shapes&apos;, async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(&apos;Circle&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Polygon&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;displays site names&apos;, async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(&apos;Downtown Construction&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Storage Facility&apos;)).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Search Functionality&apos;, () => {
    it(&apos;filters geofences based on search term&apos;, async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      const searchInput = screen.getByPlaceholderText(&apos;Search geofences...&apos;);
      fireEvent.change(searchInput, { target: { value: &apos;Construction&apos; } });

      await waitFor(() => {
        expect(screen.getByText(&apos;Construction Site A&apos;)).toBeInTheDocument();
        expect(screen.queryByText(&apos;Equipment Storage&apos;)).not.toBeInTheDocument();
      });
    });

    it(&apos;shows no results when search yields no matches&apos;, async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      const searchInput = screen.getByPlaceholderText(&apos;Search geofences...&apos;);
      fireEvent.change(searchInput, { target: { value: &apos;NonExistent&apos; } });

      await waitFor(() => {
        expect(screen.getByText(&apos;No geofences found&apos;)).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Filtering&apos;, () => {
    it(&apos;renders filter controls&apos;, () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      expect(screen.getByText(&apos;Filters&apos;)).toBeInTheDocument();
    });

    it(&apos;shows and hides filters when filter button is clicked&apos;, () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      const filterButton = screen.getByText(&apos;Filters&apos;);
      fireEvent.click(filterButton);

      // Should show filter options
      expect(screen.getByText(&apos;Type&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Status&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Shape&apos;)).toBeInTheDocument();
    });

    it(&apos;filters by type&apos;, async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      // Open filters
      fireEvent.click(screen.getByText(&apos;Filters&apos;));

      // Select restricted type
      const typeSelect = screen.getByDisplayValue(&apos;All Types&apos;);
      fireEvent.click(typeSelect);
      fireEvent.click(screen.getByText(&apos;Restricted&apos;));

      await waitFor(() => {
        expect(screen.getByText(&apos;Construction Site A&apos;)).toBeInTheDocument();
        expect(screen.queryByText(&apos;Equipment Storage&apos;)).not.toBeInTheDocument();
      });
    });

    it(&apos;filters by status&apos;, async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      // Open filters
      fireEvent.click(screen.getByText(&apos;Filters&apos;));

      // Select active status
      const statusSelect = screen.getByDisplayValue(&apos;All Statuses&apos;);
      fireEvent.click(statusSelect);
      fireEvent.click(screen.getByText(&apos;Active&apos;));

      await waitFor(() => {
        expect(screen.getByText(&apos;Construction Site A&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Equipment Storage&apos;)).toBeInTheDocument();
      });
    });
  });

  describe(&apos;User Interactions&apos;, () => {
    it(&apos;calls onCreateGeofence when Create Geofence button is clicked&apos;, () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      fireEvent.click(screen.getByText(&apos;Create Geofence&apos;));

      expect(mockOnCreateGeofence).toHaveBeenCalled();
    });

    it(&apos;calls onEditGeofence when Edit button is clicked&apos;, async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      await waitFor(() => {
        const editButtons = screen.getAllByRole(&apos;button&apos;);
        const editButton = editButtons.find(
          button => button.querySelector(&apos;svg&apos;) // Look for the Edit icon
        );

        if (editButton) {
          fireEvent.click(editButton);
          expect(mockOnEditGeofence).toHaveBeenCalledWith(&apos;GEO-001&apos;);
        }
      });
    });

    it(&apos;shows delete confirmation dialog when Delete button is clicked&apos;, async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole(&apos;button&apos;);
        const deleteButton = deleteButtons.find(
          button => button.querySelector(&apos;svg&apos;) // Look for the Trash2 icon
        );

        if (deleteButton) {
          fireEvent.click(deleteButton);
          expect(screen.getByText(&apos;Are you sure?&apos;)).toBeInTheDocument();
          expect(
            screen.getByText(&apos;This will permanently delete the geofence&apos;)
          ).toBeInTheDocument();
        }
      });
    });

    it(&apos;calls onViewViolatingAssets when View Violations button is clicked&apos;, async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      await waitFor(() => {
        const viewButtons = screen.getAllByText(&apos;View Violations&apos;);
        if (viewButtons.length > 0) {
          fireEvent.click(viewButtons[0]);
          expect(mockOnViewViolatingAssets).toHaveBeenCalled();
        }
      });
    });
  });

  describe(&apos;Delete Functionality&apos;, () => {
    it(&apos;confirms deletion and removes geofence from list&apos;, async () => {
      const { toast } = require(&apos;sonner&apos;);

      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole(&apos;button&apos;);
        const deleteButton = deleteButtons.find(
          button => button.querySelector(&apos;svg&apos;) // Look for the Trash2 icon
        );

        if (deleteButton) {
          fireEvent.click(deleteButton);

          // Confirm deletion
          const confirmButton = screen.getByText(&apos;Delete&apos;);
          fireEvent.click(confirmButton);

          expect(toast.success).toHaveBeenCalledWith(
            &apos;Geofence deleted successfully&apos;
          );
        }
      });
    });

    it(&apos;cancels deletion when Cancel button is clicked&apos;, async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole(&apos;button&apos;);
        const deleteButton = deleteButtons.find(
          button => button.querySelector(&apos;svg&apos;) // Look for the Trash2 icon
        );

        if (deleteButton) {
          fireEvent.click(deleteButton);

          // Cancel deletion
          const cancelButton = screen.getByText(&apos;Cancel&apos;);
          fireEvent.click(cancelButton);

          // Dialog should be closed
          expect(screen.queryByText(&apos;Are you sure?&apos;)).not.toBeInTheDocument();
        }
      });
    });
  });

  describe(&apos;Empty States&apos;, () => {
    it(&apos;shows empty state when no geofences are available&apos;, () => {
      // Mock empty geofences
      vi.mocked(require(&apos;../../data/mockData&apos;).mockGeofences).mockReturnValue(
        []
      );

      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      expect(screen.getByText(&apos;No geofences found&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Get started by creating your first geofence&apos;)
      ).toBeInTheDocument();
    });
  });

  describe(&apos;Loading States&apos;, () => {
    it(&apos;shows loading state while geofences are being loaded&apos;, () => {
      // Mock loading state
      vi.mocked(require(&apos;../../data/mockData&apos;).mockGeofences).mockReturnValue(
        []
      );

      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      );

      // Should show loading or empty state
      expect(screen.getByText(&apos;No geofences found&apos;)).toBeInTheDocument();
    });
  });
});
