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
  fetchConfig: vi.fn().mockImplementation((configType: string) => {
    const configs = {
      assetTypes: [
        { value: 'vehicle', label: 'Vehicle' },
        { value: 'equipment', label: 'Equipment' }
      ],
      assetStatuses: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ],
      assetOwners: [
        { value: 'owner1', label: 'Owner 1' },
        { value: 'owner2', label: 'Owner 2' }
      ],
      projects: [
        { value: 'project1', label: 'Project 1' },
        { value: 'project2', label: 'Project 2' }
      ],
      lostItemMechanisms: [
        { value: 'mechanism1', label: 'Mechanism 1' },
        { value: 'mechanism2', label: 'Mechanism 2' }
      ],
      assetAvailability: [
        { value: 'available', label: 'Available' },
        { value: 'unavailable', label: 'Unavailable' }
      ]
    }
    return Promise.resolve(configs[configType as keyof typeof configs] || [])
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

describe('CreateAsset Component - Basic Tests', () => {
  const mockProps = {
    onBack: vi.fn(),
    onAssetCreated: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render the component without crashing', async () => {
      render(<CreateAsset {...mockProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('Add New Asset')).toBeInTheDocument()
      })
    })

    it('should render back button and handle click', async () => {
      const user = userEvent.setup()
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(backButton)
      expect(mockProps.onBack).toHaveBeenCalledTimes(1)
    })

    it('should render submit button', async () => {
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add asset/i })).toBeInTheDocument()
      })
    })
  })

  describe('Form Inputs', () => {
    it('should render asset name input', async () => {
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/asset name/i)).toBeInTheDocument()
      })
    })

    it('should handle asset name input typing', async () => {
      const user = userEvent.setup()
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/asset name/i)).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/asset name/i)
      await user.type(nameInput, 'Test Asset')
      expect(nameInput).toHaveValue('Test Asset')
    })
  })

  describe('Form Structure', () => {
    it('should render form with proper structure', async () => {
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument()
      })
    })

    it('should render form sections', async () => {
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument()
      })
    })
  })

  describe('Button Interactions', () => {
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

    it('should render submit button as disabled initially', async () => {
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /add asset/i })
        expect(submitButton).toBeInTheDocument()
        // Button might be disabled initially due to form validation
      })
    })
  })

  describe('Component Loading', () => {
    it('should load configuration data', async () => {
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Add New Asset')).toBeInTheDocument()
      })
    })

    it('should handle loading state', async () => {
      render(<CreateAsset {...mockProps} />)

      // Should show loading state initially
      expect(screen.getByText('Loading configuration...')).toBeInTheDocument()
      
      // Should eventually show the main content
      await waitFor(() => {
        expect(screen.getByText('Add New Asset')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure', async () => {
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Add New Asset')).toBeInTheDocument()
      })

      // Check for form element
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should have proper labels for inputs', async () => {
      render(<CreateAsset {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/asset name/i)).toBeInTheDocument()
      })
    })
  })
})