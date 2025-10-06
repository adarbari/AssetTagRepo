import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Maintenance } from '../maintenance/Maintenance';
import { render, waitForAsync } from '../../test/test-utils';

// Mock the maintenance service
vi.mock('../../services/maintenanceService', () => ({
  fetchMaintenanceTasks: vi.fn().mockResolvedValue([
    {
      id: 'MT-001',
      assetId: 'AT-001',
      assetName: 'Excavator CAT 320',
      type: 'scheduled',
      priority: 'high',
      status: 'pending',
      dueDate: '2024-01-15T10:00:00Z',
      description: 'Regular maintenance check',
      assignedTo: 'John Smith',
      estimatedDuration: 120,
      actualDuration: null,
      notes: '',
      auditLog: [
        {
          timestamp: '2024-01-01T10:00:00Z',
          user: 'John Smith',
          action: 'created',
          changes: [],
          notes: 'Maintenance task created',
        },
      ],
    },
    {
      id: 'MT-002',
      assetId: 'AT-002',
      assetName: 'Delivery Truck F-350',
      type: 'emergency',
      priority: 'critical',
      status: 'in-progress',
      dueDate: '2024-01-10T14:00:00Z',
      description: 'Engine repair',
      assignedTo: 'Jane Doe',
      estimatedDuration: 240,
      actualDuration: 180,
      notes: 'Engine oil leak detected',
      auditLog: [
        {
          timestamp: '2024-01-01T10:00:00Z',
          user: 'Jane Doe',
          action: 'started',
          changes: [{ field: 'status', from: 'pending', to: 'in-progress' }],
          notes: 'Started engine repair',
        },
      ],
    },
  ]),
  fetchMaintenanceHistory: vi.fn().mockResolvedValue([
    {
      id: 'MH-001',
      assetId: 'AT-003',
      assetName: 'Tool Container #5',
      type: 'preventive',
      completedDate: '2024-01-01T16:00:00Z',
      duration: 90,
      technician: 'Bob Johnson',
      description: 'Monthly inspection',
      notes: 'All systems functioning normally',
    },
  ]),
  fetchPredictiveAlerts: vi.fn().mockResolvedValue([
    {
      id: 'PA-001',
      assetId: 'AT-001',
      assetName: 'Excavator CAT 320',
      alertType: 'battery_degradation',
      severity: 'medium',
      predictedDate: '2024-01-20T10:00:00Z',
      confidence: 85,
      description: 'Battery performance declining',
      recommendations: [
        'Schedule battery replacement',
        'Monitor usage patterns',
      ],
    },
  ]),
  getMaintenanceStats: vi.fn().mockResolvedValue({
    overdue: 5,
    inProgress: 8,
    scheduled: 12,
    predictiveAlerts: 3,
  }),
  updateMaintenanceTask: vi.fn().mockResolvedValue({ success: true }),
  dismissPredictiveAlert: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock the navigation context
vi.mock('../../contexts/NavigationContext', () => ({
  useNavigation: () => ({
    navigateToCreateMaintenance: vi.fn(),
    navigateToEditMaintenance: vi.fn(),
    navigateToMaintenanceDetails: vi.fn(),
  }),
}));

describe('Maintenance Component', () => {
  const defaultProps = {
    onAssetClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Basic Functionality', () => {
    it('should render the maintenance page with header', async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Maintenance Management')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(<Maintenance {...defaultProps} />);

      expect(
        screen.getByText('Loading maintenance data...')
      ).toBeInTheDocument();
    });

    it('should render tabs navigation', async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Tasks')).toBeInTheDocument();
        expect(screen.getByText('History')).toBeInTheDocument();
        expect(screen.getByText('Predictive Alerts')).toBeInTheDocument();
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });
    });

    it('should render stats cards', async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Overdue')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
        expect(screen.getByText('Scheduled')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('Predictive Alerts')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });
  });

  describe('Tasks Tab', () => {
    it('should render maintenance tasks table', async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Maintenance Tasks')).toBeInTheDocument();
        expect(screen.getByText('Asset')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
        expect(screen.getByText('Priority')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Due Date')).toBeInTheDocument();
        expect(screen.getByText('Assigned To')).toBeInTheDocument();
      });
    });

    it('should display task data in table', async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Excavator CAT 320')).toBeInTheDocument();
        expect(screen.getByText('Delivery Truck F-350')).toBeInTheDocument();
        expect(screen.getByText('Scheduled')).toBeInTheDocument();
        expect(screen.getByText('Emergency')).toBeInTheDocument();
        expect(screen.getByText('High')).toBeInTheDocument();
        expect(screen.getByText('Critical')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
      });
    });

    it('should render search and filter controls', async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/search tasks/i)
        ).toBeInTheDocument();
        expect(screen.getByText('All Types')).toBeInTheDocument();
        expect(screen.getByText('All Priorities')).toBeInTheDocument();
        expect(screen.getByText('All Statuses')).toBeInTheDocument();
      });
    });

    it('should filter tasks by search term', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Excavator CAT 320')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search tasks/i);
      await user.type(searchInput, 'Excavator');

      expect(screen.getByText('Excavator CAT 320')).toBeInTheDocument();
      expect(
        screen.queryByText('Delivery Truck F-350')
      ).not.toBeInTheDocument();
    });

    it('should filter tasks by type', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('All Types')).toBeInTheDocument();
      });

      const typeSelect = screen.getByText('All Types');
      await user.click(typeSelect);
      await user.click(screen.getByText('Scheduled'));

      expect(screen.getByText('Excavator CAT 320')).toBeInTheDocument();
      expect(
        screen.queryByText('Delivery Truck F-350')
      ).not.toBeInTheDocument();
    });

    it('should filter tasks by priority', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('All Priorities')).toBeInTheDocument();
      });

      const prioritySelect = screen.getByText('All Priorities');
      await user.click(prioritySelect);
      await user.click(screen.getByText('High'));

      expect(screen.getByText('Excavator CAT 320')).toBeInTheDocument();
      expect(
        screen.queryByText('Delivery Truck F-350')
      ).not.toBeInTheDocument();
    });

    it('should filter tasks by status', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('All Statuses')).toBeInTheDocument();
      });

      const statusSelect = screen.getByText('All Statuses');
      await user.click(statusSelect);
      await user.click(screen.getByText('In Progress'));

      expect(screen.getByText('Delivery Truck F-350')).toBeInTheDocument();
      expect(screen.queryByText('Excavator CAT 320')).not.toBeInTheDocument();
    });
  });

  describe('History Tab', () => {
    it('should render maintenance history table', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('History')).toBeInTheDocument();
      });

      const historyTab = screen.getByText('History');
      await user.click(historyTab);

      expect(screen.getByText('Maintenance History')).toBeInTheDocument();
      expect(screen.getByText('Asset')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Completed Date')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
      expect(screen.getByText('Technician')).toBeInTheDocument();
    });

    it('should display history data in table', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('History')).toBeInTheDocument();
      });

      const historyTab = screen.getByText('History');
      await user.click(historyTab);

      expect(screen.getByText('Tool Container #5')).toBeInTheDocument();
      expect(screen.getByText('Preventive')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  describe('Predictive Alerts Tab', () => {
    it('should render predictive alerts table', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Predictive Alerts')).toBeInTheDocument();
      });

      const alertsTab = screen.getByText('Predictive Alerts');
      await user.click(alertsTab);

      expect(
        screen.getByText('Predictive Maintenance Alerts')
      ).toBeInTheDocument();
      expect(screen.getByText('Asset')).toBeInTheDocument();
      expect(screen.getByText('Alert Type')).toBeInTheDocument();
      expect(screen.getByText('Severity')).toBeInTheDocument();
      expect(screen.getByText('Predicted Date')).toBeInTheDocument();
      expect(screen.getByText('Confidence')).toBeInTheDocument();
    });

    it('should display predictive alert data', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Predictive Alerts')).toBeInTheDocument();
      });

      const alertsTab = screen.getByText('Predictive Alerts');
      await user.click(alertsTab);

      expect(screen.getByText('Excavator CAT 320')).toBeInTheDocument();
      expect(screen.getByText('Battery Degradation')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('should allow dismissing predictive alerts', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Predictive Alerts')).toBeInTheDocument();
      });

      const alertsTab = screen.getByText('Predictive Alerts');
      await user.click(alertsTab);

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);

      // Should call dismiss function
      const { dismissPredictiveAlert } = await import(
        '../../services/maintenanceService'
      );
      expect(dismissPredictiveAlert).toHaveBeenCalled();
    });
  });

  describe('Analytics Tab', () => {
    it('should render analytics charts', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });

      const analyticsTab = screen.getByText('Analytics');
      await user.click(analyticsTab);

      expect(screen.getByText('Maintenance Analytics')).toBeInTheDocument();
    });
  });

  describe('Task Actions', () => {
    it('should allow starting a task', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Excavator CAT 320')).toBeInTheDocument();
      });

      const startButton = screen.getByRole('button', { name: /start/i });
      await user.click(startButton);

      // Should call update function
      const { updateMaintenanceTask } = await import(
        '../../services/maintenanceService'
      );
      expect(updateMaintenanceTask).toHaveBeenCalled();
    });

    it('should allow completing a task', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Delivery Truck F-350')).toBeInTheDocument();
      });

      const completeButton = screen.getByRole('button', { name: /complete/i });
      await user.click(completeButton);

      // Should call update function
      const { updateMaintenanceTask } = await import(
        '../../services/maintenanceService'
      );
      expect(updateMaintenanceTask).toHaveBeenCalled();
    });

    it('should allow editing a task', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Excavator CAT 320')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Should navigate to edit page
      const { useNavigation } = await import(
        '../../contexts/NavigationContext'
      );
      const navigation = useNavigation();
      expect(navigation.navigateToEditMaintenance).toHaveBeenCalled();
    });
  });

  describe('Create New Task', () => {
    it('should render create task button', async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create task/i })
        ).toBeInTheDocument();
      });
    });

    it('should navigate to create task page when button is clicked', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create task/i })
        ).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create task/i });
      await user.click(createButton);

      // Should navigate to create page
      const { useNavigation } = await import(
        '../../contexts/NavigationContext'
      );
      const navigation = useNavigation();
      expect(navigation.navigateToCreateMaintenance).toHaveBeenCalled();
    });
  });

  describe('Audit Log', () => {
    it('should render audit log dialog when requested', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Excavator CAT 320')).toBeInTheDocument();
      });

      const auditButton = screen.getByRole('button', { name: /audit log/i });
      await user.click(auditButton);

      expect(screen.getByText('Task Audit Log')).toBeInTheDocument();
    });

    it('should display audit log entries', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Excavator CAT 320')).toBeInTheDocument();
      });

      const auditButton = screen.getByRole('button', { name: /audit log/i });
      await user.click(auditButton);

      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('created')).toBeInTheDocument();
      expect(screen.getByText('Maintenance task created')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle data loading errors gracefully', async () => {
      const { fetchMaintenanceTasks } = await import(
        '../../services/maintenanceService'
      );
      vi.mocked(fetchMaintenanceTasks).mockRejectedValueOnce(
        new Error('Failed to load')
      );

      render(<Maintenance {...defaultProps} />);

      // Should still render the component
      await waitFor(() => {
        expect(screen.getByText('Maintenance Management')).toBeInTheDocument();
      });
    });

    it('should handle task update errors', async () => {
      const user = userEvent.setup();
      const { updateMaintenanceTask } = await import(
        '../../services/maintenanceService'
      );
      vi.mocked(updateMaintenanceTask).mockRejectedValueOnce(
        new Error('Update failed')
      );

      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Excavator CAT 320')).toBeInTheDocument();
      });

      const startButton = screen.getByRole('button', { name: /start/i });
      await user.click(startButton);

      // Should handle error gracefully
      expect(updateMaintenanceTask).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Maintenance Management')).toBeInTheDocument();
      });

      // Check tab navigation
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(4);

      // Check table headers
      const tableHeaders = screen.getAllByRole('columnheader');
      expect(tableHeaders.length).toBeGreaterThan(0);
    });

    it('should maintain keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Maintenance Management')).toBeInTheDocument();
      });

      // Tab through elements
      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('Data Refresh', () => {
    it('should refresh data when refresh button is clicked', async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Maintenance Management')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      // Should reload data
      const { fetchMaintenanceTasks } = await import(
        '../../services/maintenanceService'
      );
      expect(fetchMaintenanceTasks).toHaveBeenCalledTimes(2); // Initial load + refresh
    });
  });
});
