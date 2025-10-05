import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import { Alerts } from '../alerts/Alerts'
import { mockAlerts } from '../../data/mockData'

// Mock the data functions
vi.mock('../../data/mockData', () => ({
  mockAlerts: [
    {
      id: 'ALERT-001',
      type: 'theft',
      severity: 'critical',
      status: 'active',
      message: 'Unauthorized movement detected',
      asset: 'Generator-001',
      timestamp: '2024-01-15T10:30:00Z',
      reason: 'Asset moved outside authorized zone',
    },
    {
      id: 'ALERT-002',
      type: 'battery',
      severity: 'warning',
      status: 'active',
      message: 'Low battery level',
      asset: 'Crane-002',
      timestamp: '2024-01-15T09:15:00Z',
      reason: 'Battery level below 20%',
    },
    {
      id: 'ALERT-003',
      type: 'compliance',
      severity: 'info',
      status: 'acknowledged',
      message: 'Inspection due',
      asset: 'Excavator-003',
      timestamp: '2024-01-15T08:00:00Z',
      reason: 'Annual inspection required',
    },
    {
      id: 'ALERT-004',
      type: 'offline',
      severity: 'warning',
      status: 'resolved',
      message: 'Asset offline',
      asset: 'Loader-004',
      timestamp: '2024-01-14T16:45:00Z',
      reason: 'No signal received for 30 minutes',
    },
  ],
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('Alerts', () => {
  const mockOnTakeAction = vi.fn()
  const mockOnNavigateToConfiguration = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders the alerts page with correct title and description', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      expect(screen.getByText('Alert Management')).toBeInTheDocument()
      expect(screen.getByText('Monitor and respond to system alerts')).toBeInTheDocument()
    })

    it('renders the Configure Rules button', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      expect(screen.getByText('Configure Rules')).toBeInTheDocument()
    })

    it('renders all statistics cards', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      expect(screen.getByText('Total Alerts')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Critical')).toBeInTheDocument()
      expect(screen.getByText('Theft')).toBeInTheDocument()
      expect(screen.getByText('Battery')).toBeInTheDocument()
      expect(screen.getByText('Compliance')).toBeInTheDocument()
      expect(screen.getByText('Offline')).toBeInTheDocument()
    })

    it('displays correct alert counts in statistics', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      expect(screen.getByText('4')).toBeInTheDocument() // Total alerts
      expect(screen.getByText('2')).toBeInTheDocument() // Active alerts
      expect(screen.getByText('1')).toBeInTheDocument() // Critical alerts
    })
  })

  describe('Filtering', () => {
    it('renders search input', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      expect(screen.getByPlaceholderText('Search alerts...')).toBeInTheDocument()
    })

    it('filters alerts based on search term', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const searchInput = screen.getByPlaceholderText('Search alerts...')
      fireEvent.change(searchInput, { target: { value: 'battery' } })
      
      // Should show only battery-related alerts
      expect(screen.getByText('Low battery level')).toBeInTheDocument()
      expect(screen.queryByText('Unauthorized movement detected')).not.toBeInTheDocument()
    })

    it('filters by alert type', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const typeSelect = screen.getByDisplayValue('All Types')
      fireEvent.click(typeSelect)
      fireEvent.click(screen.getByText('Theft Alert'))
      
      expect(screen.getByText('Unauthorized movement detected')).toBeInTheDocument()
      expect(screen.queryByText('Low battery level')).not.toBeInTheDocument()
    })

    it('filters by severity', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const severitySelect = screen.getByDisplayValue('All Severities')
      fireEvent.click(severitySelect)
      fireEvent.click(screen.getByText('Critical'))
      
      expect(screen.getByText('Unauthorized movement detected')).toBeInTheDocument()
      expect(screen.queryByText('Low battery level')).not.toBeInTheDocument()
    })

    it('filters by status', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const statusSelect = screen.getByDisplayValue('All Statuses')
      fireEvent.click(statusSelect)
      fireEvent.click(screen.getByText('Active'))
      
      expect(screen.getByText('Unauthorized movement detected')).toBeInTheDocument()
      expect(screen.getByText('Low battery level')).toBeInTheDocument()
      expect(screen.queryByText('Inspection due')).not.toBeInTheDocument()
    })

    it('shows clear filters button when filters are active', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const searchInput = screen.getByPlaceholderText('Search alerts...')
      fireEvent.change(searchInput, { target: { value: 'test' } })
      
      expect(screen.getByText('Clear All Filters')).toBeInTheDocument()
    })

    it('clears all filters when Clear All Filters button is clicked', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const searchInput = screen.getByPlaceholderText('Search alerts...')
      fireEvent.change(searchInput, { target: { value: 'test' } })
      
      fireEvent.click(screen.getByText('Clear All Filters'))
      
      expect(searchInput).toHaveValue('')
    })
  })

  describe('Grouping', () => {
    it('renders group by selector', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      expect(screen.getByDisplayValue('No Grouping')).toBeInTheDocument()
    })

    it('groups alerts by type when selected', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const groupSelect = screen.getByDisplayValue('No Grouping')
      fireEvent.click(groupSelect)
      fireEvent.click(screen.getByText('Group by Type'))
      
      expect(screen.getByText('By Type')).toBeInTheDocument()
    })

    it('groups alerts by severity when selected', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const groupSelect = screen.getByDisplayValue('No Grouping')
      fireEvent.click(groupSelect)
      fireEvent.click(screen.getByText('Group by Severity'))
      
      expect(screen.getByText('By Severity')).toBeInTheDocument()
    })

    it('groups alerts by asset when selected', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const groupSelect = screen.getByDisplayValue('No Grouping')
      fireEvent.click(groupSelect)
      fireEvent.click(screen.getByText('Group by Asset'))
      
      expect(screen.getByText('By Asset')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('renders all tab options with correct counts', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      expect(screen.getByText('All Alerts (4)')).toBeInTheDocument()
      expect(screen.getByText('Active (2)')).toBeInTheDocument()
      expect(screen.getByText('Acknowledged (1)')).toBeInTheDocument()
      expect(screen.getByText('Resolved (1)')).toBeInTheDocument()
    })

    it('filters alerts when switching tabs', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      // Click on Active tab
      fireEvent.click(screen.getByText('Active (2)'))
      
      // Should show only active alerts
      expect(screen.getByText('Unauthorized movement detected')).toBeInTheDocument()
      expect(screen.getByText('Low battery level')).toBeInTheDocument()
      expect(screen.queryByText('Inspection due')).not.toBeInTheDocument()
    })
  })

  describe('Statistics Card Interactions', () => {
    it('filters alerts when clicking on Total Alerts card', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const totalCard = screen.getByText('Total Alerts').closest('.cursor-pointer')
      if (totalCard) {
        fireEvent.click(totalCard)
        
        // Should show all alerts
        expect(screen.getByText('Unauthorized movement detected')).toBeInTheDocument()
        expect(screen.getByText('Low battery level')).toBeInTheDocument()
        expect(screen.getByText('Inspection due')).toBeInTheDocument()
      }
    })

    it('filters alerts when clicking on Active card', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const activeCard = screen.getByText('Active').closest('.cursor-pointer')
      if (activeCard) {
        fireEvent.click(activeCard)
        
        // Should show only active alerts
        expect(screen.getByText('Unauthorized movement detected')).toBeInTheDocument()
        expect(screen.getByText('Low battery level')).toBeInTheDocument()
        expect(screen.queryByText('Inspection due')).not.toBeInTheDocument()
      }
    })

    it('filters alerts when clicking on Critical card', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const criticalCard = screen.getByText('Critical').closest('.cursor-pointer')
      if (criticalCard) {
        fireEvent.click(criticalCard)
        
        // Should show only critical alerts
        expect(screen.getByText('Unauthorized movement detected')).toBeInTheDocument()
        expect(screen.queryByText('Low battery level')).not.toBeInTheDocument()
      }
    })
  })

  describe('User Interactions', () => {
    it('calls onNavigateToConfiguration when Configure Rules button is clicked', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      fireEvent.click(screen.getByText('Configure Rules'))
      
      expect(mockOnNavigateToConfiguration).toHaveBeenCalled()
    })

    it('calls onTakeAction when Take Action button is clicked on an alert', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const takeActionButtons = screen.getAllByText('Take Action')
      if (takeActionButtons.length > 0) {
        fireEvent.click(takeActionButtons[0])
        expect(mockOnTakeAction).toHaveBeenCalled()
      }
    })

    it('acknowledges alert when Acknowledge button is clicked', () => {
      const { toast } = require('sonner')
      
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const acknowledgeButtons = screen.getAllByText('Acknowledge')
      if (acknowledgeButtons.length > 0) {
        fireEvent.click(acknowledgeButtons[0])
        expect(toast.success).toHaveBeenCalledWith('Alert acknowledged')
      }
    })

    it('resolves alert when Resolve button is clicked', () => {
      const { toast } = require('sonner')
      
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const resolveButtons = screen.getAllByText('Resolve')
      if (resolveButtons.length > 0) {
        fireEvent.click(resolveButtons[0])
        expect(toast.success).toHaveBeenCalledWith('Alert resolved')
      }
    })
  })

  describe('Empty States', () => {
    it('shows no alerts found message when no alerts match filters', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const searchInput = screen.getByPlaceholderText('Search alerts...')
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } })
      
      expect(screen.getByText('No alerts found')).toBeInTheDocument()
    })
  })

  describe('User Preferences', () => {
    it('loads user preferences from localStorage', () => {
      const savedPrefs = {
        defaultView: 'active',
        groupBy: 'type',
        defaultSeverity: 'critical',
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedPrefs))
      
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('alertPreferences')
    })

    it('saves user preferences to localStorage when changed', () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const groupSelect = screen.getByDisplayValue('No Grouping')
      fireEvent.click(groupSelect)
      fireEvent.click(screen.getByText('Group by Type'))
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'alertPreferences',
        expect.stringContaining('"groupBy":"type"')
      )
    })
  })

  describe('Initial Filter Props', () => {
    it('applies initial filter when provided', () => {
      const initialFilter = {
        searchText: 'battery',
        category: 'battery',
        severity: 'warning',
        status: 'active',
      }
      
      render(
        <Alerts
          initialFilter={initialFilter}
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      )
      
      const searchInput = screen.getByPlaceholderText('Search alerts...')
      expect(searchInput).toHaveValue('battery')
    })
  })
})
