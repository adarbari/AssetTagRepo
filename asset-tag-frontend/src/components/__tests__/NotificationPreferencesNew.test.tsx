// import React from &apos;react&apos;;
import { describe, it, expect, vi, beforeEach, afterEach } from &apos;vitest&apos;;
import { render, screen, fireEvent, waitFor } from &apos;../../test/test-utils&apos;;
import { NotificationPreferencesNew } from &apos;../notifications/NotificationPreferencesNew&apos;;
import type { NotificationPreferences } from &apos;../../types/notificationConfig&apos;;

// Mock the alert configurations
vi.mock(&apos;../../data/alertConfigurations&apos;, () => ({
  getAllAlertTypes: vi
    .fn()
    .mockReturnValue([
      &apos;theft&apos;,
      &apos;battery&apos;,
      &apos;compliance&apos;,
      &apos;offline&apos;,
      &apos;geofence_entry&apos;,
      &apos;geofence_exit&apos;,
      &apos;maintenance_due&apos;,
    ]),
}));

// Mock toast
vi.mock(&apos;sonner&apos;, () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockNotificationConfigs: Record<string, NotificationPreferences> = {
  &apos;user:default&apos;: {
    id: &apos;user-default-1&apos;,
    level: &apos;user&apos;,
    entityId: &apos;default&apos;,
    channels: {
      email: {
        enabled: true,
        addresses: [&apos;user@example.com&apos;],
        verified: true,
      },
      sms: {
        enabled: false,
        phoneNumbers: [],
        verified: false,
      },
      push: {
        enabled: true,
        devices: [&apos;device-1&apos;],
      },
      webhook: {
        enabled: false,
        endpoints: [],
      },
    },
    filters: {
      types: [&apos;theft&apos;, &apos;battery&apos;, &apos;compliance&apos;],
      severities: [&apos;medium&apos;, &apos;high&apos;, &apos;critical&apos;],
    },
    quietHours: {
      enabled: true,
      start: &apos;22:00&apos;,
      end: &apos;08:00&apos;,
      timezone: &apos;America/New_York&apos;,
      excludeCritical: true,
    },
    frequency: {
      maxPerHour: 10,
      maxPerDay: 50,
      digestMode: false,
    },
    isOverride: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  &apos;site:SITE-001&apos;: {
    id: &apos;site-SITE-001-1&apos;,
    level: &apos;site&apos;,
    entityId: &apos;SITE-001&apos;,
    channels: {
      email: {
        enabled: true,
        addresses: [&apos;site@example.com&apos;],
        verified: true,
      },
      sms: {
        enabled: true,
        phoneNumbers: [&apos;+1234567890&apos;],
        verified: true,
      },
      push: {
        enabled: false,
        devices: [],
      },
      webhook: {
        enabled: true,
        endpoints: [&apos;https://api.example.com/webhooks/site&apos;],
      },
    },
    filters: {
      types: [&apos;theft&apos;, &apos;geofence_entry&apos;, &apos;geofence_exit&apos;],
      severities: [&apos;high&apos;, &apos;critical&apos;],
    },
    quietHours: {
      enabled: false,
      start: &apos;22:00&apos;,
      end: &apos;08:00&apos;,
      timezone: &apos;America/New_York&apos;,
      excludeCritical: true,
    },
    frequency: {
      maxPerHour: 5,
      maxPerDay: 25,
      digestMode: false,
    },
    isOverride: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

describe(&apos;NotificationPreferencesNew&apos;, () => {
  const mockOnSaveConfig = vi.fn();
  const mockOnDeleteConfig = vi.fn();
  const mockOnGetConfig = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    mockOnSaveConfig.mockResolvedValue({ success: true });
    mockOnDeleteConfig.mockResolvedValue({ success: true });
    mockOnGetConfig.mockImplementation((level: string, entityId: string) => {
      const key = `${level}:${entityId}`;
      return mockNotificationConfigs[key];
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe(&apos;Component Rendering&apos;, () => {
    it(&apos;renders the notification preferences page with correct title&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByText(&apos;Notification Preferences&apos;)).toBeInTheDocument();
    });

    it(&apos;renders the back button when onBack is provided&apos;, () => {
      render(
        <NotificationPreferencesNew
          onBack={mockOnBack}
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByText(&apos;Back&apos;)).toBeInTheDocument();
    });

    it(&apos;renders the three-level tab selector&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByText(&apos;User Level&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Site Level&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Asset Level&apos;)).toBeInTheDocument();
    });

    it(&apos;renders channel configuration sections&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByText(&apos;Email&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;SMS&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Push Notifications&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Webhook&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Tab Navigation&apos;, () => {
    it(&apos;starts with User Level tab selected by default&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const userTab = screen.getByText(&apos;User Level&apos;);
      expect(userTab).toHaveClass(&apos;data-[state=active]&apos;);
    });

    it(&apos;switches to Site Level tab when clicked&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      fireEvent.click(screen.getByText(&apos;Site Level&apos;));

      const siteTab = screen.getByText(&apos;Site Level&apos;);
      expect(siteTab).toHaveClass(&apos;data-[state=active]&apos;);
    });

    it(&apos;switches to Asset Level tab when clicked&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      fireEvent.click(screen.getByText(&apos;Asset Level&apos;));

      const assetTab = screen.getByText(&apos;Asset Level&apos;);
      expect(assetTab).toHaveClass(&apos;data-[state=active]&apos;);
    });

    it(&apos;preselects the correct tab when preselectedLevel is provided&apos;, () => {
      render(
        <NotificationPreferencesNew
          preselectedLevel=&apos;site&apos;
          preselectedEntityId=&apos;SITE-001&apos;
          preselectedEntityName=&apos;Construction Site A&apos;
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const siteTab = screen.getByText(&apos;Site Level&apos;);
      expect(siteTab).toHaveClass(&apos;data-[state=active]&apos;);
    });
  });

  describe(&apos;Channel Configuration&apos;, () => {
    it(&apos;displays current channel settings for User Level&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      // Email should be enabled
      const emailSwitch = screen.getByLabelText(&apos;Enable Email notifications&apos;);
      expect(emailSwitch).toBeChecked();

      // SMS should be disabled
      const smsSwitch = screen.getByLabelText(&apos;Enable SMS notifications&apos;);
      expect(smsSwitch).not.toBeChecked();

      // Push should be enabled
      const pushSwitch = screen.getByLabelText(&apos;Enable Push notifications&apos;);
      expect(pushSwitch).toBeChecked();
    });

    it(&apos;allows toggling channel switches&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const emailSwitch = screen.getByLabelText(&apos;Enable Email notifications&apos;);
      fireEvent.click(emailSwitch);

      expect(emailSwitch).not.toBeChecked();
    });

    it(&apos;shows email address input when email is enabled&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByDisplayValue(&apos;user@example.com&apos;)).toBeInTheDocument();
    });

    it(&apos;shows SMS number input when SMS is enabled&apos;, () => {
      render(
        <NotificationPreferencesNew
          preselectedLevel=&apos;site&apos;
          preselectedEntityId=&apos;SITE-001&apos;
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByDisplayValue(&apos;+1234567890&apos;)).toBeInTheDocument();
    });

    it(&apos;shows webhook URL input when webhook is enabled&apos;, () => {
      render(
        <NotificationPreferencesNew
          preselectedLevel=&apos;site&apos;
          preselectedEntityId=&apos;SITE-001&apos;
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(
        screen.getByDisplayValue(&apos;https://api.example.com/webhooks/site&apos;)
      ).toBeInTheDocument();
    });
  });

  describe(&apos;Quiet Hours Configuration&apos;, () => {
    it(&apos;displays quiet hours settings&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByText(&apos;Quiet Hours&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Enable quiet hours&apos;)).toBeInTheDocument();
    });

    it(&apos;shows quiet hours enabled by default for User Level&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const quietHoursSwitch = screen.getByLabelText(&apos;Enable quiet hours&apos;);
      expect(quietHoursSwitch).toBeChecked();
    });

    it(&apos;allows toggling quiet hours&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const quietHoursSwitch = screen.getByLabelText(&apos;Enable quiet hours&apos;);
      fireEvent.click(quietHoursSwitch);

      expect(quietHoursSwitch).not.toBeChecked();
    });

    it(&apos;displays quiet hours time inputs&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByDisplayValue(&apos;22:00&apos;)).toBeInTheDocument();
      expect(screen.getByDisplayValue(&apos;08:00&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Alert Filtering&apos;, () => {
    it(&apos;displays alert filtering section&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByText(&apos;Alert Filtering&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Minimum Severity&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Alert Types&apos;)).toBeInTheDocument();
    });

    it(&apos;displays current minimum severity setting&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByDisplayValue(&apos;Medium&apos;)).toBeInTheDocument();
    });

    it(&apos;allows changing minimum severity&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const severitySelect = screen.getByDisplayValue(&apos;Medium&apos;);
      fireEvent.click(severitySelect);
      fireEvent.click(screen.getByText(&apos;High&apos;));

      expect(screen.getByDisplayValue(&apos;High&apos;)).toBeInTheDocument();
    });

    it(&apos;displays alert type checkboxes&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByLabelText(&apos;Theft&apos;)).toBeInTheDocument();
      expect(screen.getByLabelText(&apos;Battery&apos;)).toBeInTheDocument();
      expect(screen.getByLabelText(&apos;Compliance&apos;)).toBeInTheDocument();
    });

    it(&apos;allows toggling alert type checkboxes&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const theftCheckbox = screen.getByLabelText(&apos;Theft&apos;);
      expect(theftCheckbox).toBeChecked();

      fireEvent.click(theftCheckbox);
      expect(theftCheckbox).not.toBeChecked();
    });
  });

  describe(&apos;Frequency Limits&apos;, () => {
    it(&apos;displays frequency limits section&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByText(&apos;Frequency Limits&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Max per hour&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Max per day&apos;)).toBeInTheDocument();
    });

    it(&apos;displays current frequency limit values&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByDisplayValue(&apos;10&apos;)).toBeInTheDocument();
      expect(screen.getByDisplayValue(&apos;50&apos;)).toBeInTheDocument();
    });

    it(&apos;allows changing frequency limit values&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const hourlyInput = screen.getByDisplayValue(&apos;10&apos;);
      fireEvent.change(hourlyInput, { target: { value: &apos;15&apos; } });

      expect(hourlyInput).toHaveValue(&apos;15&apos;);
    });
  });

  describe(&apos;Save and Delete Operations&apos;, () => {
    it(&apos;calls onSaveConfig when Save button is clicked&apos;, async () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const saveButton = screen.getByText(&apos;Save Configuration&apos;);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSaveConfig).toHaveBeenCalled();
      });
    });

    it(&apos;shows success toast when save is successful&apos;, async () => {
      const { toast } = require(&apos;sonner&apos;);

      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const saveButton = screen.getByText(&apos;Save Configuration&apos;);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          &apos;Configuration saved successfully&apos;
        );
      });
    });

    it(&apos;shows error toast when save fails&apos;, async () => {
      const { toast } = require(&apos;sonner&apos;);
      mockOnSaveConfig.mockResolvedValue({
        success: false,
        error: &apos;Save failed&apos;,
      });

      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const saveButton = screen.getByText(&apos;Save Configuration&apos;);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          &apos;Failed to save configuration: Save failed&apos;
        );
      });
    });

    it(&apos;shows delete override button for non-user level configurations&apos;, () => {
      render(
        <NotificationPreferencesNew
          preselectedLevel=&apos;site&apos;
          preselectedEntityId=&apos;SITE-001&apos;
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByText(&apos;Delete Override&apos;)).toBeInTheDocument();
    });

    it(&apos;calls onDeleteConfig when Delete Override button is clicked&apos;, async () => {
      render(
        <NotificationPreferencesNew
          preselectedLevel=&apos;site&apos;
          preselectedEntityId=&apos;SITE-001&apos;
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const deleteButton = screen.getByText(&apos;Delete Override&apos;);
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnDeleteConfig).toHaveBeenCalledWith(&apos;site&apos;, &apos;SITE-001&apos;);
      });
    });
  });

  describe(&apos;Configuration Inspector&apos;, () => {
    it(&apos;renders configuration inspector&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByText(&apos;Configuration Inspector&apos;)).toBeInTheDocument();
    });

    it(&apos;shows current active configuration&apos;, () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      expect(screen.getByText(&apos;Active Configuration&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Form Validation&apos;, () => {
    it(&apos;validates email format&apos;, async () => {
      render(
        <NotificationPreferencesNew
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const emailInput = screen.getByDisplayValue(&apos;user@example.com&apos;);
      fireEvent.change(emailInput, { target: { value: &apos;invalid-email&apos; } });

      const saveButton = screen.getByText(&apos;Save Configuration&apos;);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(&apos;Please enter a valid email address&apos;)
        ).toBeInTheDocument();
      });
    });

    it(&apos;validates phone number format&apos;, async () => {
      render(
        <NotificationPreferencesNew
          preselectedLevel=&apos;site&apos;
          preselectedEntityId=&apos;SITE-001&apos;
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const smsSwitch = screen.getByLabelText(&apos;Enable SMS notifications&apos;);
      fireEvent.click(smsSwitch);

      const phoneInput = screen.getByDisplayValue(&apos;+1234567890&apos;);
      fireEvent.change(phoneInput, { target: { value: &apos;invalid-phone&apos; } });

      const saveButton = screen.getByText(&apos;Save Configuration&apos;);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(&apos;Please enter a valid phone number&apos;)
        ).toBeInTheDocument();
      });
    });

    it(&apos;validates webhook URL format&apos;, async () => {
      render(
        <NotificationPreferencesNew
          preselectedLevel=&apos;site&apos;
          preselectedEntityId=&apos;SITE-001&apos;
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      const webhookInput = screen.getByDisplayValue(
        &apos;https://api.example.com/webhooks/site&apos;
      );
      fireEvent.change(webhookInput, { target: { value: &apos;invalid-url&apos; } });

      const saveButton = screen.getByText(&apos;Save Configuration&apos;);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(&apos;Please enter a valid URL&apos;)
        ).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Back Navigation&apos;, () => {
    it(&apos;calls onBack when Back button is clicked&apos;, () => {
      render(
        <NotificationPreferencesNew
          onBack={mockOnBack}
          notificationConfigs={mockNotificationConfigs}
          onSaveConfig={mockOnSaveConfig}
          onDeleteConfig={mockOnDeleteConfig}
          onGetConfig={mockOnGetConfig}
        />
      );

      fireEvent.click(screen.getByText(&apos;Back&apos;));

      expect(mockOnBack).toHaveBeenCalled();
    });
  });
});
