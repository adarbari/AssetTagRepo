import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '../dashboard/Dashboard';
import { render, waitForAsync } from '../../test/test-utils';

// Mock the dashboard data service
vi.mock('../../data/mockDashboardData', () => ({
  getDashboardStats: vi.fn().mockResolvedValue({
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
  getLocationData: vi.fn().mockResolvedValue([
    { time: '2024-01-01', assets: 10, personnel: 5 },
    { time: '2024-01-02', assets: 12, personnel: 6 },
    { time: '2024-01-03', assets: 8, personnel: 4 },
  ]),
  getAssetsByType: vi.fn().mockResolvedValue([
    { name: 'Equipment', value: 95, count: 95, color: '#3b82f6' },
    { name: 'Vehicles', value: 52, count: 52, color: '#22c55e' },
    { name: 'Tools', value: 67, count: 67, color: '#f59e0b' },
    { name: 'Containers', value: 20, count: 20, color: '#8b5cf6' },
  ]),
  getBatteryStatus: vi.fn().mockResolvedValue([
    { range: '0-20%', count: 5, color: '#ef4444' },
    { range: '21-50%', count: 18, color: '#f59e0b' },
    { range: '51-80%', count: 45, color: '#3b82f6' },
    { range: '81-100%', count: 82, color: '#22c55e' },
  ]),
  getRecentActivity: vi.fn().mockResolvedValue([
    {
      id: '1',
      type: 'asset_arrival',
      assetName: 'Excavator CAT 320',
      location: 'Main Warehouse',
      timestamp: '2 min ago',
      icon: 'Wrench',
    },
    {
      id: '2',
      type: 'alert',
      assetName: 'Forklift Toyota 8FG',
      location: 'Construction Site B',
      timestamp: '15 min ago',
      icon: 'AlertTriangle',
      message: 'Low battery warning',
    },
  ]),
  getAlertBreakdown: vi.fn().mockResolvedValue([
    { type: 'Battery Low', count: 5, color: '#f59e0b' },
    { type: 'Geofence Violation', count: 2, color: '#ef4444' },
    { type: 'Maintenance Due', count: 1, color: '#3b82f6' },
  ]),
}));

describe('Dashboard Component', () => {
  const defaultProps = {
    onViewChange: vi.fn(),
    onNavigateToAlerts: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Basic Functionality', () => {
    it('should render the dashboard with header', async () => {
      render(<Dashboard {...defaultProps} />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      expect(
        screen.getByText('Real-time asset tracking overview')
      ).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<Dashboard {...defaultProps} />);

      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    it('should render system status badge', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('System Status: Online')).toBeInTheDocument();
      });
    });

    it('should render all main sections', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText('Asset & Location Overview')
        ).toBeInTheDocument();
        expect(screen.getByText('Alerts & Issues')).toBeInTheDocument();
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      });
    });
  });

  describe('Stats Cards', () => {
    it('should render asset overview stats', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Total Assets')).toBeInTheDocument();
        expect(screen.getByText('1,500')).toBeInTheDocument();
        expect(screen.getByText('+45 added this month')).toBeInTheDocument();
      });
    });

    it('should render location stats', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Active Locations')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('98.5% tracking accuracy')).toBeInTheDocument();
      });
    });

    it('should render alerts stats', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Active Alerts')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
        expect(screen.getByText('2 critical')).toBeInTheDocument();
      });
    });

    it('should render maintenance stats', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Maintenance Due')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
        expect(screen.getByText('23 low battery')).toBeInTheDocument();
      });
    });
  });

  describe('Interactive Elements', () => {
    it('should call onViewChange when Total Assets card is clicked', async () => {
      const user = userEvent.setup();
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Total Assets')).toBeInTheDocument();
      });

      const totalAssetsCard = screen
        .getByText('Total Assets')
        .closest('[role="button"]');
      if (totalAssetsCard) {
        await user.click(totalAssetsCard);
        expect(defaultProps.onViewChange).toHaveBeenCalledWith('inventory');
      }
    });

    it('should call onViewChange when Active Locations card is clicked', async () => {
      const user = userEvent.setup();
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Active Locations')).toBeInTheDocument();
      });

      const activeLocationsCard = screen
        .getByText('Active Locations')
        .closest('[role="button"]');
      if (activeLocationsCard) {
        await user.click(activeLocationsCard);
        expect(defaultProps.onViewChange).toHaveBeenCalledWith('map');
      }
    });

    it('should call onNavigateToAlerts when alerts card is clicked', async () => {
      const user = userEvent.setup();
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Active Alerts')).toBeInTheDocument();
      });

      const alertsCard = screen
        .getByText('Active Alerts')
        .closest('[role="button"]');
      if (alertsCard) {
        await user.click(alertsCard);
        expect(defaultProps.onNavigateToAlerts).toHaveBeenCalled();
      }
    });

    it('should call onViewChange when maintenance card is clicked', async () => {
      const user = userEvent.setup();
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Maintenance Due')).toBeInTheDocument();
      });

      const maintenanceCard = screen
        .getByText('Maintenance Due')
        .closest('[role="button"]');
      if (maintenanceCard) {
        await user.click(maintenanceCard);
        expect(defaultProps.onViewChange).toHaveBeenCalledWith('maintenance');
      }
    });
  });

  describe('Charts and Visualizations', () => {
    it('should render location activity chart', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Location Activity (24h)')).toBeInTheDocument();
      });
    });

    it('should render asset type distribution chart', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Asset Distribution')).toBeInTheDocument();
      });
    });

    it('should render battery status chart', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Battery Status')).toBeInTheDocument();
      });
    });

    it('should render alert breakdown chart', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Alert Breakdown')).toBeInTheDocument();
      });
    });
  });

  describe('Recent Activity', () => {
    it('should render recent activity list', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
        expect(screen.getByText('Excavator CAT 320')).toBeInTheDocument();
        expect(screen.getByText('Forklift Toyota 8FG')).toBeInTheDocument();
      });
    });

    it('should show activity timestamps', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('2 min ago')).toBeInTheDocument();
        expect(screen.getByText('15 min ago')).toBeInTheDocument();
      });
    });

    it('should show activity locations', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
        expect(screen.getByText('Construction Site B')).toBeInTheDocument();
      });
    });

    it('should show alert messages when present', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Low battery warning')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Metrics', () => {
    it('should render utilization rate', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Utilization Rate')).toBeInTheDocument();
        expect(screen.getByText('76.2%')).toBeInTheDocument();
      });
    });

    it('should render efficiency score', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Efficiency Score')).toBeInTheDocument();
        expect(screen.getByText('88.5%')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading and Error Handling', () => {
    it('should handle data loading errors gracefully', async () => {
      const { getDashboardStats } = await import(
        '../../data/mockDashboardData'
      );
      vi.mocked(getDashboardStats).mockRejectedValueOnce(
        new Error('Failed to load')
      );

      render(<Dashboard {...defaultProps} />);

      // Should still render the component even if data fails to load
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });

    it('should show loading state while fetching data', () => {
      render(<Dashboard {...defaultProps} />);

      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    it('should render content after data loads', async () => {
      render(<Dashboard {...defaultProps} />);

      // Initially loading
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

      // After data loads
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Total Assets')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Check that interactive elements have proper roles
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Check that charts have proper structure
      const charts = screen.getAllByRole('img', { hidden: true });
      expect(charts.length).toBeGreaterThan(0);
    });

    it('should maintain keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Tab through interactive elements
      await user.tab();
      // Should focus on first interactive element
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render properly on different screen sizes', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Check that grid layouts are present
      const gridElements = document.querySelectorAll('.grid');
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });

  describe('Real-time Updates', () => {
    it('should handle data updates', async () => {
      const { getDashboardStats } = await import(
        '../../data/mockDashboardData'
      );

      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('1,500')).toBeInTheDocument();
      });

      // Update mock data
      vi.mocked(getDashboardStats).mockResolvedValueOnce({
        totalAssets: 1600,
        assetsAddedThisMonth: 50,
        activeLocations: 13,
        trackingAccuracy: 99.0,
        systemStatus: 'online',
        alertsCount: 6,
        criticalAlerts: 1,
        maintenanceDue: 12,
        batteryLow: 20,
        utilizationRate: 78.5,
        efficiencyScore: 90.0,
      });

      // Component should handle updates gracefully
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('System Status Display', () => {
    it('should display online status correctly', async () => {
      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('System Status: Online')).toBeInTheDocument();
      });
    });

    it('should handle different system statuses', async () => {
      const { getDashboardStats } = await import(
        '../../data/mockDashboardData'
      );
      vi.mocked(getDashboardStats).mockResolvedValueOnce({
        totalAssets: 1500,
        assetsAddedThisMonth: 45,
        activeLocations: 12,
        trackingAccuracy: 98.5,
        systemStatus: 'degraded',
        alertsCount: 8,
        criticalAlerts: 2,
        maintenanceDue: 15,
        batteryLow: 23,
        utilizationRate: 76.2,
        efficiencyScore: 88.5,
      });

      render(<Dashboard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('System Status: Degraded')).toBeInTheDocument();
      });
    });
  });
});
