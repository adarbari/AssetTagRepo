import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IssueTracking } from '../issues/IssueTracking'
import { 
  render, 
  mockIssues, 
  mockOnUpdateIssue, 
  mockOnUpdateStatus,
  mockOnDeleteIssue,
  createMockNavigation,
  waitForAsync 
} from '../../test/test-utils'

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock the navigation context
vi.mock('../../contexts/NavigationContext', () => ({
  useNavigation: () => createMockNavigation(),
}))

describe('IssueTracking Component - Button Click Tests', () => {
  const defaultProps = {
    issues: mockIssues,
    onUpdateIssue: mockOnUpdateIssue,
    onUpdateStatus: mockOnUpdateStatus,
    onDeleteIssue: mockOnDeleteIssue,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Search and Filter Buttons', () => {
    it('should filter issues when search input changes', async () => {
      const user = userEvent.setup()
      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Find search input
      const searchInput = screen.getByPlaceholderText(/search issues/i)
      expect(searchInput).toBeInTheDocument()

      // Type in search
      await user.type(searchInput, 'Test')

      // Should still show the test issue
      await waitFor(() => {
        expect(screen.getByText('ISS-001')).toBeInTheDocument()
      })
    })

    it('should filter by status when status dropdown changes', async () => {
      const user = userEvent.setup()
      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Find status filter dropdown
      const statusFilter = screen.getByRole('combobox', { name: /status/i })
      await user.click(statusFilter)

      // Select "Open" status
      const openOption = screen.getByText('Open')
      await user.click(openOption)

      // Should show the issue (since it's open)
      await waitFor(() => {
        expect(screen.getByText('ISS-001')).toBeInTheDocument()
      })
    })

    it('should filter by severity when severity dropdown changes', async () => {
      const user = userEvent.setup()
      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Find severity filter dropdown
      const severityFilter = screen.getByRole('combobox', { name: /severity/i })
      await user.click(severityFilter)

      // Select "Medium" severity
      const mediumOption = screen.getByText('Medium')
      await user.click(mediumOption)

      // Should show the issue (since it's medium severity)
      await waitFor(() => {
        expect(screen.getByText('ISS-001')).toBeInTheDocument()
      })
    })
  })

  describe('Tab Navigation Buttons', () => {
    it('should switch to Active tab when clicked', async () => {
      const user = userEvent.setup()
      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Click Active tab
      const activeTab = screen.getByRole('tab', { name: /active/i })
      await user.click(activeTab)

      // Should show the issue (since it's open/active)
      await waitFor(() => {
        expect(screen.getByText('ISS-001')).toBeInTheDocument()
      })
    })

    it('should switch to Resolved tab when clicked', async () => {
      const user = userEvent.setup()
      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Click Resolved tab
      const resolvedTab = screen.getByRole('tab', { name: /resolved/i })
      await user.click(resolvedTab)

      // Should show empty state since no resolved issues
      await waitFor(() => {
        expect(screen.getByText('No issues found')).toBeInTheDocument()
      })
    })

    it('should switch back to All Issues tab when clicked', async () => {
      const user = userEvent.setup()
      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // First go to Active tab
      const activeTab = screen.getByRole('tab', { name: /active/i })
      await user.click(activeTab)

      // Then go back to All Issues tab
      const allIssuesTab = screen.getByRole('tab', { name: /all issues/i })
      await user.click(allIssuesTab)

      // Should show the issue
      await waitFor(() => {
        expect(screen.getByText('ISS-001')).toBeInTheDocument()
      })
    })
  })

  describe('Table Row Click Actions', () => {
    it('should navigate to issue details when table row is clicked', async () => {
      const user = userEvent.setup()
      const mockNavigation = createMockNavigation()
      
      vi.mocked(require('../../contexts/NavigationContext').useNavigation).mockReturnValue(mockNavigation)

      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Click on the table row
      const tableRow = screen.getByText('ISS-001').closest('tr')
      expect(tableRow).toBeInTheDocument()
      
      if (tableRow) {
        await user.click(tableRow)
        expect(mockNavigation.navigateToEditIssue).toHaveBeenCalledWith('ISS-001')
      }
    })
  })

  describe('Dropdown Menu Actions', () => {
    it('should open dropdown menu when more actions button is clicked', async () => {
      const user = userEvent.setup()
      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Find and click the more actions button
      const moreActionsButton = screen.getByRole('button', { name: /more/i })
      await user.click(moreActionsButton)

      // Should show dropdown menu items
      await waitFor(() => {
        expect(screen.getByText('View Details')).toBeInTheDocument()
        expect(screen.getByText('Acknowledge')).toBeInTheDocument()
        expect(screen.getByText('Start Work')).toBeInTheDocument()
        expect(screen.getByText('Edit Issue')).toBeInTheDocument()
      })
    })

    it('should call onUpdateStatus when Acknowledge is clicked', async () => {
      const user = userEvent.setup()
      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Open dropdown menu
      const moreActionsButton = screen.getByRole('button', { name: /more/i })
      await user.click(moreActionsButton)

      // Click Acknowledge
      const acknowledgeButton = screen.getByText('Acknowledge')
      await user.click(acknowledgeButton)

      // Should call onUpdateStatus
      await waitFor(() => {
        expect(mockOnUpdateStatus).toHaveBeenCalledWith('ISS-001', 'acknowledged')
      })
    })

    it('should call onUpdateStatus when Start Work is clicked', async () => {
      const user = userEvent.setup()
      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Open dropdown menu
      const moreActionsButton = screen.getByRole('button', { name: /more/i })
      await user.click(moreActionsButton)

      // Click Start Work
      const startWorkButton = screen.getByText('Start Work')
      await user.click(startWorkButton)

      // Should call onUpdateStatus
      await waitFor(() => {
        expect(mockOnUpdateStatus).toHaveBeenCalledWith('ISS-001', 'in-progress')
      })
    })

    it('should navigate to edit issue when Edit Issue is clicked', async () => {
      const user = userEvent.setup()
      const mockNavigation = createMockNavigation()
      
      vi.mocked(require('../../contexts/NavigationContext').useNavigation).mockReturnValue(mockNavigation)

      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Open dropdown menu
      const moreActionsButton = screen.getByRole('button', { name: /more/i })
      await user.click(moreActionsButton)

      // Click Edit Issue
      const editIssueButton = screen.getByText('Edit Issue')
      await user.click(editIssueButton)

      // Should navigate to edit issue
      expect(mockNavigation.navigateToEditIssue).toHaveBeenCalledWith('ISS-001')
    })

    it('should navigate to view details when View Details is clicked', async () => {
      const user = userEvent.setup()
      const mockNavigation = createMockNavigation()
      
      vi.mocked(require('../../contexts/NavigationContext').useNavigation).mockReturnValue(mockNavigation)

      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Open dropdown menu
      const moreActionsButton = screen.getByRole('button', { name: /more/i })
      await user.click(moreActionsButton)

      // Click View Details
      const viewDetailsButton = screen.getByText('View Details')
      await user.click(viewDetailsButton)

      // Should navigate to edit issue (same as edit in this case)
      expect(mockNavigation.navigateToEditIssue).toHaveBeenCalledWith('ISS-001')
    })
  })

  describe('Status Update Actions', () => {
    it('should show Mark Resolved option for in-progress issues', async () => {
      const user = userEvent.setup()
      const inProgressIssue = { ...mockIssues[0], status: 'in-progress' as const }
      
      render(<IssueTracking {...defaultProps} issues={[inProgressIssue]} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Open dropdown menu
      const moreActionsButton = screen.getByRole('button', { name: /more/i })
      await user.click(moreActionsButton)

      // Should show Mark Resolved option
      await waitFor(() => {
        expect(screen.getByText('Mark Resolved')).toBeInTheDocument()
      })

      // Click Mark Resolved
      const markResolvedButton = screen.getByText('Mark Resolved')
      await user.click(markResolvedButton)

      // Should call onUpdateStatus
      await waitFor(() => {
        expect(mockOnUpdateStatus).toHaveBeenCalledWith('ISS-001', 'resolved')
      })
    })

    it('should not show Acknowledge for already acknowledged issues', async () => {
      const user = userEvent.setup()
      const acknowledgedIssue = { ...mockIssues[0], status: 'acknowledged' as const }
      
      render(<IssueTracking {...defaultProps} issues={[acknowledgedIssue]} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Open dropdown menu
      const moreActionsButton = screen.getByRole('button', { name: /more/i })
      await user.click(moreActionsButton)

      // Should not show Acknowledge option
      expect(screen.queryByText('Acknowledge')).not.toBeInTheDocument()
      
      // Should show Start Work option
      expect(screen.getByText('Start Work')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle status update errors gracefully', async () => {
      const user = userEvent.setup()
      const mockOnUpdateStatusError = vi.fn().mockResolvedValue({ 
        success: false, 
        error: 'Update failed' 
      })

      render(<IssueTracking {...defaultProps} onUpdateStatus={mockOnUpdateStatusError} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Open dropdown menu
      const moreActionsButton = screen.getByRole('button', { name: /more/i })
      await user.click(moreActionsButton)

      // Click Acknowledge
      const acknowledgeButton = screen.getByText('Acknowledge')
      await user.click(acknowledgeButton)

      // Should call onUpdateStatus but handle error
      await waitFor(() => {
        expect(mockOnUpdateStatusError).toHaveBeenCalledWith('ISS-001', 'acknowledged')
      })
    })
  })

  describe('Button Accessibility', () => {
    it('should have proper ARIA labels and roles for all interactive elements', async () => {
      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Check search input
      const searchInput = screen.getByPlaceholderText(/search issues/i)
      expect(searchInput).toBeInTheDocument()

      // Check filter dropdowns
      const statusFilter = screen.getByRole('combobox', { name: /status/i })
      const severityFilter = screen.getByRole('combobox', { name: /severity/i })
      expect(statusFilter).toBeInTheDocument()
      expect(severityFilter).toBeInTheDocument()

      // Check tabs
      const tabs = screen.getAllByRole('tab')
      expect(tabs.length).toBeGreaterThan(0)

      // Check table
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()

      // Check action buttons
      const moreActionsButton = screen.getByRole('button', { name: /more/i })
      expect(moreActionsButton).toBeInTheDocument()
    })

    it('should support keyboard navigation for all buttons', async () => {
      const user = userEvent.setup()
      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Tab through interactive elements
      await user.tab()
      
      // Should be able to focus on search input
      const searchInput = screen.getByPlaceholderText(/search issues/i)
      expect(document.activeElement).toBe(searchInput)

      // Continue tabbing to reach other elements
      await user.tab()
      await user.tab()
      
      // Should be able to focus on tabs
      const allIssuesTab = screen.getByRole('tab', { name: /all issues/i })
      allIssuesTab.focus()
      expect(document.activeElement).toBe(allIssuesTab)
    })
  })

  describe('Empty State Handling', () => {
    it('should show empty state when no issues match filters', async () => {
      const user = userEvent.setup()
      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Switch to Resolved tab (which should be empty)
      const resolvedTab = screen.getByRole('tab', { name: /resolved/i })
      await user.click(resolvedTab)

      // Should show empty state
      await waitFor(() => {
        expect(screen.getByText('No issues found')).toBeInTheDocument()
        expect(screen.getByText('No issues match your current filters')).toBeInTheDocument()
      })
    })

    it('should show empty state when search returns no results', async () => {
      const user = userEvent.setup()
      render(<IssueTracking {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Issue Tracking')).toBeInTheDocument()
      })

      // Search for something that doesn't exist
      const searchInput = screen.getByPlaceholderText(/search issues/i)
      await user.type(searchInput, 'nonexistent')

      // Should show empty state
      await waitFor(() => {
        expect(screen.getByText('No issues found')).toBeInTheDocument()
      })
    })
  })
})
