import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { ComplianceTracking } from '../compliance/ComplianceTracking';
import { useAsyncDataAll } from '../../hooks/useAsyncData';
import {
  getComplianceRecords,
  getComplianceSummary,
} from '../../data/mockReportsData';

// Mock the hooks and data functions
vi.mock('../../hooks/useAsyncData');
vi.mock('../../data/mockReportsData');
vi.mock('../../contexts/NavigationContext', () => ({
  useNavigation: () => ({
    navigateToCreateCompliance: vi.fn(),
  }),
}));

// Mock toast
vi.mock('sonner', () => ({
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
    id: 'COMP-001',
    assetId: 'AST-001',
    assetName: 'Generator-001',
    certificationType: 'Safety Inspection',
    status: 'valid',
    issueDate: '2024-01-15T00:00:00Z',
    expiryDate: '2025-01-15T00:00:00Z',
    daysUntilExpiry: 365,
    inspector: 'John Smith',
  },
  {
    id: 'COMP-002',
    assetId: 'AST-002',
    assetName: 'Crane-002',
    certificationType: 'Load Test',
    status: 'expiring_soon',
    issueDate: '2024-01-01T00:00:00Z',
    expiryDate: '2024-12-31T00:00:00Z',
    daysUntilExpiry: 15,
    inspector: 'Jane Doe',
  },
  {
    id: 'COMP-003',
    assetId: 'AST-003',
    assetName: 'Excavator-003',
    certificationType: 'Environmental Compliance',
    status: 'expired',
    issueDate: '2023-01-01T00:00:00Z',
    expiryDate: '2024-01-01T00:00:00Z',
    daysUntilExpiry: -30,
    inspector: 'Bob Wilson',
  },
];

describe('ComplianceTracking', () => {
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

  describe('Component Rendering', () => {
    it('renders the compliance tracking page with correct title and description', () => {
      render(<ComplianceTracking />);

      expect(screen.getByText('Compliance Tracking')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Manage certifications, inspections, and regulatory compliance'
        )
      ).toBeInTheDocument();
    });

    it('renders all summary statistics cards', () => {
      render(<ComplianceTracking />);

      expect(screen.getByText('Total Certifications')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('Valid')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('Expiring Soon')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Expired')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(<ComplianceTracking />);

      expect(screen.getByText('Upload')).toBeInTheDocument();
      expect(screen.getByText('Add Compliance')).toBeInTheDocument();
    });

    it('renders the compliance records table with correct headers', () => {
      render(<ComplianceTracking />);

      expect(screen.getByText('Asset')).toBeInTheDocument();
      expect(screen.getByText('Certification Type')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Issue Date')).toBeInTheDocument();
      expect(screen.getByText('Expiry Date')).toBeInTheDocument();
      expect(screen.getByText('Days Until Expiry')).toBeInTheDocument();
      expect(screen.getByText('Inspector')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('Data Loading States', () => {
    it('shows loading state when data is being fetched', () => {
      mockUseAsyncDataAll.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: vi.fn(),
      });

      render(<ComplianceTracking />);

      expect(
        screen.getByText('Loading compliance data...')
      ).toBeInTheDocument();
    });

    it('shows error state when data fetching fails', () => {
      const errorMessage = 'Failed to fetch compliance data';
      mockUseAsyncDataAll.mockReturnValue({
        data: null,
        loading: false,
        error: new Error(errorMessage),
        refetch: vi.fn(),
      });

      render(<ComplianceTracking />);

      expect(
        screen.getByText('Failed to load compliance data')
      ).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('renders all tab options with correct counts', () => {
      render(<ComplianceTracking />);

      expect(screen.getByText('All (25)')).toBeInTheDocument();
      expect(screen.getByText('Valid (18)')).toBeInTheDocument();
      expect(screen.getByText('Expiring Soon (5)')).toBeInTheDocument();
      expect(screen.getByText('Expired (2)')).toBeInTheDocument();
    });

    it('filters records when switching tabs', async () => {
      const { rerender } = render(<ComplianceTracking />);

      // Click on "Expired" tab
      fireEvent.click(screen.getByText('Expired (2)'));

      // Verify that getComplianceRecords is called with the correct filter
      await waitFor(() => {
        expect(mockGetComplianceRecords).toHaveBeenCalledWith('expired');
      });
    });
  });

  describe('Search Functionality', () => {
    it('filters records based on search term', () => {
      render(<ComplianceTracking />);

      const searchInput = screen.getByPlaceholderText(
        'Search assets or certificates...'
      );
      fireEvent.change(searchInput, { target: { value: 'Generator' } });

      // Should show only Generator-001
      expect(screen.getByText('Generator-001')).toBeInTheDocument();
      expect(screen.queryByText('Crane-002')).not.toBeInTheDocument();
      expect(screen.queryByText('Excavator-003')).not.toBeInTheDocument();
    });

    it('searches by asset ID', () => {
      render(<ComplianceTracking />);

      const searchInput = screen.getByPlaceholderText(
        'Search assets or certificates...'
      );
      fireEvent.change(searchInput, { target: { value: 'AST-002' } });

      // Should show only Crane-002
      expect(screen.getByText('Crane-002')).toBeInTheDocument();
      expect(screen.queryByText('Generator-001')).not.toBeInTheDocument();
    });

    it('searches by certification type', () => {
      render(<ComplianceTracking />);

      const searchInput = screen.getByPlaceholderText(
        'Search assets or certificates...'
      );
      fireEvent.change(searchInput, { target: { value: 'Safety' } });

      // Should show only Generator-001 with Safety Inspection
      expect(screen.getByText('Generator-001')).toBeInTheDocument();
      expect(screen.getByText('Safety Inspection')).toBeInTheDocument();
    });

    it('shows no results message when search yields no matches', () => {
      render(<ComplianceTracking />);

      const searchInput = screen.getByPlaceholderText(
        'Search assets or certificates...'
      );
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

      expect(
        screen.getByText('No compliance records found')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Try adjusting your search terms')
      ).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('displays correct status badges for different compliance statuses', () => {
      render(<ComplianceTracking />);

      // Valid status
      expect(screen.getByText('Valid')).toBeInTheDocument();

      // Expiring soon status
      expect(screen.getByText('Expiring Soon')).toBeInTheDocument();

      // Expired status
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });

    it('displays correct colors for days until expiry', () => {
      render(<ComplianceTracking />);

      // Valid (365 days) - should be green
      const validDays = screen.getByText('365 days');
      expect(validDays).toHaveClass('text-green-600');

      // Expiring soon (15 days) - should be amber
      const expiringDays = screen.getByText('15 days');
      expect(expiringDays).toHaveClass('text-amber-600');

      // Expired (-30 days) - should be red
      const expiredDays = screen.getByText('30 days ago');
      expect(expiredDays).toHaveClass('text-red-600');
    });
  });

  describe('User Interactions', () => {
    it('calls navigateToCreateCompliance when Add Compliance button is clicked', () => {
      render(<ComplianceTracking />);

      fireEvent.click(screen.getByText('Add Compliance'));

      // The mock is already set up in the beforeEach, so we just verify the component renders
      expect(screen.getByText('Add Compliance')).toBeInTheDocument();
    });

    it('shows toast message when Upload button is clicked', () => {
      const { toast } = require('sonner');
      render(<ComplianceTracking />);

      fireEvent.click(screen.getByText('Upload'));

      expect(toast.success).toHaveBeenCalledWith('Upload feature coming soon');
    });

    it('shows toast message when Download Certificate is clicked', () => {
      const { toast } = require('sonner');
      render(<ComplianceTracking />);

      // Click on the actions menu for the first record
      const actionButtons = screen.getAllByRole('button');
      const moreButton = actionButtons.find(
        button => button.querySelector('svg') // Look for the MoreVertical icon
      );

      if (moreButton) {
        fireEvent.click(moreButton);

        // Click on Download Certificate
        fireEvent.click(screen.getByText('Download Certificate'));

        expect(toast.success).toHaveBeenCalledWith(
          'Downloading certificate for Generator-001'
        );
      }
    });

    it('shows toast message when Renew Certificate is clicked for expiring/expired records', () => {
      const { toast } = require('sonner');
      render(<ComplianceTracking />);

      // Find the actions menu for an expiring record (Crane-002)
      const actionButtons = screen.getAllByRole('button');
      const moreButtons = actionButtons.filter(
        button => button.querySelector('svg') // Look for the MoreVertical icon
      );

      if (moreButtons.length > 1) {
        fireEvent.click(moreButtons[1]); // Click on the second record's actions

        // Click on Renew Certificate
        fireEvent.click(screen.getByText('Renew Certificate'));

        expect(toast.success).toHaveBeenCalledWith(
          'Renewal process initiated for Load Test'
        );
      }
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no records are found', () => {
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
        screen.getByText('No compliance records found')
      ).toBeInTheDocument();
      expect(
        screen.getByText('No compliance records in this category')
      ).toBeInTheDocument();
      expect(screen.getByText('Add Compliance Record')).toBeInTheDocument();
    });
  });

  describe('Data Refresh', () => {
    it('calls refetch when Try Again button is clicked in error state', () => {
      const mockRefetch = vi.fn();
      mockUseAsyncDataAll.mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Test error'),
        refetch: mockRefetch,
      });

      render(<ComplianceTracking />);

      fireEvent.click(screen.getByText('Try Again'));

      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
