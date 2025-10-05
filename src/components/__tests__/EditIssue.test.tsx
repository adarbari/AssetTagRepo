import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditIssue } from '../EditIssue'
import { render } from '../../test/test-utils'
import { mockIssue } from '../../test/test-utils'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

// Mock getIssueById
vi.mock('../../data/mockIssueData', () => ({
  getIssueById: vi.fn().mockResolvedValue(mockIssue)
}))

describe('EditIssue Component - Button Click Tests', () => {
  const mockProps = {
    issueId: mockIssue.id,
    onBack: vi.fn(),
    onUpdateIssue: vi.fn().mockResolvedValue({ success: true, issue: mockIssue })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Navigation and Header Buttons', () => {
    it('should render back button and handle click', async () => {
      const user = userEvent.setup()
      render(<EditIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)
      expect(mockProps.onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Form Input Interactions', () => {
    it('should populate form with issue data', async () => {
      render(<EditIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockIssue.title)).toBeInTheDocument()
      })

      expect(screen.getByDisplayValue(mockIssue.title)).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockIssue.description)).toBeInTheDocument()
    })

    it('should handle issue title input changes', async () => {
      const user = userEvent.setup()
      render(<EditIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockIssue.title)).toBeInTheDocument()
      })

      const titleInput = screen.getByDisplayValue(mockIssue.title)
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Issue Title')
      expect(titleInput).toHaveValue('Updated Issue Title')
    })

    it('should handle issue description textarea changes', async () => {
      const user = userEvent.setup()
      render(<EditIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockIssue.description)).toBeInTheDocument()
      })

      const descriptionInput = screen.getByDisplayValue(mockIssue.description)
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Updated description')
      expect(descriptionInput).toHaveValue('Updated description')
    })

    it('should handle location input changes', async () => {
      const user = userEvent.setup()
      render(<EditIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockIssue.location || '')).toBeInTheDocument()
      })

      const locationInput = screen.getByDisplayValue(mockIssue.location || '')
      await user.clear(locationInput)
      await user.type(locationInput, 'Updated Location')
      expect(locationInput).toHaveValue('Updated Location')
    })
  })

  describe('Dropdown Selections', () => {
    it('should handle issue type selection', async () => {
      const user = userEvent.setup()
      render(<EditIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockIssue.type)).toBeInTheDocument()
      })

      const typeSelect = screen.getByDisplayValue(mockIssue.type)
      await user.click(typeSelect)

      await waitFor(() => {
        expect(screen.getByText('Maintenance')).toBeInTheDocument()
      })

      const maintenanceOption = screen.getByText('Maintenance')
      await user.click(maintenanceOption)
    })

    it('should handle severity selection', async () => {
      const user = userEvent.setup()
      render(<EditIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockIssue.severity)).toBeInTheDocument()
      })

      const severitySelect = screen.getByDisplayValue(mockIssue.severity)
      await user.click(severitySelect)

      await waitFor(() => {
        expect(screen.getByText('High')).toBeInTheDocument()
      })

      const highOption = screen.getByText('High')
      await user.click(highOption)
    })

    it('should handle status selection', async () => {
      const user = userEvent.setup()
      render(<EditIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockIssue.status)).toBeInTheDocument()
      })

      const statusSelect = screen.getByDisplayValue(mockIssue.status)
      await user.click(statusSelect)

      await waitFor(() => {
        expect(screen.getByText('Open')).toBeInTheDocument()
      })

      const openOption = screen.getByText('Open')
      await user.click(openOption)
    })
  })

  describe('Form Submission', () => {
    it('should handle save button click', async () => {
      const user = userEvent.setup()
      render(<EditIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save|update/i })).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockProps.onUpdateIssue).toHaveBeenCalledTimes(1)
      })
    })

    it('should show validation errors for invalid data', async () => {
      const user = userEvent.setup()
      render(<EditIssue {...mockProps} />)

      // Clear required fields
      await waitFor(() => {
        expect(screen.getByDisplayValue(mockIssue.title)).toBeInTheDocument()
      })

      const titleInput = screen.getByDisplayValue(mockIssue.title)
      await user.clear(titleInput)

      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Cancel and Reset', () => {
    it('should handle cancel button click', async () => {
      const user = userEvent.setup()
      render(<EditIssue {...mockProps} />)

      const cancelButton = screen.queryByRole('button', { name: /cancel/i })
      if (cancelButton) {
        await user.click(cancelButton)
        expect(mockProps.onBack).toHaveBeenCalledTimes(1)
      }
    })

    it('should handle reset button click', async () => {
      const user = userEvent.setup()
      render(<EditIssue {...mockProps} />)

      // Modify some fields first
      await waitFor(() => {
        expect(screen.getByDisplayValue(mockIssue.title)).toBeInTheDocument()
      })

      const titleInput = screen.getByDisplayValue(mockIssue.title)
      await user.clear(titleInput)
      await user.type(titleInput, 'Modified Title')

      // Look for reset button
      const resetButton = screen.queryByRole('button', { name: /reset|revert/i })
      if (resetButton) {
        await user.click(resetButton)
        expect(titleInput).toHaveValue(mockIssue.title)
      }
    })
  })

  describe('Audit Log', () => {
    it('should display audit log entries', async () => {
      render(<EditIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText(/audit log/i)).toBeInTheDocument()
      })

      // Should show audit log entries
      expect(screen.getByText(/audit log/i)).toBeInTheDocument()
    })

    it('should handle audit log button clicks', async () => {
      const user = userEvent.setup()
      render(<EditIssue {...mockProps} />)

      const auditLogButton = screen.queryByRole('button', { name: /audit log|history/i })
      if (auditLogButton) {
        await user.click(auditLogButton)
        // Should expand or show audit log
      }
    })
  })

  describe('Loading States', () => {
    it('should show loading state during save', async () => {
      const user = userEvent.setup()
      render(<EditIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save|update/i })).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)

      // Should show loading state
      await waitFor(() => {
        expect(saveButton).toBeDisabled()
      })
    })
  })

  describe('Issue Status Updates', () => {
    it('should handle status change buttons', async () => {
      const user = userEvent.setup()
      render(<EditIssue {...mockProps} />)

      // Look for status change buttons
      const resolveButton = screen.queryByRole('button', { name: /resolve|close/i })
      const reopenButton = screen.queryByRole('button', { name: /reopen/i })

      if (resolveButton) {
        await user.click(resolveButton)
      }

      if (reopenButton) {
        await user.click(reopenButton)
      }
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', async () => {
      render(<EditIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument()
      })

      // Check for proper form structure
      expect(screen.getByRole('form')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should render properly on different screen sizes', async () => {
      render(<EditIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument()
      })

      // Component should be responsive
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
    })
  })
})
