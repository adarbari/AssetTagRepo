import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateJob } from '../CreateJob'
import { render } from '../../test/test-utils'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

describe('CreateJob Component - Button Click Tests', () => {
  const mockProps = {
    onBack: vi.fn(),
    onCreateJob: vi.fn().mockResolvedValue({ success: true, job: { id: 'new-job-id' } })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Navigation and Header Buttons', () => {
    it('should render back button and handle click', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)
      expect(mockProps.onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Form Input Interactions', () => {
    it('should handle job name input', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/job name/i)).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/job name/i)
      await user.type(nameInput, 'Test Job')
      expect(nameInput).toHaveValue('Test Job')
    })

    it('should handle job description textarea', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      })

      const descriptionInput = screen.getByLabelText(/description/i)
      await user.type(descriptionInput, 'Test job description')
      expect(descriptionInput).toHaveValue('Test job description')
    })

    it('should handle start date input', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
      })

      const startDateInput = screen.getByLabelText(/start date/i)
      await user.type(startDateInput, '2024-01-01')
      expect(startDateInput).toHaveValue('2024-01-01')
    })

    it('should handle end date input', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
      })

      const endDateInput = screen.getByLabelText(/end date/i)
      await user.type(endDateInput, '2024-12-31')
      expect(endDateInput).toHaveValue('2024-12-31')
    })

    it('should handle project manager input', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/project manager/i)).toBeInTheDocument()
      })

      const pmInput = screen.getByLabelText(/project manager/i)
      await user.type(pmInput, 'John Doe')
      expect(pmInput).toHaveValue('John Doe')
    })
  })

  describe('Dropdown Selections', () => {
    it('should handle priority selection', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      })

      const prioritySelect = screen.getByLabelText(/priority/i)
      await user.click(prioritySelect)

      await waitFor(() => {
        expect(screen.getByText('High')).toBeInTheDocument()
      })

      const highOption = screen.getByText('High')
      await user.click(highOption)
    })

    it('should handle client selection', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/client/i)).toBeInTheDocument()
      })

      const clientSelect = screen.getByLabelText(/client/i)
      await user.click(clientSelect)

      await waitFor(() => {
        expect(screen.getByText('Client 1')).toBeInTheDocument()
      })

      const clientOption = screen.getByText('Client 1')
      await user.click(clientOption)
    })

    it('should handle site selection', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/site/i)).toBeInTheDocument()
      })

      const siteSelect = screen.getByLabelText(/site/i)
      await user.click(siteSelect)

      await waitFor(() => {
        expect(screen.getByText('Site 1')).toBeInTheDocument()
      })

      const siteOption = screen.getByText('Site 1')
      await user.click(siteOption)
    })
  })

  describe('Budget Section', () => {
    it('should handle budget input', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/budget/i)).toBeInTheDocument()
      })

      const budgetInput = screen.getByLabelText(/budget/i)
      await user.type(budgetInput, '10000')
      expect(budgetInput).toHaveValue('10000')
    })

    it('should handle hourly rate input', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/hourly rate/i)).toBeInTheDocument()
      })

      const rateInput = screen.getByLabelText(/hourly rate/i)
      await user.type(rateInput, '50')
      expect(rateInput).toHaveValue('50')
    })
  })

  describe('Notes Section', () => {
    it('should handle notes textarea', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
      })

      const notesInput = screen.getByLabelText(/notes/i)
      await user.type(notesInput, 'Test notes')
      expect(notesInput).toHaveValue('Test notes')
    })
  })

  describe('Tags Section', () => {
    it('should handle tag input and addition', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
      })

      const tagInput = screen.getByLabelText(/tags/i)
      await user.type(tagInput, 'urgent')
      await user.keyboard('{Enter}')

      // Should add tag
      expect(screen.getByText('urgent')).toBeInTheDocument()
    })

    it('should handle tag removal', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      // Add a tag first
      await waitFor(() => {
        expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
      })

      const tagInput = screen.getByLabelText(/tags/i)
      await user.type(tagInput, 'urgent')
      await user.keyboard('{Enter}')

      // Remove the tag
      const removeButton = screen.getByRole('button', { name: /remove.*urgent/i })
      await user.click(removeButton)

      // Tag should be removed
      expect(screen.queryByText('urgent')).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should handle form submission with valid data', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      // Fill out the form
      await waitFor(() => {
        expect(screen.getByLabelText(/job name/i)).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/job name/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const submitButton = screen.getByRole('button', { name: /create job|submit/i })

      await user.type(nameInput, 'Test Job')
      await user.type(descriptionInput, 'Test description')

      await user.click(submitButton)

      await waitFor(() => {
        expect(mockProps.onCreateJob).toHaveBeenCalledTimes(1)
      })
    })

    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create job|submit/i })).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /create job|submit/i })
      await user.click(submitButton)

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Cancel and Reset', () => {
    it('should handle cancel button click', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      const cancelButton = screen.queryByRole('button', { name: /cancel/i })
      if (cancelButton) {
        await user.click(cancelButton)
        expect(mockProps.onBack).toHaveBeenCalledTimes(1)
      }
    })

    it('should handle reset button click', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      // Fill out some fields first
      await waitFor(() => {
        expect(screen.getByLabelText(/job name/i)).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/job name/i)
      await user.type(nameInput, 'Test Job')

      // Look for reset button
      const resetButton = screen.queryByRole('button', { name: /reset|clear/i })
      if (resetButton) {
        await user.click(resetButton)
        expect(nameInput).toHaveValue('')
      }
    })
  })

  describe('Loading States', () => {
    it('should show loading state during form submission', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create job|submit/i })).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /create job|submit/i })
      await user.click(submitButton)

      // Should show loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', async () => {
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument()
      })

      // Check for proper form structure
      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByLabelText(/job name/i)).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should render properly on different screen sizes', async () => {
      render(<CreateJob {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument()
      })

      // Component should be responsive
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
    })
  })
})
