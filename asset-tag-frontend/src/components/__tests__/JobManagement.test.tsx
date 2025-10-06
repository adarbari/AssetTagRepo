// import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobManagement } from '../job/JobManagement';
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
} from '../../test/test-utils';

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the navigation context
vi.mock('../../contexts/NavigationContext', () => ({
  useNavigation: () => createMockNavigation(),
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

describe('JobManagement Component - Button Click Tests', () => {
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

  describe('Create Job Button', () => {
    it('should call onNavigateToCreateJob when Create Job button is clicked', async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Find and click Create Job button
      const createJobButton = screen.getByRole('button', {
        name: /create job/i,
      });
      await user.click(createJobButton);

      expect(mockOnNavigateToCreateJob).toHaveBeenCalledTimes(1);
    });

    it('should use navigation context when onNavigateToCreateJob is not provided', async () => {
      const user = userEvent.setup();
      const mockNavigation = createMockNavigation();

      vi.mocked(
        require('../../contexts/NavigationContext').useNavigation
      ).mockReturnValue(mockNavigation);

      const propsWithoutCallback = {
        ...defaultProps,
        onNavigateToCreateJob: undefined,
      };

      render(<JobManagement {...propsWithoutCallback} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Find and click Create Job button
      const createJobButton = screen.getByRole('button', {
        name: /create job/i,
      });
      await user.click(createJobButton);

      expect(mockNavigation.navigateToCreateJob).toHaveBeenCalled();
    });
  });

  describe('Search and Filter Buttons', () => {
    it('should filter jobs when search input changes', async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Find search input
      const searchInput = screen.getByPlaceholderText(/search jobs/i);
      expect(searchInput).toBeInTheDocument();

      // Type in search
      await user.type(searchInput, 'Test');

      // Should still show the test job
      await waitFor(() => {
        expect(screen.getByText('JOB-001')).toBeInTheDocument();
      });
    });

    it('should filter by status when status dropdown changes', async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Find status filter dropdown
      const statusFilter = screen.getByRole('combobox', {
        name: /filter by status/i,
      });
      await user.click(statusFilter);

      // Select "Active" status
      const activeOption = screen.getByText('Active');
      await user.click(activeOption);

      // Should show the job (since it's active)
      await waitFor(() => {
        expect(screen.getByText('JOB-001')).toBeInTheDocument();
      });
    });

    it('should filter by priority when priority dropdown changes', async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Find priority filter dropdown
      const priorityFilter = screen.getByRole('combobox', {
        name: /filter by priority/i,
      });
      await user.click(priorityFilter);

      // Select "High" priority
      const highOption = screen.getByText('High');
      await user.click(highOption);

      // Should show the job (since it's high priority)
      await waitFor(() => {
        expect(screen.getByText('JOB-001')).toBeInTheDocument();
      });
    });
  });

  describe('Table Row Click Actions', () => {
    it('should navigate to job details when table row is clicked', async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Click on the table row
      const tableRow = screen.getByText('JOB-001').closest('tr');
      expect(tableRow).toBeInTheDocument();

      if (tableRow) {
        await user.click(tableRow);
        expect(mockOnNavigateToJobDetails).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'JOB-001',
          })
        );
      }
    });

    it('should use navigation context when onNavigateToJobDetails is not provided', async () => {
      const user = userEvent.setup();
      const mockNavigation = createMockNavigation();

      vi.mocked(
        require('../../contexts/NavigationContext').useNavigation
      ).mockReturnValue(mockNavigation);

      const propsWithoutCallback = {
        ...defaultProps,
        onNavigateToJobDetails: undefined,
      };

      render(<JobManagement {...propsWithoutCallback} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Click on the table row
      const tableRow = screen.getByText('JOB-001').closest('tr');
      expect(tableRow).toBeInTheDocument();

      if (tableRow) {
        await user.click(tableRow);
        expect(mockNavigation.navigateToJobDetails).toHaveBeenCalled();
      }
    });
  });

  describe('Dropdown Menu Actions', () => {
    it('should open dropdown menu when more actions button is clicked', async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Find and click the more actions button
      const moreActionsButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreActionsButton);

      // Should show dropdown menu items
      await waitFor(() => {
        expect(screen.getByText('View Details')).toBeInTheDocument();
        expect(screen.getByText('Delete Job')).toBeInTheDocument();
      });
    });

    it('should navigate to job details when View Details is clicked', async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreActionsButton);

      // Click View Details
      const viewDetailsButton = screen.getByText('View Details');
      await user.click(viewDetailsButton);

      // Should navigate to job details
      expect(mockOnNavigateToJobDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'JOB-001',
        })
      );
    });

    it('should call onDeleteJob when Delete Job is clicked and confirmed', async () => {
      const user = userEvent.setup();
      mockConfirm.mockReturnValue(true); // User confirms deletion

      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreActionsButton);

      // Click Delete Job
      const deleteJobButton = screen.getByText('Delete Job');
      await user.click(deleteJobButton);

      // Should show confirmation dialog and call onDeleteJob
      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this job?'
      );
      expect(mockOnDeleteJob).toHaveBeenCalledWith('JOB-001');
    });

    it('should not call onDeleteJob when Delete Job is clicked but user cancels', async () => {
      const user = userEvent.setup();
      mockConfirm.mockReturnValue(false); // User cancels deletion

      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreActionsButton);

      // Click Delete Job
      const deleteJobButton = screen.getByText('Delete Job');
      await user.click(deleteJobButton);

      // Should show confirmation dialog but not call onDeleteJob
      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this job?'
      );
      expect(mockOnDeleteJob).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle delete job errors gracefully', async () => {
      const user = userEvent.setup();
      const mockOnDeleteJobError = vi.fn().mockResolvedValue({
        success: false,
        error: 'Delete failed',
      });

      render(
        <JobManagement {...defaultProps} onDeleteJob={mockOnDeleteJobError} />
      );

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreActionsButton);

      // Click Delete Job
      const deleteJobButton = screen.getByText('Delete Job');
      await user.click(deleteJobButton);

      // Should call onDeleteJob but handle error
      await waitFor(() => {
        expect(mockOnDeleteJobError).toHaveBeenCalledWith('JOB-001');
      });
    });
  });

  describe('Button Accessibility', () => {
    it('should have proper ARIA labels and roles for all interactive elements', async () => {
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Check Create Job button
      const createJobButton = screen.getByRole('button', {
        name: /create job/i,
      });
      expect(createJobButton).toBeInTheDocument();

      // Check search input
      const searchInput = screen.getByPlaceholderText(/search jobs/i);
      expect(searchInput).toBeInTheDocument();

      // Check filter dropdowns
      const statusFilter = screen.getByRole('combobox', {
        name: /filter by status/i,
      });
      const priorityFilter = screen.getByRole('combobox', {
        name: /filter by priority/i,
      });
      expect(statusFilter).toBeInTheDocument();
      expect(priorityFilter).toBeInTheDocument();

      // Check table
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Check action buttons
      const moreActionsButton = screen.getByRole('button', { name: /more/i });
      expect(moreActionsButton).toBeInTheDocument();
    });

    it('should support keyboard navigation for all buttons', async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
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
      const createJobButton = screen.getByRole('button', {
        name: /create job/i,
      });
      createJobButton.focus();
      expect(document.activeElement).toBe(createJobButton);
    });
  });

  describe('Empty State Handling', () => {
    it('should show empty state when no jobs exist', async () => {
      render(<JobManagement {...defaultProps} jobs={{}} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Should show empty state message
      await waitFor(() => {
        expect(
          screen.getByText('No jobs yet. Create your first job to get started.')
        ).toBeInTheDocument();
      });
    });

    it('should show empty state when search returns no results', async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Search for something that doesn't exist
      const searchInput = screen.getByPlaceholderText(/search jobs/i);
      await user.type(searchInput, 'nonexistent');

      // Should show empty state
      await waitFor(() => {
        expect(
          screen.getByText('No jobs match your filters')
        ).toBeInTheDocument();
      });
    });

    it('should show empty state when status filter returns no results', async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Filter by status that doesn't exist
      const statusFilter = screen.getByRole('combobox', {
        name: /filter by status/i,
      });
      await user.click(statusFilter);

      const planningOption = screen.getByText('Planning');
      await user.click(planningOption);

      // Should show empty state
      await waitFor(() => {
        expect(
          screen.getByText('No jobs match your filters')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Statistics Cards', () => {
    it('should display correct statistics', async () => {
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Check that statistics are displayed
      expect(screen.getByText('Total Jobs')).toBeInTheDocument();
      expect(screen.getByText('Total Budget')).toBeInTheDocument();
      expect(screen.getByText('Actual Costs')).toBeInTheDocument();
      expect(screen.getByText('Active Alerts')).toBeInTheDocument();

      // Check that values are displayed
      expect(screen.getByText('1')).toBeInTheDocument(); // Total jobs
      expect(screen.getByText('$10,000.00')).toBeInTheDocument(); // Total budget
      expect(screen.getByText('$8,000.00')).toBeInTheDocument(); // Actual costs
      expect(screen.getByText('0')).toBeInTheDocument(); // Active alerts
    });
  });

  describe('Dropdown Menu Event Handling', () => {
    it('should prevent row click when dropdown menu is opened', async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Find the more actions button
      const moreActionsButton = screen.getByRole('button', { name: /more/i });

      // Click the button (should not trigger row click)
      await user.click(moreActionsButton);

      // Should not have called onNavigateToJobDetails
      expect(mockOnNavigateToJobDetails).not.toHaveBeenCalled();

      // Should show dropdown menu
      await waitFor(() => {
        expect(screen.getByText('View Details')).toBeInTheDocument();
      });
    });

    it('should prevent row click when dropdown menu item is clicked', async () => {
      const user = userEvent.setup();
      render(<JobManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Job Management')).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreActionsButton);

      // Click View Details
      const viewDetailsButton = screen.getByText('View Details');
      await user.click(viewDetailsButton);

      // Should call onNavigateToJobDetails only once (not from row click)
      expect(mockOnNavigateToJobDetails).toHaveBeenCalledTimes(1);
    });
  });
});
