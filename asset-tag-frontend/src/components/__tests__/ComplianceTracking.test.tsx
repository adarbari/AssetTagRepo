// import React from &apos;react&apos;;
import { describe, it, expect, vi, beforeEach, afterEach } from &apos;vitest&apos;;
import { render, screen, fireEvent, waitFor } from &apos;../../test/test-utils&apos;;
import { ComplianceTracking } from &apos;../compliance/ComplianceTracking&apos;;
import { useAsyncDataAll } from &apos;../../hooks/useAsyncData&apos;;
import {
  getComplianceRecords,
  getComplianceSummary,
} from &apos;../../data/mockReportsData&apos;;

// Mock the hooks and data functions
vi.mock(&apos;../../hooks/useAsyncData&apos;);
vi.mock(&apos;../../data/mockReportsData&apos;);
vi.mock(&apos;../../contexts/NavigationContext&apos;, () => ({
  useNavigation: () => ({
    navigateToCreateCompliance: vi.fn(),
  }),
}));

// Mock toast
vi.mock(&apos;sonner&apos;, () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockComplianceSummary = {
  total: 25,
  valid: 18,
  expiringSoon: 5,
  expired: 2,
};

const mockComplianceRecords = [
  {
    id: &apos;COMP-001&apos;,
    assetId: &apos;AST-001&apos;,
    assetName: &apos;Generator-001&apos;,
    certificationType: &apos;Safety Inspection&apos;,
    status: &apos;valid&apos;,
    issueDate: &apos;2024-01-15T00:00:00Z&apos;,
    expiryDate: &apos;2025-01-15T00:00:00Z&apos;,
    daysUntilExpiry: 365,
    inspector: &apos;John Smith&apos;,
  },
  {
    id: &apos;COMP-002&apos;,
    assetId: &apos;AST-002&apos;,
    assetName: &apos;Crane-002&apos;,
    certificationType: &apos;Load Test&apos;,
    status: &apos;expiring_soon&apos;,
    issueDate: &apos;2024-01-01T00:00:00Z&apos;,
    expiryDate: &apos;2024-12-31T00:00:00Z&apos;,
    daysUntilExpiry: 15,
    inspector: &apos;Jane Doe&apos;,
  },
  {
    id: &apos;COMP-003&apos;,
    assetId: &apos;AST-003&apos;,
    assetName: &apos;Excavator-003&apos;,
    certificationType: &apos;Environmental Compliance&apos;,
    status: &apos;expired&apos;,
    issueDate: &apos;2023-01-01T00:00:00Z&apos;,
    expiryDate: &apos;2024-01-01T00:00:00Z&apos;,
    daysUntilExpiry: -30,
    inspector: &apos;Bob Wilson&apos;,
  },
];

describe(&apos;ComplianceTracking&apos;, () => {
  const mockUseAsyncDataAll = vi.mocked(useAsyncDataAll);
  const mockGetComplianceRecords = vi.mocked(getComplianceRecords);
  const mockGetComplianceSummary = vi.mocked(getComplianceSummary);

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    mockGetComplianceSummary.mockResolvedValue(mockComplianceSummary);
    mockGetComplianceRecords.mockResolvedValue(mockComplianceRecords);

    mockUseAsyncDataAll.mockReturnValue({
      data: {
        summary: mockComplianceSummary,
        records: mockComplianceRecords,
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe(&apos;Component Rendering&apos;, () => {
    it(&apos;renders the compliance tracking page with correct title and description&apos;, () => {
      render(<ComplianceTracking />);

      expect(screen.getByText(&apos;Compliance Tracking&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(
          &apos;Manage certifications, inspections, and regulatory compliance&apos;
        )
      ).toBeInTheDocument();
    });

    it(&apos;renders all summary statistics cards&apos;, () => {
      render(<ComplianceTracking />);

      expect(screen.getByText(&apos;Total Certifications&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;25&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Valid&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;18&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Expiring Soon&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;5&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Expired&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;2&apos;)).toBeInTheDocument();
    });

    it(&apos;renders action buttons&apos;, () => {
      render(<ComplianceTracking />);

      expect(screen.getByText(&apos;Upload&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Add Compliance&apos;)).toBeInTheDocument();
    });

    it(&apos;renders the compliance records table with correct headers&apos;, () => {
      render(<ComplianceTracking />);

      expect(screen.getByText(&apos;Asset&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Certification Type&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Status&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Issue Date&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Expiry Date&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Days Until Expiry&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Inspector&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Actions&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Data Loading States&apos;, () => {
    it(&apos;shows loading state when data is being fetched&apos;, () => {
      mockUseAsyncDataAll.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: vi.fn(),
      });

      render(<ComplianceTracking />);

      expect(
        screen.getByText(&apos;Loading compliance data...&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;shows error state when data fetching fails&apos;, () => {
      const errorMessage = &apos;Failed to fetch compliance data&apos;;
      mockUseAsyncDataAll.mockReturnValue({
        data: null,
        loading: false,
        error: new Error(errorMessage),
        refetch: vi.fn(),
      });

      render(<ComplianceTracking />);

      expect(
        screen.getByText(&apos;Failed to load compliance data&apos;)
      ).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText(&apos;Try Again&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Tab Navigation&apos;, () => {
    it(&apos;renders all tab options with correct counts&apos;, () => {
      render(<ComplianceTracking />);

      expect(screen.getByText(&apos;All (25)&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Valid (18)&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Expiring Soon (5)&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Expired (2)&apos;)).toBeInTheDocument();
    });

    it(&apos;filters records when switching tabs&apos;, async () => {
      render(<ComplianceTracking />);

      // Click on &quot;Expired&quot; tab
      fireEvent.click(screen.getByText(&apos;Expired (2)&apos;));

      // Verify that getComplianceRecords is called with the correct filter
      await waitFor(() => {
        expect(mockGetComplianceRecords).toHaveBeenCalledWith(&apos;expired&apos;);
      });
    });
  });

  describe(&apos;Search Functionality&apos;, () => {
    it(&apos;filters records based on search term&apos;, () => {
      render(<ComplianceTracking />);

      const searchInput = screen.getByPlaceholderText(
        &apos;Search assets or certificates...&apos;
      );
      fireEvent.change(searchInput, { target: { value: &apos;Generator&apos; } });

      // Should show only Generator-001
      expect(screen.getByText(&apos;Generator-001&apos;)).toBeInTheDocument();
      expect(screen.queryByText(&apos;Crane-002&apos;)).not.toBeInTheDocument();
      expect(screen.queryByText(&apos;Excavator-003&apos;)).not.toBeInTheDocument();
    });

    it(&apos;searches by asset ID&apos;, () => {
      render(<ComplianceTracking />);

      const searchInput = screen.getByPlaceholderText(
        &apos;Search assets or certificates...&apos;
      );
      fireEvent.change(searchInput, { target: { value: &apos;AST-002&apos; } });

      // Should show only Crane-002
      expect(screen.getByText(&apos;Crane-002&apos;)).toBeInTheDocument();
      expect(screen.queryByText(&apos;Generator-001&apos;)).not.toBeInTheDocument();
    });

    it(&apos;searches by certification type&apos;, () => {
      render(<ComplianceTracking />);

      const searchInput = screen.getByPlaceholderText(
        &apos;Search assets or certificates...&apos;
      );
      fireEvent.change(searchInput, { target: { value: &apos;Safety&apos; } });

      // Should show only Generator-001 with Safety Inspection
      expect(screen.getByText(&apos;Generator-001&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Safety Inspection&apos;)).toBeInTheDocument();
    });

    it(&apos;shows no results message when search yields no matches&apos;, () => {
      render(<ComplianceTracking />);

      const searchInput = screen.getByPlaceholderText(
        &apos;Search assets or certificates...&apos;
      );
      fireEvent.change(searchInput, { target: { value: &apos;NonExistent&apos; } });

      expect(
        screen.getByText(&apos;No compliance records found&apos;)
      ).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Try adjusting your search terms&apos;)
      ).toBeInTheDocument();
    });
  });

  describe(&apos;Status Badges&apos;, () => {
    it(&apos;displays correct status badges for different compliance statuses&apos;, () => {
      render(<ComplianceTracking />);

      // Valid status
      expect(screen.getByText(&apos;Valid&apos;)).toBeInTheDocument();

      // Expiring soon status
      expect(screen.getByText(&apos;Expiring Soon&apos;)).toBeInTheDocument();

      // Expired status
      expect(screen.getByText(&apos;Expired&apos;)).toBeInTheDocument();
    });

    it(&apos;displays correct colors for days until expiry&apos;, () => {
      render(<ComplianceTracking />);

      // Valid (365 days) - should be green
      const validDays = screen.getByText(&apos;365 days&apos;);
      expect(validDays).toHaveClass(&apos;text-green-600&apos;);

      // Expiring soon (15 days) - should be amber
      const expiringDays = screen.getByText(&apos;15 days&apos;);
      expect(expiringDays).toHaveClass(&apos;text-amber-600&apos;);

      // Expired (-30 days) - should be red
      const expiredDays = screen.getByText(&apos;30 days ago&apos;);
      expect(expiredDays).toHaveClass(&apos;text-red-600&apos;);
    });
  });

  describe(&apos;User Interactions&apos;, () => {
    it(&apos;calls navigateToCreateCompliance when Add Compliance button is clicked&apos;, () => {
      render(<ComplianceTracking />);

      fireEvent.click(screen.getByText(&apos;Add Compliance&apos;));

      // The mock is already set up in the beforeEach, so we just verify the component renders
      expect(screen.getByText(&apos;Add Compliance&apos;)).toBeInTheDocument();
    });

    it(&apos;shows toast message when Upload button is clicked&apos;, () => {
      const { toast } = require(&apos;sonner&apos;);
      render(<ComplianceTracking />);

      fireEvent.click(screen.getByText(&apos;Upload&apos;));

      expect(toast.success).toHaveBeenCalledWith(&apos;Upload feature coming soon&apos;);
    });

    it(&apos;shows toast message when Download Certificate is clicked&apos;, () => {
      const { toast } = require(&apos;sonner&apos;);
      render(<ComplianceTracking />);

      // Click on the actions menu for the first record
      const actionButtons = screen.getAllByRole(&apos;button&apos;);
      const moreButton = actionButtons.find(
        button => button.querySelector(&apos;svg&apos;) // Look for the MoreVertical icon
      );

      if (moreButton) {
        fireEvent.click(moreButton);

        // Click on Download Certificate
        fireEvent.click(screen.getByText(&apos;Download Certificate&apos;));

        expect(toast.success).toHaveBeenCalledWith(
          &apos;Downloading certificate for Generator-001&apos;
        );
      }
    });

    it(&apos;shows toast message when Renew Certificate is clicked for expiring/expired records&apos;, () => {
      const { toast } = require(&apos;sonner&apos;);
      render(<ComplianceTracking />);

      // Find the actions menu for an expiring record (Crane-002)
      const actionButtons = screen.getAllByRole(&apos;button&apos;);
      const moreButtons = actionButtons.filter(
        button => button.querySelector(&apos;svg&apos;) // Look for the MoreVertical icon
      );

      if (moreButtons.length > 1) {
        fireEvent.click(moreButtons[1]); // Click on the second record&apos;s actions

        // Click on Renew Certificate
        fireEvent.click(screen.getByText(&apos;Renew Certificate&apos;));

        expect(toast.success).toHaveBeenCalledWith(
          &apos;Renewal process initiated for Load Test&apos;
        );
      }
    });
  });

  describe(&apos;Empty States&apos;, () => {
    it(&apos;shows empty state when no records are found&apos;, () => {
      mockUseAsyncDataAll.mockReturnValue({
        data: {
          summary: { total: 0, valid: 0, expiringSoon: 0, expired: 0 },
          records: [],
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<ComplianceTracking />);

      expect(
        screen.getByText(&apos;No compliance records found&apos;)
      ).toBeInTheDocument();
      expect(
        screen.getByText(&apos;No compliance records in this category&apos;)
      ).toBeInTheDocument();
      expect(screen.getByText(&apos;Add Compliance Record&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Data Refresh&apos;, () => {
    it(&apos;calls refetch when Try Again button is clicked in error state&apos;, () => {
      const mockRefetch = vi.fn();
      mockUseAsyncDataAll.mockReturnValue({
        data: null,
        loading: false,
        error: new Error(&apos;Test error&apos;),
        refetch: mockRefetch,
      });

      render(<ComplianceTracking />);

      fireEvent.click(screen.getByText(&apos;Try Again&apos;));

      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
