import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import { NotificationPreferencesNew } from '../notifications/NotificationPreferencesNew'
import type { NotificationPreferences } from '../../types/notificationConfig'

// Mock the alert configurations
vi.mock('../../data/alertConfigurations', () => ({
  getAllAlertTypes: vi.fn().mockReturnValue([
    'theft',
    'battery',
    'compliance',
    'offline',
    'geofence_entry',
    'geofence_exit',
    'maintenance_due',
  ]),
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockNotificationConfigs: Record<string, NotificationPreferences> = {
  'user:default': {
    level: 'user',
    entityId: 'default',
    entityName: 'Default User',
    channels: {
      email: {
        enabled: true,
        address: 'user@example.com',
        verified: true,
      },
      sms: {
        enabled: false,
        number: '',
        verified: false,
      },
      push: {
        enabled: true,
        verified: true,
      },
      webhook: {
        enabled: false,
        url: '',
        verified: false,
      },
    },
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
      timezone: 'America/New_York',
    },
    alertFiltering: {
      minSeverity: 'medium',
      alertTypes: ['theft', 'battery', 'compliance'],
    },
    frequencyLimits: {
      maxPerHour: 10,
      maxPerDay: 50,
    },
  },
  'site:SITE-001': {
    level: 'site',
    entityId: 'SITE-001',
    entityName: 'Construction Site A',
    channels: {
      email: {
        enabled: true,
        address: 'site@example.com',
        verified: true,
      },
      sms: {
        enabled: true,
        number: '+1234567890',
        verified: true,
      },
      push: {
        enabled: false,
        verified: false,
      },
      webhook: {
        enabled: true,
        url: 'https://api.example.com/webhooks/site',
        verified: true,
      },
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
      timezone: 'America/New_York',
    },
    alertFiltering: {
      minSeverity: 'high',
      alertTypes: ['theft', 'geofence_entry', 'geofence_exit'],
    },
    frequencyLimits: {
      maxPerHour: 5,
      maxPerDay: 25,
    },
  },
}

describe('NotificationPreferencesNew', () => {
  const mockOnSaveConfig = vi.fn()
  const mockOnDeleteConfig = vi.fn()
  const mockOnGetConfig = vi.fn()
  const mockOnBack = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock implementations
    mockOnSaveConfig.mockResolvedValue({ success: true })
    mockOnDeleteConfig.mockResolvedValue({ success: true })
    mockOnGetConfig.mockImplementation((level: string, entityId: string) => {
      const key = `${level}:${entityId}`
      return mockNotificationConfigs[key]
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders the notification preferences page with correct title', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument()
    })

    it('renders the back button when onBack is provided', () => {
      render(
        <NotificationPreferencesNew
          onBack={mockOnBack}
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByText('Back')).toBeInTheDocument()
    })

    it('renders the three-level tab selector', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByText('User Level')).toBeInTheDocument()
      expect(screen.getByText('Site Level')).toBeInTheDocument()
      expect(screen.getByText('Asset Level')).toBeInTheDocument()
    })

    it('renders channel configuration sections', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('SMS')).toBeInTheDocument()
      expect(screen.getByText('Push Notifications')).toBeInTheDocument()
      expect(screen.getByText('Webhook')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('starts with User Level tab selected by default', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const userTab = screen.getByText('User Level')
      expect(userTab).toHaveClass('data-[state=active]')
    })

    it('switches to Site Level tab when clicked', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      fireEvent.click(screen.getByText('Site Level'))
      
      const siteTab = screen.getByText('Site Level')
      expect(siteTab).toHaveClass('data-[state=active]')
    })

    it('switches to Asset Level tab when clicked', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      fireEvent.click(screen.getByText('Asset Level'))
      
      const assetTab = screen.getByText('Asset Level')
      expect(assetTab).toHaveClass('data-[state=active]')
    })

    it('preselects the correct tab when preselectedLevel is provided', () => {
      render(
        <NotificationPreferencesNew
          preselectedLevel="site"
          preselectedEntityId="SITE-001"
          preselectedEntityName="Construction Site A"
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const siteTab = screen.getByText('Site Level')
      expect(siteTab).toHaveClass('data-[state=active]')
    })
  })

  describe('Channel Configuration', () => {
    it('displays current channel settings for User Level', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      // Email should be enabled
      const emailSwitch = screen.getByLabelText('Enable Email notifications')
      expect(emailSwitch).toBeChecked()
      
      // SMS should be disabled
      const smsSwitch = screen.getByLabelText('Enable SMS notifications')
      expect(smsSwitch).not.toBeChecked()
      
      // Push should be enabled
      const pushSwitch = screen.getByLabelText('Enable Push notifications')
      expect(pushSwitch).toBeChecked()
    })

    it('allows toggling channel switches', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const emailSwitch = screen.getByLabelText('Enable Email notifications')
      fireEvent.click(emailSwitch)
      
      expect(emailSwitch).not.toBeChecked()
    })

    it('shows email address input when email is enabled', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByDisplayValue('user@example.com')).toBeInTheDocument()
    })

    it('shows SMS number input when SMS is enabled', () => {
      render(
        <NotificationPreferencesNew
          preselectedLevel="site"
          preselectedEntityId="SITE-001"
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument()
    })

    it('shows webhook URL input when webhook is enabled', () => {
      render(
        <NotificationPreferencesNew
          preselectedLevel="site"
          preselectedEntityId="SITE-001"
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByDisplayValue('https://api.example.com/webhooks/site')).toBeInTheDocument()
    })
  })

  describe('Quiet Hours Configuration', () => {
    it('displays quiet hours settings', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByText('Quiet Hours')).toBeInTheDocument()
      expect(screen.getByText('Enable quiet hours')).toBeInTheDocument()
    })

    it('shows quiet hours enabled by default for User Level', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const quietHoursSwitch = screen.getByLabelText('Enable quiet hours')
      expect(quietHoursSwitch).toBeChecked()
    })

    it('allows toggling quiet hours', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const quietHoursSwitch = screen.getByLabelText('Enable quiet hours')
      fireEvent.click(quietHoursSwitch)
      
      expect(quietHoursSwitch).not.toBeChecked()
    })

    it('displays quiet hours time inputs', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByDisplayValue('22:00')).toBeInTheDocument()
      expect(screen.getByDisplayValue('08:00')).toBeInTheDocument()
    })
  })

  describe('Alert Filtering', () => {
    it('displays alert filtering section', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByText('Alert Filtering')).toBeInTheDocument()
      expect(screen.getByText('Minimum Severity')).toBeInTheDocument()
      expect(screen.getByText('Alert Types')).toBeInTheDocument()
    })

    it('displays current minimum severity setting', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByDisplayValue('Medium')).toBeInTheDocument()
    })

    it('allows changing minimum severity', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const severitySelect = screen.getByDisplayValue('Medium')
      fireEvent.click(severitySelect)
      fireEvent.click(screen.getByText('High'))
      
      expect(screen.getByDisplayValue('High')).toBeInTheDocument()
    })

    it('displays alert type checkboxes', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByLabelText('Theft')).toBeInTheDocument()
      expect(screen.getByLabelText('Battery')).toBeInTheDocument()
      expect(screen.getByLabelText('Compliance')).toBeInTheDocument()
    })

    it('allows toggling alert type checkboxes', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const theftCheckbox = screen.getByLabelText('Theft')
      expect(theftCheckbox).toBeChecked()
      
      fireEvent.click(theftCheckbox)
      expect(theftCheckbox).not.toBeChecked()
    })
  })

  describe('Frequency Limits', () => {
    it('displays frequency limits section', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByText('Frequency Limits')).toBeInTheDocument()
      expect(screen.getByText('Max per hour')).toBeInTheDocument()
      expect(screen.getByText('Max per day')).toBeInTheDocument()
    })

    it('displays current frequency limit values', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
      expect(screen.getByDisplayValue('50')).toBeInTheDocument()
    })

    it('allows changing frequency limit values', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const hourlyInput = screen.getByDisplayValue('10')
      fireEvent.change(hourlyInput, { target: { value: '15' } })
      
      expect(hourlyInput).toHaveValue('15')
    })
  })

  describe('Save and Delete Operations', () => {
    it('calls onSaveConfig when Save button is clicked', async () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const saveButton = screen.getByText('Save Configuration')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockOnSaveConfig).toHaveBeenCalled()
      })
    })

    it('shows success toast when save is successful', async () => {
      const { toast } = require('sonner')
      
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const saveButton = screen.getByText('Save Configuration')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Configuration saved successfully')
      })
    })

    it('shows error toast when save fails', async () => {
      const { toast } = require('sonner')
      mockOnSaveConfig.mockResolvedValue({ success: false, error: 'Save failed' })
      
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const saveButton = screen.getByText('Save Configuration')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save configuration: Save failed')
      })
    })

    it('shows delete override button for non-user level configurations', () => {
      render(
        <NotificationPreferencesNew
          preselectedLevel="site"
          preselectedEntityId="SITE-001"
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByText('Delete Override')).toBeInTheDocument()
    })

    it('calls onDeleteConfig when Delete Override button is clicked', async () => {
      render(
        <NotificationPreferencesNew
          preselectedLevel="site"
          preselectedEntityId="SITE-001"
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const deleteButton = screen.getByText('Delete Override')
      fireEvent.click(deleteButton)
      
      await waitFor(() => {
        expect(mockOnDeleteConfig).toHaveBeenCalledWith('site', 'SITE-001')
      })
    })
  })

  describe('Configuration Inspector', () => {
    it('renders configuration inspector', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByText('Configuration Inspector')).toBeInTheDocument()
    })

    it('shows current active configuration', () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      expect(screen.getByText('Active Configuration')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('validates email format', async () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const emailInput = screen.getByDisplayValue('user@example.com')
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      
      const saveButton = screen.getByText('Save Configuration')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('validates phone number format', async () => {
      render(
        <NotificationPreferencesNew
          preselectedLevel="site"
          preselectedEntityId="SITE-001"
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const smsSwitch = screen.getByLabelText('Enable SMS notifications')
      fireEvent.click(smsSwitch)
      
      const phoneInput = screen.getByDisplayValue('+1234567890')
      fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } })
      
      const saveButton = screen.getByText('Save Configuration')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument()
      })
    })

    it('validates webhook URL format', async () => {
      render(
        <NotificationPreferencesNew
          preselectedLevel="site"
          preselectedEntityId="SITE-001"
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      const webhookInput = screen.getByDisplayValue('https://api.example.com/webhooks/site')
      fireEvent.change(webhookInput, { target: { value: 'invalid-url' } })
      
      const saveButton = screen.getByText('Save Configuration')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument()
      })
    })
  })

  describe('Back Navigation', () => {
    it('calls onBack when Back button is clicked', () => {
      render(
        <NotificationPreferencesNew
          onBack={mockOnBack}
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      )
      
      fireEvent.click(screen.getByText('Back'))
      
      expect(mockOnBack).toHaveBeenCalled()
    })
  })
})
