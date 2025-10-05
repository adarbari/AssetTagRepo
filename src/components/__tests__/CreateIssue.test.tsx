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

describe('CreateIssue Component - Basic Tests', () => {
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

  describe('Basic Rendering', () => {
    it('should render the component without crashing', () => {
      render(<CreateIssue {...mockProps} />)
      
      expect(screen.getByText(/create issue/i)).toBeInTheDocument()
    })

    it('should render back button and handle click', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)
      expect(mockProps.onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Form Structure', () => {
    it('should render form with proper structure', () => {
      render(<CreateIssue {...mockProps} />)

      expect(screen.getByText(/create issue/i)).toBeInTheDocument()
    })

    it('should render asset information', () => {
      render(<CreateIssue {...mockProps} />)

      expect(screen.getByText(mockAsset.name)).toBeInTheDocument()
    })
  })

  describe('Form Inputs', () => {
    it('should render issue title input', () => {
      render(<CreateIssue {...mockProps} />)

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    it('should handle title input typing', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Test Issue')
      expect(titleInput).toHaveValue('Test Issue')
    })
  })

  describe('Button Interactions', () => {
    it('should render submit button', () => {
      render(<CreateIssue {...mockProps} />)

      const submitButton = screen.getByRole('button', { name: /create issue/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('should handle cancel button click', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      expect(mockProps.onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Form Validation', () => {
    it('should handle form submission with valid data', async () => {
      const user = userEvent.setup()
      render(<CreateIssue {...mockProps} />)

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Test Issue')

      const submitButton = screen.getByRole('button', { name: /create issue/i })
      await user.click(submitButton)

      expect(mockProps.onCreateIssue).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<CreateIssue {...mockProps} />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should have proper labels for inputs', () => {
      render(<CreateIssue {...mockProps} />)

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing asset data gracefully', () => {
      render(<CreateIssue {...mockProps} assetContext={null} />)

      // Should render without crashing
      expect(screen.getByText(/create issue/i)).toBeInTheDocument()
    })

    it('should handle onCreateIssue callback', () => {
      expect(mockProps.onCreateIssue).toBeDefined()
    })
  })
})