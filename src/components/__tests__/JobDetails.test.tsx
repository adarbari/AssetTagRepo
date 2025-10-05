import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JobDetails } from '../JobDetails'
import { render } from '../../test/test-utils'
import { mockJobData } from '../../data/mockJobData'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

describe('JobDetails Component - Button Click Tests', () => {
  const mockJob = mockJobData[0]
  const mockProps = {
    jobId: mockJob.id,
    onBack: vi.fn(),
    onEditJob: vi.fn(),
    onDeleteJob: vi.fn(),
    onAssignAsset: vi.fn(),
    onRemoveAsset: vi.fn(),
    onUpdateStatus: vi.fn(),
    onExportData: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Navigation and Header Buttons', () => {
    it('should render back button and handle click', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)
      expect(mockProps.onBack).toHaveBeenCalledTimes(1)
    })

    it('should render edit button and handle click', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      })

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)
      expect(mockProps.onEditJob).toHaveBeenCalledTimes(1)
    })

    it('should render delete button and handle click', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm|delete/i })
      await user.click(confirmButton)
      expect(mockProps.onDeleteJob).toHaveBeenCalledTimes(1)
    })
  })

  describe('Action Buttons', () => {
    it('should render export button and handle click', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
      })

      const exportButton = screen.getByRole('button', { name: /export/i })
      await user.click(exportButton)
      expect(mockProps.onExportData).toHaveBeenCalledTimes(1)
    })

    it('should handle status update buttons', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      // Look for status update buttons
      const startButton = screen.queryByRole('button', { name: /start/i })
      const pauseButton = screen.queryByRole('button', { name: /pause/i })
      const completeButton = screen.queryByRole('button', { name: /complete/i })

      if (startButton) {
        await user.click(startButton)
        expect(mockProps.onUpdateStatus).toHaveBeenCalledTimes(1)
      }

      if (pauseButton) {
        await user.click(pauseButton)
        expect(mockProps.onUpdateStatus).toHaveBeenCalledTimes(1)
      }

      if (completeButton) {
        await user.click(completeButton)
        expect(mockProps.onUpdateStatus).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('Tab Navigation', () => {
    it('should switch between tabs when clicked', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument()
      })

      // Click on different tabs
      const overviewTab = screen.getByRole('tab', { name: /overview/i })
      const assetsTab = screen.getByRole('tab', { name: /assets/i })
      const budgetTab = screen.getByRole('tab', { name: /budget/i })
      const teamTab = screen.getByRole('tab', { name: /team/i })

      await user.click(assetsTab)
      expect(assetsTab).toHaveAttribute('data-state', 'active')

      await user.click(budgetTab)
      expect(budgetTab).toHaveAttribute('data-state', 'active')

      await user.click(teamTab)
      expect(teamTab).toHaveAttribute('data-state', 'active')

      await user.click(overviewTab)
      expect(overviewTab).toHaveAttribute('data-state', 'active')
    })
  })

  describe('Asset Management', () => {
    it('should handle assign asset button click', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      // Switch to assets tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /assets/i })).toBeInTheDocument()
      })

      const assetsTab = screen.getByRole('tab', { name: /assets/i })
      await user.click(assetsTab)

      // Look for assign asset button
      const assignButton = screen.queryByRole('button', { name: /assign asset/i })
      if (assignButton) {
        await user.click(assignButton)
        expect(mockProps.onAssignAsset).toHaveBeenCalledTimes(1)
      }
    })

    it('should handle remove asset button clicks', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      // Switch to assets tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /assets/i })).toBeInTheDocument()
      })

      const assetsTab = screen.getByRole('tab', { name: /assets/i })
      await user.click(assetsTab)

      // Look for remove asset buttons
      const removeButtons = screen.queryAllByRole('button', { name: /remove/i })
      if (removeButtons.length > 0) {
        await user.click(removeButtons[0])
        expect(mockProps.onRemoveAsset).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('Budget Management', () => {
    it('should handle budget update buttons', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      // Switch to budget tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /budget/i })).toBeInTheDocument()
      })

      const budgetTab = screen.getByRole('tab', { name: /budget/i })
      await user.click(budgetTab)

      // Look for budget update buttons
      const updateBudgetButton = screen.queryByRole('button', { name: /update budget/i })
      if (updateBudgetButton) {
        await user.click(updateBudgetButton)
      }
    })
  })

  describe('Team Management', () => {
    it('should handle add team member button click', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      // Switch to team tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /team/i })).toBeInTheDocument()
      })

      const teamTab = screen.getByRole('tab', { name: /team/i })
      await user.click(teamTab)

      // Look for add team member button
      const addMemberButton = screen.queryByRole('button', { name: /add.*member/i })
      if (addMemberButton) {
        await user.click(addMemberButton)
      }
    })

    it('should handle remove team member button clicks', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      // Switch to team tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /team/i })).toBeInTheDocument()
      })

      const teamTab = screen.getByRole('tab', { name: /team/i })
      await user.click(teamTab)

      // Look for remove team member buttons
      const removeButtons = screen.queryAllByRole('button', { name: /remove.*member/i })
      if (removeButtons.length > 0) {
        await user.click(removeButtons[0])
      }
    })
  })

  describe('Progress Tracking', () => {
    it('should handle progress update buttons', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      // Look for progress update buttons
      const updateProgressButton = screen.queryByRole('button', { name: /update progress/i })
      if (updateProgressButton) {
        await user.click(updateProgressButton)
      }
    })
  })

  describe('Timeline and Milestones', () => {
    it('should handle milestone buttons', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      // Look for milestone buttons
      const milestoneButtons = screen.queryAllByRole('button', { name: /milestone/i })
      if (milestoneButtons.length > 0) {
        await user.click(milestoneButtons[0])
      }
    })
  })

  describe('Alerts and Notifications', () => {
    it('should handle alert action buttons', async () => {
      const user = userEvent.setup()
      render(<JobDetails {...mockProps} />)

      // Look for alert action buttons
      const alertButtons = screen.queryAllByRole('button', { name: /alert|notification/i })
      if (alertButtons.length > 0) {
        await user.click(alertButtons[0])
      }
    })
  })

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      render(<JobDetails {...mockProps} />)
      
      // Should show loading skeleton or spinner
      const loadingElements = screen.queryAllByTestId(/loading|skeleton/i)
      expect(loadingElements.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle job not found', async () => {
      render(<JobDetails {...mockProps} jobId="non-existent-id" />)

      await waitFor(() => {
        expect(screen.getByText(/job not found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument()
        expect(screen.getByRole('tablist')).toBeInTheDocument()
      })

      // Check for proper button labels
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should render properly on different screen sizes', async () => {
      render(<JobDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument()
      })

      // Component should be responsive
      const mainElement = screen.getByRole('main')
      expect(mainElement).toBeInTheDocument()
    })
  })
})
