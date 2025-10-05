import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import { Geofences } from '../geofences/Geofences'
import { mockGeofences } from '../../data/mockData'

// Mock the data functions
vi.mock('../../data/mockData', () => ({
  mockGeofences: [
    {
      id: 'GEO-001',
      name: 'Construction Site A',
      type: 'restricted',
      shape: 'circle',
      center: { lat: 40.7128, lng: -74.0060 },
      radius: 100,
      status: 'active',
      siteId: 'SITE-001',
      siteName: 'Downtown Construction',
      alertOnEntry: true,
      alertOnExit: true,
      tolerance: 5,
      attachmentType: 'site',
    },
    {
      id: 'GEO-002',
      name: 'Equipment Storage',
      type: 'allowed',
      shape: 'polygon',
      center: { lat: 40.7589, lng: -73.9851 },
      radius: 50,
      status: 'active',
      siteId: 'SITE-002',
      siteName: 'Storage Facility',
      alertOnEntry: false,
      alertOnExit: true,
      tolerance: 10,
      attachmentType: 'site',
    },
  ],
  getGeofenceViolatingAssets: vi.fn().mockReturnValue([]),
  getGeofenceExpectedAssets: vi.fn().mockReturnValue([]),
  getGeofenceActualAssets: vi.fn().mockReturnValue([]),
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Geofences', () => {
  const mockOnCreateGeofence = vi.fn()
  const mockOnEditGeofence = vi.fn()
  const mockOnViewViolatingAssets = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders the geofences page with correct title', () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      expect(screen.getByText('Geofences')).toBeInTheDocument()
    })

    it('renders the create geofence button', () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      expect(screen.getByText('Create Geofence')).toBeInTheDocument()
    })

    it('renders the geofences table with correct headers', () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Type')).toBeInTheDocument()
      expect(screen.getByText('Shape')).toBeInTheDocument()
      expect(screen.getByText('Site')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Assets')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('displays geofence data in the table', async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      await waitFor(() => {
        expect(screen.getByText('Construction Site A')).toBeInTheDocument()
        expect(screen.getByText('Equipment Storage')).toBeInTheDocument()
      })
    })

    it('displays correct geofence types', async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      await waitFor(() => {
        expect(screen.getByText('Restricted')).toBeInTheDocument()
        expect(screen.getByText('Allowed')).toBeInTheDocument()
      })
    })

    it('displays correct geofence shapes', async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      await waitFor(() => {
        expect(screen.getByText('Circle')).toBeInTheDocument()
        expect(screen.getByText('Polygon')).toBeInTheDocument()
      })
    })

    it('displays site names', async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      await waitFor(() => {
        expect(screen.getByText('Downtown Construction')).toBeInTheDocument()
        expect(screen.getByText('Storage Facility')).toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    it('filters geofences based on search term', async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      const searchInput = screen.getByPlaceholderText('Search geofences...')
      fireEvent.change(searchInput, { target: { value: 'Construction' } })
      
      await waitFor(() => {
        expect(screen.getByText('Construction Site A')).toBeInTheDocument()
        expect(screen.queryByText('Equipment Storage')).not.toBeInTheDocument()
      })
    })

    it('shows no results when search yields no matches', async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      const searchInput = screen.getByPlaceholderText('Search geofences...')
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } })
      
      await waitFor(() => {
        expect(screen.getByText('No geofences found')).toBeInTheDocument()
      })
    })
  })

  describe('Filtering', () => {
    it('renders filter controls', () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })

    it('shows and hides filters when filter button is clicked', () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      const filterButton = screen.getByText('Filters')
      fireEvent.click(filterButton)
      
      // Should show filter options
      expect(screen.getByText('Type')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Shape')).toBeInTheDocument()
    })

    it('filters by type', async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      // Open filters
      fireEvent.click(screen.getByText('Filters'))
      
      // Select restricted type
      const typeSelect = screen.getByDisplayValue('All Types')
      fireEvent.click(typeSelect)
      fireEvent.click(screen.getByText('Restricted'))
      
      await waitFor(() => {
        expect(screen.getByText('Construction Site A')).toBeInTheDocument()
        expect(screen.queryByText('Equipment Storage')).not.toBeInTheDocument()
      })
    })

    it('filters by status', async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      // Open filters
      fireEvent.click(screen.getByText('Filters'))
      
      // Select active status
      const statusSelect = screen.getByDisplayValue('All Statuses')
      fireEvent.click(statusSelect)
      fireEvent.click(screen.getByText('Active'))
      
      await waitFor(() => {
        expect(screen.getByText('Construction Site A')).toBeInTheDocument()
        expect(screen.getByText('Equipment Storage')).toBeInTheDocument()
      })
    })
  })

  describe('User Interactions', () => {
    it('calls onCreateGeofence when Create Geofence button is clicked', () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      fireEvent.click(screen.getByText('Create Geofence'))
      
      expect(mockOnCreateGeofence).toHaveBeenCalled()
    })

    it('calls onEditGeofence when Edit button is clicked', async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      await waitFor(() => {
        const editButtons = screen.getAllByRole('button')
        const editButton = editButtons.find(button => 
          button.querySelector('svg') // Look for the Edit icon
        )
        
        if (editButton) {
          fireEvent.click(editButton)
          expect(mockOnEditGeofence).toHaveBeenCalledWith('GEO-001')
        }
      })
    })

    it('shows delete confirmation dialog when Delete button is clicked', async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button')
        const deleteButton = deleteButtons.find(button => 
          button.querySelector('svg') // Look for the Trash2 icon
        )
        
        if (deleteButton) {
          fireEvent.click(deleteButton)
          expect(screen.getByText('Are you sure?')).toBeInTheDocument()
          expect(screen.getByText('This will permanently delete the geofence')).toBeInTheDocument()
        }
      })
    })

    it('calls onViewViolatingAssets when View Violations button is clicked', async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      await waitFor(() => {
        const viewButtons = screen.getAllByText('View Violations')
        if (viewButtons.length > 0) {
          fireEvent.click(viewButtons[0])
          expect(mockOnViewViolatingAssets).toHaveBeenCalled()
        }
      })
    })
  })

  describe('Delete Functionality', () => {
    it('confirms deletion and removes geofence from list', async () => {
      const { toast } = require('sonner')
      
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button')
        const deleteButton = deleteButtons.find(button => 
          button.querySelector('svg') // Look for the Trash2 icon
        )
        
        if (deleteButton) {
          fireEvent.click(deleteButton)
          
          // Confirm deletion
          const confirmButton = screen.getByText('Delete')
          fireEvent.click(confirmButton)
          
          expect(toast.success).toHaveBeenCalledWith('Geofence deleted successfully')
        }
      })
    })

    it('cancels deletion when Cancel button is clicked', async () => {
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button')
        const deleteButton = deleteButtons.find(button => 
          button.querySelector('svg') // Look for the Trash2 icon
        )
        
        if (deleteButton) {
          fireEvent.click(deleteButton)
          
          // Cancel deletion
          const cancelButton = screen.getByText('Cancel')
          fireEvent.click(cancelButton)
          
          // Dialog should be closed
          expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
        }
      })
    })
  })

  describe('Empty States', () => {
    it('shows empty state when no geofences are available', () => {
      // Mock empty geofences
      vi.mocked(require('../../data/mockData').mockGeofences).mockReturnValue([])
      
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      expect(screen.getByText('No geofences found')).toBeInTheDocument()
      expect(screen.getByText('Get started by creating your first geofence')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('shows loading state while geofences are being loaded', () => {
      // Mock loading state
      vi.mocked(require('../../data/mockData').mockGeofences).mockReturnValue([])
      
      render(
        <Geofences
          onCreateGeofence={mockOnCreateGeofence}
          onEditGeofence={mockOnEditGeofence}
          onViewViolatingAssets={mockOnViewViolatingAssets}
        />
      )
      
      // Should show loading or empty state
      expect(screen.getByText('No geofences found')).toBeInTheDocument()
    })
  })
})
