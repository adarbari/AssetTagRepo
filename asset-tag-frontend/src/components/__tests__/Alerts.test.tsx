// import React from &apos;react&apos;;
import { describe, it, expect, vi, beforeEach, afterEach } from &apos;vitest&apos;;
import { render, screen, fireEvent } from &apos;../../test/test-utils&apos;;
import { Alerts } from &apos;../alerts/Alerts&apos;;

// Mock the data functions
vi.mock(&apos;../../data/mockData&apos;, () => ({
  mockAlerts: [
    {
      id: &apos;ALERT-001&apos;,
      type: &apos;theft&apos;,
      severity: &apos;critical&apos;,
      status: &apos;active&apos;,
      message: &apos;Unauthorized movement detected&apos;,
      asset: &apos;Generator-001&apos;,
      timestamp: &apos;2024-01-15T10:30:00Z&apos;,
      reason: &apos;Asset moved outside authorized zone&apos;,
    },
    {
      id: &apos;ALERT-002&apos;,
      type: &apos;battery&apos;,
      severity: &apos;warning&apos;,
      status: &apos;active&apos;,
      message: &apos;Low battery level&apos;,
      asset: &apos;Crane-002&apos;,
      timestamp: &apos;2024-01-15T09:15:00Z&apos;,
      reason: &apos;Battery level below 20%&apos;,
    },
    {
      id: &apos;ALERT-003&apos;,
      type: &apos;compliance&apos;,
      severity: &apos;info&apos;,
      status: &apos;acknowledged&apos;,
      message: &apos;Inspection due&apos;,
      asset: &apos;Excavator-003&apos;,
      timestamp: &apos;2024-01-15T08:00:00Z&apos;,
      reason: &apos;Annual inspection required&apos;,
    },
    {
      id: &apos;ALERT-004&apos;,
      type: &apos;offline&apos;,
      severity: &apos;warning&apos;,
      status: &apos;resolved&apos;,
      message: &apos;Asset offline&apos;,
      asset: &apos;Loader-004&apos;,
      timestamp: &apos;2024-01-14T16:45:00Z&apos;,
      reason: &apos;No signal received for 30 minutes&apos;,
    },
  ],
}));

// Mock toast
vi.mock(&apos;sonner&apos;, () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, &apos;localStorage&apos;, {
  value: mockLocalStorage,
});

describe(&apos;Alerts&apos;, () => {
  const mockOnTakeAction = vi.fn();
  const mockOnNavigateToConfiguration = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe(&apos;Component Rendering&apos;, () => {
    it(&apos;renders the alerts page with correct title and description&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      expect(screen.getByText(&apos;Alert Management&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Monitor and respond to system alerts&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;renders the Configure Rules button&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      expect(screen.getByText(&apos;Configure Rules&apos;)).toBeInTheDocument();
    });

    it(&apos;renders all statistics cards&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      expect(screen.getByText(&apos;Total Alerts&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Active&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Critical&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Theft&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Battery&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Compliance&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Offline&apos;)).toBeInTheDocument();
    });

    it(&apos;displays correct alert counts in statistics&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      expect(screen.getByText(&apos;4&apos;)).toBeInTheDocument(); // Total alerts
      expect(screen.getByText(&apos;2&apos;)).toBeInTheDocument(); // Active alerts
      expect(screen.getByText(&apos;1&apos;)).toBeInTheDocument(); // Critical alerts
    });
  });

  describe(&apos;Filtering&apos;, () => {
    it(&apos;renders search input&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      expect(
        screen.getByPlaceholderText(&apos;Search alerts...&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;filters alerts based on search term&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const searchInput = screen.getByPlaceholderText(&apos;Search alerts...&apos;);
      fireEvent.change(searchInput, { target: { value: &apos;battery&apos; } });

      // Should show only battery-related alerts
      expect(screen.getByText(&apos;Low battery level&apos;)).toBeInTheDocument();
      expect(
        screen.queryByText(&apos;Unauthorized movement detected&apos;)
      ).not.toBeInTheDocument();
    });

    it(&apos;filters by alert type&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const typeSelect = screen.getByDisplayValue(&apos;All Types&apos;);
      fireEvent.click(typeSelect);
      fireEvent.click(screen.getByText(&apos;Theft Alert&apos;));

      expect(
        screen.getByText(&apos;Unauthorized movement detected&apos;)
      ).toBeInTheDocument();
      expect(screen.queryByText(&apos;Low battery level&apos;)).not.toBeInTheDocument();
    });

    it(&apos;filters by severity&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const severitySelect = screen.getByDisplayValue(&apos;All Severities&apos;);
      fireEvent.click(severitySelect);
      fireEvent.click(screen.getByText(&apos;Critical&apos;));

      expect(
        screen.getByText(&apos;Unauthorized movement detected&apos;)
      ).toBeInTheDocument();
      expect(screen.queryByText(&apos;Low battery level&apos;)).not.toBeInTheDocument();
    });

    it(&apos;filters by status&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const statusSelect = screen.getByDisplayValue(&apos;All Statuses&apos;);
      fireEvent.click(statusSelect);
      fireEvent.click(screen.getByText(&apos;Active&apos;));

      expect(
        screen.getByText(&apos;Unauthorized movement detected&apos;)
      ).toBeInTheDocument();
      expect(screen.getByText(&apos;Low battery level&apos;)).toBeInTheDocument();
      expect(screen.queryByText(&apos;Inspection due&apos;)).not.toBeInTheDocument();
    });

    it(&apos;shows clear filters button when filters are active&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const searchInput = screen.getByPlaceholderText(&apos;Search alerts...&apos;);
      fireEvent.change(searchInput, { target: { value: &apos;test&apos; } });

      expect(screen.getByText(&apos;Clear All Filters&apos;)).toBeInTheDocument();
    });

    it(&apos;clears all filters when Clear All Filters button is clicked&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const searchInput = screen.getByPlaceholderText(&apos;Search alerts...&apos;);
      fireEvent.change(searchInput, { target: { value: &apos;test&apos; } });

      fireEvent.click(screen.getByText(&apos;Clear All Filters&apos;));

      expect(searchInput).toHaveValue(&apos;&apos;);
    });
  });

  describe(&apos;Grouping&apos;, () => {
    it(&apos;renders group by selector&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      expect(screen.getByDisplayValue(&apos;No Grouping&apos;)).toBeInTheDocument();
    });

    it(&apos;groups alerts by type when selected&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const groupSelect = screen.getByDisplayValue(&apos;No Grouping&apos;);
      fireEvent.click(groupSelect);
      fireEvent.click(screen.getByText(&apos;Group by Type&apos;));

      expect(screen.getByText(&apos;By Type&apos;)).toBeInTheDocument();
    });

    it(&apos;groups alerts by severity when selected&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const groupSelect = screen.getByDisplayValue(&apos;No Grouping&apos;);
      fireEvent.click(groupSelect);
      fireEvent.click(screen.getByText(&apos;Group by Severity&apos;));

      expect(screen.getByText(&apos;By Severity&apos;)).toBeInTheDocument();
    });

    it(&apos;groups alerts by asset when selected&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const groupSelect = screen.getByDisplayValue(&apos;No Grouping&apos;);
      fireEvent.click(groupSelect);
      fireEvent.click(screen.getByText(&apos;Group by Asset&apos;));

      expect(screen.getByText(&apos;By Asset&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Tab Navigation&apos;, () => {
    it(&apos;renders all tab options with correct counts&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      expect(screen.getByText(&apos;All Alerts (4)&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Active (2)&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Acknowledged (1)&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Resolved (1)&apos;)).toBeInTheDocument();
    });

    it(&apos;filters alerts when switching tabs&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      // Click on Active tab
      fireEvent.click(screen.getByText(&apos;Active (2)&apos;));

      // Should show only active alerts
      expect(
        screen.getByText(&apos;Unauthorized movement detected&apos;)
      ).toBeInTheDocument();
      expect(screen.getByText(&apos;Low battery level&apos;)).toBeInTheDocument();
      expect(screen.queryByText(&apos;Inspection due&apos;)).not.toBeInTheDocument();
    });
  });

  describe(&apos;Statistics Card Interactions&apos;, () => {
    it(&apos;filters alerts when clicking on Total Alerts card&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const totalCard = screen
        .getByText(&apos;Total Alerts&apos;)
        .closest(&apos;.cursor-pointer&apos;);
      if (totalCard) {
        fireEvent.click(totalCard);

        // Should show all alerts
        expect(
          screen.getByText(&apos;Unauthorized movement detected&apos;)
        ).toBeInTheDocument();
        expect(screen.getByText(&apos;Low battery level&apos;)).toBeInTheDocument();
        expect(screen.getByText(&apos;Inspection due&apos;)).toBeInTheDocument();
      }
    });

    it(&apos;filters alerts when clicking on Active card&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const activeCard = screen.getByText(&apos;Active&apos;).closest(&apos;.cursor-pointer&apos;);
      if (activeCard) {
        fireEvent.click(activeCard);

        // Should show only active alerts
        expect(
          screen.getByText(&apos;Unauthorized movement detected&apos;)
        ).toBeInTheDocument();
        expect(screen.getByText(&apos;Low battery level&apos;)).toBeInTheDocument();
        expect(screen.queryByText(&apos;Inspection due&apos;)).not.toBeInTheDocument();
      }
    });

    it(&apos;filters alerts when clicking on Critical card&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const criticalCard = screen
        .getByText(&apos;Critical&apos;)
        .closest(&apos;.cursor-pointer&apos;);
      if (criticalCard) {
        fireEvent.click(criticalCard);

        // Should show only critical alerts
        expect(
          screen.getByText(&apos;Unauthorized movement detected&apos;)
        ).toBeInTheDocument();
        expect(screen.queryByText(&apos;Low battery level&apos;)).not.toBeInTheDocument();
      }
    });
  });

  describe(&apos;User Interactions&apos;, () => {
    it(&apos;calls onNavigateToConfiguration when Configure Rules button is clicked&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      fireEvent.click(screen.getByText(&apos;Configure Rules&apos;));

      expect(mockOnNavigateToConfiguration).toHaveBeenCalled();
    });

    it(&apos;calls onTakeAction when Take Action button is clicked on an alert&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const takeActionButtons = screen.getAllByText(&apos;Take Action&apos;);
      if (takeActionButtons.length > 0) {
        fireEvent.click(takeActionButtons[0]);
        expect(mockOnTakeAction).toHaveBeenCalled();
      }
    });

    it(&apos;acknowledges alert when Acknowledge button is clicked&apos;, () => {
      const { toast } = require(&apos;sonner&apos;);

      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const acknowledgeButtons = screen.getAllByText(&apos;Acknowledge&apos;);
      if (acknowledgeButtons.length > 0) {
        fireEvent.click(acknowledgeButtons[0]);
        expect(toast.success).toHaveBeenCalledWith(&apos;Alert acknowledged&apos;);
      }
    });

    it(&apos;resolves alert when Resolve button is clicked&apos;, () => {
      const { toast } = require(&apos;sonner&apos;);

      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const resolveButtons = screen.getAllByText(&apos;Resolve&apos;);
      if (resolveButtons.length > 0) {
        fireEvent.click(resolveButtons[0]);
        expect(toast.success).toHaveBeenCalledWith(&apos;Alert resolved&apos;);
      }
    });
  });

  describe(&apos;Empty States&apos;, () => {
    it(&apos;shows no alerts found message when no alerts match filters&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const searchInput = screen.getByPlaceholderText(&apos;Search alerts...&apos;);
      fireEvent.change(searchInput, { target: { value: &apos;NonExistent&apos; } });

      expect(screen.getByText(&apos;No alerts found&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;User Preferences&apos;, () => {
    it(&apos;loads user preferences from localStorage&apos;, () => {
      const savedPrefs = {
        defaultView: &apos;active&apos;,
        groupBy: &apos;type&apos;,
        defaultSeverity: &apos;critical&apos;,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedPrefs));

      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(&apos;alertPreferences&apos;);
    });

    it(&apos;saves user preferences to localStorage when changed&apos;, () => {
      render(
        <Alerts
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const groupSelect = screen.getByDisplayValue(&apos;No Grouping&apos;);
      fireEvent.click(groupSelect);
      fireEvent.click(screen.getByText(&apos;Group by Type&apos;));

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        &apos;alertPreferences&apos;,
        expect.stringContaining(&apos;&quot;groupBy&quot;:&quot;type&quot;&apos;)
      );
    });
  });

  describe(&apos;Initial Filter Props&apos;, () => {
    it(&apos;applies initial filter when provided&apos;, () => {
      const initialFilter = {
        searchText: &apos;battery&apos;,
        category: &apos;battery&apos;,
        severity: &apos;warning&apos;,
        status: &apos;active&apos;,
      };

      render(
        <Alerts
          initialFilter={initialFilter}
          onTakeAction={mockOnTakeAction}
          onNavigateToConfiguration={mockOnNavigateToConfiguration}
        />
      );

      const searchInput = screen.getByPlaceholderText(&apos;Search alerts...&apos;);
      expect(searchInput).toHaveValue(&apos;battery&apos;);
    });
  });
});
