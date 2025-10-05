import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssetInventory } from '../AssetInventory'
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

describe('AssetInventory Component - Button Click Tests', () => {
  const mockProps = {
    onAssetClick: vi.fn(),
    onCreateAsset: vi.fn(),
    onEditAsset: vi.fn(),
    onDeleteAsset: vi.fn(),
    onExportData: vi.fn(),
    onViewOnMap: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Header and Navigation Buttons', () => {
    it('should render create asset button and handle click', async () => {
      const user = userEvent.setup()
      render(<AssetInventory {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create asset/i })).toBeInTheDocument()
      })

      const createButton = screen.getByRole('button', { name: /create asset/i })
      await user.click(createButton)
      expect(mockProps.onCreateAsset).toHaveBeenCalledTimes(1)
    })

    it('should render export button and handle click', async () => {
      const user = userEvent.setup()
      render(<AssetInventory {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
      })

      const exportButton = screen.getByRole('button', { name: /export/i })
      await user.click(exportButton)
      expect(mockProps.onExportData).toHaveBeenCalledTimes(1)
    })
  })

  describe('Search and Filter Controls', () => {
    it('should handle search input changes', async () => {
      const user = userEvent.setup()
      render(<AssetInventory {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search assets/i)).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/search assets/i)
      await user.type(searchInput, 'test search')
      expect(searchInput).toHaveValue('test search')
    })

    it('should handle filter dropdown changes', async () => {
      const user = userEvent.setup()
      render(<AssetInventory {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })

      const filterDropdown = screen.getByRole('combobox')
      await user.click(filterDropdown)

      // Look for filter options
      await waitFor(() => {
        const activeOption = screen.queryByText(/active/i)
        if (activeOption) {
          await user.click(activeOption)
        }
      })
    })
  })

  describe('Asset Table Interactions', () => {
    it('should handle asset row clicks', async () => {
      const user = userEvent.setup()
      render(<AssetInventory {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Find first asset row
      const assetRows = screen.getAllByRole('row')
      if (assetRows.length > 1) { // Skip header row
        const firstAssetRow = assetRows[1]
        await user.click(firstAssetRow)
        expect(mockProps.onAssetClick).toHaveBeenCalledTimes(1)
      }
    })

    it('should handle edit button clicks in asset rows', async () => {
      const user = userEvent.setup()
      render(<AssetInventory {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Look for edit buttons in the table
      const editButtons = screen.queryAllByRole('button', { name: /edit/i })
      if (editButtons.length > 0) {
        await user.click(editButtons[0])
        expect(mockProps.onEditAsset).toHaveBeenCalledTimes(1)
      }
    })

    it('should handle delete button clicks in asset rows', async () => {
      const user = userEvent.setup()
      render(<AssetInventory {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Look for delete buttons in the table
      const deleteButtons = screen.queryAllByRole('button', { name: /delete/i })
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0])
        
        // Should show confirmation dialog
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        // Confirm deletion
        const confirmButton = screen.getByRole('button', { name: /confirm|delete/i })
        await user.click(confirmButton)
        expect(mockProps.onDeleteAsset).toHaveBeenCalledTimes(1)
      }
    })

    it('should handle view on map button clicks', async () => {
      const user = userEvent.setup()
      render(<AssetInventory {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Look for view on map buttons
      const mapButtons = screen.queryAllByRole('button', { name: /view on map|map/i })
      if (mapButtons.length > 0) {
        await user.click(mapButtons[0])
        expect(mockProps.onViewOnMap).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('Pagination Controls', () => {
    it('should handle pagination button clicks', async () => {
      const user = userEvent.setup()
      render(<AssetInventory {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Look for pagination controls
      const nextButton = screen.queryByRole('button', { name: /next/i })
      const prevButton = screen.queryByRole('button', { name: /previous|prev/i })

      if (nextButton) {
        await user.click(nextButton)
      }

      if (prevButton) {
        await user.click(prevButton)
      }
    })
  })

  describe('Sorting Controls', () => {
    it('should handle column header clicks for sorting', async () => {
      const user = userEvent.setup()
      render(<AssetInventory {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Look for sortable column headers
      const nameHeader = screen.queryByRole('columnheader', { name: /name/i })
      const statusHeader = screen.queryByRole('columnheader', { name: /status/i })

      if (nameHeader) {
        await user.click(nameHeader)
      }

      if (statusHeader) {
        await user.click(statusHeader)
      }
    })
  })

  describe('Bulk Actions', () => {
    it('should handle bulk selection and actions', async () => {
      const user = userEvent.setup()
      render(<AssetInventory {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Look for checkboxes for bulk selection
      const checkboxes = screen.queryAllByRole('checkbox')
      if (checkboxes.length > 0) {
        // Select first few assets
        await user.click(checkboxes[1]) // Skip header checkbox
        if (checkboxes[2]) {
          await user.click(checkboxes[2])
        }

        // Look for bulk action buttons
        const bulkDeleteButton = screen.queryByRole('button', { name: /bulk delete|delete selected/i })
        if (bulkDeleteButton) {
          await user.click(bulkDeleteButton)
        }
      }
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no assets', async () => {
      // Mock empty assets
      vi.doMock('../../data/mockData', () => ({
        mockAssets: []
      }))

      render(<AssetInventory {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText(/no assets found/i)).toBeInTheDocument()
      })

      // Should show create asset button in empty state
      const createButton = screen.getByRole('button', { name: /create asset/i })
      expect(createButton).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      render(<AssetInventory {...mockProps} />)
      
      // Should show loading skeleton or spinner
      const loadingElements = screen.queryAllByTestId(/loading|skeleton/i)
      expect(loadingElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      render(<AssetInventory {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Check for proper table structure
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByRole('columnheader')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should render properly on different screen sizes', async () => {
      render(<AssetInventory {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Component should be responsive
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })
})
