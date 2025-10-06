// import React from &apos;react&apos;;
import { describe, it, expect, vi, beforeEach, afterEach } from &apos;vitest&apos;;
import { render, screen, fireEvent, waitFor } from &apos;../../test/test-utils&apos;;
import { HierarchicalAlertConfiguration } from &apos;../alerts/HierarchicalAlertConfiguration&apos;;
import type { AlertConfig } from &apos;../../types/alertConfig&apos;;

// Mock toast
vi.mock(&apos;sonner&apos;, () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAlertConfigs: Record<string, AlertConfig> = {
  &apos;global:theft&apos;: {
    id: &apos;global:theft&apos;,
    level: &apos;global&apos;,
    entityId: &apos;global&apos;,
    entityName: &apos;Global&apos;,
    alertType: &apos;theft&apos;,
    enabled: true,
    thresholds: {
      movementDistance: 100,
      timeThreshold: 300,
    },
    severity: &apos;critical&apos;,
    suppression: {
      enabled: true,
      duration: 3600,
      maxAlerts: 5,
    },
    escalation: {
      enabled: true,
      delay: 1800,
      recipients: [&apos;admin@example.com&apos;],
    },
  },
  &apos;site:SITE-001:battery&apos;: {
    id: &apos;site:SITE-001:battery&apos;,
    level: &apos;site&apos;,
    entityId: &apos;SITE-001&apos;,
    entityName: &apos;Construction Site A&apos;,
    alertType: &apos;battery&apos;,
    enabled: true,
    thresholds: {
      batteryLevel: 20,
    },
    severity: &apos;warning&apos;,
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
  &apos;asset:AST-001:compliance&apos;: {
    id: &apos;asset:AST-001:compliance&apos;,
    level: &apos;asset&apos;,
    entityId: &apos;AST-001&apos;,
    entityName: &apos;Generator-001&apos;,
    alertType: &apos;compliance&apos;,
    enabled: true,
    thresholds: {
      daysUntilExpiry: 30,
    },
    severity: &apos;info&apos;,
    suppression: {
      enabled: true,
      duration: 86400,
      maxAlerts: 1,
    },
    escalation: {
      enabled: true,
      delay: 0,
      recipients: [&apos;compliance@example.com&apos;],
    },
  },
};

const mockJobs = {
  &apos;JOB-001&apos;: {
    id: &apos;JOB-001&apos;,
    name: &apos;Construction Project A&apos;,
    status: &apos;active&apos;,
    priority: &apos;high&apos;,
    startDate: &apos;2024-01-01T00:00:00Z&apos;,
    endDate: &apos;2024-12-31T00:00:00Z&apos;,
    projectManager: &apos;John Doe&apos;,
    siteName: &apos;Construction Site A&apos;,
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

describe(&apos;HierarchicalAlertConfiguration&apos;, () => {
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

  describe(&apos;Component Rendering&apos;, () => {
    it(&apos;renders the alert configuration page with correct title&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText(&apos;Alert Configuration&apos;)).toBeInTheDocument();
    });

    it(&apos;renders the back button&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText(&apos;Back&apos;)).toBeInTheDocument();
    });

    it(&apos;renders the three-level tab selector&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText(&apos;Global&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Site Level&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Asset Level&apos;)).toBeInTheDocument();
    });

    it(&apos;renders the add configuration button&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText(&apos;Add Configuration&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Tab Navigation&apos;, () => {
    it(&apos;starts with Global tab selected by default&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      const globalTab = screen.getByText(&apos;Global&apos;);
      expect(globalTab).toHaveClass(&apos;data-[state=active]&apos;);
    });

    it(&apos;switches to Site Level tab when clicked&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText(&apos;Site Level&apos;));

      const siteTab = screen.getByText(&apos;Site Level&apos;);
      expect(siteTab).toHaveClass(&apos;data-[state=active]&apos;);
    });

    it(&apos;switches to Asset Level tab when clicked&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText(&apos;Asset Level&apos;));

      const assetTab = screen.getByText(&apos;Asset Level&apos;);
      expect(assetTab).toHaveClass(&apos;data-[state=active]&apos;);
    });
  });

  describe(&apos;Configuration Display&apos;, () => {
    it(&apos;displays global configurations in Global tab&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText(&apos;Theft Alert&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Global&apos;)).toBeInTheDocument();
    });

    it(&apos;displays site configurations in Site Level tab&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText(&apos;Site Level&apos;));

      expect(screen.getByText(&apos;Battery Alert&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Construction Site A&apos;)).toBeInTheDocument();
    });

    it(&apos;displays asset configurations in Asset Level tab&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText(&apos;Asset Level&apos;));

      expect(screen.getByText(&apos;Compliance Alert&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Generator-001&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Configuration Details&apos;, () => {
    it(&apos;displays configuration status badges&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText(&apos;Enabled&apos;)).toBeInTheDocument();
    });

    it(&apos;displays severity levels&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText(&apos;Critical&apos;)).toBeInTheDocument();
    });

    it(&apos;displays threshold values&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText(&apos;Movement Distance: 100m&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Time Threshold: 5min&apos;)).toBeInTheDocument();
    });

    it(&apos;displays suppression settings&apos;, () => {
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
        screen.getByText(&apos;Suppression: 1h, max 5 alerts&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;displays escalation settings&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText(&apos;Escalation: 30min delay&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Configuration Actions&apos;, () => {
    it(&apos;renders edit and delete buttons for each configuration&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      const editButtons = screen.getAllByText(&apos;Edit&apos;);
      const deleteButtons = screen.getAllByText(&apos;Delete&apos;);

      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it(&apos;opens edit dialog when Edit button is clicked&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      const editButtons = screen.getAllByText(&apos;Edit&apos;);
      fireEvent.click(editButtons[0]);

      expect(screen.getByText(&apos;Edit Alert Configuration&apos;)).toBeInTheDocument();
    });

    it(&apos;shows delete confirmation when Delete button is clicked&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      const deleteButtons = screen.getAllByText(&apos;Delete&apos;);
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText(&apos;Are you sure?&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;This will permanently delete the alert configuration&apos;)
      ).toBeInTheDocument();
    });
  });

  describe(&apos;Add Configuration&apos;, () => {
    it(&apos;opens add configuration dialog when Add Configuration button is clicked&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText(&apos;Add Configuration&apos;));

      expect(screen.getByText(&apos;Add Alert Configuration&apos;)).toBeInTheDocument();
    });

    it(&apos;shows alert type selector in add dialog&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText(&apos;Add Configuration&apos;));

      expect(screen.getByText(&apos;Alert Type&apos;)).toBeInTheDocument();
    });

    it(&apos;shows entity selector for site and asset levels&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText(&apos;Site Level&apos;));
      fireEvent.click(screen.getByText(&apos;Add Configuration&apos;));

      expect(screen.getByText(&apos;Site&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Form Validation&apos;, () => {
    it(&apos;validates required fields in add configuration form&apos;, async () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText(&apos;Add Configuration&apos;));

      const saveButton = screen.getByText(&apos;Save Configuration&apos;);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(&apos;Please select an alert type&apos;)
        ).toBeInTheDocument();
      });
    });

    it(&apos;validates threshold values&apos;, async () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText(&apos;Add Configuration&apos;));

      // Select alert type
      const alertTypeSelect = screen.getByDisplayValue(&apos;Select alert type&apos;);
      fireEvent.click(alertTypeSelect);
      fireEvent.click(screen.getByText(&apos;Battery Alert&apos;));

      // Enter invalid threshold
      const thresholdInput = screen.getByLabelText(&apos;Battery Level (%)&apos;);
      fireEvent.change(thresholdInput, { target: { value: &apos;150&apos; } });

      const saveButton = screen.getByText(&apos;Save Configuration&apos;);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(&apos;Battery level must be between 0 and 100&apos;)
        ).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Save and Delete Operations&apos;, () => {
    it(&apos;calls onSaveConfig when saving new configuration&apos;, async () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText(&apos;Add Configuration&apos;));

      // Fill out form
      const alertTypeSelect = screen.getByDisplayValue(&apos;Select alert type&apos;);
      fireEvent.click(alertTypeSelect);
      fireEvent.click(screen.getByText(&apos;Battery Alert&apos;));

      const thresholdInput = screen.getByLabelText(&apos;Battery Level (%)&apos;);
      fireEvent.change(thresholdInput, { target: { value: &apos;20&apos; } });

      const saveButton = screen.getByText(&apos;Save Configuration&apos;);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSaveConfig).toHaveBeenCalled();
      });
    });

    it(&apos;shows success toast when save is successful&apos;, async () => {
      const { toast } = require(&apos;sonner&apos;);

      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText(&apos;Add Configuration&apos;));

      // Fill out form
      const alertTypeSelect = screen.getByDisplayValue(&apos;Select alert type&apos;);
      fireEvent.click(alertTypeSelect);
      fireEvent.click(screen.getByText(&apos;Battery Alert&apos;));

      const thresholdInput = screen.getByLabelText(&apos;Battery Level (%)&apos;);
      fireEvent.change(thresholdInput, { target: { value: &apos;20&apos; } });

      const saveButton = screen.getByText(&apos;Save Configuration&apos;);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          &apos;Alert configuration saved successfully&apos;
        );
      });
    });

    it(&apos;calls onDeleteConfig when confirming deletion&apos;, async () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      const deleteButtons = screen.getAllByText(&apos;Delete&apos;);
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByText(&apos;Delete&apos;);
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnDeleteConfig).toHaveBeenCalled();
      });
    });

    it(&apos;shows success toast when deletion is successful&apos;, async () => {
      const { toast } = require(&apos;sonner&apos;);

      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      const deleteButtons = screen.getAllByText(&apos;Delete&apos;);
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByText(&apos;Delete&apos;);
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          &apos;Alert configuration deleted successfully&apos;
        );
      });
    });
  });

  describe(&apos;Empty States&apos;, () => {
    it(&apos;shows empty state when no configurations exist for a level&apos;, () => {
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
        screen.getByText(&apos;No alert configurations found&apos;)
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          &apos;Get started by creating your first alert configuration&apos;
        )
      ).toBeInTheDocument();
    });
  });

  describe(&apos;Back Navigation&apos;, () => {
    it(&apos;calls onBack when Back button is clicked&apos;, () => {
      render(
        <HierarchicalAlertConfiguration
          alertConfigs={mockAlertConfigs}
          jobs={mockJobs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByText(&apos;Back&apos;));

      expect(mockOnBack).toHaveBeenCalled();
    });
  });
});
