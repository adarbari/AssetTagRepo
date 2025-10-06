// import React from &apos;react&apos;;
import { describe, it, expect, vi, beforeEach } from &apos;vitest&apos;;
import { screen, waitFor } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { IssueTracking } from &apos;../issues/IssueTracking&apos;;
import {
  render,
  mockIssues,
  mockOnUpdateIssue,
  mockOnUpdateStatus,
  mockOnDeleteIssue,
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

describe(&apos;IssueTracking Component - Button Click Tests&apos;, () => {
  const defaultProps = {
    issues: mockIssues,
    onUpdateIssue: mockOnUpdateIssue,
    onUpdateStatus: mockOnUpdateStatus,
    onDeleteIssue: mockOnDeleteIssue,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe(&apos;Search and Filter Buttons&apos;, () => {
    it(&apos;should filter issues when search input changes&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Find search input
      const searchInput = screen.getByPlaceholderText(/search issues/i);
      expect(searchInput).toBeInTheDocument();

      // Type in search
      await user.type(searchInput, &apos;Test&apos;);

      // Should still show the test issue
      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should filter by status when status dropdown changes&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Find status filter dropdown
      const statusFilter = screen.getByRole(&apos;combobox&apos;, { name: /status/i });
      await user.click(statusFilter);

      // Select &quot;Open&quot; status
      const openOption = screen.getByText(&apos;Open&apos;);
      await user.click(openOption);

      // Should show the issue (since it&apos;s open)
      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should filter by severity when severity dropdown changes&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Find severity filter dropdown
      const severityFilter = screen.getByRole(&apos;combobox&apos;, {
        name: /severity/i,
      });
      await user.click(severityFilter);

      // Select &quot;Medium&quot; severity
      const mediumOption = screen.getByText(&apos;Medium&apos;);
      await user.click(mediumOption);

      // Should show the issue (since it&apos;s medium severity)
      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001&apos;)).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Tab Navigation Buttons&apos;, () => {
    it(&apos;should switch to Active tab when clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Click Active tab
      const activeTab = screen.getByRole(&apos;tab&apos;, { name: /active/i });
      await user.click(activeTab);

      // Should show the issue (since it&apos;s open/active)
      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should switch to Resolved tab when clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Click Resolved tab
      const resolvedTab = screen.getByRole(&apos;tab&apos;, { name: /resolved/i });
      await user.click(resolvedTab);

      // Should show empty state since no resolved issues
      await waitFor(() => {
        expect(screen.getByText(&apos;No issues found&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should switch back to All Issues tab when clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // First go to Active tab
      const activeTab = screen.getByRole(&apos;tab&apos;, { name: /active/i });
      await user.click(activeTab);

      // Then go back to All Issues tab
      const allIssuesTab = screen.getByRole(&apos;tab&apos;, { name: /all issues/i });
      await user.click(allIssuesTab);

      // Should show the issue
      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001&apos;)).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Table Row Click Actions&apos;, () => {
    it(&apos;should navigate to issue details when table row is clicked&apos;, async () => {
      const user = userEvent.setup();
      const mockNavigation = createMockNavigation();

      vi.mocked(
        require(&apos;../../contexts/NavigationContext&apos;).useNavigation
      ).mockReturnValue(mockNavigation);

      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Click on the table row
      const tableRow = screen.getByText(&apos;ISS-001&apos;).closest(&apos;tr&apos;);
      expect(tableRow).toBeInTheDocument();

      if (tableRow) {
        await user.click(tableRow);
        expect(mockNavigation.navigateToEditIssue).toHaveBeenCalledWith(
          &apos;ISS-001&apos;
        );
      }
    });
  });

  describe(&apos;Dropdown Menu Actions&apos;, () => {
    it(&apos;should open dropdown menu when more actions button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Find and click the more actions button
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      await user.click(moreActionsButton);

      // Should show dropdown menu items
      await waitFor(() => {
        expect(screen.getByText(&apos;View Details&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Acknowledge&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Start Work&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Edit Issue&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should call onUpdateStatus when Acknowledge is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      await user.click(moreActionsButton);

      // Click Acknowledge
      const acknowledgeButton = screen.getByText(&apos;Acknowledge&apos;);
      await user.click(acknowledgeButton);

      // Should call onUpdateStatus
      await waitFor(() => {
        expect(mockOnUpdateStatus).toHaveBeenCalledWith(
          &apos;ISS-001&apos;,
          &apos;acknowledged&apos;
        );
      });
    });

    it(&apos;should call onUpdateStatus when Start Work is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      await user.click(moreActionsButton);

      // Click Start Work
      const startWorkButton = screen.getByText(&apos;Start Work&apos;);
      await user.click(startWorkButton);

      // Should call onUpdateStatus
      await waitFor(() => {
        expect(mockOnUpdateStatus).toHaveBeenCalledWith(
          &apos;ISS-001&apos;,
          &apos;in-progress&apos;
        );
      });
    });

    it(&apos;should navigate to edit issue when Edit Issue is clicked&apos;, async () => {
      const user = userEvent.setup();
      const mockNavigation = createMockNavigation();

      vi.mocked(
        require(&apos;../../contexts/NavigationContext&apos;).useNavigation
      ).mockReturnValue(mockNavigation);

      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      await user.click(moreActionsButton);

      // Click Edit Issue
      const editIssueButton = screen.getByText(&apos;Edit Issue&apos;);
      await user.click(editIssueButton);

      // Should navigate to edit issue
      expect(mockNavigation.navigateToEditIssue).toHaveBeenCalledWith(
        &apos;ISS-001&apos;
      );
    });

    it(&apos;should navigate to view details when View Details is clicked&apos;, async () => {
      const user = userEvent.setup();
      const mockNavigation = createMockNavigation();

      vi.mocked(
        require(&apos;../../contexts/NavigationContext&apos;).useNavigation
      ).mockReturnValue(mockNavigation);

      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      await user.click(moreActionsButton);

      // Click View Details
      const viewDetailsButton = screen.getByText(&apos;View Details&apos;);
      await user.click(viewDetailsButton);

      // Should navigate to edit issue (same as edit in this case)
      expect(mockNavigation.navigateToEditIssue).toHaveBeenCalledWith(
        &apos;ISS-001&apos;
      );
    });
  });

  describe(&apos;Status Update Actions&apos;, () => {
    it(&apos;should show Mark Resolved option for in-progress issues&apos;, async () => {
      const user = userEvent.setup();
      const inProgressIssue = {
        ...mockIssues[0],
        status: &apos;in-progress&apos; as const,
      };

      render(<IssueTracking {...defaultProps} issues={[inProgressIssue]} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      await user.click(moreActionsButton);

      // Should show Mark Resolved option
      await waitFor(() => {
        expect(screen.getByText(&apos;Mark Resolved&apos;)).toBeInTheDocument();
      });

      // Click Mark Resolved
      const markResolvedButton = screen.getByText(&apos;Mark Resolved&apos;);
      await user.click(markResolvedButton);

      // Should call onUpdateStatus
      await waitFor(() => {
        expect(mockOnUpdateStatus).toHaveBeenCalledWith(&apos;ISS-001&apos;, &apos;resolved&apos;);
      });
    });

    it(&apos;should not show Acknowledge for already acknowledged issues&apos;, async () => {
      const user = userEvent.setup();
      const acknowledgedIssue = {
        ...mockIssues[0],
        status: &apos;acknowledged&apos; as const,
      };

      render(<IssueTracking {...defaultProps} issues={[acknowledgedIssue]} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      await user.click(moreActionsButton);

      // Should not show Acknowledge option
      expect(screen.queryByText(&apos;Acknowledge&apos;)).not.toBeInTheDocument();

      // Should show Start Work option
      expect(screen.getByText(&apos;Start Work&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Error Handling&apos;, () => {
    it(&apos;should handle status update errors gracefully&apos;, async () => {
      const user = userEvent.setup();
      const mockOnUpdateStatusError = vi.fn().mockResolvedValue({
        success: false,
        error: &apos;Update failed&apos;,
      });

      render(
        <IssueTracking
          {...defaultProps}
          onUpdateStatus={mockOnUpdateStatusError}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Open dropdown menu
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      await user.click(moreActionsButton);

      // Click Acknowledge
      const acknowledgeButton = screen.getByText(&apos;Acknowledge&apos;);
      await user.click(acknowledgeButton);

      // Should call onUpdateStatus but handle error
      await waitFor(() => {
        expect(mockOnUpdateStatusError).toHaveBeenCalledWith(
          &apos;ISS-001&apos;,
          &apos;acknowledged&apos;
        );
      });
    });
  });

  describe(&apos;Button Accessibility&apos;, () => {
    it(&apos;should have proper ARIA labels and roles for all interactive elements&apos;, async () => {
      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Check search input
      const searchInput = screen.getByPlaceholderText(/search issues/i);
      expect(searchInput).toBeInTheDocument();

      // Check filter dropdowns
      const statusFilter = screen.getByRole(&apos;combobox&apos;, { name: /status/i });
      const severityFilter = screen.getByRole(&apos;combobox&apos;, {
        name: /severity/i,
      });
      expect(statusFilter).toBeInTheDocument();
      expect(severityFilter).toBeInTheDocument();

      // Check tabs
      const tabs = screen.getAllByRole(&apos;tab&apos;);
      expect(tabs.length).toBeGreaterThan(0);

      // Check table
      const table = screen.getByRole(&apos;table&apos;);
      expect(table).toBeInTheDocument();

      // Check action buttons
      const moreActionsButton = screen.getByRole(&apos;button&apos;, { name: /more/i });
      expect(moreActionsButton).toBeInTheDocument();
    });

    it(&apos;should support keyboard navigation for all buttons&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Tab through interactive elements
      await user.tab();

      // Should be able to focus on search input
      const searchInput = screen.getByPlaceholderText(/search issues/i);
      expect(document.activeElement).toBe(searchInput);

      // Continue tabbing to reach other elements
      await user.tab();
      await user.tab();

      // Should be able to focus on tabs
      const allIssuesTab = screen.getByRole(&apos;tab&apos;, { name: /all issues/i });
      allIssuesTab.focus();
      expect(document.activeElement).toBe(allIssuesTab);
    });
  });

  describe(&apos;Empty State Handling&apos;, () => {
    it(&apos;should show empty state when no issues match filters&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Switch to Resolved tab (which should be empty)
      const resolvedTab = screen.getByRole(&apos;tab&apos;, { name: /resolved/i });
      await user.click(resolvedTab);

      // Should show empty state
      await waitFor(() => {
        expect(screen.getByText(&apos;No issues found&apos;)).toBeInTheDocument();
        expect(
          screen.getByText(&apos;No issues match your current filters&apos;)
        ).toBeInTheDocument();
      });
    });

    it(&apos;should show empty state when search returns no results&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueTracking {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Tracking&apos;)).toBeInTheDocument();
      });

      // Search for something that doesn&apos;t exist
      const searchInput = screen.getByPlaceholderText(/search issues/i);
      await user.type(searchInput, &apos;nonexistent&apos;);

      // Should show empty state
      await waitFor(() => {
        expect(screen.getByText(&apos;No issues found&apos;)).toBeInTheDocument();
      });
    });
  });
});
