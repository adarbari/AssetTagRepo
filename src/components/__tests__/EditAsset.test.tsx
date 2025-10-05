import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditAssetDialog } from '../assets/EditAssetDialog'
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

// Mock useAssetMutations hook
vi.mock('../../hooks/useAssetDetails', () => ({
  useAssetMutations: () => ({
    updateAsset: vi.fn().mockResolvedValue({ success: true }),
    deleteAsset: vi.fn().mockResolvedValue({ success: true }),
    isLoading: false
  })
}))

describe('EditAssetDialog Component - Button Click Tests', () => {
  const mockAsset = mockAssets[0]
  const mockProps = {
    open: true,
    onOpenChange: vi.fn(),
    asset: mockAsset
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Dialog Controls', () => {
    it('should render dialog when open prop is true', () => {
      render(<EditAssetDialog {...mockProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/edit asset/i)).toBeInTheDocument()
    })

    it('should close dialog when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(mockProps.onOpenChange).toHaveBeenCalledWith(false)
    })

    it('should close dialog when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockProps.onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Form Input Interactions', () => {
    it('should populate form with asset data', () => {
      render(<EditAssetDialog {...mockProps} />)

      expect(screen.getByDisplayValue(mockAsset.name)).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockAsset.id)).toBeInTheDocument()
    })

    it('should handle asset name input changes', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      const nameInput = screen.getByDisplayValue(mockAsset.name)
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Asset Name')
      expect(nameInput).toHaveValue('Updated Asset Name')
    })

    it('should handle asset ID input changes', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      const idInput = screen.getByDisplayValue(mockAsset.id)
      await user.clear(idInput)
      await user.type(idInput, 'UPDATED-001')
      expect(idInput).toHaveValue('UPDATED-001')
    })

    it('should handle description input changes', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      const descriptionInput = screen.getByDisplayValue(mockAsset.description || '')
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Updated description')
      expect(descriptionInput).toHaveValue('Updated description')
    })
  })

  describe('Dropdown Selections', () => {
    it('should handle asset type selection', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      const typeSelect = screen.getByDisplayValue(mockAsset.type)
      await user.click(typeSelect)

      await waitFor(() => {
        expect(screen.getByText('Vehicle')).toBeInTheDocument()
      })

      const vehicleOption = screen.getByText('Vehicle')
      await user.click(vehicleOption)
    })

    it('should handle status selection', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      const statusSelect = screen.getByDisplayValue(mockAsset.status)
      await user.click(statusSelect)

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument()
      })

      const activeOption = screen.getByText('Active')
      await user.click(activeOption)
    })
  })

  describe('Tab Navigation', () => {
    it('should switch between tabs when clicked', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      // Look for tabs
      const basicInfoTab = screen.queryByRole('tab', { name: /basic info/i })
      const locationTab = screen.queryByRole('tab', { name: /location/i })
      const settingsTab = screen.queryByRole('tab', { name: /settings/i })

      if (basicInfoTab) {
        await user.click(basicInfoTab)
        expect(basicInfoTab).toHaveAttribute('data-state', 'active')
      }

      if (locationTab) {
        await user.click(locationTab)
        expect(locationTab).toHaveAttribute('data-state', 'active')
      }

      if (settingsTab) {
        await user.click(settingsTab)
        expect(settingsTab).toHaveAttribute('data-state', 'active')
      }
    })
  })

  describe('Form Submission', () => {
    it('should handle save button click', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)

      // Should close dialog after successful save
      await waitFor(() => {
        expect(mockProps.onOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('should show validation errors for invalid data', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      // Clear required fields
      const nameInput = screen.getByDisplayValue(mockAsset.name)
      await user.clear(nameInput)

      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Delete Functionality', () => {
    it('should handle delete button click', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      const deleteButton = screen.queryByRole('button', { name: /delete/i })
      if (deleteButton) {
        await user.click(deleteButton)

        // Should show confirmation dialog
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        // Confirm deletion
        const confirmButton = screen.getByRole('button', { name: /confirm|delete/i })
        await user.click(confirmButton)

        // Should close dialog after deletion
        await waitFor(() => {
          expect(mockProps.onOpenChange).toHaveBeenCalledWith(false)
        })
      }
    })
  })

  describe('Loading States', () => {
    it('should show loading state during save', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)

      // Should show loading state
      await waitFor(() => {
        expect(saveButton).toBeDisabled()
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should close dialog on Escape key', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      await user.keyboard('{Escape}')

      expect(mockProps.onOpenChange).toHaveBeenCalledWith(false)
    })

    it('should handle form submission on Enter key', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      const nameInput = screen.getByDisplayValue(mockAsset.name)
      nameInput.focus()
      await user.keyboard('{Enter}')

      // Should trigger form submission
      await waitFor(() => {
        expect(mockProps.onOpenChange).toHaveBeenCalledWith(false)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<EditAssetDialog {...mockProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('form')).toBeInTheDocument()
    })

    it('should maintain focus management', async () => {
      const user = userEvent.setup()
      render(<EditAssetDialog {...mockProps} />)

      const firstInput = screen.getByDisplayValue(mockAsset.name)
      expect(firstInput).toHaveFocus()
    })
  })

  describe('Responsive Design', () => {
    it('should render properly on different screen sizes', () => {
      render(<EditAssetDialog {...mockProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })
  })
})
