// import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sites } from '../sites/Sites';
import { render, createMockNavigation } from '../../test/test-utils';

// Mock the navigation context
vi.mock('../../contexts/NavigationContext', () => ({
  useNavigation: () => createMockNavigation(),
}));

// Mock the mock data
vi.mock('../../data/mockData', () => ({
  mockSites: [
    {
      id: 'ST-001',
      name: 'Main Warehouse',
      address: '123 Main St, Austin, TX 78701',
      location: '123 Main St, Austin, TX 78701',
      area: '500 ft radius',
      tolerance: 50,
      assets: 150,
      status: 'active',
      coordinates: { lat: 30.2672, lng: -97.7431, radius: 500 },
      manager: 'John Smith',
      phone: '(555) 123-4567',
      email: 'john@example.com',
    },
    {
      id: 'ST-002',
      name: 'Construction Site B',
      address: '456 Oak Ave, Dallas, TX 75201',
      location: '456 Oak Ave, Dallas, TX 75201',
      area: '300 ft radius',
      tolerance: 30,
      assets: 75,
      status: 'maintenance',
      coordinates: { lat: 32.7767, lng: -96.797, radius: 300 },
      manager: 'Jane Doe',
      phone: '(555) 987-6543',
      email: 'jane@example.com',
    },
    {
      id: 'ST-003',
      name: 'Remote Office',
      address: '789 Pine St, Houston, TX 77001',
      location: '789 Pine St, Houston, TX 77001',
      area: '200 ft radius',
      tolerance: 25,
      assets: 25,
      status: 'inactive',
      coordinates: { lat: 29.7604, lng: -95.3698, radius: 200 },
      manager: 'Bob Johnson',
      phone: '(555) 456-7890',
      email: 'bob@example.com',
    },
  ],
}));

describe('Sites Component', () => {
  const mockOnSiteClick = vi.fn();
  const mockNavigation = createMockNavigation();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Basic Functionality', () => {
    it('should render the sites page with header and stats', () => {
      render(<Sites onSiteClick={mockOnSiteClick} />);

      expect(screen.getByText('Sites')).toBeInTheDocument();
      expect(
        screen.getByText('Manage physical locations and boundaries')
      ).toBeInTheDocument();
      expect(screen.getByText('Total Sites')).toBeInTheDocument();
      expect(screen.getByText('Active Sites')).toBeInTheDocument();
      expect(screen.getByText('Total Assets')).toBeInTheDocument();
      expect(screen.getByText('Total Personnel')).toBeInTheDocument();
    });

    it('should render the Add Site button', () => {
      render(<Sites onSiteClick={mockOnSiteClick} />);

      const addButton = screen.getByRole('button', { name: /add site/i });
      expect(addButton).toBeInTheDocument();
    });

    it('should render the sites table with correct headers', () => {
      render(<Sites onSiteClick={mockOnSiteClick} />);

      expect(screen.getByText('Site Name')).toBeInTheDocument();
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByText('Boundary')).toBeInTheDocument();
      expect(screen.getByText('Tolerance')).toBeInTheDocument();
      expect(screen.getByText('Assets')).toBeInTheDocument();
      expect(screen.getByText('Personnel')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Last Activity')).toBeInTheDocument();
    });

    it('should render all mock sites in the table', () => {
      render(<Sites onSiteClick={mockOnSiteClick} />);

      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
      expect(screen.getByText('Construction Site B')).toBeInTheDocument();
      expect(screen.getByText('Remote Office')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter sites by name when searching', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      const searchInput = screen.getByPlaceholderText(/search by site name/i);
      await user.type(searchInput, 'Main');

      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
      expect(screen.queryByText('Construction Site B')).not.toBeInTheDocument();
      expect(screen.queryByText('Remote Office')).not.toBeInTheDocument();
    });

    it('should filter sites by ID when searching', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      const searchInput = screen.getByPlaceholderText(/search by site name/i);
      await user.type(searchInput, 'ST-002');

      expect(screen.getByText('Construction Site B')).toBeInTheDocument();
      expect(screen.queryByText('Main Warehouse')).not.toBeInTheDocument();
      expect(screen.queryByText('Remote Office')).not.toBeInTheDocument();
    });

    it('should filter sites by address when searching', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      const searchInput = screen.getByPlaceholderText(/search by site name/i);
      await user.type(searchInput, 'Austin');

      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
      expect(screen.queryByText('Construction Site B')).not.toBeInTheDocument();
      expect(screen.queryByText('Remote Office')).not.toBeInTheDocument();
    });

    it('should show all sites when search is cleared', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      const searchInput = screen.getByPlaceholderText(/search by site name/i);
      await user.type(searchInput, 'Main');
      await user.clear(searchInput);

      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
      expect(screen.getByText('Construction Site B')).toBeInTheDocument();
      expect(screen.getByText('Remote Office')).toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    it('should show and hide filters when filter button is clicked', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      const filterButton = screen.getByRole('button', { name: /filters/i });

      // Initially filters should be hidden
      expect(screen.queryByText('Filter Sites')).not.toBeInTheDocument();

      // Click to show filters
      await user.click(filterButton);
      expect(screen.getByText('Filter Sites')).toBeInTheDocument();

      // Click to hide filters
      await user.click(filterButton);
      expect(screen.queryByText('Filter Sites')).not.toBeInTheDocument();
    });

    it('should filter sites by status', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      // Show filters
      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      // Filter by active status
      const statusSelect = screen.getByRole('combobox');
      await user.click(statusSelect);
      await user.click(screen.getByText('Active'));

      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
      expect(screen.queryByText('Construction Site B')).not.toBeInTheDocument();
      expect(screen.queryByText('Remote Office')).not.toBeInTheDocument();
    });

    it('should filter sites by state', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      // Show filters
      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      // Filter by Texas
      const stateSelect = screen.getByRole('combobox', { name: /state/i });
      await user.click(stateSelect);
      await user.click(screen.getByText('Texas (TX)'));

      // All sites should be visible since they're all in Texas
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
      expect(screen.getByText('Construction Site B')).toBeInTheDocument();
      expect(screen.getByText('Remote Office')).toBeInTheDocument();
    });

    it('should filter sites by asset count range', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      // Show filters
      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      // Filter by 0-100 assets
      const assetSelect = screen.getByRole('combobox', {
        name: /asset count/i,
      });
      await user.click(assetSelect);
      await user.click(screen.getByText('0 - 100'));

      expect(screen.getByText('Construction Site B')).toBeInTheDocument();
      expect(screen.getByText('Remote Office')).toBeInTheDocument();
      expect(screen.queryByText('Main Warehouse')).not.toBeInTheDocument(); // 150 assets
    });

    it('should show active filter count badge', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      // Show filters
      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      // Apply a filter
      const statusSelect = screen.getByRole('combobox');
      await user.click(statusSelect);
      await user.click(screen.getByText('Active'));

      // Should show filter count badge
      expect(screen.getByText('1')).toBeInTheDocument(); // Badge showing 1 active filter
    });

    it('should clear all filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      // Show filters and apply some
      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      const statusSelect = screen.getByRole('combobox');
      await user.click(statusSelect);
      await user.click(screen.getByText('Active'));

      // Clear all filters
      const clearButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearButton);

      // All sites should be visible again
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
      expect(screen.getByText('Construction Site B')).toBeInTheDocument();
      expect(screen.getByText('Remote Office')).toBeInTheDocument();
    });
  });

  describe('Site Interaction', () => {
    it('should call onSiteClick when a site row is clicked', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      const siteRow = screen.getByText('Main Warehouse').closest('tr');
      await user.click(siteRow!);

      expect(mockOnSiteClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'ST-001',
          name: 'Main Warehouse',
        })
      );
    });

    it('should show dropdown menu when more actions button is clicked', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      const moreButton = screen.getAllByRole('button', { name: '' })[0]; // First more button
      await user.click(moreButton);

      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('View Details')).toBeInTheDocument();
      expect(screen.getByText('Edit Site')).toBeInTheDocument();
      expect(screen.getByText('View Assets')).toBeInTheDocument();
      expect(screen.getByText('View on Map')).toBeInTheDocument();
      expect(screen.getByText('Deactivate Site')).toBeInTheDocument();
    });

    it('should call onSiteClick when View Details is clicked from dropdown', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      const moreButton = screen.getAllByRole('button', { name: '' })[0];
      await user.click(moreButton);

      const viewDetailsButton = screen.getByText('View Details');
      await user.click(viewDetailsButton);

      expect(mockOnSiteClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'ST-001',
          name: 'Main Warehouse',
        })
      );
    });
  });

  describe('Pagination', () => {
    it('should render pagination controls', () => {
      render(<Sites onSiteClick={mockOnSiteClick} />);

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('should show correct count of filtered sites', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      const searchInput = screen.getByPlaceholderText(/search by site name/i);
      await user.type(searchInput, 'Main');

      expect(screen.getByText('Showing 1 of 3 sites')).toBeInTheDocument();
    });
  });

  describe('Navigation Integration', () => {
    it('should call navigateToCreateSite when Add Site button is clicked', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      const addButton = screen.getByRole('button', { name: /add site/i });
      await user.click(addButton);

      expect(mockNavigation.navigateToCreateSite).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles for all interactive elements', () => {
      render(<Sites onSiteClick={mockOnSiteClick} />);

      // Check search input
      const searchInput = screen.getByPlaceholderText(/search by site name/i);
      expect(searchInput).toBeInTheDocument();

      // Check filter button
      const filterButton = screen.getByRole('button', { name: /filters/i });
      expect(filterButton).toBeInTheDocument();

      // Check table headers
      const tableHeaders = screen.getAllByRole('columnheader');
      expect(tableHeaders.length).toBeGreaterThan(0);

      // Check table rows
      const tableRows = screen.getAllByRole('row');
      expect(tableRows.length).toBeGreaterThan(1); // Header + data rows
    });

    it('should maintain keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByPlaceholderText(/search by site name, id, or location/i)
      );

      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: /filters/i })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle empty search results gracefully', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      const searchInput = screen.getByPlaceholderText(/search by site name/i);
      await user.type(searchInput, 'NonExistentSite');

      // Should show 0 results
      expect(screen.getByText('Showing 0 of 3 sites')).toBeInTheDocument();
    });

    it('should handle multiple filter combinations', async () => {
      const user = userEvent.setup();
      render(<Sites onSiteClick={mockOnSiteClick} />);

      // Show filters
      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      // Apply multiple filters
      const statusSelect = screen.getByRole('combobox');
      await user.click(statusSelect);
      await user.click(screen.getByText('Active'));

      const assetSelect = screen.getByRole('combobox', {
        name: /asset count/i,
      });
      await user.click(assetSelect);
      await user.click(screen.getByText('101 - 500'));

      // Should show filter count badge with 2
      expect(screen.getByText('2')).toBeInTheDocument();

      // Should show only Main Warehouse (active and 150 assets)
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
      expect(screen.queryByText('Construction Site B')).not.toBeInTheDocument();
      expect(screen.queryByText('Remote Office')).not.toBeInTheDocument();
    });
  });
});
