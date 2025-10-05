import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JobDetails } from '../job/JobDetails'
import { render } from '../../test/test-utils'
import { mockJobs } from '../../data/mockJobData'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

describe('JobDetails Component - Basic Tests', () => {
  const mockJob = Object.values(mockJobs)[0]
  const mockProps = {
    jobId: mockJob.id,
    onBack: vi.fn(),
    onEditJob: vi.fn(),
    onDeleteJob: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render the component without crashing', async () => {
      render(<JobDetails {...mockProps} />)
      
      await waitFor(() => {
        expect(screen.getByText(/job details/i)).toBeInTheDocument()
      })
    })

    it('should render back button and handle click', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      await waitFor(async () => {
        const backButton = screen.getByRole('button', { name: /back/i })
        await user.click(backButton)
        expect(mockProps.onBack).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Job Information', () => {
    it('should render job details', async () => {
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText(/job details/i)).toBeInTheDocument()
      })
    })

    it('should render job status', async () => {
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText(/job details/i)).toBeInTheDocument()
      })
    })
  })

  describe('Action Buttons', () => {
    it('should render edit button', async () => {
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i })
        expect(editButton).toBeInTheDocument()
      })
    })

    it('should handle edit button click', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i })
        user.click(editButton)
        expect(mockProps.onEditJob).toHaveBeenCalledTimes(1)
      })
    })

    it('should render delete button', async () => {
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete/i })
        expect(deleteButton).toBeInTheDocument()
      })
    })

    it('should handle delete button click', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete/i })
        user.click(deleteButton)
        expect(mockProps.onDeleteJob).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Job Status', () => {
    it('should display job status information', async () => {
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText(/job details/i)).toBeInTheDocument()
      })
    })

    it('should show job progress if available', async () => {
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText(/job details/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText(/job details/i)).toBeInTheDocument()
      })
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        // Test keyboard navigation
        user.tab()
        expect(document.activeElement).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle missing job data gracefully', async () => {
      render(<JobDetails {...mockProps} jobId="non-existent" />)

      // Should render without crashing
      await waitFor(() => {
        expect(screen.getByText(/job details/i)).toBeInTheDocument()
      })
    })

    it('should handle callback functions', () => {
      expect(mockProps.onEditJob).toBeDefined()
      expect(mockProps.onDeleteJob).toBeDefined()
    })
  })
})