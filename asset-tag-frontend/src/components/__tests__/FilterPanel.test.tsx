import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FilterPanel, type FilterConfig } from '../common/FilterPanel';

describe('FilterPanel Component', () => {
  const mockFilters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
      currentValue: 'all',
      onValueChange: vi.fn(),
    },
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'equipment', label: 'Equipment' },
        { value: 'vehicle', label: 'Vehicle' },
      ],
      currentValue: 'equipment',
      onValueChange: vi.fn(),
    },
  ];

  const defaultProps = {
    filters: mockFilters,
    activeFiltersCount: 0,
    onClearAllFilters: vi.fn(),
    showFilters: false,
    onShowFiltersChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render filter button', () => {
      render(<FilterPanel {...defaultProps} />);

      const filterButton = screen.getByRole('button');
      expect(filterButton).toBeInTheDocument();
    });

    it('should show active filters count badge', () => {
      render(<FilterPanel {...defaultProps} activeFiltersCount={3} />);

      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('should not show badge when no active filters', () => {
      render(<FilterPanel {...defaultProps} activeFiltersCount={0} />);

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('Filter Popover', () => {
    it('should open popover when filter button is clicked', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} />);

      const filterButton = screen.getByRole('button');
      await user.click(filterButton);

      expect(defaultProps.onShowFiltersChange).toHaveBeenCalledWith(true);
    });

    it('should render filter options when popover is open', () => {
      render(<FilterPanel {...defaultProps} showFilters={true} />);

      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
    });

    it('should render filter labels and select triggers', () => {
      render(<FilterPanel {...defaultProps} showFilters={true} />);

      // Check that filter labels are rendered
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();

      // Check that select triggers are rendered with current values
      expect(screen.getByText('All Status')).toBeInTheDocument();
      expect(screen.getByText('Equipment')).toBeInTheDocument();
    });

    it('should show clear all button when filters are active', () => {
      render(
        <FilterPanel
          {...defaultProps}
          showFilters={true}
          activeFiltersCount={2}
        />
      );

      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should not show clear all button when no filters are active', () => {
      render(
        <FilterPanel
          {...defaultProps}
          showFilters={true}
          activeFiltersCount={0}
        />
      );

      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });
  });

  describe('Filter Interactions', () => {
    it('should render select components with proper accessibility', () => {
      render(<FilterPanel {...defaultProps} showFilters={true} />);

      // Check that select components are rendered with proper roles
      const statusSelect = screen.getByRole('combobox', { name: 'Status' });
      const typeSelect = screen.getByRole('combobox', { name: 'Type' });

      expect(statusSelect).toBeInTheDocument();
      expect(typeSelect).toBeInTheDocument();
    });

    it('should call onClearAllFilters when clear all button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FilterPanel
          {...defaultProps}
          showFilters={true}
          activeFiltersCount={2}
        />
      );

      const clearAllButton = screen.getByText('Clear All');
      await user.click(clearAllButton);

      expect(defaultProps.onClearAllFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe('Active Filter Badges', () => {
    it('should show active filter badges', () => {
      render(<FilterPanel {...defaultProps} activeFiltersCount={1} />);

      expect(screen.getByText('Active filters:')).toBeInTheDocument();
    });

    it('should not show active filter badges when no filters are active', () => {
      render(<FilterPanel {...defaultProps} activeFiltersCount={0} />);

      expect(screen.queryByText('Active filters:')).not.toBeInTheDocument();
    });

    it('should show search term badge when provided', () => {
      render(
        <FilterPanel
          {...defaultProps}
          activeFiltersCount={1}
          searchTerm='test search'
          onClearSearch={vi.fn()}
        />
      );

      expect(screen.getByText('Search: test search')).toBeInTheDocument();
    });

    it('should show individual filter badges for non-default values', () => {
      const filtersWithActiveValues: FilterConfig[] = [
        {
          ...mockFilters[0],
          currentValue: 'active',
          defaultOptionValue: 'all',
        },
        {
          ...mockFilters[1],
          currentValue: 'equipment',
          defaultOptionValue: 'all',
        },
      ];

      render(
        <FilterPanel
          {...defaultProps}
          filters={filtersWithActiveValues}
          activeFiltersCount={2}
        />
      );

      expect(screen.getByText('Status: Active')).toBeInTheDocument();
      expect(screen.getByText('Type: Equipment')).toBeInTheDocument();
    });

    it('should not show badges for default values', () => {
      const filtersWithDefaultValues: FilterConfig[] = [
        {
          ...mockFilters[0],
          currentValue: 'all',
          defaultOptionValue: 'all',
        },
      ];

      render(
        <FilterPanel
          {...defaultProps}
          filters={filtersWithDefaultValues}
          activeFiltersCount={0}
        />
      );

      expect(screen.queryByText('Status: All Status')).not.toBeInTheDocument();
    });
  });

  describe('Badge Interactions', () => {
    it('should call onClearSearch when search badge X is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClearSearch = vi.fn();

      render(
        <FilterPanel
          {...defaultProps}
          activeFiltersCount={1}
          searchTerm='test'
          onClearSearch={mockOnClearSearch}
        />
      );

      const searchBadge = screen.getByText('Search: test');
      const xButton = searchBadge.parentElement?.querySelector('svg');
      expect(xButton).toBeInTheDocument();

      await user.click(xButton!);
      expect(mockOnClearSearch).toHaveBeenCalledTimes(1);
    });

    it('should call onValueChange when filter badge X is clicked', async () => {
      const user = userEvent.setup();
      const filtersWithActiveValues: FilterConfig[] = [
        {
          ...mockFilters[0],
          currentValue: 'active',
          defaultOptionValue: 'all',
        },
      ];

      render(
        <FilterPanel
          {...defaultProps}
          filters={filtersWithActiveValues}
          activeFiltersCount={1}
        />
      );

      const statusBadge = screen.getByText('Status: Active');
      const xButton = statusBadge.parentElement?.querySelector('svg');
      expect(xButton).toBeInTheDocument();

      await user.click(xButton!);
      expect(filtersWithActiveValues[0].onValueChange).toHaveBeenCalledWith(
        'all'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty filters array', () => {
      render(<FilterPanel {...defaultProps} filters={[]} showFilters={true} />);

      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
      expect(screen.queryByText('Status')).not.toBeInTheDocument();
    });

    it('should handle filters without defaultOptionValue', () => {
      const filtersWithoutDefault: FilterConfig[] = [
        {
          ...mockFilters[0],
          currentValue: 'active',
          // no defaultOptionValue
        },
      ];

      render(
        <FilterPanel
          {...defaultProps}
          filters={filtersWithoutDefault}
          activeFiltersCount={1}
        />
      );

      expect(screen.getByText('Status: Active')).toBeInTheDocument();
    });

    it('should handle missing option labels gracefully', () => {
      const filtersWithMissingLabels: FilterConfig[] = [
        {
          ...mockFilters[0],
          options: [
            { value: 'active', label: 'Active' },
            { value: 'unknown', label: undefined as any },
          ],
          currentValue: 'unknown',
          defaultOptionValue: 'active',
        },
      ];

      render(
        <FilterPanel
          {...defaultProps}
          filters={filtersWithMissingLabels}
          activeFiltersCount={1}
        />
      );

      expect(screen.getByText('Status: unknown')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button role', () => {
      render(<FilterPanel {...defaultProps} />);

      const filterButton = screen.getByRole('button');
      expect(filterButton).toBeInTheDocument();
    });

    it('should have proper labels for filter selects', () => {
      render(<FilterPanel {...defaultProps} showFilters={true} />);

      expect(screen.getByLabelText('Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Type')).toBeInTheDocument();
    });
  });
});
