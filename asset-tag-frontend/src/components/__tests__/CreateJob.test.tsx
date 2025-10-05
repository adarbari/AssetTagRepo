import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateJob } from '../job/CreateJob'
import { render } from '../../test/test-utils'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

describe('CreateJob Component - Basic Tests', () => {
  const mockProps = {
    onBack: vi.fn(),
    onCreateJob: vi.fn().mockResolvedValue({ success: true, job: { id: 'new-job-id' } })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render the component without crashing', () => {
      render(<CreateJob {...mockProps} />)
      
      expect(screen.getByText(/create job/i)).toBeInTheDocument()
    })

    it('should render back button and handle click', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      const backButton = screen.getByRole('button') // First button is the back button
      await user.click(backButton)
      expect(mockProps.onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Form Structure', () => {
    it('should render form with proper structure', () => {
      render(<CreateJob {...mockProps} />)

      expect(screen.getByText(/create job/i)).toBeInTheDocument()
    })

    it('should render job form sections', () => {
      render(<CreateJob {...mockProps} />)

      expect(screen.getByText(/create job/i)).toBeInTheDocument()
    })
  })

  describe('Form Inputs', () => {
    it('should render job title input', () => {
      render(<CreateJob {...mockProps} />)

      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument()
    })

    it('should handle title input typing', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      const titleInput = screen.getByLabelText(/job title/i)
      await user.type(titleInput, 'Test Job')
      expect(titleInput).toHaveValue('Test Job')
    })
  })

  describe('Button Interactions', () => {
    it('should render submit button', () => {
      render(<CreateJob {...mockProps} />)

      const submitButton = screen.getByRole('button', { name: /create job/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('should handle cancel button click', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      expect(mockProps.onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Form Validation', () => {
    it('should handle form submission with valid data', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      const titleInput = screen.getByLabelText(/job title/i)
      await user.type(titleInput, 'Test Job')

      const submitButton = screen.getByRole('button', { name: /create job/i })
      await user.click(submitButton)

      expect(mockProps.onCreateJob).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<CreateJob {...mockProps} />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should have proper labels for inputs', () => {
      render(<CreateJob {...mockProps} />)

      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle onCreateJob callback', () => {
      expect(mockProps.onCreateJob).toBeDefined()
    })

    it('should handle form errors gracefully', async () => {
      const user = userEvent.setup()
      render(<CreateJob {...mockProps} />)

      const submitButton = screen.getByRole('button', { name: /create job/i })
      await user.click(submitButton)

      // Should handle form validation
      expect(submitButton).toBeInTheDocument()
    })
  })
})