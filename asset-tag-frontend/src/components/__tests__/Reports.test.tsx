import { render, screen } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { vi, describe, it, expect, beforeEach, afterEach } from &apos;vitest&apos;;
import { Reports } from &apos;../reports/Reports&apos;;
// import * as mockReportsData from &apos;../../data/mockReportsData&apos;;
import { useAsyncDataAll } from &apos;../../hooks/useAsyncData&apos;;

// Mock the useAsyncDataAll hook
vi.mock(&apos;../../hooks/useAsyncData&apos;, () => ({
  useAsyncDataAll: vi.fn(),
}));

// Mock the GenerateReportDialog component
vi.mock(&apos;../GenerateReportDialog&apos;, () => ({
  GenerateReportDialog: ({ open, onOpenChange, reportType }: unknown) => (
    <div
      data-testid=&apos;generate-report-dialog&apos;
      data-open={open}
      data-report-type={reportType}
    >
      <button onClick={() => onOpenChange(false)}>Close Dialog</button>
    </div>
  ),
}));

// Mock recharts components
vi.mock(&apos;recharts&apos;, () => ({
  BarChart: ({ children }: unknown) => (
    <div data-testid=&apos;bar-chart&apos;>{children}</div>
  ),
  Bar: ({ dataKey, name }: unknown) => (
    <div data-testid={`bar-${dataKey}`} data-name={name} />
  ),
  LineChart: ({ children }: unknown) => (
    <div data-testid=&apos;line-chart&apos;>{children}</div>
  ),
  Line: ({ dataKey, name }: unknown) => (
    <div data-testid={`line-${dataKey}`} data-name={name} />
  ),
  XAxis: ({ dataKey }: unknown) => <div data-testid={`x-axis-${dataKey}`} />,
  YAxis: () => <div data-testid=&apos;y-axis&apos; />,
  CartesianGrid: () => <div data-testid=&apos;cartesian-grid&apos; />,
  Tooltip: () => <div data-testid=&apos;tooltip&apos; />,
  Legend: () => <div data-testid=&apos;legend&apos; />,
  ResponsiveContainer: ({ children }: unknown) => (
    <div data-testid=&apos;responsive-container&apos;>{children}</div>
  ),
}));

// lucide-react icons are mocked globally in test setup

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, &apos;location&apos;, {
  value: { reload: mockReload },
  writable: true,
});

// Mock // console.log
const mockConsoleLog = vi.spyOn(console, &apos;log&apos;).mockImplementation(() => {});

describe(&apos;Reports Component&apos;, () => {
  const mockData = {
    utilization: [
      { month: &apos;Jan&apos;, utilization: 85, idle: 10, maintenance: 5 },
      { month: &apos;Feb&apos;, utilization: 90, idle: 5, maintenance: 5 },
    ],
    costSavings: [
      {
        month: &apos;Jan&apos;,
        theftPrevention: 10000,
        laborSaved: 5000,
        insurance: 2000,
        maintenanceSavings: 3000,
      },
      {
        month: &apos;Feb&apos;,
        theftPrevention: 12000,
        laborSaved: 6000,
        insurance: 2500,
        maintenanceSavings: 3500,
      },
    ],
    topAssets: [
      {
        id: &apos;1&apos;,
        name: &apos;Asset 1&apos;,
        type: &apos;Equipment&apos;,
        utilization: 95,
        hours: 200,
        revenue: 50000,
        location: &apos;Site A&apos;,
      },
      {
        id: &apos;2&apos;,
        name: &apos;Asset 2&apos;,
        type: &apos;Vehicle&apos;,
        utilization: 88,
        hours: 180,
        revenue: 45000,
        location: &apos;Site B&apos;,
      },
    ],
    templates: [
      {
        id: &apos;1&apos;,
        name: &apos;Monthly Report&apos;,
        type: &apos;monthly&apos;,
        description: &apos;Monthly asset report&apos;,
        lastGenerated: &apos;2024-01-01&apos;,
      },
      {
        id: &apos;2&apos;,
        name: &apos;Quarterly Report&apos;,
        type: &apos;quarterly&apos;,
        description: &apos;Quarterly summary&apos;,
        lastGenerated: &apos;2024-01-01&apos;,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleLog.mockClear();
    mockReload.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe(&apos;Loading State&apos;, () => {
    it(&apos;should show loading state when data is being fetched&apos;, () => {
      (useAsyncDataAll as any).mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });

      render(<Reports />);

      expect(screen.getByText(&apos;Loading reports...&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Error State&apos;, () => {
    it(&apos;should show error state when data fetching fails&apos;, () => {
      const errorMessage = &apos;Failed to fetch reports&apos;;
      (useAsyncDataAll as any).mockReturnValue({
        data: null,
        loading: false,
        error: new Error(errorMessage),
      });

      render(<Reports />);

      expect(screen.getByText(&apos;Failed to load reports&apos;)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText(&apos;Try Again&apos;)).toBeInTheDocument();
    });

    it(&apos;should reload page when Try Again is clicked&apos;, async () => {
      const user = userEvent.setup();
      (useAsyncDataAll as any).mockReturnValue({
        data: null,
        loading: false,
        error: new Error(&apos;Test error&apos;),
      });

      render(<Reports />);

      const tryAgainButton = screen.getByText(&apos;Try Again&apos;);
      await user.click(tryAgainButton);

      expect(mockReload).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Success State&apos;, () => {
    beforeEach(() => {
      (useAsyncDataAll as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      });
    });

    it(&apos;should render the reports page with all sections&apos;, () => {
      render(<Reports />);

      // Check page header
      expect(screen.getByText(&apos;Reports & Analytics&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Insights and performance metrics&apos;)
      ).toBeInTheDocument();

      // Check time range selector
      expect(screen.getByDisplayValue(&apos;Last 6 months&apos;)).toBeInTheDocument();

      // Check export button
      expect(screen.getByText(&apos;Export Report&apos;)).toBeInTheDocument();

      // Check ROI summary cards
      expect(screen.getByText(&apos;Total ROI&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Theft Prevention&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Labor Savings&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Insurance Reduction&apos;)).toBeInTheDocument();

      // Check chart sections
      expect(screen.getByText(&apos;Asset Utilization Trend&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Cost Savings Breakdown&apos;)).toBeInTheDocument();

      // Check top assets section
      expect(
        screen.getByText(&apos;Top Performing Assets (by Utilization)&apos;)
      ).toBeInTheDocument();

      // Check report templates section
      expect(screen.getByText(&apos;Report Templates&apos;)).toBeInTheDocument();
    });

    it(&apos;should display correct ROI calculations&apos;, () => {
      render(<Reports />);

      // Total ROI should be calculated from cost savings data
      // (10000 + 5000 + 2000 + 3000) + (12000 + 6000 + 2500 + 3500) = 45000
      expect(screen.getByText(&apos;45K&apos;)).toBeInTheDocument(); // 45000 / 1000 = 45K

      // Theft prevention total: 10000 + 12000 = 22000
      expect(screen.getByText(&apos;22K&apos;)).toBeInTheDocument();

      // Labor savings total: 5000 + 6000 = 11000
      expect(screen.getByText(&apos;11.0K&apos;)).toBeInTheDocument();

      // Insurance savings total: 2000 + 2500 = 4500
      expect(screen.getByText(&apos;4.5K&apos;)).toBeInTheDocument();
    });

    it(&apos;should render charts with correct data&apos;, () => {
      render(<Reports />);

      // Check that charts are rendered
      expect(screen.getByTestId(&apos;bar-chart&apos;)).toBeInTheDocument();
      expect(screen.getByTestId(&apos;line-chart&apos;)).toBeInTheDocument();

      // Check bar chart components
      expect(screen.getByTestId(&apos;bar-utilization&apos;)).toBeInTheDocument();
      expect(screen.getByTestId(&apos;bar-idle&apos;)).toBeInTheDocument();
      expect(screen.getByTestId(&apos;bar-maintenance&apos;)).toBeInTheDocument();

      // Check line chart components
      expect(screen.getByTestId(&apos;line-theftPrevention&apos;)).toBeInTheDocument();
      expect(screen.getByTestId(&apos;line-laborSaved&apos;)).toBeInTheDocument();
      expect(screen.getByTestId(&apos;line-insurance&apos;)).toBeInTheDocument();
      expect(screen.getByTestId(&apos;line-maintenanceSavings&apos;)).toBeInTheDocument();
    });

    it(&apos;should display top performing assets correctly&apos;, () => {
      render(<Reports />);

      // Check asset names
      expect(screen.getByText(&apos;Asset 1&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Asset 2&apos;)).toBeInTheDocument();

      // Check asset types
      expect(screen.getByText(&apos;Equipment&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Vehicle&apos;)).toBeInTheDocument();

      // Check utilization percentages
      expect(screen.getByText(&apos;95%&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;88%&apos;)).toBeInTheDocument();

      // Check hours
      expect(screen.getByText(&apos;200h&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;180h&apos;)).toBeInTheDocument();

      // Check revenue
      expect(screen.getByText(&apos;$50K&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;$45K&apos;)).toBeInTheDocument();
    });

    it(&apos;should display report templates correctly&apos;, () => {
      render(<Reports />);

      // Check template names
      expect(screen.getByText(&apos;Monthly Report&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Quarterly Report&apos;)).toBeInTheDocument();

      // Check template descriptions
      expect(screen.getByText(&apos;Monthly asset report&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Quarterly summary&apos;)).toBeInTheDocument();

      // Check last generated dates
      expect(screen.getByText(&apos;Last: 1/1/2024&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;User Interactions&apos;, () => {
    beforeEach(() => {
      (useAsyncDataAll as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      });
    });

    it(&apos;should change time range when selector is used&apos;, async () => {
      const user = userEvent.setup();
      render(<Reports />);

      const timeRangeSelect = screen.getByDisplayValue(&apos;Last 6 months&apos;);
      await user.click(timeRangeSelect);

      const option = screen.getByText(&apos;Last 12 months&apos;);
      await user.click(option);

      expect(screen.getByDisplayValue(&apos;Last 12 months&apos;)).toBeInTheDocument();
    });

    it(&apos;should open report dialog when template is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<Reports />);

      const monthlyReportButton = screen.getByText(&apos;Monthly Report&apos;);
      await user.click(monthlyReportButton);

      const dialog = screen.getByTestId(&apos;generate-report-dialog&apos;);
      expect(dialog).toHaveAttribute(&apos;data-open&apos;, &apos;true&apos;);
      expect(dialog).toHaveAttribute(&apos;data-report-type&apos;, &apos;monthly&apos;);
    });

    it(&apos;should close report dialog when close button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<Reports />);

      // Open dialog first
      const monthlyReportButton = screen.getByText(&apos;Monthly Report&apos;);
      await user.click(monthlyReportButton);

      // Close dialog
      const closeButton = screen.getByText(&apos;Close Dialog&apos;);
      await user.click(closeButton);

      const dialog = screen.getByTestId(&apos;generate-report-dialog&apos;);
      expect(dialog).toHaveAttribute(&apos;data-open&apos;, &apos;false&apos;);
    });

    it(&apos;should log export action when export button is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<Reports />);

      const exportButton = screen.getByText(&apos;Export Report&apos;);
      await user.click(exportButton);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        &apos;Exporting comprehensive report for:&apos;,
        &apos;6&apos;
      );
    });
  });

  describe(&apos;Empty States&apos;, () => {
    it(&apos;should show empty state when no top assets are available&apos;, () => {
      const emptyData = { ...mockData, topAssets: [] };
      (useAsyncDataAll as any).mockReturnValue({
        data: emptyData,
        loading: false,
        error: null,
      });

      render(<Reports />);

      expect(screen.getByText(&apos;No asset data available&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Asset utilization data will appear here&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;should show empty state when no report templates are available&apos;, () => {
      const emptyData = { ...mockData, templates: [] };
      (useAsyncDataAll as any).mockReturnValue({
        data: emptyData,
        loading: false,
        error: null,
      });

      render(<Reports />);

      expect(screen.getByText(&apos;No report templates&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;Report templates will appear here&apos;)
      ).toBeInTheDocument();
    });
  });

  describe(&apos;Data Dependencies&apos;, () => {
    it(&apos;should call useAsyncDataAll with correct parameters&apos;, () => {
      render(<Reports />);

      expect(useAsyncDataAll).toHaveBeenCalledWith(
        {
          utilization: expect.any(Function),
          costSavings: expect.any(Function),
          topAssets: expect.any(Function),
          templates: expect.any(Function),
        },
        { deps: [6] } // Default timeRange is &quot;6&quot;
      );
    });

    it(&apos;should update dependencies when time range changes&apos;, async () => {
      const user = userEvent.setup();
      render(<Reports />);

      // Change time range
      const timeRangeSelect = screen.getByDisplayValue(&apos;Last 6 months&apos;);
      await user.click(timeRangeSelect);

      const option = screen.getByText(&apos;Last 3 months&apos;);
      await user.click(option);

      // The hook should be called again with new dependencies
      expect(useAsyncDataAll).toHaveBeenCalledWith(expect.any(Object), {
        deps: [3],
      });
    });
  });

  describe(&apos;Accessibility&apos;, () => {
    beforeEach(() => {
      (useAsyncDataAll as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      });
    });

    it(&apos;should have proper ARIA labels and roles&apos;, () => {
      render(<Reports />);

      // Check that buttons are accessible
      const exportButton = screen.getByRole(&apos;button&apos;, {
        name: /export report/i,
      });
      expect(exportButton).toBeInTheDocument();

      // Check that select is accessible
      const timeRangeSelect = screen.getByRole(&apos;combobox&apos;);
      expect(timeRangeSelect).toBeInTheDocument();
    });

    it(&apos;should support keyboard navigation&apos;, async () => {
      const user = userEvent.setup();
      render(<Reports />);

      // Tab to export button and press Enter
      await user.tab();
      await user.tab();
      await user.keyboard(&apos;{Enter}&apos;);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        &apos;Exporting comprehensive report for:&apos;,
        &apos;6&apos;
      );
    });
  });
});
