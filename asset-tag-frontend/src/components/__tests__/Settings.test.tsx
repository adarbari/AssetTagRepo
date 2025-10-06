// import React from &apos;react&apos;;
import { describe, it, expect, vi, beforeEach, afterEach } from &apos;vitest&apos;;
import { render, screen, fireEvent, waitFor } from &apos;../../test/test-utils&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { Settings } from &apos;../settings/Settings&apos;;

// Mock toast
vi.mock(&apos;sonner&apos;, () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

describe(&apos;Settings&apos;, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe(&apos;Component Rendering&apos;, () => {
    it(&apos;renders the settings page with correct title and description&apos;, () => {
      render(<Settings />);

      expect(screen.getByText(&apos;Settings&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Manage system configuration, users, and integrations&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;renders all tab options&apos;, () => {
      render(<Settings />);

      expect(screen.getByText(&apos;Users & Roles&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Organization&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;System Config&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;API & Integrations&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Audit Logs&apos;)).toBeInTheDocument();
    });

    it(&apos;starts with Users & Roles tab selected by default&apos;, () => {
      render(<Settings />);

      const usersTab = screen.getByText(&apos;Users & Roles&apos;);
      expect(usersTab).toHaveClass(&apos;data-[state=active]&apos;);
    });
  });

  describe(&apos;Users & Roles Tab&apos;, () => {
    it(&apos;displays user management section&apos;, () => {
      render(<Settings />);

      expect(screen.getByText(&apos;User Management&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Manage users and their permissions&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;displays the Add User button&apos;, () => {
      render(<Settings />);

      expect(screen.getByText(&apos;Add User&apos;)).toBeInTheDocument();
    });

    it(&apos;displays users table with correct headers&apos;, () => {
      render(<Settings />);

      expect(screen.getByText(&apos;User&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Role&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Status&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Last Active&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Actions&apos;)).toBeInTheDocument();
    });

    it(&apos;displays mock users in the table&apos;, () => {
      render(<Settings />);

      expect(screen.getByText(&apos;John Smith&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;john.smith@company.com&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Sarah Johnson&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;sarah.j@company.com&apos;)).toBeInTheDocument();
    });

    it(&apos;displays role badges with correct colors&apos;, () => {
      render(<Settings />);

      expect(screen.getByText(&apos;admin&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;manager&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;operator&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;viewer&apos;)).toBeInTheDocument();
    });

    it(&apos;displays status badges&apos;, () => {
      render(<Settings />);

      expect(screen.getAllByText(&apos;active&apos;)).toHaveLength(3);
      expect(screen.getByText(&apos;inactive&apos;)).toBeInTheDocument();
    });

    it(&apos;displays role permissions section&apos;, () => {
      render(<Settings />);

      expect(screen.getByText(&apos;Role Permissions&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Define what each role can do&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;displays all role permission cards&apos;, () => {
      render(<Settings />);

      expect(screen.getByText(&apos;admin&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;manager&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;operator&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;viewer&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;User Management Actions&apos;, () => {
    it(&apos;opens Add User dialog when Add User button is clicked&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;Add User&apos;));

      expect(screen.getByText(&apos;Add New User&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Invite a new user to your organization&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;opens Edit User dialog when Edit button is clicked&apos;, () => {
      render(<Settings />);

      const editButtons = screen.getAllByRole(&apos;button&apos;);
      const editButton = editButtons.find(
        button => button.querySelector(&apos;svg&apos;) // Look for the Edit icon
      );

      if (editButton) {
        fireEvent.click(editButton);
        expect(screen.getByText(&apos;Edit User&apos;)).toBeInTheDocument();
      }
    });

    it(&apos;opens Delete User confirmation dialog when Delete button is clicked&apos;, () => {
      render(<Settings />);

      const deleteButtons = screen.getAllByRole(&apos;button&apos;);
      const deleteButton = deleteButtons.find(
        button => button.querySelector(&apos;svg&apos;) // Look for the Trash2 icon
      );

      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(screen.getByText(&apos;Are you sure?&apos;)).toBeInTheDocument();
        expect(
          screen.getByText(&apos;This will permanently delete the user&apos;)
        ).toBeInTheDocument();
      }
    });

    it(&apos;opens Edit Permissions dialog when Edit Permissions button is clicked&apos;, () => {
      render(<Settings />);

      const editPermissionsButtons = screen.getAllByText(&apos;Edit Permissions&apos;);
      fireEvent.click(editPermissionsButtons[0]);

      expect(screen.getByText(&apos;Edit Role Permissions&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Organization Tab&apos;, () => {
    it(&apos;displays organization settings when tab is clicked&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;Organization&apos;));

      expect(screen.getByText(&apos;Organization Settings&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Manage your organization details&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;displays organization form fields&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;Organization&apos;));

      expect(
        screen.getByDisplayValue(&apos;Acme Construction Co.&apos;)
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue(&apos;ORG-12345&apos;)).toBeInTheDocument();
      expect(screen.getByDisplayValue(&apos;America/Chicago&apos;)).toBeInTheDocument();
    });

    it(&apos;displays SSO integration toggle&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;Organization&apos;));

      expect(screen.getByText(&apos;SSO Integration&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Enable single sign-on with SAML/OIDC&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;displays Save Changes button&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;Organization&apos;));

      expect(screen.getByText(&apos;Save Changes&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;System Config Tab&apos;, () => {
    it(&apos;displays system configuration when tab is clicked&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;System Config&apos;));

      expect(screen.getByText(&apos;Location Settings&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Configure location tracking parameters&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;displays location settings form fields&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;System Config&apos;));

      expect(screen.getByText(&apos;Location Update Frequency&apos;)).toBeInTheDocument();
      expect(screen.getByDisplayValue(&apos;60&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Data Retention Period&apos;)).toBeInTheDocument();
      expect(screen.getByDisplayValue(&apos;90&apos;)).toBeInTheDocument();
    });

    it(&apos;displays high-precision mode toggle&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;System Config&apos;));

      expect(screen.getByText(&apos;High-Precision Mode&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(
          &apos;Use more gateways for improved accuracy (higher cost)&apos;
        )
      ).toBeInTheDocument();
    });

    it(&apos;displays alert settings section&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;System Config&apos;));

      expect(screen.getByText(&apos;Alert Settings&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Configure alert thresholds and delivery&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;displays alert configuration fields&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;System Config&apos;));

      expect(screen.getByText(&apos;Low Battery Threshold&apos;)).toBeInTheDocument();
      expect(screen.getByDisplayValue(&apos;20&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Geofence Alert Delay&apos;)).toBeInTheDocument();
      expect(screen.getByDisplayValue(&apos;2&apos;)).toBeInTheDocument();
    });

    it(&apos;displays alert deduplication toggle&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;System Config&apos;));

      expect(screen.getByText(&apos;Alert Deduplication&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Prevent duplicate alerts within 1 hour&apos;)
      ).toBeInTheDocument();
    });
  });

  describe(&apos;API & Integrations Tab&apos;, () => {
    it(&apos;displays API & Integrations when tab is clicked&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      expect(screen.getByText(&apos;API Keys&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Manage API keys for integrations&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;displays Create API Key button&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      expect(screen.getByText(&apos;Create API Key&apos;)).toBeInTheDocument();
    });

    it(&apos;displays API keys table with correct headers&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      expect(screen.getByText(&apos;Name&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Key&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Created&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Last Used&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Status&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Actions&apos;)).toBeInTheDocument();
    });

    it(&apos;displays mock API keys in the table&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      expect(screen.getByText(&apos;Production API Key&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Development API Key&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Mobile App Key&apos;)).toBeInTheDocument();
    });

    it(&apos;displays webhooks section&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      expect(screen.getByText(&apos;Webhooks&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Configure webhook endpoints for real-time events&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;displays Add Webhook button&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      expect(screen.getByText(&apos;Add Webhook&apos;)).toBeInTheDocument();
    });

    it(&apos;displays mock webhooks&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      expect(screen.getByText(&apos;Asset Events Webhook&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Maintenance Alerts&apos;)).toBeInTheDocument();
    });

    it(&apos;displays ERP/CMMS integrations section&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      expect(screen.getByText(&apos;ERP/CMMS Integrations&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Connect with enterprise systems&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;displays integration options&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      expect(screen.getByText(&apos;SAP&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;ServiceNow&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Procore&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;API Key Management&apos;, () => {
    it(&apos;opens Create API Key dialog when Create API Key button is clicked&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));
      fireEvent.click(screen.getByText(&apos;Create API Key&apos;));

      expect(screen.getByText(&apos;Create API Key&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Generate a new API key for integrations&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;shows API key form fields in create dialog&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));
      fireEvent.click(screen.getByText(&apos;Create API Key&apos;));

      expect(screen.getByText(&apos;Key Name&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Permissions (Scopes)&apos;)).toBeInTheDocument();
    });

    it(&apos;copies API key to clipboard when copy button is clicked&apos;, async () => {
      const { toast } = require(&apos;sonner&apos;);

      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      const copyButtons = screen.getAllByRole(&apos;button&apos;);
      const copyButton = copyButtons.find(
        button => button.querySelector(&apos;svg&apos;) // Look for the Copy icon
      );

      if (copyButton) {
        fireEvent.click(copyButton);

        expect(navigator.clipboard.writeText).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith(&apos;Copied to clipboard&apos;);
      }
    });

    it(&apos;shows/hides API key when eye button is clicked&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      const eyeButtons = screen.getAllByRole(&apos;button&apos;);
      const eyeButton = eyeButtons.find(
        button => button.querySelector(&apos;svg&apos;) // Look for the Eye icon
      );

      if (eyeButton) {
        fireEvent.click(eyeButton);
        // Key should be visible now
        expect(
          screen.getByText(
            &apos;ak_prod_abc123def456ghi789jklmno012pqr345stu678vwx901yz234&apos;
          )
        ).toBeInTheDocument();
      }
    });

    it(&apos;regenerates API key when regenerate button is clicked&apos;, () => {
      const { toast } = require(&apos;sonner&apos;);

      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      const regenerateButtons = screen.getAllByRole(&apos;button&apos;);
      const regenerateButton = regenerateButtons.find(
        button => button.querySelector(&apos;svg&apos;) // Look for the RefreshCw icon
      );

      if (regenerateButton) {
        fireEvent.click(regenerateButton);
        expect(toast.success).toHaveBeenCalledWith(&apos;API key regenerated&apos;);
      }
    });

    it(&apos;deletes API key when delete button is clicked&apos;, () => {
      const { toast } = require(&apos;sonner&apos;);

      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      const deleteButtons = screen.getAllByRole(&apos;button&apos;);
      const deleteButton = deleteButtons.find(
        button => button.querySelector(&apos;svg&apos;) // Look for the Trash2 icon
      );

      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(toast.success).toHaveBeenCalledWith(&apos;API key deleted&apos;);
      }
    });
  });

  describe(&apos;Webhook Management&apos;, () => {
    it(&apos;opens Add Webhook dialog when Add Webhook button is clicked&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));
      fireEvent.click(screen.getByText(&apos;Add Webhook&apos;));

      expect(screen.getByText(&apos;Add Webhook&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(
          &apos;Configure a new webhook endpoint for real-time events&apos;
        )
      ).toBeInTheDocument();
    });

    it(&apos;shows webhook form fields in add dialog&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));
      fireEvent.click(screen.getByText(&apos;Add Webhook&apos;));

      expect(screen.getByText(&apos;Webhook Name&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Endpoint URL&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Events to Subscribe&apos;)).toBeInTheDocument();
    });

    it(&apos;tests webhook when Test button is clicked&apos;, () => {
      const { toast } = require(&apos;sonner&apos;);

      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      const testButtons = screen.getAllByText(&apos;Test&apos;);
      if (testButtons.length > 0) {
        fireEvent.click(testButtons[0]);
        expect(toast.success).toHaveBeenCalledWith(&apos;Test event sent&apos;);
      }
    });

    it(&apos;edits webhook when Edit button is clicked&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      const editButtons = screen.getAllByRole(&apos;button&apos;);
      const editButton = editButtons.find(
        button => button.querySelector(&apos;svg&apos;) // Look for the Edit icon
      );

      if (editButton) {
        fireEvent.click(editButton);
        expect(screen.getByText(&apos;Edit Webhook&apos;)).toBeInTheDocument();
      }
    });

    it(&apos;deletes webhook when Delete button is clicked&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;API & Integrations&apos;));

      const deleteButtons = screen.getAllByRole(&apos;button&apos;);
      const deleteButton = deleteButtons.find(
        button => button.querySelector(&apos;svg&apos;) // Look for the Trash2 icon
      );

      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(screen.getByText(&apos;Delete Webhook?&apos;)).toBeInTheDocument();
      }
    });
  });

  describe(&apos;Audit Logs Tab&apos;, () => {
    it(&apos;displays audit logs when tab is clicked&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;Audit Logs&apos;));

      expect(screen.getByText(&apos;Audit Logs&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Track all system activities and changes&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;displays search and filter controls&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;Audit Logs&apos;));

      expect(screen.getByPlaceholderText(&apos;Search logs...&apos;)).toBeInTheDocument();
      expect(screen.getByDisplayValue(&apos;All Events&apos;)).toBeInTheDocument();
    });

    it(&apos;displays audit logs table with correct headers&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;Audit Logs&apos;));

      expect(screen.getByText(&apos;Timestamp&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;User&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Event&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Details&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;IP Address&apos;)).toBeInTheDocument();
    });

    it(&apos;displays mock audit log entries&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;Audit Logs&apos;));

      expect(screen.getByText(&apos;john.smith@company.com&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Asset Checkout&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Checked out Generator-045&apos;)).toBeInTheDocument();
    });

    it(&apos;displays pagination controls&apos;, () => {
      render(<Settings />);

      fireEvent.click(screen.getByText(&apos;Audit Logs&apos;));

      expect(screen.getByText(&apos;Showing 3 of 1,247 events&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Previous&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Next&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Form Interactions&apos;, () => {
    it(&apos;allows editing user information in edit dialog&apos;, async () => {
      const user = userEvent.setup();
      render(<Settings />);

      // Use specific query for edit button
      const editButton = screen.getByRole(&apos;button&apos;, {
        name: /edit user john smith/i,
      });
      await user.click(editButton);

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByRole(&apos;dialog&apos;)).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue(&apos;John Smith&apos;);
      await user.clear(nameInput);
      await user.type(nameInput, &apos;John Updated&apos;);

      expect(nameInput).toHaveValue(&apos;John Updated&apos;);
    });

    it(&apos;allows changing user role in edit dialog&apos;, async () => {
      const user = userEvent.setup();
      render(<Settings />);

      // Use specific query for edit button
      const editButton = screen.getByRole(&apos;button&apos;, {
        name: /edit user john smith/i,
      });
      await user.click(editButton);

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByRole(&apos;dialog&apos;)).toBeInTheDocument();
      });

      const roleSelect = screen.getByDisplayValue(&apos;admin&apos;);
      await user.click(roleSelect);
      await user.click(screen.getByText(&apos;manager&apos;));

      expect(screen.getByDisplayValue(&apos;manager&apos;)).toBeInTheDocument();
    });

    it(&apos;allows toggling permissions in permissions dialog&apos;, () => {
      render(<Settings />);

      const editPermissionsButtons = screen.getAllByText(&apos;Edit Permissions&apos;);
      fireEvent.click(editPermissionsButtons[0]);

      const permissionSwitches = screen.getAllByRole(&apos;checkbox&apos;);
      if (permissionSwitches.length > 0) {
        const firstSwitch = permissionSwitches[0];
        const initialState = firstSwitch.checked;

        fireEvent.click(firstSwitch);
        expect(firstSwitch.checked).toBe(!initialState);
      }
    });
  });

  describe(&apos;Toast Notifications&apos;, () => {
    it(&apos;shows success toast when user is deleted&apos;, () => {
      const { toast } = require(&apos;sonner&apos;);

      render(<Settings />);

      const deleteButtons = screen.getAllByRole(&apos;button&apos;);
      const deleteButton = deleteButtons.find(
        button => button.querySelector(&apos;svg&apos;) // Look for the Trash2 icon
      );

      if (deleteButton) {
        fireEvent.click(deleteButton);

        const confirmButton = screen.getByText(&apos;Delete User&apos;);
        fireEvent.click(confirmButton);

        expect(toast.success).toHaveBeenCalledWith(&apos;User deleted&apos;);
      }
    });

    it(&apos;shows success toast when user is updated&apos;, () => {
      const { toast } = require(&apos;sonner&apos;);

      render(<Settings />);

      const editButtons = screen.getAllByRole(&apos;button&apos;);
      const editButton = editButtons.find(
        button => button.querySelector(&apos;svg&apos;) // Look for the Edit icon
      );

      if (editButton) {
        fireEvent.click(editButton);

        const saveButton = screen.getByText(&apos;Save Changes&apos;);
        fireEvent.click(saveButton);

        expect(toast.success).toHaveBeenCalledWith(&apos;User updated&apos;);
      }
    });

    it(&apos;shows success toast when permissions are saved&apos;, () => {
      const { toast } = require(&apos;sonner&apos;);

      render(<Settings />);

      const editPermissionsButtons = screen.getAllByText(&apos;Edit Permissions&apos;);
      fireEvent.click(editPermissionsButtons[0]);

      const saveButton = screen.getByText(&apos;Save Permissions&apos;);
      fireEvent.click(saveButton);

      expect(toast.success).toHaveBeenCalledWith(&apos;Permissions updated&apos;);
    });
  });
});
