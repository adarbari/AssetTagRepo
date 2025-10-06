import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { HierarchicalAlertConfiguration } from '../alerts/HierarchicalAlertConfiguration';
import type { AlertConfig } from '../../types/alertConfig';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAlertConfigs: Record<string, AlertConfig> = {
  'global:theft': {
    id: 'global:theft',
    level: 'global',
    entityId: 'global',
    entityName: 'Global',
    alertType: 'theft',
    enabled: true,
    thresholds: {
      movementDistance: 100,
      timeThreshold: 300,
    },
    severity: 'critical',
    suppression: {
      enabled: true,
      duration: 3600,
      maxAlerts: 5,
    },
    escalation: {
      enabled: true,
      delay: 1800,
      recipients: ['admin@example.com'],
    },
  },
  'site:SITE-001:battery': {
    id: 'site:SITE-001:battery',
    level: 'site',
    entityId: 'SITE-001',
    entityName: 'Construction Site A',
    alertType: 'battery',
    enabled: true,
    thresholds: {
      batteryLevel: 20,
    },
    severity: 'warning',
    suppression: {
      enabled: false,
      duration: 0,
      maxAlerts: 0,
    },
    escalation: {
      enabled: false,
      delay: 0,
      recipients: [],
    },
  },
  'asset:AST-001:compliance': {
    id: 'asset:AST-001:compliance',
    level: 'asset',
    entityId: 'AST-001',
    entityName: 'Generator-001',
    alertType: 'compliance',
    enabled: true,
    thresholds: {
      daysUntilExpiry: 30,
    },
    severity: 'info',
    suppression: {
      enabled: true,
      duration: 86400,
      maxAlerts: 1,
    },
    escalation: {
      enabled: true,
      delay: 0,
      recipients: ['compliance@example.com'],
    },
  },
};

const mockJobs = {
  'JOB-001': {
    id: 'JOB-001',
    name: 'Construction Project A',
    status: 'active',
    priority: 'high',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T00:00:00Z',
    projectManager: 'John Doe',
    siteName: 'Construction Site A',
    budget: {
      total: 100000,
      labor: 50000,
      materials: 30000,
      equipment: 20000,
    },
    actualCosts: {
      total: 75000,
      labor: 40000,
      materials: 20000,
      equipment: 15000,
    },
    variance: -25000,
    variancePercentage: -25,
    assets: [],
    hasActiveAlerts: false,
    missingAssets: [],
  },
};

describe('HierarchicalAlertConfiguration', () => {
  const mockOnSaveConfig = vi.fn();
  const mockOnDeleteConfig = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    mockOnSaveConfig.mockResolvedValue({ success: true });
    mockOnDeleteConfig.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the alert configuration page with correct title', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Alert Configuration')).toBeInTheDocument();
    });

    it('renders the back button', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('renders the three-level tab selector', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Global')).toBeInTheDocument();
      expect(screen.getByText('Site Level')).toBeInTheDocument();
      expect(screen.getByText('Asset Level')).toBeInTheDocument();
    });

    it('renders the add configuration button', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Add Configuration')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('starts with Global tab selected by default', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      const globalTab = screen.getByText('Global');
      expect(globalTab).toHaveClass('data-[state=active]');
    });

    it('switches to Site Level tab when clicked', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText('Site Level'));

      const siteTab = screen.getByText('Site Level');
      expect(siteTab).toHaveClass('data-[state=active]');
    });

    it('switches to Asset Level tab when clicked', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText('Asset Level'));

      const assetTab = screen.getByText('Asset Level');
      expect(assetTab).toHaveClass('data-[state=active]');
    });
  });

  describe('Configuration Display', () => {
    it('displays global configurations in Global tab', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Theft Alert')).toBeInTheDocument();
      expect(screen.getByText('Global')).toBeInTheDocument();
    });

    it('displays site configurations in Site Level tab', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText('Site Level'));

      expect(screen.getByText('Battery Alert')).toBeInTheDocument();
      expect(screen.getByText('Construction Site A')).toBeInTheDocument();
    });

    it('displays asset configurations in Asset Level tab', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText('Asset Level'));

      expect(screen.getByText('Compliance Alert')).toBeInTheDocument();
      expect(screen.getByText('Generator-001')).toBeInTheDocument();
    });
  });

  describe('Configuration Details', () => {
    it('displays configuration status badges', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });

    it('displays severity levels', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Critical')).toBeInTheDocument();
    });

    it('displays threshold values', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Movement Distance: 100m')).toBeInTheDocument();
      expect(screen.getByText('Time Threshold: 5min')).toBeInTheDocument();
    });

    it('displays suppression settings', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(
        screen.getByText('Suppression: 1h, max 5 alerts')
      ).toBeInTheDocument();
    });

    it('displays escalation settings', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Escalation: 30min delay')).toBeInTheDocument();
    });
  });

  describe('Configuration Actions', () => {
    it('renders edit and delete buttons for each configuration', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');

      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('opens edit dialog when Edit button is clicked', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      expect(screen.getByText('Edit Alert Configuration')).toBeInTheDocument();
    });

    it('shows delete confirmation when Delete button is clicked', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
      expect(
        screen.getByText('This will permanently delete the alert configuration')
      ).toBeInTheDocument();
    });
  });

  describe('Add Configuration', () => {
    it('opens add configuration dialog when Add Configuration button is clicked', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText('Add Configuration'));

      expect(screen.getByText('Add Alert Configuration')).toBeInTheDocument();
    });

    it('shows alert type selector in add dialog', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText('Add Configuration'));

      expect(screen.getByText('Alert Type')).toBeInTheDocument();
    });

    it('shows entity selector for site and asset levels', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText('Site Level'));
      fireEvent.click(screen.getByText('Add Configuration'));

      expect(screen.getByText('Site')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required fields in add configuration form', async () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText('Add Configuration'));

      const saveButton = screen.getByText('Save Configuration');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please select an alert type')
        ).toBeInTheDocument();
      });
    });

    it('validates threshold values', async () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText('Add Configuration'));

      // Select alert type
      const alertTypeSelect = screen.getByDisplayValue('Select alert type');
      fireEvent.click(alertTypeSelect);
      fireEvent.click(screen.getByText('Battery Alert'));

      // Enter invalid threshold
      const thresholdInput = screen.getByLabelText('Battery Level (%)');
      fireEvent.change(thresholdInput, { target: { value: '150' } });

      const saveButton = screen.getByText('Save Configuration');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText('Battery level must be between 0 and 100')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Save and Delete Operations', () => {
    it('calls onSaveConfig when saving new configuration', async () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText('Add Configuration'));

      // Fill out form
      const alertTypeSelect = screen.getByDisplayValue('Select alert type');
      fireEvent.click(alertTypeSelect);
      fireEvent.click(screen.getByText('Battery Alert'));

      const thresholdInput = screen.getByLabelText('Battery Level (%)');
      fireEvent.change(thresholdInput, { target: { value: '20' } });

      const saveButton = screen.getByText('Save Configuration');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSaveConfig).toHaveBeenCalled();
      });
    });

    it('shows success toast when save is successful', async () => {
      const { toast } = require('sonner');

      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText('Add Configuration'));

      // Fill out form
      const alertTypeSelect = screen.getByDisplayValue('Select alert type');
      fireEvent.click(alertTypeSelect);
      fireEvent.click(screen.getByText('Battery Alert'));

      const thresholdInput = screen.getByLabelText('Battery Level (%)');
      fireEvent.change(thresholdInput, { target: { value: '20' } });

      const saveButton = screen.getByText('Save Configuration');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Alert configuration saved successfully'
        );
      });
    });

    it('calls onDeleteConfig when confirming deletion', async () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByText('Delete');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnDeleteConfig).toHaveBeenCalled();
      });
    });

    it('shows success toast when deletion is successful', async () => {
      const { toast } = require('sonner');

      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByText('Delete');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Alert configuration deleted successfully'
        );
      });
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no configurations exist for a level', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={{}}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(
        screen.getByText('No alert configurations found')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Get started by creating your first alert configuration'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Back Navigation', () => {
    it('calls onBack when Back button is clicked', () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText('Back'));

      expect(mockOnBack).toHaveBeenCalled();
    });
  });
});
