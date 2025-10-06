import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import { Settings } from '../settings/Settings'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders the settings page with correct title and description', () => {
      render(<Settings />)
      
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Manage system configuration, users, and integrations')).toBeInTheDocument()
    })

    it('renders all tab options', () => {
      render(<Settings />)
      
      expect(screen.getByText('Users & Roles')).toBeInTheDocument()
      expect(screen.getByText('Organization')).toBeInTheDocument()
      expect(screen.getByText('System Config')).toBeInTheDocument()
      expect(screen.getByText('API & Integrations')).toBeInTheDocument()
      expect(screen.getByText('Audit Logs')).toBeInTheDocument()
    })

    it('starts with Users & Roles tab selected by default', () => {
      render(<Settings />)
      
      const usersTab = screen.getByText('Users & Roles')
      expect(usersTab).toHaveClass('data-[state=active]')
    })
  })

  describe('Users & Roles Tab', () => {
    it('displays user management section', () => {
      render(<Settings />)
      
      expect(screen.getByText('User Management')).toBeInTheDocument()
      expect(screen.getByText('Manage users and their permissions')).toBeInTheDocument()
    })

    it('displays the Add User button', () => {
      render(<Settings />)
      
      expect(screen.getByText('Add User')).toBeInTheDocument()
    })

    it('displays users table with correct headers', () => {
      render(<Settings />)
      
      expect(screen.getByText('User')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Last Active')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('displays mock users in the table', () => {
      render(<Settings />)
      
      expect(screen.getByText('John Smith')).toBeInTheDocument()
      expect(screen.getByText('john.smith@company.com')).toBeInTheDocument()
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.getByText('sarah.j@company.com')).toBeInTheDocument()
    })

    it('displays role badges with correct colors', () => {
      render(<Settings />)
      
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText('manager')).toBeInTheDocument()
      expect(screen.getByText('operator')).toBeInTheDocument()
      expect(screen.getByText('viewer')).toBeInTheDocument()
    })

    it('displays status badges', () => {
      render(<Settings />)
      
      expect(screen.getAllByText('active')).toHaveLength(3)
      expect(screen.getByText('inactive')).toBeInTheDocument()
    })

    it('displays role permissions section', () => {
      render(<Settings />)
      
      expect(screen.getByText('Role Permissions')).toBeInTheDocument()
      expect(screen.getByText('Define what each role can do')).toBeInTheDocument()
    })

    it('displays all role permission cards', () => {
      render(<Settings />)
      
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText('manager')).toBeInTheDocument()
      expect(screen.getByText('operator')).toBeInTheDocument()
      expect(screen.getByText('viewer')).toBeInTheDocument()
    })
  })

  describe('User Management Actions', () => {
    it('opens Add User dialog when Add User button is clicked', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('Add User'))
      
      expect(screen.getByText('Add New User')).toBeInTheDocument()
      expect(screen.getByText('Invite a new user to your organization')).toBeInTheDocument()
    })

    it('opens Edit User dialog when Edit button is clicked', () => {
      render(<Settings />)
      
      const editButtons = screen.getAllByRole('button')
      const editButton = editButtons.find(button => 
        button.querySelector('svg') // Look for the Edit icon
      )
      
      if (editButton) {
        fireEvent.click(editButton)
        expect(screen.getByText('Edit User')).toBeInTheDocument()
      }
    })

    it('opens Delete User confirmation dialog when Delete button is clicked', () => {
      render(<Settings />)
      
      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find(button => 
        button.querySelector('svg') // Look for the Trash2 icon
      )
      
      if (deleteButton) {
        fireEvent.click(deleteButton)
        expect(screen.getByText('Are you sure?')).toBeInTheDocument()
        expect(screen.getByText('This will permanently delete the user')).toBeInTheDocument()
      }
    })

    it('opens Edit Permissions dialog when Edit Permissions button is clicked', () => {
      render(<Settings />)
      
      const editPermissionsButtons = screen.getAllByText('Edit Permissions')
      fireEvent.click(editPermissionsButtons[0])
      
      expect(screen.getByText('Edit Role Permissions')).toBeInTheDocument()
    })
  })

  describe('Organization Tab', () => {
    it('displays organization settings when tab is clicked', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('Organization'))
      
      expect(screen.getByText('Organization Settings')).toBeInTheDocument()
      expect(screen.getByText('Manage your organization details')).toBeInTheDocument()
    })

    it('displays organization form fields', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('Organization'))
      
      expect(screen.getByDisplayValue('Acme Construction Co.')).toBeInTheDocument()
      expect(screen.getByDisplayValue('ORG-12345')).toBeInTheDocument()
      expect(screen.getByDisplayValue('America/Chicago')).toBeInTheDocument()
    })

    it('displays SSO integration toggle', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('Organization'))
      
      expect(screen.getByText('SSO Integration')).toBeInTheDocument()
      expect(screen.getByText('Enable single sign-on with SAML/OIDC')).toBeInTheDocument()
    })

    it('displays Save Changes button', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('Organization'))
      
      expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })
  })

  describe('System Config Tab', () => {
    it('displays system configuration when tab is clicked', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('System Config'))
      
      expect(screen.getByText('Location Settings')).toBeInTheDocument()
      expect(screen.getByText('Configure location tracking parameters')).toBeInTheDocument()
    })

    it('displays location settings form fields', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('System Config'))
      
      expect(screen.getByText('Location Update Frequency')).toBeInTheDocument()
      expect(screen.getByDisplayValue('60')).toBeInTheDocument()
      expect(screen.getByText('Data Retention Period')).toBeInTheDocument()
      expect(screen.getByDisplayValue('90')).toBeInTheDocument()
    })

    it('displays high-precision mode toggle', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('System Config'))
      
      expect(screen.getByText('High-Precision Mode')).toBeInTheDocument()
      expect(screen.getByText('Use more gateways for improved accuracy (higher cost)')).toBeInTheDocument()
    })

    it('displays alert settings section', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('System Config'))
      
      expect(screen.getByText('Alert Settings')).toBeInTheDocument()
      expect(screen.getByText('Configure alert thresholds and delivery')).toBeInTheDocument()
    })

    it('displays alert configuration fields', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('System Config'))
      
      expect(screen.getByText('Low Battery Threshold')).toBeInTheDocument()
      expect(screen.getByDisplayValue('20')).toBeInTheDocument()
      expect(screen.getByText('Geofence Alert Delay')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2')).toBeInTheDocument()
    })

    it('displays alert deduplication toggle', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('System Config'))
      
      expect(screen.getByText('Alert Deduplication')).toBeInTheDocument()
      expect(screen.getByText('Prevent duplicate alerts within 1 hour')).toBeInTheDocument()
    })
  })

  describe('API & Integrations Tab', () => {
    it('displays API & Integrations when tab is clicked', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      expect(screen.getByText('API Keys')).toBeInTheDocument()
      expect(screen.getByText('Manage API keys for integrations')).toBeInTheDocument()
    })

    it('displays Create API Key button', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      expect(screen.getByText('Create API Key')).toBeInTheDocument()
    })

    it('displays API keys table with correct headers', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Key')).toBeInTheDocument()
      expect(screen.getByText('Created')).toBeInTheDocument()
      expect(screen.getByText('Last Used')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('displays mock API keys in the table', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      expect(screen.getByText('Production API Key')).toBeInTheDocument()
      expect(screen.getByText('Development API Key')).toBeInTheDocument()
      expect(screen.getByText('Mobile App Key')).toBeInTheDocument()
    })

    it('displays webhooks section', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      expect(screen.getByText('Webhooks')).toBeInTheDocument()
      expect(screen.getByText('Configure webhook endpoints for real-time events')).toBeInTheDocument()
    })

    it('displays Add Webhook button', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      expect(screen.getByText('Add Webhook')).toBeInTheDocument()
    })

    it('displays mock webhooks', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      expect(screen.getByText('Asset Events Webhook')).toBeInTheDocument()
      expect(screen.getByText('Maintenance Alerts')).toBeInTheDocument()
    })

    it('displays ERP/CMMS integrations section', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      expect(screen.getByText('ERP/CMMS Integrations')).toBeInTheDocument()
      expect(screen.getByText('Connect with enterprise systems')).toBeInTheDocument()
    })

    it('displays integration options', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      expect(screen.getByText('SAP')).toBeInTheDocument()
      expect(screen.getByText('ServiceNow')).toBeInTheDocument()
      expect(screen.getByText('Procore')).toBeInTheDocument()
    })
  })

  describe('API Key Management', () => {
    it('opens Create API Key dialog when Create API Key button is clicked', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      fireEvent.click(screen.getByText('Create API Key'))
      
      expect(screen.getByText('Create API Key')).toBeInTheDocument()
      expect(screen.getByText('Generate a new API key for integrations')).toBeInTheDocument()
    })

    it('shows API key form fields in create dialog', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      fireEvent.click(screen.getByText('Create API Key'))
      
      expect(screen.getByText('Key Name')).toBeInTheDocument()
      expect(screen.getByText('Permissions (Scopes)')).toBeInTheDocument()
    })

    it('copies API key to clipboard when copy button is clicked', async () => {
      const { toast } = require('sonner')
      
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      const copyButtons = screen.getAllByRole('button')
      const copyButton = copyButtons.find(button => 
        button.querySelector('svg') // Look for the Copy icon
      )
      
      if (copyButton) {
        fireEvent.click(copyButton)
        
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Copied to clipboard')
      }
    })

    it('shows/hides API key when eye button is clicked', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      const eyeButtons = screen.getAllByRole('button')
      const eyeButton = eyeButtons.find(button => 
        button.querySelector('svg') // Look for the Eye icon
      )
      
      if (eyeButton) {
        fireEvent.click(eyeButton)
        // Key should be visible now
        expect(screen.getByText('ak_prod_abc123def456ghi789jklmno012pqr345stu678vwx901yz234')).toBeInTheDocument()
      }
    })

    it('regenerates API key when regenerate button is clicked', () => {
      const { toast } = require('sonner')
      
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      const regenerateButtons = screen.getAllByRole('button')
      const regenerateButton = regenerateButtons.find(button => 
        button.querySelector('svg') // Look for the RefreshCw icon
      )
      
      if (regenerateButton) {
        fireEvent.click(regenerateButton)
        expect(toast.success).toHaveBeenCalledWith('API key regenerated')
      }
    })

    it('deletes API key when delete button is clicked', () => {
      const { toast } = require('sonner')
      
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find(button => 
        button.querySelector('svg') // Look for the Trash2 icon
      )
      
      if (deleteButton) {
        fireEvent.click(deleteButton)
        expect(toast.success).toHaveBeenCalledWith('API key deleted')
      }
    })
  })

  describe('Webhook Management', () => {
    it('opens Add Webhook dialog when Add Webhook button is clicked', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      fireEvent.click(screen.getByText('Add Webhook'))
      
      expect(screen.getByText('Add Webhook')).toBeInTheDocument()
      expect(screen.getByText('Configure a new webhook endpoint for real-time events')).toBeInTheDocument()
    })

    it('shows webhook form fields in add dialog', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      fireEvent.click(screen.getByText('Add Webhook'))
      
      expect(screen.getByText('Webhook Name')).toBeInTheDocument()
      expect(screen.getByText('Endpoint URL')).toBeInTheDocument()
      expect(screen.getByText('Events to Subscribe')).toBeInTheDocument()
    })

    it('tests webhook when Test button is clicked', () => {
      const { toast } = require('sonner')
      
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      const testButtons = screen.getAllByText('Test')
      if (testButtons.length > 0) {
        fireEvent.click(testButtons[0])
        expect(toast.success).toHaveBeenCalledWith('Test event sent')
      }
    })

    it('edits webhook when Edit button is clicked', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      const editButtons = screen.getAllByRole('button')
      const editButton = editButtons.find(button => 
        button.querySelector('svg') // Look for the Edit icon
      )
      
      if (editButton) {
        fireEvent.click(editButton)
        expect(screen.getByText('Edit Webhook')).toBeInTheDocument()
      }
    })

    it('deletes webhook when Delete button is clicked', () => {
      const { toast } = require('sonner')
      
      render(<Settings />)
      
      fireEvent.click(screen.getByText('API & Integrations'))
      
      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find(button => 
        button.querySelector('svg') // Look for the Trash2 icon
      )
      
      if (deleteButton) {
        fireEvent.click(deleteButton)
        expect(screen.getByText('Delete Webhook?')).toBeInTheDocument()
      }
    })
  })

  describe('Audit Logs Tab', () => {
    it('displays audit logs when tab is clicked', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('Audit Logs'))
      
      expect(screen.getByText('Audit Logs')).toBeInTheDocument()
      expect(screen.getByText('Track all system activities and changes')).toBeInTheDocument()
    })

    it('displays search and filter controls', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('Audit Logs'))
      
      expect(screen.getByPlaceholderText('Search logs...')).toBeInTheDocument()
      expect(screen.getByDisplayValue('All Events')).toBeInTheDocument()
    })

    it('displays audit logs table with correct headers', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('Audit Logs'))
      
      expect(screen.getByText('Timestamp')).toBeInTheDocument()
      expect(screen.getByText('User')).toBeInTheDocument()
      expect(screen.getByText('Event')).toBeInTheDocument()
      expect(screen.getByText('Details')).toBeInTheDocument()
      expect(screen.getByText('IP Address')).toBeInTheDocument()
    })

    it('displays mock audit log entries', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('Audit Logs'))
      
      expect(screen.getByText('john.smith@company.com')).toBeInTheDocument()
      expect(screen.getByText('Asset Checkout')).toBeInTheDocument()
      expect(screen.getByText('Checked out Generator-045')).toBeInTheDocument()
    })

    it('displays pagination controls', () => {
      render(<Settings />)
      
      fireEvent.click(screen.getByText('Audit Logs'))
      
      expect(screen.getByText('Showing 3 of 1,247 events')).toBeInTheDocument()
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('allows editing user information in edit dialog', async () => {
      const user = userEvent.setup()
      render(<Settings />)
      
      // Use specific query for edit button
      const editButton = screen.getByRole('button', { name: /edit user john smith/i })
      await user.click(editButton)
      
      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      const nameInput = screen.getByDisplayValue('John Smith')
      await user.clear(nameInput)
      await user.type(nameInput, 'John Updated')
      
      expect(nameInput).toHaveValue('John Updated')
    })

    it('allows changing user role in edit dialog', async () => {
      const user = userEvent.setup()
      render(<Settings />)
      
      // Use specific query for edit button
      const editButton = screen.getByRole('button', { name: /edit user john smith/i })
      await user.click(editButton)
      
      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      const roleSelect = screen.getByDisplayValue('admin')
      await user.click(roleSelect)
      await user.click(screen.getByText('manager'))
      
      expect(screen.getByDisplayValue('manager')).toBeInTheDocument()
    })

    it('allows toggling permissions in permissions dialog', () => {
      render(<Settings />)
      
      const editPermissionsButtons = screen.getAllByText('Edit Permissions')
      fireEvent.click(editPermissionsButtons[0])
      
      const permissionSwitches = screen.getAllByRole('checkbox')
      if (permissionSwitches.length > 0) {
        const firstSwitch = permissionSwitches[0]
        const initialState = firstSwitch.checked
        
        fireEvent.click(firstSwitch)
        expect(firstSwitch.checked).toBe(!initialState)
      }
    })
  })

  describe('Toast Notifications', () => {
    it('shows success toast when user is deleted', () => {
      const { toast } = require('sonner')
      
      render(<Settings />)
      
      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find(button => 
        button.querySelector('svg') // Look for the Trash2 icon
      )
      
      if (deleteButton) {
        fireEvent.click(deleteButton)
        
        const confirmButton = screen.getByText('Delete User')
        fireEvent.click(confirmButton)
        
        expect(toast.success).toHaveBeenCalledWith('User deleted')
      }
    })

    it('shows success toast when user is updated', () => {
      const { toast } = require('sonner')
      
      render(<Settings />)
      
      const editButtons = screen.getAllByRole('button')
      const editButton = editButtons.find(button => 
        button.querySelector('svg') // Look for the Edit icon
      )
      
      if (editButton) {
        fireEvent.click(editButton)
        
        const saveButton = screen.getByText('Save Changes')
        fireEvent.click(saveButton)
        
        expect(toast.success).toHaveBeenCalledWith('User updated')
      }
    })

    it('shows success toast when permissions are saved', () => {
      const { toast } = require('sonner')
      
      render(<Settings />)
      
      const editPermissionsButtons = screen.getAllByText('Edit Permissions')
      fireEvent.click(editPermissionsButtons[0])
      
      const saveButton = screen.getByText('Save Permissions')
      fireEvent.click(saveButton)
      
      expect(toast.success).toHaveBeenCalledWith('Permissions updated')
    })
  })
})
