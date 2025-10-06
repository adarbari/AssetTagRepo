// import React from &apos;react&apos;;
import { render, screen } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { describe, it, expect, vi, beforeEach } from &apos;vitest&apos;;
import { FilterPanel, type FilterConfig } from &apos;../common/FilterPanel&apos;;

describe(&apos;FilterPanel Component&apos;, () => {
  const mockFilters: FilterConfig[] = [
    {
      key: &apos;status&apos;,
      label: &apos;Status&apos;,
      options: [
        { value: &apos;all&apos;, label: &apos;All Status&apos; },
        { value: &apos;active&apos;, label: &apos;Active&apos; },
        { value: &apos;inactive&apos;, label: &apos;Inactive&apos; },
      ],
      currentValue: &apos;all&apos;,
      onValueChange: vi.fn(),
    },
    {
      key: &apos;type&apos;,
      label: &apos;Type&apos;,
      options: [
        { value: &apos;all&apos;, label: &apos;All Types&apos; },
        { value: &apos;equipment&apos;, label: &apos;Equipment&apos; },
        { value: &apos;vehicle&apos;, label: &apos;Vehicle&apos; },
      ],
      currentValue: &apos;equipment&apos;,
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

  describe(&apos;Basic Rendering&apos;, () => {
    it(&apos;should render filter button&apos;, () => {
      render(<FilterPanel {...defaultProps} />);

      const filterButton = screen.getByRole(&apos;button&apos;);
      expect(filterButton).toBeInTheDocument();
    });

    it(&apos;should show active filters count badge&apos;, () => {
      render(<FilterPanel {...defaultProps} activeFiltersCount={3} />);

      const badge = screen.getByText(&apos;3&apos;);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(&apos;bg-primary&apos;, &apos;text-primary-foreground&apos;);
    });

    it(&apos;should not show badge when no active filters&apos;, () => {
      render(<FilterPanel {...defaultProps} activeFiltersCount={0} />);

      expect(screen.queryByText(&apos;0&apos;)).not.toBeInTheDocument();
    });
  });

  describe(&apos;Filter Popover&apos;, () => {
    it(&apos;should open popover when filter button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} />);

      const filterButton = screen.getByRole(&apos;button&apos;);
      await user.click(filterButton);

      expect(defaultProps.onShowFiltersChange).toHaveBeenCalledWith(true);
    });

    it(&apos;should render filter options when popover is open&apos;, () => {
      render(<FilterPanel {...defaultProps} showFilters={true} />);

      expect(screen.getByText(&apos;Advanced Filters&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Status&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Type&apos;)).toBeInTheDocument();
    });

    it(&apos;should render filter labels and select triggers&apos;, () => {
      render(<FilterPanel {...defaultProps} showFilters={true} />);

      // Check that filter labels are rendered
      expect(screen.getByText(&apos;Status&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Type&apos;)).toBeInTheDocument();

      // Check that select triggers are rendered with current values
      expect(screen.getByText(&apos;All Status&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Equipment&apos;)).toBeInTheDocument();
    });

    it(&apos;should show clear all button when filters are active&apos;, () => {
      render(
        <FilterPanel
          {...defaultProps}
          showFilters={true}
          activeFiltersCount={2}
        />
      );

      expect(screen.getByText(&apos;Clear All&apos;)).toBeInTheDocument();
    });

    it(&apos;should not show clear all button when no filters are active&apos;, () => {
      render(
        <FilterPanel
          {...defaultProps}
          showFilters={true}
          activeFiltersCount={0}
        />
      );

      expect(screen.queryByText(&apos;Clear All&apos;)).not.toBeInTheDocument();
    });
  });

  describe(&apos;Filter Interactions&apos;, () => {
    it(&apos;should render select components with proper accessibility&apos;, () => {
      render(<FilterPanel {...defaultProps} showFilters={true} />);

      // Check that select components are rendered with proper roles
      const statusSelect = screen.getByRole(&apos;combobox&apos;, { name: &apos;Status&apos; });
      const typeSelect = screen.getByRole(&apos;combobox&apos;, { name: &apos;Type&apos; });

      expect(statusSelect).toBeInTheDocument();
      expect(typeSelect).toBeInTheDocument();
    });

    it(&apos;should call onClearAllFilters when clear all button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(
        <FilterPanel
          {...defaultProps}
          showFilters={true}
          activeFiltersCount={2}
        />
      );

      const clearAllButton = screen.getByText(&apos;Clear All&apos;);
      await user.click(clearAllButton);

      expect(defaultProps.onClearAllFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Active Filter Badges&apos;, () => {
    it(&apos;should show active filter badges&apos;, () => {
      render(<FilterPanel {...defaultProps} activeFiltersCount={1} />);

      expect(screen.getByText(&apos;Active filters:&apos;)).toBeInTheDocument();
    });

    it(&apos;should not show active filter badges when no filters are active&apos;, () => {
      render(<FilterPanel {...defaultProps} activeFiltersCount={0} />);

      expect(screen.queryByText(&apos;Active filters:&apos;)).not.toBeInTheDocument();
    });

    it(&apos;should show search term badge when provided&apos;, () => {
      render(
        <FilterPanel
          {...defaultProps}
          activeFiltersCount={1}
          searchTerm=&apos;test search&apos;
          onClearSearch={vi.fn()}
        />
      );

      expect(screen.getByText(&apos;Search: test search&apos;)).toBeInTheDocument();
    });

    it(&apos;should show individual filter badges for non-default values&apos;, () => {
      const filtersWithActiveValues: FilterConfig[] = [
        {
          ...mockFilters[0],
          currentValue: &apos;active&apos;,
          defaultOptionValue: &apos;all&apos;,
        },
        {
          ...mockFilters[1],
          currentValue: &apos;equipment&apos;,
          defaultOptionValue: &apos;all&apos;,
        },
      ];

      render(
        <FilterPanel
          {...defaultProps}
          filters={filtersWithActiveValues}
          activeFiltersCount={2}
        />
      );

      expect(screen.getByText(&apos;Status: Active&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Type: Equipment&apos;)).toBeInTheDocument();
    });

    it(&apos;should not show badges for default values&apos;, () => {
      const filtersWithDefaultValues: FilterConfig[] = [
        {
          ...mockFilters[0],
          currentValue: &apos;all&apos;,
          defaultOptionValue: &apos;all&apos;,
        },
      ];

      render(
        <FilterPanel
          {...defaultProps}
          filters={filtersWithDefaultValues}
          activeFiltersCount={0}
        />
      );

      expect(screen.queryByText(&apos;Status: All Status&apos;)).not.toBeInTheDocument();
    });
  });

  describe(&apos;Badge Interactions&apos;, () => {
    it(&apos;should call onClearSearch when search badge X is clicked&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClearSearch = vi.fn();

      render(
        <FilterPanel
          {...defaultProps}
          activeFiltersCount={1}
          searchTerm=&apos;test&apos;
          onClearSearch={mockOnClearSearch}
        />
      );

      const searchBadge = screen.getByText(&apos;Search: test&apos;);
      const xButton = searchBadge.parentElement?.querySelector(&apos;svg&apos;);
      expect(xButton).toBeInTheDocument();

      if (xButton) {
        await user.click(xButton);
        expect(mockOnClearSearch).toHaveBeenCalledTimes(1);
      }
    });

    it(&apos;should call onValueChange when filter badge X is clicked&apos;, async () => {
      const user = userEvent.setup();
      const filtersWithActiveValues: FilterConfig[] = [
        {
          ...mockFilters[0],
          currentValue: &apos;active&apos;,
          defaultOptionValue: &apos;all&apos;,
        },
      ];

      render(
        <FilterPanel
          {...defaultProps}
          filters={filtersWithActiveValues}
          activeFiltersCount={1}
        />
      );

      const statusBadge = screen.getByText(&apos;Status: Active&apos;);
      const xButton = statusBadge.parentElement?.querySelector(&apos;svg&apos;);
      expect(xButton).toBeInTheDocument();

      if (xButton) {
        await user.click(xButton);
        expect(filtersWithActiveValues[0].onValueChange).toHaveBeenCalledWith(
          &apos;all&apos;
        );
      }
    });
  });

  describe(&apos;Edge Cases&apos;, () => {
    it(&apos;should handle empty filters array&apos;, () => {
      render(<FilterPanel {...defaultProps} filters={[]} showFilters={true} />);

      expect(screen.getByText(&apos;Advanced Filters&apos;)).toBeInTheDocument();
      expect(screen.queryByText(&apos;Status&apos;)).not.toBeInTheDocument();
    });

    it(&apos;should handle filters without defaultOptionValue&apos;, () => {
      const filtersWithoutDefault: FilterConfig[] = [
        {
          ...mockFilters[0],
          currentValue: &apos;active&apos;,
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

      expect(screen.getByText(&apos;Status: Active&apos;)).toBeInTheDocument();
    });

    it(&apos;should handle missing option labels gracefully&apos;, () => {
      const filtersWithMissingLabels: FilterConfig[] = [
        {
          ...mockFilters[0],
          options: [
            { value: &apos;active&apos;, label: &apos;Active&apos; },
            { value: &apos;unknown&apos;, label: undefined as string | undefined },
          ],
          currentValue: &apos;unknown&apos;,
          defaultOptionValue: &apos;active&apos;,
        },
      ];

      render(
        <FilterPanel
          {...defaultProps}
          filters={filtersWithMissingLabels}
          activeFiltersCount={1}
        />
      );

      expect(screen.getByText(&apos;Status: unknown&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Accessibility&apos;, () => {
    it(&apos;should have proper button role&apos;, () => {
      render(<FilterPanel {...defaultProps} />);

      const filterButton = screen.getByRole(&apos;button&apos;);
      expect(filterButton).toBeInTheDocument();
    });

    it(&apos;should have proper labels for filter selects&apos;, () => {
      render(<FilterPanel {...defaultProps} showFilters={true} />);

      expect(screen.getByLabelText(&apos;Status&apos;)).toBeInTheDocument();
      expect(screen.getByLabelText(&apos;Type&apos;)).toBeInTheDocument();
    });
  });
});
