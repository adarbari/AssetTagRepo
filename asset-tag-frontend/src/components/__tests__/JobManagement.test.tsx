// import React from &apos;react&apos;;
import { describe, it, expect, vi, beforeEach } from &apos;vitest&apos;;
import { screen, waitFor } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { JobManagement } from &apos;../job/JobManagement&apos;;
import {
  render,
  mockJobs,
  mockJobAlerts,
  mockOnCreateJob,
  mockOnUpdateJob,
  mockOnDeleteJob,
  mockOnAddAssetToJob,
  mockOnRemoveAssetFromJob,
  mockOnNavigateToCreateJob,
  mockOnNavigateToJobDetails,
  createMockNavigation,
} from &apos;../../test/test-utils&apos;;

// Mock the toast function
vi.mock(&apos;sonner&apos;, () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the navigation context
vi.mock(&apos;../../contexts/NavigationContext&apos;, () => ({
  useNavigation: () => createMockNavigation(),
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, &apos;confirm&apos;, {
  value: mockConfirm,
  writable: true,
});

describe(&apos;JobManagement Component - Button Click Tests&apos;, () => {
  const defaultProps = {
    jobs: mockJobs,
    onCreateJob: mockOnCreateJob,
    onUpdateJob: mockOnUpdateJob,
    onDeleteJob: mockOnDeleteJob,
    onAddAssetToJob: mockOnAddAssetToJob,
    onRemoveAssetFromJob: mockOnRemoveAssetFromJob,
    jobAlerts: mockJobAlerts,
    onNavigateToCreateJob: mockOnNavigateToCreateJob,
    onNavigateToJobDetails: mockOnNavigateToJobDetails,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true); // Default to confirming actions
  });

  describe(&apos;Create Job Button&apos;, () => {
    it(&apos;should call onNavigateToCreateJob when Create Job button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Find and click Create Job button
      const createJobButton = screen.getByRole(&apos;button&apos;, {
        name: /create job/i,
      });
      await user.click(createJobButton);

      expect(mockOnNavigateToCreateJob).toHaveBeenCalledTimes(1);
    });

    it(&apos;should use navigation context when onNavigateToCreateJob is not provided&apos;, async () => {
      const user = userEvent.setup();
      const mockNavigation = createMockNavigation();

      vi.mocked(
        require(&apos;../../contexts/NavigationContext&apos;).useNavigation
      ).mockReturnValue(mockNavigation);

      const propsWithoutCallback = {
        ...defaultProps,
        onNavigateToCreateJob: undefined,
      };

      render(<JobManagement {...propsWithoutCallback} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Find and click Create Job button
      const createJobButton = screen.getByRole(&apos;button&apos;, {
        name: /create job/i,
      });
      await user.click(createJobButton);

      expect(mockNavigation.navigateToCreateJob).toHaveBeenCalled();
    });
  });

  describe(&apos;Search and Filter Buttons&apos;, () => {
    it(&apos;should filter jobs when search input changes&apos;, async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Find search input
      const searchInput = screen.getByPlaceholderText(/search jobs/i);
      expect(searchInput).toBeInTheDocument();

      // Type in search
      await user.type(searchInput, &apos;Test&apos;);

      // Should still show the test job
      await waitFor(() => {
        expect(screen.getByText(&apos;JOB-001&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should filter by status when status dropdown changes&apos;, async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Find status filter dropdown
      const statusFilter = screen.getByRole(&apos;combobox&apos;, {
        name: /filter by status/i,
      });
      await user.click(statusFilter);

      // Select &quot;Active&quot; status
      const activeOption = screen.getByText(&apos;Active&apos;);
      await user.click(activeOption);

      // Should show the job (since it&apos;s active)
      await waitFor(() => {
        expect(screen.getByText(&apos;JOB-001&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should filter by priority when priority dropdown changes&apos;, async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Find priority filter dropdown
      const priorityFilter = screen.getByRole(&apos;combobox&apos;, {
        name: /filter by priority/i,
      });
      await user.click(priorityFilter);

      // Select &quot;High&quot; priority
      const highOption = screen.getByText(&apos;High&apos;);
      await user.click(highOption);

      // Should show the job (since it&apos;s high priority)
      await waitFor(() => {
        expect(screen.getByText(&apos;JOB-001&apos;)).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Table Row Click Actions&apos;, () => {
    it(&apos;should navigate to job details when table row is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Click on the table row
      const tableRow = screen.getByText(&apos;JOB-001&apos;).closest(&apos;tr&apos;);
      expect(tableRow).toBeInTheDocument();

      if (tableRow) {
        await user.click(tableRow);
        expect(mockOnNavigateToJobDetails).toHaveBeenCalledWith(
          expect.objectContaining({
            id: &apos;JOB-001&apos;,
          })
        );
      }
    });

    it(&apos;should use navigation context when onNavigateToJobDetails is not provided&apos;, async () => {
      const user = userEvent.setup();
      const mockNavigation = createMockNavigation();

      vi.mocked(
        require(&apos;../../contexts/NavigationContext&apos;).useNavigation
      ).mockReturnValue(mockNavigation);

      const propsWithoutCallback = {
        ...defaultProps,
        onNavigateToJobDetails: undefined,
      };

      render(<JobManagement {...propsWithoutCallback} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Click on the table row
      const tableRow = screen.getByText(&apos;JOB-001&apos;).closest(&apos;tr&apos;);
      expect(tableRow).toBeInTheDocument();

      if (tableRow) {
        await user.click(tableRow);
        expect(mockNavigation.navigateToJobDetails).toHaveBeenCalled();
      }
    });
  });

  describe(&apos;Dropdown Menu Actions&apos;, () => {
    it(&apos;should open dropdown menu when more actions button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Find and click the more actions button
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      await user.click(moreActionsButton);

      // Should show dropdown menu items
      await waitFor(() => {
        expect(screen.getByText(&apos;View Details&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Delete Job&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should navigate to job details when View Details is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      await user.click(moreActionsButton);

      // Click View Details
      const viewDetailsButton = screen.getByText(&apos;View Details&apos;);
      await user.click(viewDetailsButton);

      // Should navigate to job details
      expect(mockOnNavigateToJobDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          id: &apos;JOB-001&apos;,
        })
      );
    });

    it(&apos;should call onDeleteJob when Delete Job is clicked and confirmed&apos;, async () => {
      const user = userEvent.setup();
      mockConfirm.mockReturnValue(true); // User confirms deletion

      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      await user.click(moreActionsButton);

      // Click Delete Job
      const deleteJobButton = screen.getByText(&apos;Delete Job&apos;);
      await user.click(deleteJobButton);

      // Should show confirmation dialog and call onDeleteJob
      expect(mockConfirm).toHaveBeenCalledWith(
        &apos;Are you sure you want to delete this job?&apos;
      );
      expect(mockOnDeleteJob).toHaveBeenCalledWith(&apos;JOB-001&apos;);
    });

    it(&apos;should not call onDeleteJob when Delete Job is clicked but user cancels&apos;, async () => {
      const user = userEvent.setup();
      mockConfirm.mockReturnValue(false); // User cancels deletion

      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      await user.click(moreActionsButton);

      // Click Delete Job
      const deleteJobButton = screen.getByText(&apos;Delete Job&apos;);
      await user.click(deleteJobButton);

      // Should show confirmation dialog but not call onDeleteJob
      expect(mockConfirm).toHaveBeenCalledWith(
        &apos;Are you sure you want to delete this job?&apos;
      );
      expect(mockOnDeleteJob).not.toHaveBeenCalled();
    });
  });

  describe(&apos;Error Handling&apos;, () => {
    it(&apos;should handle delete job errors gracefully&apos;, async () => {
      const user = userEvent.setup();
      const mockOnDeleteJobError = vi.fn().mockResolvedValue({
        success: false,
        error: &apos;Delete failed&apos;,
      });

      render(
        <JobManagement {...defaultProps} onDeleteJob={mockOnDeleteJobError} />
      );

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      await user.click(moreActionsButton);

      // Click Delete Job
      const deleteJobButton = screen.getByText(&apos;Delete Job&apos;);
      await user.click(deleteJobButton);

      // Should call onDeleteJob but handle error
      await waitFor(() => {
        expect(mockOnDeleteJobError).toHaveBeenCalledWith(&apos;JOB-001&apos;);
      });
    });
  });

  describe(&apos;Button Accessibility&apos;, () => {
    it(&apos;should have proper ARIA labels and roles for all interactive elements&apos;, async () => {
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Check Create Job button
      const createJobButton = screen.getByRole(&apos;button&apos;, {
        name: /create job/i,
      });
      expect(createJobButton).toBeInTheDocument();

      // Check search input
      const searchInput = screen.getByPlaceholderText(/search jobs/i);
      expect(searchInput).toBeInTheDocument();

      // Check filter dropdowns
      const statusFilter = screen.getByRole(&apos;combobox&apos;, {
        name: /filter by status/i,
      });
      const priorityFilter = screen.getByRole(&apos;combobox&apos;, {
        name: /filter by priority/i,
      });
      expect(statusFilter).toBeInTheDocument();
      expect(priorityFilter).toBeInTheDocument();

      // Check table
      const table = screen.getByRole(&apos;table&apos;);
      expect(table).toBeInTheDocument();

      // Check action buttons
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      expect(moreActionsButton).toBeInTheDocument();
    });

    it(&apos;should support keyboard navigation for all buttons&apos;, async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Tab through interactive elements
      await user.tab();

      // Should be able to focus on search input
      const searchInput = screen.getByPlaceholderText(/search jobs/i);
      expect(document.activeElement).toBe(searchInput);

      // Continue tabbing to reach other elements
      await user.tab();
      await user.tab();

      // Should be able to focus on Create Job button
      const createJobButton = screen.getByRole(&apos;button&apos;, {
        name: /create job/i,
      });
      createJobButton.focus();
      expect(document.activeElement).toBe(createJobButton);
    });
  });

  describe(&apos;Empty State Handling&apos;, () => {
    it(&apos;should show empty state when no jobs exist&apos;, async () => {
      render(<JobManagement {...defaultProps} jobs={{}} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Should show empty state message
      await waitFor(() => {
        expect(
          screen.getByText(&apos;No jobs yet. Create your first job to get started.&apos;)
        ).toBeInTheDocument();
      });
    });

    it(&apos;should show empty state when search returns no results&apos;, async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Search for something that doesn&apos;t exist
      const searchInput = screen.getByPlaceholderText(/search jobs/i);
      await user.type(searchInput, &apos;nonexistent&apos;);

      // Should show empty state
      await waitFor(() => {
        expect(
          screen.getByText(&apos;No jobs match your filters&apos;)
        ).toBeInTheDocument();
      });
    });

    it(&apos;should show empty state when status filter returns no results&apos;, async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Filter by status that doesn&apos;t exist
      const statusFilter = screen.getByRole(&apos;combobox&apos;, {
        name: /filter by status/i,
      });
      await user.click(statusFilter);

      const planningOption = screen.getByText(&apos;Planning&apos;);
      await user.click(planningOption);

      // Should show empty state
      await waitFor(() => {
        expect(
          screen.getByText(&apos;No jobs match your filters&apos;)
        ).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Statistics Cards&apos;, () => {
    it(&apos;should display correct statistics&apos;, async () => {
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Check that statistics are displayed
      expect(screen.getByText(&apos;Total Jobs&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Total Budget&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Actual Costs&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Active Alerts&apos;)).toBeInTheDocument();

      // Check that values are displayed
      expect(screen.getByText(&apos;1&apos;)).toBeInTheDocument(); // Total jobs
      expect(screen.getByText(&apos;$10,000.00&apos;)).toBeInTheDocument(); // Total budget
      expect(screen.getByText(&apos;$8,000.00&apos;)).toBeInTheDocument(); // Actual costs
      expect(screen.getByText(&apos;0&apos;)).toBeInTheDocument(); // Active alerts
    });
  });

  describe(&apos;Dropdown Menu Event Handling&apos;, () => {
    it(&apos;should prevent row click when dropdown menu is opened&apos;, async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Find the more actions button
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });

      // Click the button (should not trigger row click)
      await user.click(moreActionsButton);

      // Should not have called onNavigateToJobDetails
      expect(mockOnNavigateToJobDetails).not.toHaveBeenCalled();

      // Should show dropdown menu
      await waitFor(() => {
        expect(screen.getByText(&apos;View Details&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should prevent row click when dropdown menu item is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Job Management&apos;)).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      await user.click(moreActionsButton);

      // Click View Details
      const viewDetailsButton = screen.getByText(&apos;View Details&apos;);
      await user.click(viewDetailsButton);

      // Should call onNavigateToJobDetails only once (not from row click)
      expect(mockOnNavigateToJobDetails).toHaveBeenCalledTimes(1);
    });
  });
});
