// import React from &apos;react&apos;;
import { describe, it, expect, vi, beforeEach } from &apos;vitest&apos;;
import { screen, waitFor } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { Maintenance } from &apos;../maintenance/Maintenance&apos;;
import { render } from &apos;../../test/test-utils&apos;;

// Mock the maintenance service
vi.mock(&apos;../../services/maintenanceService&apos;, () => ({
  fetchMaintenanceTasks: vi.fn().mockResolvedValue([
    {
      id: &apos;MT-001&apos;,
      assetId: &apos;AT-001&apos;,
      assetName: &apos;Excavator CAT 320&apos;,
      type: &apos;scheduled&apos;,
      priority: &apos;high&apos;,
      status: &apos;pending&apos;,
      dueDate: &apos;2024-01-15T10:00:00Z&apos;,
      description: &apos;Regular maintenance check&apos;,
      assignedTo: &apos;John Smith&apos;,
      estimatedDuration: 120,
      actualDuration: null,
      notes: &apos;&apos;,
      auditLog: [
        {
          timestamp: &apos;2024-01-01T10:00:00Z&apos;,
          user: &apos;John Smith&apos;,
          action: &apos;created&apos;,
          changes: [],
          notes: &apos;Maintenance task created&apos;,
        },
      ],
    },
    {
      id: &apos;MT-002&apos;,
      assetId: &apos;AT-002&apos;,
      assetName: &apos;Delivery Truck F-350&apos;,
      type: &apos;emergency&apos;,
      priority: &apos;critical&apos;,
      status: &apos;in-progress&apos;,
      dueDate: &apos;2024-01-10T14:00:00Z&apos;,
      description: &apos;Engine repair&apos;,
      assignedTo: &apos;Jane Doe&apos;,
      estimatedDuration: 240,
      actualDuration: 180,
      notes: &apos;Engine oil leak detected&apos;,
      auditLog: [
        {
          timestamp: &apos;2024-01-01T10:00:00Z&apos;,
          user: &apos;Jane Doe&apos;,
          action: &apos;started&apos;,
          changes: [{ field: &apos;status&apos;, from: &apos;pending&apos;, to: &apos;in-progress&apos; }],
          notes: &apos;Started engine repair&apos;,
        },
      ],
    },
  ]),
  fetchMaintenanceHistory: vi.fn().mockResolvedValue([
    {
      id: &apos;MH-001&apos;,
      assetId: &apos;AT-003&apos;,
      assetName: &apos;Tool Container #5&apos;,
      type: &apos;preventive&apos;,
      completedDate: &apos;2024-01-01T16:00:00Z&apos;,
      duration: 90,
      technician: &apos;Bob Johnson&apos;,
      description: &apos;Monthly inspection&apos;,
      notes: &apos;All systems functioning normally&apos;,
    },
  ]),
  fetchPredictiveAlerts: vi.fn().mockResolvedValue([
    {
      id: &apos;PA-001&apos;,
      assetId: &apos;AT-001&apos;,
      assetName: &apos;Excavator CAT 320&apos;,
      alertType: &apos;battery_degradation&apos;,
      severity: &apos;medium&apos;,
      predictedDate: &apos;2024-01-20T10:00:00Z&apos;,
      confidence: 85,
      description: &apos;Battery performance declining&apos;,
      recommendations: [
        &apos;Schedule battery replacement&apos;,
        &apos;Monitor usage patterns&apos;,
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
vi.mock(&apos;../../contexts/NavigationContext&apos;, () => ({
  useNavigation: () => ({
    navigateToCreateMaintenance: vi.fn(),
    navigateToEditMaintenance: vi.fn(),
    navigateToMaintenanceDetails: vi.fn(),
  }),
}));

describe(&apos;Maintenance Component&apos;, () => {
  const defaultProps = {
    onAssetClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe(&apos;Rendering and Basic Functionality&apos;, () => {
    it(&apos;should render the maintenance page with header&apos;, async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Maintenance Management&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should show loading state initially&apos;, () => {
      render(<Maintenance {...defaultProps} />);

      expect(
        screen.getByText(&apos;Loading maintenance data...&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;should render tabs navigation&apos;, async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Tasks&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;History&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Predictive Alerts&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Analytics&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should render stats cards&apos;, async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Overdue&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;5&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;In Progress&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;8&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Scheduled&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;12&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Predictive Alerts&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;3&apos;)).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Tasks Tab&apos;, () => {
    it(&apos;should render maintenance tasks table&apos;, async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Maintenance Tasks&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Asset&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Type&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Priority&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Status&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Due Date&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Assigned To&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should display task data in table&apos;, async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Excavator CAT 320&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Delivery Truck F-350&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Scheduled&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Emergency&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;High&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Critical&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Pending&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;In Progress&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should render search and filter controls&apos;, async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/search tasks/i)
        ).toBeInTheDocument();
        expect(screen.getByText(&apos;All Types&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;All Priorities&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;All Statuses&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should filter tasks by search term&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Excavator CAT 320&apos;)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search tasks/i);
      await user.type(searchInput, &apos;Excavator&apos;);

      expect(screen.getByText(&apos;Excavator CAT 320&apos;)).toBeInTheDocument();
      expect(
        screen.queryByText(&apos;Delivery Truck F-350&apos;)
      ).not.toBeInTheDocument();
    });

    it(&apos;should filter tasks by type&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;All Types&apos;)).toBeInTheDocument();
      });

      const typeSelect = screen.getByText(&apos;All Types&apos;);
      await user.click(typeSelect);
      await user.click(screen.getByText(&apos;Scheduled&apos;));

      expect(screen.getByText(&apos;Excavator CAT 320&apos;)).toBeInTheDocument();
      expect(
        screen.queryByText(&apos;Delivery Truck F-350&apos;)
      ).not.toBeInTheDocument();
    });

    it(&apos;should filter tasks by priority&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;All Priorities&apos;)).toBeInTheDocument();
      });

      const prioritySelect = screen.getByText(&apos;All Priorities&apos;);
      await user.click(prioritySelect);
      await user.click(screen.getByText(&apos;High&apos;));

      expect(screen.getByText(&apos;Excavator CAT 320&apos;)).toBeInTheDocument();
      expect(
        screen.queryByText(&apos;Delivery Truck F-350&apos;)
      ).not.toBeInTheDocument();
    });

    it(&apos;should filter tasks by status&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;All Statuses&apos;)).toBeInTheDocument();
      });

      const statusSelect = screen.getByText(&apos;All Statuses&apos;);
      await user.click(statusSelect);
      await user.click(screen.getByText(&apos;In Progress&apos;));

      expect(screen.getByText(&apos;Delivery Truck F-350&apos;)).toBeInTheDocument();
      expect(screen.queryByText(&apos;Excavator CAT 320&apos;)).not.toBeInTheDocument();
    });
  });

  describe(&apos;History Tab&apos;, () => {
    it(&apos;should render maintenance history table&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;History&apos;)).toBeInTheDocument();
      });

      const historyTab = screen.getByText(&apos;History&apos;);
      await user.click(historyTab);

      expect(screen.getByText(&apos;Maintenance History&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Asset&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Type&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Completed Date&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Duration&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Technician&apos;)).toBeInTheDocument();
    });

    it(&apos;should display history data in table&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;History&apos;)).toBeInTheDocument();
      });

      const historyTab = screen.getByText(&apos;History&apos;);
      await user.click(historyTab);

      expect(screen.getByText(&apos;Tool Container #5&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Preventive&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Bob Johnson&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Predictive Alerts Tab&apos;, () => {
    it(&apos;should render predictive alerts table&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Predictive Alerts&apos;)).toBeInTheDocument();
      });

      const alertsTab = screen.getByText(&apos;Predictive Alerts&apos;);
      await user.click(alertsTab);

      expect(
        screen.getByText(&apos;Predictive Maintenance Alerts&apos;)
      ).toBeInTheDocument();
      expect(screen.getByText(&apos;Asset&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Alert Type&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Severity&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Predicted Date&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Confidence&apos;)).toBeInTheDocument();
    });

    it(&apos;should display predictive alert data&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Predictive Alerts&apos;)).toBeInTheDocument();
      });

      const alertsTab = screen.getByText(&apos;Predictive Alerts&apos;);
      await user.click(alertsTab);

      expect(screen.getByText(&apos;Excavator CAT 320&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Battery Degradation&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Medium&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;85%&apos;)).toBeInTheDocument();
    });

    it(&apos;should allow dismissing predictive alerts&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Predictive Alerts&apos;)).toBeInTheDocument();
      });

      const alertsTab = screen.getByText(&apos;Predictive Alerts&apos;);
      await user.click(alertsTab);

      const dismissButton = screen.getByRole(&apos;button&apos;, { name: /dismiss/i });
      await user.click(dismissButton);

      // Should call dismiss function
      const { dismissPredictiveAlert } = await import(
        &apos;../../services/maintenanceService&apos;
      );
      expect(dismissPredictiveAlert).toHaveBeenCalled();
    });
  });

  describe(&apos;Analytics Tab&apos;, () => {
    it(&apos;should render analytics charts&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Analytics&apos;)).toBeInTheDocument();
      });

      const analyticsTab = screen.getByText(&apos;Analytics&apos;);
      await user.click(analyticsTab);

      expect(screen.getByText(&apos;Maintenance Analytics&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Task Actions&apos;, () => {
    it(&apos;should allow starting a task&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Excavator CAT 320&apos;)).toBeInTheDocument();
      });

      const startButton = screen.getByRole(&apos;button&apos;, { name: /start/i });
      await user.click(startButton);

      // Should call update function
      const { updateMaintenanceTask } = await import(
        &apos;../../services/maintenanceService&apos;
      );
      expect(updateMaintenanceTask).toHaveBeenCalled();
    });

    it(&apos;should allow completing a task&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Delivery Truck F-350&apos;)).toBeInTheDocument();
      });

      const completeButton = screen.getByRole(&apos;button&apos;, { name: /complete/i });
      await user.click(completeButton);

      // Should call update function
      const { updateMaintenanceTask } = await import(
        &apos;../../services/maintenanceService&apos;
      );
      expect(updateMaintenanceTask).toHaveBeenCalled();
    });

    it(&apos;should allow editing a task&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Excavator CAT 320&apos;)).toBeInTheDocument();
      });

      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit/i });
      await user.click(editButton);

      // Should navigate to edit page
      const { useNavigation } = await import(
        &apos;../../contexts/NavigationContext&apos;
      );
      const navigation = useNavigation();
      expect(navigation.navigateToEditMaintenance).toHaveBeenCalled();
    });
  });

  describe(&apos;Create New Task&apos;, () => {
    it(&apos;should render create task button&apos;, async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole(&apos;button&apos;, { name: /create task/i })
        ).toBeInTheDocument();
      });
    });

    it(&apos;should navigate to create task page when button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole(&apos;button&apos;, { name: /create task/i })
        ).toBeInTheDocument();
      });

      const createButton = screen.getByRole(&apos;button&apos;, { name: /create task/i });
      await user.click(createButton);

      // Should navigate to create page
      const { useNavigation } = await import(
        &apos;../../contexts/NavigationContext&apos;
      );
      const navigation = useNavigation();
      expect(navigation.navigateToCreateMaintenance).toHaveBeenCalled();
    });
  });

  describe(&apos;Audit Log&apos;, () => {
    it(&apos;should render audit log dialog when requested&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Excavator CAT 320&apos;)).toBeInTheDocument();
      });

      const auditButton = screen.getByRole(&apos;button&apos;, { name: /audit log/i });
      await user.click(auditButton);

      expect(screen.getByText(&apos;Task Audit Log&apos;)).toBeInTheDocument();
    });

    it(&apos;should display audit log entries&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Excavator CAT 320&apos;)).toBeInTheDocument();
      });

      const auditButton = screen.getByRole(&apos;button&apos;, { name: /audit log/i });
      await user.click(auditButton);

      expect(screen.getByText(&apos;John Smith&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;created&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Maintenance task created&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Error Handling&apos;, () => {
    it(&apos;should handle data loading errors gracefully&apos;, async () => {
      const { fetchMaintenanceTasks } = await import(
        &apos;../../services/maintenanceService&apos;
      );
      vi.mocked(fetchMaintenanceTasks).mockRejectedValueOnce(
        new Error(&apos;Failed to load&apos;)
      );

      render(<Maintenance {...defaultProps} />);

      // Should still render the component
      await waitFor(() => {
        expect(screen.getByText(&apos;Maintenance Management&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should handle task update errors&apos;, async () => {
      const user = userEvent.setup();
      const { updateMaintenanceTask } = await import(
        &apos;../../services/maintenanceService&apos;
      );
      vi.mocked(updateMaintenanceTask).mockRejectedValueOnce(
        new Error(&apos;Update failed&apos;)
      );

      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Excavator CAT 320&apos;)).toBeInTheDocument();
      });

      const startButton = screen.getByRole(&apos;button&apos;, { name: /start/i });
      await user.click(startButton);

      // Should handle error gracefully
      expect(updateMaintenanceTask).toHaveBeenCalled();
    });
  });

  describe(&apos;Accessibility&apos;, () => {
    it(&apos;should have proper ARIA labels and roles&apos;, async () => {
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Maintenance Management&apos;)).toBeInTheDocument();
      });

      // Check tab navigation
      const tabs = screen.getAllByRole(&apos;tab&apos;);
      expect(tabs.length).toBe(4);

      // Check table headers
      const tableHeaders = screen.getAllByRole(&apos;columnheader&apos;);
      expect(tableHeaders.length).toBeGreaterThan(0);
    });

    it(&apos;should maintain keyboard navigation&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Maintenance Management&apos;)).toBeInTheDocument();
      });

      // Tab through elements
      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe(&apos;Data Refresh&apos;, () => {
    it(&apos;should refresh data when refresh button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<Maintenance {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Maintenance Management&apos;)).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole(&apos;button&apos;, { name: /refresh/i });
      await user.click(refreshButton);

      // Should reload data
      const { fetchMaintenanceTasks } = await import(
        &apos;../../services/maintenanceService&apos;
      );
      expect(fetchMaintenanceTasks).toHaveBeenCalledTimes(2); // Initial load + refresh
    });
  });
});
