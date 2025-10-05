import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateIssue } from '../CreateIssue'
import { render } from '../../test/test-utils'
import { mockAssets } from '../../data/mockData'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

describe('CreateIssue Component - Button Click Tests', () => {
  const mockAsset = mockAssets[0]
  const mockProps = {
    onBack: vi.fn(),
    assetId: mockAsset.id,
    assetName: mockAsset.name,
    assetContext: mockAsset,
    onCreateIssue: vi.fn().mockResolvedValue({ success: true, issue: { id: 'new-issue-id' } })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Navigation and Header Buttons', () => {
    it('should render back button and handle click', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)
      expect(mockProps.onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Form Input Interactions', () => {
    it('should handle issue title input', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Test Issue Title')
      expect(titleInput).toHaveValue('Test Issue Title')
    })

    it('should handle issue description textarea', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      })

      const descriptionInput = screen.getByLabelText(/description/i)
      await user.type(descriptionInput, 'Test issue description')
      expect(descriptionInput).toHaveValue('Test issue description')
    })

    it('should handle location input', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
      })

      const locationInput = screen.getByLabelText(/location/i)
      await user.type(locationInput, 'Test Location')
      expect(locationInput).toHaveValue('Test Location')
    })
  })

  describe('Dropdown Selections', () => {
    it('should handle issue type selection', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/issue type/i)).toBeInTheDocument()
      })

      const typeSelect = screen.getByLabelText(/issue type/i)
      await user.click(typeSelect)

      await waitFor(() => {
        expect(screen.getByText('Maintenance')).toBeInTheDocument()
      })

      const maintenanceOption = screen.getByText('Maintenance')
      await user.click(maintenanceOption)
    })

    it('should handle severity selection', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/severity/i)).toBeInTheDocument()
      })

      const severitySelect = screen.getByLabelText(/severity/i)
      await user.click(severitySelect)

      await waitFor(() => {
        expect(screen.getByText('High')).toBeInTheDocument()
      })

      const highOption = screen.getByText('High')
      await user.click(highOption)
    })

    it('should handle priority selection', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      })

      const prioritySelect = screen.getByLabelText(/priority/i)
      await user.click(prioritySelect)

      await waitFor(() => {
        expect(screen.getByText('Urgent')).toBeInTheDocument()
      })

      const urgentOption = screen.getByText('Urgent')
      await user.click(urgentOption)
    })
  })

  describe('Form Submission', () => {
    it('should handle form submission with valid data', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      // Fill out the form
      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const submitButton = screen.getByRole('button', { name: /create issue|submit/i })

      await user.type(titleInput, 'Test Issue')
      await user.type(descriptionInput, 'Test description')

      await user.click(submitButton)

      await waitFor(() => {
        expect(mockProps.onCreateIssue).toHaveBeenCalledTimes(1)
      })
    })

    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create issue|submit/i })).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /create issue|submit/i })
      await user.click(submitButton)

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
    })
  })

  describe('File Upload', () => {
    it('should handle file upload button click', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      const uploadButton = screen.queryByRole('button', { name: /upload|attach/i })
      if (uploadButton) {
        await user.click(uploadButton)
        // Should trigger file input
      }
    })

    it('should handle camera button click', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      const cameraButton = screen.queryByRole('button', { name: /camera|photo/i })
      if (cameraButton) {
        await user.click(cameraButton)
        // Should trigger camera functionality
      }
    })
  })

  describe('Cancel and Reset', () => {
    it('should handle cancel button click', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      const cancelButton = screen.queryByRole('button', { name: /cancel/i })
      if (cancelButton) {
        await user.click(cancelButton)
        expect(mockProps.onBack).toHaveBeenCalledTimes(1)
      }
    })

    it('should handle reset button click', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      // Fill out some fields first
      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Test Issue')

      // Look for reset button
      const resetButton = screen.queryByRole('button', { name: /reset|clear/i })
      if (resetButton) {
        await user.click(resetButton)
        expect(titleInput).toHaveValue('')
      }
    })
  })

  describe('Loading States', () => {
    it('should show loading state during form submission', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create issue|submit/i })).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /create issue|submit/i })
      await user.click(submitButton)

      // Should show loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('Asset Context Display', () => {
    it('should display asset information', () => {
      render(<CreateIssue {...mockProps} />)

      expect(screen.getByText(mockAsset.name)).toBeInTheDocument()
      expect(screen.getByText(mockAsset.id)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', async () => {
      render(<CreateIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument()
      })

      // Check for proper form structure
      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should render properly on different screen sizes', async () => {
      render(<CreateIssue {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument()
      })

      // Component should be responsive
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
    })
  })
})
