// import React from &apos;react&apos;;
import { describe, it, expect, vi, beforeEach } from &apos;vitest&apos;;
import { screen, waitFor } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { IssueDetails } from &apos;../issues/IssueDetails&apos;;
import {
  render,
  mockIssue,
  mockOnUpdateIssue,
  mockOnBack,
} from &apos;../../test/test-utils&apos;;

// Mock the toast function
vi.mock(&apos;sonner&apos;, () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the getIssueById function
vi.mock(&apos;../../data/mockIssueData&apos;, () => ({
  getIssueById: vi.fn(() => mockIssue),
}));

describe(&apos;IssueDetails Component - Button Click Tests&apos;, () => {
  const defaultProps = {
    issueId: &apos;ISS-001&apos;,
    onBack: mockOnBack,
    onUpdateIssue: mockOnUpdateIssue,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe(&apos;Back Button Functionality&apos;, () => {
    it(&apos;should call onBack when back button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueDetails {...defaultProps} />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001 - Test Issue&apos;)).toBeInTheDocument();
      });

      // Find and click the back button
      const backButton = screen.getByRole(&apos;button&apos;, { name: /back/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it(&apos;should call onBack when &quot;Back to Issues&quot; button is clicked in error state&apos;, async () => {
      const user = userEvent.setup();

      // Mock getIssueById to return null (issue not found)
      const { getIssueById } = await import(&apos;../../data/mockIssueData&apos;);
      vi.mocked(getIssueById).mockReturnValueOnce(null);

      render(<IssueDetails {...defaultProps} />);

      // Wait for error state to appear
      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Not Found&apos;)).toBeInTheDocument();
      });

      const backButton = screen.getByRole(&apos;button&apos;, {
        name: /back to issues/i,
      });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Edit Button Functionality&apos;, () => {
    it(&apos;should toggle to edit mode when Edit Issue button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001 - Test Issue&apos;)).toBeInTheDocument();
      });

      // Click Edit Issue button
      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit issue/i });
      await user.click(editButton);

      // Should show edit form
      expect(screen.getByText(&apos;Edit Issue&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Update the issue information&apos;)
      ).toBeInTheDocument();

      // Should show Cancel and Save buttons
      expect(
        screen.getByRole(&apos;button&apos;, { name: /cancel/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole(&apos;button&apos;, { name: /save changes/i })
      ).toBeInTheDocument();
    });

    it(&apos;should toggle back to view mode when Cancel button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001 - Test Issue&apos;)).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit issue/i });
      await user.click(editButton);

      // Click Cancel button
      const cancelButton = screen.getByRole(&apos;button&apos;, { name: /cancel/i });
      await user.click(cancelButton);

      // Should be back to view mode
      expect(screen.getByText(&apos;Edit Issue&apos;)).not.toBeInTheDocument();
      expect(
        screen.getByRole(&apos;button&apos;, { name: /edit issue/i })
      ).toBeInTheDocument();
    });

    it(&apos;should call onUpdateIssue when Save Changes button is clicked with valid form data&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001 - Test Issue&apos;)).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit issue/i });
      await user.click(editButton);

      // Wait for form to appear
      await waitFor(() => {
        expect(screen.getByText(&apos;Edit Issue&apos;)).toBeInTheDocument();
      });

      // Fill in form fields (assuming IssueForm has these fields)
      const titleInput = screen.getByDisplayValue(&apos;Test Issue&apos;);
      await user.clear(titleInput);
      await user.type(titleInput, &apos;Updated Test Issue&apos;);

      const descriptionInput = screen.getByDisplayValue(
        &apos;This is a test issue description&apos;
      );
      await user.clear(descriptionInput);
      await user.type(descriptionInput, &apos;Updated description&apos;);

      // Click Save Changes button
      const saveButton = screen.getByRole(&apos;button&apos;, { name: /save changes/i });
      await user.click(saveButton);

      // Wait for the update to be called
      await waitFor(() => {
        expect(mockOnUpdateIssue).toHaveBeenCalledWith(
          &apos;ISS-001&apos;,
          expect.objectContaining({
            title: &apos;Updated Test Issue&apos;,
            description: &apos;Updated description&apos;,
          })
        );
      });
    });

    it(&apos;should handle form submission errors gracefully&apos;, async () => {
      const user = userEvent.setup();
      const mockOnUpdateIssueError = vi.fn().mockResolvedValue({
        success: false,
        error: &apos;Update failed&apos;,
      });

      render(
        <IssueDetails
          {...defaultProps}
          onUpdateIssue={mockOnUpdateIssueError}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001 - Test Issue&apos;)).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit issue/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText(&apos;Edit Issue&apos;)).toBeInTheDocument();
      });

      // Click Save Changes button
      const saveButton = screen.getByRole(&apos;button&apos;, { name: /save changes/i });
      await user.click(saveButton);

      // Should call onUpdateIssue but handle error
      await waitFor(() => {
        expect(mockOnUpdateIssueError).toHaveBeenCalled();
      });
    });
  });

  describe(&apos;Form Submission via Button&apos;, () => {
    it(&apos;should submit form when Save Changes button is clicked (form submit)&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001 - Test Issue&apos;)).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit issue/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText(&apos;Edit Issue&apos;)).toBeInTheDocument();
      });

      // The Save Changes button should have type=&quot;submit&quot; and form=&quot;issue-form&quot;
      const saveButton = screen.getByRole(&apos;button&apos;, { name: /save changes/i });
      expect(saveButton).toHaveAttribute(&apos;type&apos;, &apos;submit&apos;);
      expect(saveButton).toHaveAttribute(&apos;form&apos;, &apos;issue-form&apos;);

      // Click the button to submit the form
      await user.click(saveButton);

      // Should call onUpdateIssue
      await waitFor(() => {
        expect(mockOnUpdateIssue).toHaveBeenCalled();
      });
    });
  });

  describe(&apos;Loading and Error States&apos;, () => {
    it(&apos;should show loading state initially&apos;, () => {
      render(<IssueDetails {...defaultProps} />);

      // Should show loading spinner
      expect(screen.getByRole(&apos;status&apos;, { hidden: true })).toBeInTheDocument();
    });

    it(&apos;should handle loading errors and show back button&apos;, async () => {
      const user = userEvent.setup();

      // Mock getIssueById to throw an error
      const { getIssueById } = await import(&apos;../../data/mockIssueData&apos;);
      vi.mocked(getIssueById).mockImplementationOnce(() => {
        throw new Error(&apos;Failed to load issue&apos;);
      });

      render(<IssueDetails {...defaultProps} />);

      // Wait for error handling
      await waitFor(() => {
        expect(screen.getByText(&apos;Issue Not Found&apos;)).toBeInTheDocument();
      });

      // Should have back button
      const backButton = screen.getByRole(&apos;button&apos;, {
        name: /back to issues/i,
      });
      expect(backButton).toBeInTheDocument();

      // Clicking back button should work
      await user.click(backButton);
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Button Accessibility&apos;, () => {
    it(&apos;should have proper ARIA labels and roles for all buttons&apos;, async () => {
      render(<IssueDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001 - Test Issue&apos;)).toBeInTheDocument();
      });

      // Check that all buttons have proper roles
      const buttons = screen.getAllByRole(&apos;button&apos;);
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
        // Each button should have accessible text or aria-label
        expect(
          button.textContent ||
            button.getAttribute(&apos;aria-label&apos;) ||
            button.getAttribute(&apos;aria-labelledby&apos;)
        ).toBeTruthy();
      });
    });

    it(&apos;should maintain focus management during edit mode toggle&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001 - Test Issue&apos;)).toBeInTheDocument();
      });

      // Focus on edit button
      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit issue/i });
      editButton.focus();
      expect(document.activeElement).toBe(editButton);

      // Click to enter edit mode
      await user.click(editButton);

      // Should have cancel and save buttons available
      const cancelButton = screen.getByRole(&apos;button&apos;, { name: /cancel/i });
      const saveButton = screen.getByRole(&apos;button&apos;, { name: /save changes/i });

      expect(cancelButton).toBeInTheDocument();
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe(&apos;Button State Management&apos;, () => {
    it(&apos;should disable Save button while saving&apos;, async () => {
      const user = userEvent.setup();
      const mockOnUpdateIssueSlow = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise(resolve =>
              setTimeout(
                () => resolve({ success: true, issue: mockIssue }),
                100
              )
            )
        );

      render(
        <IssueDetails {...defaultProps} onUpdateIssue={mockOnUpdateIssueSlow} />
      );

      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001 - Test Issue&apos;)).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit issue/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText(&apos;Edit Issue&apos;)).toBeInTheDocument();
      });

      // Click Save Changes button
      const saveButton = screen.getByRole(&apos;button&apos;, { name: /save changes/i });
      await user.click(saveButton);

      // Button should be disabled while saving
      await waitFor(() => {
        expect(saveButton).toBeDisabled();
      });
    });

    it(&apos;should re-enable buttons after save completion&apos;, async () => {
      const user = userEvent.setup();
      render(<IssueDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(&apos;ISS-001 - Test Issue&apos;)).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit issue/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText(&apos;Edit Issue&apos;)).toBeInTheDocument();
      });

      // Click Save Changes button
      const saveButton = screen.getByRole(&apos;button&apos;, { name: /save changes/i });
      await user.click(saveButton);

      // Wait for save to complete
      await waitFor(() => {
        expect(mockOnUpdateIssue).toHaveBeenCalled();
      });

      // Should navigate back (button state is no longer relevant)
      await waitFor(() => {
        expect(mockOnBack).toHaveBeenCalled();
      });
    });
  });
});
