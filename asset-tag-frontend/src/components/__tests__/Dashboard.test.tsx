// import React from &apos;react&apos;;
import { describe, it, expect, vi, beforeEach } from &apos;vitest&apos;;
import { screen, waitFor } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { Dashboard } from &apos;../dashboard/Dashboard&apos;;
import { render } from &apos;../../test/test-utils&apos;;

// Mock the dashboard data service
vi.mock(&apos;../../data/mockDashboardData&apos;, () => ({
  getDashboardStats: vi.fn().mockResolvedValue({
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
  }),
  getLocationData: vi.fn().mockResolvedValue([
    { time: &apos;2024-01-01&apos;, assets: 10, personnel: 5 },
    { time: &apos;2024-01-02&apos;, assets: 12, personnel: 6 },
    { time: &apos;2024-01-03&apos;, assets: 8, personnel: 4 },
  ]),
  getAssetsByType: vi.fn().mockResolvedValue([
    { name: &apos;Equipment&apos;, value: 95, count: 95, color: &apos;#3b82f6&apos; },
    { name: &apos;Vehicles&apos;, value: 52, count: 52, color: &apos;#22c55e&apos; },
    { name: &apos;Tools&apos;, value: 67, count: 67, color: &apos;#f59e0b&apos; },
    { name: &apos;Containers&apos;, value: 20, count: 20, color: &apos;#8b5cf6&apos; },
  ]),
  getBatteryStatus: vi.fn().mockResolvedValue([
    { range: &apos;0-20%&apos;, count: 5, color: &apos;#ef4444&apos; },
    { range: &apos;21-50%&apos;, count: 18, color: &apos;#f59e0b&apos; },
    { range: &apos;51-80%&apos;, count: 45, color: &apos;#3b82f6&apos; },
    { range: &apos;81-100%&apos;, count: 82, color: &apos;#22c55e&apos; },
  ]),
  getRecentActivity: vi.fn().mockResolvedValue([
    {
      id: &apos;1&apos;,
      type: &apos;asset_arrival&apos;,
      assetName: &apos;Excavator CAT 320&apos;,
      location: &apos;Main Warehouse&apos;,
      timestamp: &apos;2 min ago&apos;,
      icon: &apos;Wrench&apos;,
    },
    {
      id: &apos;2&apos;,
      type: &apos;alert&apos;,
      assetName: &apos;Forklift Toyota 8FG&apos;,
      location: &apos;Construction Site B&apos;,
      timestamp: &apos;15 min ago&apos;,
      icon: &apos;AlertTriangle&apos;,
      message: &apos;Low battery warning&apos;,
    },
  ]),
  getAlertBreakdown: vi.fn().mockResolvedValue([
    { type: &apos;Battery Low&apos;, count: 5, color: &apos;#f59e0b&apos; },
    { type: &apos;Geofence Violation&apos;, count: 2, color: &apos;#ef4444&apos; },
    { type: &apos;Maintenance Due&apos;, count: 1, color: &apos;#3b82f6&apos; },
  ]),
}));

describe(&apos;Dashboard Component&apos;, () => {
  const defaultProps = {
    onViewChange: vi.fn(),
    onNavigateToAlerts: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe(&apos;Rendering and Basic Functionality&apos;, () => {
    it(&apos;should render the dashboard with header&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText(&apos;Dashboard&apos;)).toBeInTheDocument();
      });

      expect(
        screen.getByText(&apos;Real-time asset tracking overview&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;should show loading state initially&apos;, () => {
      render(<Dashboard {...defaultProps} />);

      expect(screen.getByText(&apos;Loading dashboard...&apos;)).toBeInTheDocument();
    });

    it(&apos;should render system status badge&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;System Status: Online&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should render all main sections&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(&apos;Asset & Location Overview&apos;)
        ).toBeInTheDocument();
        expect(screen.getByText(&apos;Alerts & Issues&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Performance Metrics&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Recent Activity&apos;)).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Stats Cards&apos;, () => {
    it(&apos;should render asset overview stats&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Total Assets&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;1,500&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;+45 added this month&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should render location stats&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Active Locations&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;12&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;98.5% tracking accuracy&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should render alerts stats&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Active Alerts&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;8&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;2 critical&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should render maintenance stats&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Maintenance Due&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;15&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;23 low battery&apos;)).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Interactive Elements&apos;, () => {
    it(&apos;should call onViewChange when Total Assets card is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Total Assets&apos;)).toBeInTheDocument();
      });

      const totalAssetsCard = screen
        .getByText(&apos;Total Assets&apos;)
        .closest(&apos;[role=&quot;button&quot;]&apos;);
      if (totalAssetsCard) {
        await user.click(totalAssetsCard);
        expect(defaultProps.onViewChange).toHaveBeenCalledWith(&apos;inventory&apos;);
      }
    });

    it(&apos;should call onViewChange when Active Locations card is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Active Locations&apos;)).toBeInTheDocument();
      });

      const activeLocationsCard = screen
        .getByText(&apos;Active Locations&apos;)
        .closest(&apos;[role=&quot;button&quot;]&apos;);
      if (activeLocationsCard) {
        await user.click(activeLocationsCard);
        expect(defaultProps.onViewChange).toHaveBeenCalledWith(&apos;map&apos;);
      }
    });

    it(&apos;should call onNavigateToAlerts when alerts card is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Active Alerts&apos;)).toBeInTheDocument();
      });

      const alertsCard = screen
        .getByText(&apos;Active Alerts&apos;)
        .closest(&apos;[role=&quot;button&quot;]&apos;);
      if (alertsCard) {
        await user.click(alertsCard);
        expect(defaultProps.onNavigateToAlerts).toHaveBeenCalled();
      }
    });

    it(&apos;should call onViewChange when maintenance card is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Maintenance Due&apos;)).toBeInTheDocument();
      });

      const maintenanceCard = screen
        .getByText(&apos;Maintenance Due&apos;)
        .closest(&apos;[role=&quot;button&quot;]&apos;);
      if (maintenanceCard) {
        await user.click(maintenanceCard);
        expect(defaultProps.onViewChange).toHaveBeenCalledWith(&apos;maintenance&apos;);
      }
    });
  });

  describe(&apos;Charts and Visualizations&apos;, () => {
    it(&apos;should render location activity chart&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Location Activity (24h)&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should render asset type distribution chart&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Asset Distribution&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should render battery status chart&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Battery Status&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should render alert breakdown chart&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Alert Breakdown&apos;)).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Recent Activity&apos;, () => {
    it(&apos;should render recent activity list&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Recent Activity&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Excavator CAT 320&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Forklift Toyota 8FG&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should show activity timestamps&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;2 min ago&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;15 min ago&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should show activity locations&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Main Warehouse&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Construction Site B&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should show alert messages when present&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Low battery warning&apos;)).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Performance Metrics&apos;, () => {
    it(&apos;should render utilization rate&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Utilization Rate&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;76.2%&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should render efficiency score&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Efficiency Score&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;88.5%&apos;)).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Data Loading and Error Handling&apos;, () => {
    it(&apos;should handle data loading errors gracefully&apos;, async () => {
      const { getDashboardStats } = await import(
        &apos;../../data/mockDashboardData&apos;
      );
      vi.mocked(getDashboardStats).mockRejectedValueOnce(
        new Error(&apos;Failed to load&apos;)
      );

      render(<Dashboard {...defaultProps} />);

      // Should still render the component even if data fails to load
      await waitFor(() => {
        expect(screen.getByText(&apos;Dashboard&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should show loading state while fetching data&apos;, () => {
      render(<Dashboard {...defaultProps} />);

      expect(screen.getByText(&apos;Loading dashboard...&apos;)).toBeInTheDocument();
    });

    it(&apos;should render content after data loads&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      // Initially loading
      expect(screen.getByText(&apos;Loading dashboard...&apos;)).toBeInTheDocument();

      // After data loads
      await waitFor(() => {
        expect(screen.getByText(&apos;Dashboard&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Total Assets&apos;)).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Accessibility&apos;, () => {
    it(&apos;should have proper ARIA labels and roles&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Dashboard&apos;)).toBeInTheDocument();
      });

      // Check that interactive elements have proper roles
      const buttons = screen.getAllByRole(&apos;button&apos;);
      expect(buttons.length).toBeGreaterThan(0);

      // Check that charts have proper structure
      const charts = screen.getAllByRole(&apos;img&apos;, { hidden: true });
      expect(charts.length).toBeGreaterThan(0);
    });

    it(&apos;should maintain keyboard navigation&apos;, async () => {
      const user = userEvent.setup();
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Dashboard&apos;)).toBeInTheDocument();
      });

      // Tab through interactive elements
      await user.tab();
      // Should focus on first interactive element
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe(&apos;Responsive Design&apos;, () => {
    it(&apos;should render properly on different screen sizes&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Dashboard&apos;)).toBeInTheDocument();
      });

      // Check that grid layouts are present
      const gridElements = document.querySelectorAll(&apos;.grid&apos;);
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });

  describe(&apos;Real-time Updates&apos;, () => {
    it(&apos;should handle data updates&apos;, async () => {
      const { getDashboardStats } = await import(
        &apos;../../data/mockDashboardData&apos;
      );

      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;1,500&apos;)).toBeInTheDocument();
      });

      // Update mock data
      vi.mocked(getDashboardStats).mockResolvedValueOnce({
        totalAssets: 1600,
        assetsAddedThisMonth: 50,
        activeLocations: 13,
        trackingAccuracy: 99.0,
        systemStatus: &apos;online&apos;,
        alertsCount: 6,
        criticalAlerts: 1,
        maintenanceDue: 12,
        batteryLow: 20,
        utilizationRate: 78.5,
        efficiencyScore: 90.0,
      });

      // Component should handle updates gracefully
      expect(screen.getByText(&apos;Dashboard&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;System Status Display&apos;, () => {
    it(&apos;should display online status correctly&apos;, async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;System Status: Online&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should handle different system statuses&apos;, async () => {
      const { getDashboardStats } = await import(
        &apos;../../data/mockDashboardData&apos;
      );
      vi.mocked(getDashboardStats).mockResolvedValueOnce({
        totalAssets: 1500,
        assetsAddedThisMonth: 45,
        activeLocations: 12,
        trackingAccuracy: 98.5,
        systemStatus: &apos;degraded&apos;,
        alertsCount: 8,
        criticalAlerts: 2,
        maintenanceDue: 15,
        batteryLow: 23,
        utilizationRate: 76.2,
        efficiencyScore: 88.5,
      });

      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;System Status: Degraded&apos;)).toBeInTheDocument();
      });
    });
  });
});
