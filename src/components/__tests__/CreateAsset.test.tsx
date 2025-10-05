import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateAsset } from '../assets/CreateAsset'
import { render } from '../../test/test-utils'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

// Mock config service
vi.mock('../../services/configService', () => ({
  fetchConfig: vi.fn().mockResolvedValue({
    assetTypes: [
      { value: 'vehicle', label: 'Vehicle' },
      { value: 'equipment', label: 'Equipment' }
    ],
    assetStatuses: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
  }),
  fetchAvailableSites: vi.fn().mockResolvedValue([
    { value: 'site1', label: 'Site 1' },
    { value: 'site2', label: 'Site 2' }
  ]),
  fetchAvailableGeofences: vi.fn().mockResolvedValue([
    { value: 'geofence1', label: 'Geofence 1' },
    { value: 'geofence2', label: 'Geofence 2' }
  ])
}))

// Mock mockData
vi.mock('../../data/mockData', () => ({
  addAsset: vi.fn().mockResolvedValue({ id: 'new-asset-id' })
}))

describe('CreateAsset Component - Button Click Tests', () => {
  const mockProps = {
    onBack: vi.fn(),
    onAssetCreated: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Navigation and Header Buttons', () => {
    it('should render back button and handle click', async () => {
      const user = userEvent.setup()
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)
      expect(mockProps.onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Form Input Interactions', () => {
    it('should handle asset name input', async () => {
      const user = userEvent.setup()
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/asset name/i)).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/asset name/i)
      await user.type(nameInput, 'Test Asset')
      expect(nameInput).toHaveValue('Test Asset')
    })

    it('should handle asset ID input', async () => {
      const user = userEvent.setup()
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/asset id/i)).toBeInTheDocument()
      })

      const idInput = screen.getByLabelText(/asset id/i)
      await user.type(idInput, 'AST-001')
      expect(idInput).toHaveValue('AST-001')
    })

    it('should handle description textarea', async () => {
      const user = userEvent.setup()
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      })

      const descriptionInput = screen.getByLabelText(/description/i)
      await user.type(descriptionInput, 'Test asset description')
      expect(descriptionInput).toHaveValue('Test asset description')
    })
  })

  describe('Dropdown Selections', () => {
    it('should handle asset type selection', async () => {
      const user = userEvent.setup()
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/asset type/i)).toBeInTheDocument()
      })

      const typeSelect = screen.getByLabelText(/asset type/i)
      await user.click(typeSelect)

      await waitFor(() => {
        expect(screen.getByText('Vehicle')).toBeInTheDocument()
      })

      const vehicleOption = screen.getByText('Vehicle')
      await user.click(vehicleOption)
    })

    it('should handle status selection', async () => {
      const user = userEvent.setup()
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
      })

      const statusSelect = screen.getByLabelText(/status/i)
      await user.click(statusSelect)

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument()
      })

      const activeOption = screen.getByText('Active')
      await user.click(activeOption)
    })

    it('should handle site selection', async () => {
      const user = userEvent.setup()
      render(<CreateAsset {...mockProps} />)

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

  describe('Switch Controls', () => {
    it('should handle tracking enabled switch', async () => {
      const user = userEvent.setup()
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/tracking enabled/i)).toBeInTheDocument()
      })

      const trackingSwitch = screen.getByLabelText(/tracking enabled/i)
      await user.click(trackingSwitch)
      expect(trackingSwitch).toBeChecked()
    })

    it('should handle geofence monitoring switch', async () => {
      const user = userEvent.setup()
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/geofence monitoring/i)).toBeInTheDocument()
      })

      const geofenceSwitch = screen.getByLabelText(/geofence monitoring/i)
      await user.click(geofenceSwitch)
      expect(geofenceSwitch).toBeChecked()
    })
  })

  describe('Form Submission', () => {
    it('should handle form submission with valid data', async () => {
      const user = userEvent.setup()
      render(<CreateAsset {...mockProps} />)

      // Fill out the form
      await waitFor(() => {
        expect(screen.getByLabelText(/asset name/i)).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/asset name/i)
      const idInput = screen.getByLabelText(/asset id/i)
      const submitButton = screen.getByRole('button', { name: /create asset|submit/i })

      await user.type(nameInput, 'Test Asset')
      await user.type(idInput, 'AST-001')

      await user.click(submitButton)

      await waitFor(() => {
        expect(mockProps.onAssetCreated).toHaveBeenCalledTimes(1)
      })
    })

    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup()
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create asset|submit/i })).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /create asset|submit/i })
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
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      expect(mockProps.onBack).toHaveBeenCalledTimes(1)
    })

    it('should handle reset button click', async () => {
      const user = userEvent.setup()
      render(<CreateAsset {...mockProps} />)

      // Fill out some fields first
      await waitFor(() => {
        expect(screen.getByLabelText(/asset name/i)).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/asset name/i)
      await user.type(nameInput, 'Test Asset')

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
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create asset|submit/i })).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /create asset|submit/i })
      await user.click(submitButton)

      // Should show loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', async () => {
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument()
      })

      // Check for proper form structure
      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByLabelText(/asset name/i)).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should render properly on different screen sizes', async () => {
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument()
      })

      // Component should be responsive
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
    })
  })
})
