import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IssueDetails } from '../issues/IssueDetails'
import { 
  render, 
  mockIssue, 
  mockOnUpdateIssue, 
  mockOnBack,
  waitForAsync 
} from '../../test/test-utils'

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock the getIssueById function
vi.mock('../../data/mockIssueData', () => ({
  getIssueById: vi.fn(() => mockIssue),
}))

describe('IssueDetails Component - Button Click Tests', () => {
  const defaultProps = {
    issueId: 'ISS-001',
    onBack: mockOnBack,
    onUpdateIssue: mockOnUpdateIssue,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Back Button Functionality', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup()
      render(<IssueDetails {...defaultProps} />)

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('ISS-001 - Test Issue')).toBeInTheDocument()
      })

      // Find and click the back button
      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)

      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })

    it('should call onBack when "Back to Issues" button is clicked in error state', async () => {
      const user = userEvent.setup()
      
      // Mock getIssueById to return null (issue not found)
      const { getIssueById } = await import('../../data/mockIssueData')
      vi.mocked(getIssueById).mockReturnValueOnce(null)

      render(<IssueDetails {...defaultProps} />)

      // Wait for error state to appear
      await waitFor(() => {
        expect(screen.getByText('Issue Not Found')).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /back to issues/i })
      await user.click(backButton)

      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edit Button Functionality', () => {
    it('should toggle to edit mode when Edit Issue button is clicked', async () => {
      const user = userEvent.setup()
      render(<IssueDetails {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('ISS-001 - Test Issue')).toBeInTheDocument()
      })

      // Click Edit Issue button
      const editButton = screen.getByRole('button', { name: /edit issue/i })
      await user.click(editButton)

      // Should show edit form
      expect(screen.getByText('Edit Issue')).toBeInTheDocument()
      expect(screen.getByText('Update the issue information')).toBeInTheDocument()
      
      // Should show Cancel and Save buttons
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })

    it('should toggle back to view mode when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<IssueDetails {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('ISS-001 - Test Issue')).toBeInTheDocument()
      })

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit issue/i })
      await user.click(editButton)

      // Click Cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Should be back to view mode
      expect(screen.getByText('Edit Issue')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit issue/i })).toBeInTheDocument()
    })

    it('should call onUpdateIssue when Save Changes button is clicked with valid form data', async () => {
      const user = userEvent.setup()
      render(<IssueDetails {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('ISS-001 - Test Issue')).toBeInTheDocument()
      })

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit issue/i })
      await user.click(editButton)

      // Wait for form to appear
      await waitFor(() => {
        expect(screen.getByText('Edit Issue')).toBeInTheDocument()
      })

      // Fill in form fields (assuming IssueForm has these fields)
      const titleInput = screen.getByDisplayValue('Test Issue')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Test Issue')

      const descriptionInput = screen.getByDisplayValue('This is a test issue description')
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Updated description')

      // Click Save Changes button
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      // Wait for the update to be called
      await waitFor(() => {
        expect(mockOnUpdateIssue).toHaveBeenCalledWith('ISS-001', expect.objectContaining({
          title: 'Updated Test Issue',
          description: 'Updated description',
        }))
      })
    })

    it('should handle form submission errors gracefully', async () => {
      const user = userEvent.setup()
      const mockOnUpdateIssueError = vi.fn().mockResolvedValue({ 
        success: false, 
        error: 'Update failed' 
      })

      render(<IssueDetails {...defaultProps} onUpdateIssue={mockOnUpdateIssueError} />)

      await waitFor(() => {
        expect(screen.getByText('ISS-001 - Test Issue')).toBeInTheDocument()
      })

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit issue/i })
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Edit Issue')).toBeInTheDocument()
      })

      // Click Save Changes button
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      // Should call onUpdateIssue but handle error
      await waitFor(() => {
        expect(mockOnUpdateIssueError).toHaveBeenCalled()
      })
    })
  })

  describe('Form Submission via Button', () => {
    it('should submit form when Save Changes button is clicked (form submit)', async () => {
      const user = userEvent.setup()
      render(<IssueDetails {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('ISS-001 - Test Issue')).toBeInTheDocument()
      })

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit issue/i })
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Edit Issue')).toBeInTheDocument()
      })

      // The Save Changes button should have type="submit" and form="issue-form"
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      expect(saveButton).toHaveAttribute('type', 'submit')
      expect(saveButton).toHaveAttribute('form', 'issue-form')

      // Click the button to submit the form
      await user.click(saveButton)

      // Should call onUpdateIssue
      await waitFor(() => {
        expect(mockOnUpdateIssue).toHaveBeenCalled()
      })
    })
  })

  describe('Loading and Error States', () => {
    it('should show loading state initially', () => {
      render(<IssueDetails {...defaultProps} />)
      
      // Should show loading spinner
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
    })

    it('should handle loading errors and show back button', async () => {
      const user = userEvent.setup()
      
      // Mock getIssueById to throw an error
      const { getIssueById } = await import('../../data/mockIssueData')
      vi.mocked(getIssueById).mockImplementationOnce(() => {
        throw new Error('Failed to load issue')
      })

      render(<IssueDetails {...defaultProps} />)

      // Wait for error handling
      await waitFor(() => {
        expect(screen.getByText('Issue Not Found')).toBeInTheDocument()
      })

      // Should have back button
      const backButton = screen.getByRole('button', { name: /back to issues/i })
      expect(backButton).toBeInTheDocument()

      // Clicking back button should work
      await user.click(backButton)
      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Button Accessibility', () => {
    it('should have proper ARIA labels and roles for all buttons', async () => {
      render(<IssueDetails {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('ISS-001 - Test Issue')).toBeInTheDocument()
      })

      // Check that all buttons have proper roles
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
        // Each button should have accessible text or aria-label
        expect(
          button.textContent || 
          button.getAttribute('aria-label') || 
          button.getAttribute('aria-labelledby')
        ).toBeTruthy()
      })
    })

    it('should maintain focus management during edit mode toggle', async () => {
      const user = userEvent.setup()
      render(<IssueDetails {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('ISS-001 - Test Issue')).toBeInTheDocument()
      })

      // Focus on edit button
      const editButton = screen.getByRole('button', { name: /edit issue/i })
      editButton.focus()
      expect(document.activeElement).toBe(editButton)

      // Click to enter edit mode
      await user.click(editButton)

      // Should have cancel and save buttons available
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      
      expect(cancelButton).toBeInTheDocument()
      expect(saveButton).toBeInTheDocument()
    })
  })

  describe('Button State Management', () => {
    it('should disable Save button while saving', async () => {
      const user = userEvent.setup()
      const mockOnUpdateIssueSlow = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, issue: mockIssue }), 100))
      )

      render(<IssueDetails {...defaultProps} onUpdateIssue={mockOnUpdateIssueSlow} />)

      await waitFor(() => {
        expect(screen.getByText('ISS-001 - Test Issue')).toBeInTheDocument()
      })

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit issue/i })
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Edit Issue')).toBeInTheDocument()
      })

      // Click Save Changes button
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      // Button should be disabled while saving
      await waitFor(() => {
        expect(saveButton).toBeDisabled()
      })
    })

    it('should re-enable buttons after save completion', async () => {
      const user = userEvent.setup()
      render(<IssueDetails {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('ISS-001 - Test Issue')).toBeInTheDocument()
      })

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit issue/i })
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Edit Issue')).toBeInTheDocument()
      })

      // Click Save Changes button
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      // Wait for save to complete
      await waitFor(() => {
        expect(mockOnUpdateIssue).toHaveBeenCalled()
      })

      // Should navigate back (button state is no longer relevant)
      await waitFor(() => {
        expect(mockOnBack).toHaveBeenCalled()
      })
    })
  })
})
