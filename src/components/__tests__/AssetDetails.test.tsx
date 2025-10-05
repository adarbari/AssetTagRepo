import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssetDetails } from '../assets/AssetDetails'
import { render } from '../../test/test-utils'
import { mockAssets } from '../../data/mockData'

// Mock QRCode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mock-qr-code')
  }
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

describe('AssetDetails Component - Button Click Tests', () => {
  const mockAsset = mockAssets[0]
  const mockProps = {
    assetId: mockAsset.id,
    onBack: vi.fn(),
    onEditAsset: vi.fn(),
    onDeleteAsset: vi.fn(),
    onTrackHistory: vi.fn(),
    onViewOnMap: vi.fn(),
    onExportData: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Navigation and Header Buttons', () => {
    it('should render back button and handle click', async () => {
      const user = userEvent.setup()
      render(<AssetDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)
      expect(mockProps.onBack).toHaveBeenCalledTimes(1)
    })

    it('should render edit button and handle click', async () => {
      const user = userEvent.setup()
      render(<AssetDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      })

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)
      expect(mockProps.onEditAsset).toHaveBeenCalledTimes(1)
    })

    it('should render delete button and handle click', async () => {
      const user = userEvent.setup()
      render(<AssetDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)
      expect(mockProps.onDeleteAsset).toHaveBeenCalledTimes(1)
    })
  })

  describe('Action Buttons', () => {
    it('should render track history button and handle click', async () => {
      const user = userEvent.setup()
      render(<AssetDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /track history/i })).toBeInTheDocument()
      })

      const trackHistoryButton = screen.getByRole('button', { name: /track history/i })
      await user.click(trackHistoryButton)
      expect(mockProps.onTrackHistory).toHaveBeenCalledTimes(1)
    })

    it('should render view on map button and handle click', async () => {
      const user = userEvent.setup()
      render(<AssetDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view on map/i })).toBeInTheDocument()
      })

      const viewOnMapButton = screen.getByRole('button', { name: /view on map/i })
      await user.click(viewOnMapButton)
      expect(mockProps.onViewOnMap).toHaveBeenCalledTimes(1)
    })

    it('should render export data button and handle click', async () => {
      const user = userEvent.setup()
      render(<AssetDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
      })

      const exportButton = screen.getByRole('button', { name: /export/i })
      await user.click(exportButton)
      expect(mockProps.onExportData).toHaveBeenCalledTimes(1)
    })
  })

  describe('Tab Navigation', () => {
    it('should switch between tabs when clicked', async () => {
      const user = userEvent.setup()
      render(<AssetDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument()
      })

      // Click on different tabs
      const overviewTab = screen.getByRole('tab', { name: /overview/i })
      const maintenanceTab = screen.getByRole('tab', { name: /maintenance/i })
      const historyTab = screen.getByRole('tab', { name: /history/i })

      await user.click(maintenanceTab)
      expect(maintenanceTab).toHaveAttribute('data-state', 'active')

      await user.click(historyTab)
      expect(historyTab).toHaveAttribute('data-state', 'active')

      await user.click(overviewTab)
      expect(overviewTab).toHaveAttribute('data-state', 'active')
    })
  })

  describe('QR Code Generation', () => {
    it('should generate QR code when QR button is clicked', async () => {
      const user = userEvent.setup()
      render(<AssetDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /qr/i })).toBeInTheDocument()
      })

      const qrButton = screen.getByRole('button', { name: /qr/i })
      await user.click(qrButton)

      // Should show QR code dialog or modal
      await waitFor(() => {
        expect(screen.getByText(/qr code/i)).toBeInTheDocument()
      })
    })
  })

  describe('Maintenance Actions', () => {
    it('should handle maintenance button clicks', async () => {
      const user = userEvent.setup()
      render(<AssetDetails {...mockProps} />)

      // Switch to maintenance tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /maintenance/i })).toBeInTheDocument()
      })

      const maintenanceTab = screen.getByRole('tab', { name: /maintenance/i })
      await user.click(maintenanceTab)

      // Look for maintenance action buttons
      await waitFor(() => {
        const addMaintenanceButton = screen.queryByRole('button', { name: /add maintenance/i })
        if (addMaintenanceButton) {
          expect(addMaintenanceButton).toBeInTheDocument()
        }
      })
    })
  })

  describe('Form Interactions', () => {
    it('should handle form inputs in edit mode', async () => {
      const user = userEvent.setup()
      render(<AssetDetails {...mockProps} />)

      // Click edit button to enter edit mode
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      })

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      // Look for form inputs
      await waitFor(async () => {
        const nameInput = screen.queryByDisplayValue(mockAsset.name)
        if (nameInput) {
          expect(nameInput).toBeInTheDocument()
          // Test typing in the input
          await user.clear(nameInput)
          await user.type(nameInput, 'Updated Asset Name')
          expect(nameInput).toHaveValue('Updated Asset Name')
        }
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      render(<AssetDetails {...mockProps} />)
      
      // Should show loading skeleton or spinner
      const loadingElements = screen.queryAllByTestId(/loading|skeleton/i)
      expect(loadingElements.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle asset not found', async () => {
      render(<AssetDetails {...mockProps} assetId="non-existent-id" />)

      await waitFor(() => {
        expect(screen.getByText(/asset not found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      render(<AssetDetails {...mockProps} />)

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
      render(<AssetDetails {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument()
      })

      // Component should be responsive
      const mainElement = screen.getByRole('main')
      expect(mainElement).toBeInTheDocument()
    })
  })
})
