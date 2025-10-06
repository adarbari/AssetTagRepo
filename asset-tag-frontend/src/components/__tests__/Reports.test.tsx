import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Reports } from '../reports/Reports';
// import * as mockReportsData from '../../data/mockReportsData';
import { useAsyncDataAll } from '../../hooks/useAsyncData';

// Mock the useAsyncDataAll hook
vi.mock('../../hooks/useAsyncData', () => ({
  useAsyncDataAll: vi.fn(),
}));

// Mock the GenerateReportDialog component
vi.mock('../GenerateReportDialog', () => ({
  GenerateReportDialog: ({ open, onOpenChange, reportType }: unknown) => (
    <div
      data-testid='generate-report-dialog'
      data-open={open}
      data-report-type={reportType}
    >
      <button onClick={() => onOpenChange(false)}>Close Dialog</button>
    </div>
  ),
}));

// Mock recharts components
vi.mock('recharts', () => ({
  BarChart: ({ children }: unknown) => (
    <div data-testid='bar-chart'>{children}</div>
  ),
  Bar: ({ dataKey, name }: unknown) => (
    <div data-testid={`bar-${dataKey}`} data-name={name} />
  ),
  LineChart: ({ children }: unknown) => (
    <div data-testid='line-chart'>{children}</div>
  ),
  Line: ({ dataKey, name }: unknown) => (
    <div data-testid={`line-${dataKey}`} data-name={name} />
  ),
  XAxis: ({ dataKey }: unknown) => <div data-testid={`x-axis-${dataKey}`} />,
  YAxis: () => <div data-testid='y-axis' />,
  CartesianGrid: () => <div data-testid='cartesian-grid' />,
  Tooltip: () => <div data-testid='tooltip' />,
  Legend: () => <div data-testid='legend' />,
  ResponsiveContainer: ({ children }: unknown) => (
    <div data-testid='responsive-container'>{children}</div>
  ),
}));

// lucide-react icons are mocked globally in test setup

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

// Mock console.log
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Reports Component', () => {
  const mockData = {
    utilization: [
      { month: 'Jan', utilization: 85, idle: 10, maintenance: 5 },
      { month: 'Feb', utilization: 90, idle: 5, maintenance: 5 },
    ],
    costSavings: [
      {
        month: 'Jan',
        theftPrevention: 10000,
        laborSaved: 5000,
        insurance: 2000,
        maintenanceSavings: 3000,
      },
      {
        month: 'Feb',
        theftPrevention: 12000,
        laborSaved: 6000,
        insurance: 2500,
        maintenanceSavings: 3500,
      },
    ],
    topAssets: [
      {
        id: '1',
        name: 'Asset 1',
        type: 'Equipment',
        utilization: 95,
        hours: 200,
        revenue: 50000,
        location: 'Site A',
      },
      {
        id: '2',
        name: 'Asset 2',
        type: 'Vehicle',
        utilization: 88,
        hours: 180,
        revenue: 45000,
        location: 'Site B',
      },
    ],
    templates: [
      {
        id: '1',
        name: 'Monthly Report',
        type: 'monthly',
        description: 'Monthly asset report',
        lastGenerated: '2024-01-01',
      },
      {
        id: '2',
        name: 'Quarterly Report',
        type: 'quarterly',
        description: 'Quarterly summary',
        lastGenerated: '2024-01-01',
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

  describe('Loading State', () => {
    it('should show loading state when data is being fetched', () => {
      (useAsyncDataAll as any).mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });

      render(<Reports />);

      expect(screen.getByText('Loading reports...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error state when data fetching fails', () => {
      const errorMessage = 'Failed to fetch reports';
      (useAsyncDataAll as any).mockReturnValue({
        data: null,
        loading: false,
        error: new Error(errorMessage),
      });

      render(<Reports />);

      expect(screen.getByText('Failed to load reports')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should reload page when Try Again is clicked', async () => {
      const user = userEvent.setup();
      (useAsyncDataAll as any).mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Test error'),
      });

      render(<Reports />);

      const tryAgainButton = screen.getByText('Try Again');
      await user.click(tryAgainButton);

      expect(mockReload).toHaveBeenCalledTimes(1);
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      (useAsyncDataAll as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      });
    });

    it('should render the reports page with all sections', () => {
      render(<Reports />);

      // Check page header
      expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
      expect(
        screen.getByText('Insights and performance metrics')
      ).toBeInTheDocument();

      // Check time range selector
      expect(screen.getByDisplayValue('Last 6 months')).toBeInTheDocument();

      // Check export button
      expect(screen.getByText('Export Report')).toBeInTheDocument();

      // Check ROI summary cards
      expect(screen.getByText('Total ROI')).toBeInTheDocument();
      expect(screen.getByText('Theft Prevention')).toBeInTheDocument();
      expect(screen.getByText('Labor Savings')).toBeInTheDocument();
      expect(screen.getByText('Insurance Reduction')).toBeInTheDocument();

      // Check chart sections
      expect(screen.getByText('Asset Utilization Trend')).toBeInTheDocument();
      expect(screen.getByText('Cost Savings Breakdown')).toBeInTheDocument();

      // Check top assets section
      expect(
        screen.getByText('Top Performing Assets (by Utilization)')
      ).toBeInTheDocument();

      // Check report templates section
      expect(screen.getByText('Report Templates')).toBeInTheDocument();
    });

    it('should display correct ROI calculations', () => {
      render(<Reports />);

      // Total ROI should be calculated from cost savings data
      // (10000 + 5000 + 2000 + 3000) + (12000 + 6000 + 2500 + 3500) = 45000
      expect(screen.getByText('45K')).toBeInTheDocument(); // 45000 / 1000 = 45K

      // Theft prevention total: 10000 + 12000 = 22000
      expect(screen.getByText('22K')).toBeInTheDocument();

      // Labor savings total: 5000 + 6000 = 11000
      expect(screen.getByText('11.0K')).toBeInTheDocument();

      // Insurance savings total: 2000 + 2500 = 4500
      expect(screen.getByText('4.5K')).toBeInTheDocument();
    });

    it('should render charts with correct data', () => {
      render(<Reports />);

      // Check that charts are rendered
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      // Check bar chart components
      expect(screen.getByTestId('bar-utilization')).toBeInTheDocument();
      expect(screen.getByTestId('bar-idle')).toBeInTheDocument();
      expect(screen.getByTestId('bar-maintenance')).toBeInTheDocument();

      // Check line chart components
      expect(screen.getByTestId('line-theftPrevention')).toBeInTheDocument();
      expect(screen.getByTestId('line-laborSaved')).toBeInTheDocument();
      expect(screen.getByTestId('line-insurance')).toBeInTheDocument();
      expect(screen.getByTestId('line-maintenanceSavings')).toBeInTheDocument();
    });

    it('should display top performing assets correctly', () => {
      render(<Reports />);

      // Check asset names
      expect(screen.getByText('Asset 1')).toBeInTheDocument();
      expect(screen.getByText('Asset 2')).toBeInTheDocument();

      // Check asset types
      expect(screen.getByText('Equipment')).toBeInTheDocument();
      expect(screen.getByText('Vehicle')).toBeInTheDocument();

      // Check utilization percentages
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('88%')).toBeInTheDocument();

      // Check hours
      expect(screen.getByText('200h')).toBeInTheDocument();
      expect(screen.getByText('180h')).toBeInTheDocument();

      // Check revenue
      expect(screen.getByText('$50K')).toBeInTheDocument();
      expect(screen.getByText('$45K')).toBeInTheDocument();
    });

    it('should display report templates correctly', () => {
      render(<Reports />);

      // Check template names
      expect(screen.getByText('Monthly Report')).toBeInTheDocument();
      expect(screen.getByText('Quarterly Report')).toBeInTheDocument();

      // Check template descriptions
      expect(screen.getByText('Monthly asset report')).toBeInTheDocument();
      expect(screen.getByText('Quarterly summary')).toBeInTheDocument();

      // Check last generated dates
      expect(screen.getByText('Last: 1/1/2024')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      (useAsyncDataAll as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      });
    });

    it('should change time range when selector is used', async () => {
      const user = userEvent.setup();
      render(<Reports />);

      const timeRangeSelect = screen.getByDisplayValue('Last 6 months');
      await user.click(timeRangeSelect);

      const option = screen.getByText('Last 12 months');
      await user.click(option);

      expect(screen.getByDisplayValue('Last 12 months')).toBeInTheDocument();
    });

    it('should open report dialog when template is clicked', async () => {
      const user = userEvent.setup();
      render(<Reports />);

      const monthlyReportButton = screen.getByText('Monthly Report');
      await user.click(monthlyReportButton);

      const dialog = screen.getByTestId('generate-report-dialog');
      expect(dialog).toHaveAttribute('data-open', 'true');
      expect(dialog).toHaveAttribute('data-report-type', 'monthly');
    });

    it('should close report dialog when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<Reports />);

      // Open dialog first
      const monthlyReportButton = screen.getByText('Monthly Report');
      await user.click(monthlyReportButton);

      // Close dialog
      const closeButton = screen.getByText('Close Dialog');
      await user.click(closeButton);

      const dialog = screen.getByTestId('generate-report-dialog');
      expect(dialog).toHaveAttribute('data-open', 'false');
    });

    it('should log export action when export button is clicked', async () => {
      const user = userEvent.setup();
      render(<Reports />);

      const exportButton = screen.getByText('Export Report');
      await user.click(exportButton);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Exporting comprehensive report for:',
        '6'
      );
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no top assets are available', () => {
      const emptyData = { ...mockData, topAssets: [] };
      (useAsyncDataAll as any).mockReturnValue({
        data: emptyData,
        loading: false,
        error: null,
      });

      render(<Reports />);

      expect(screen.getByText('No asset data available')).toBeInTheDocument();
      expect(
        screen.getByText('Asset utilization data will appear here')
      ).toBeInTheDocument();
    });

    it('should show empty state when no report templates are available', () => {
      const emptyData = { ...mockData, templates: [] };
      (useAsyncDataAll as any).mockReturnValue({
        data: emptyData,
        loading: false,
        error: null,
      });

      render(<Reports />);

      expect(screen.getByText('No report templates')).toBeInTheDocument();
      expect(
        screen.getByText('Report templates will appear here')
      ).toBeInTheDocument();
    });
  });

  describe('Data Dependencies', () => {
    it('should call useAsyncDataAll with correct parameters', () => {
      render(<Reports />);

      expect(useAsyncDataAll).toHaveBeenCalledWith(
        {
          utilization: expect.any(Function),
          costSavings: expect.any(Function),
          topAssets: expect.any(Function),
          templates: expect.any(Function),
        },
        { deps: [6] } // Default timeRange is "6"
      );
    });

    it('should update dependencies when time range changes', async () => {
      const user = userEvent.setup();
      render(<Reports />);

      // Change time range
      const timeRangeSelect = screen.getByDisplayValue('Last 6 months');
      await user.click(timeRangeSelect);

      const option = screen.getByText('Last 3 months');
      await user.click(option);

      // The hook should be called again with new dependencies
      expect(useAsyncDataAll).toHaveBeenCalledWith(expect.any(Object), {
        deps: [3],
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useAsyncDataAll as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      });
    });

    it('should have proper ARIA labels and roles', () => {
      render(<Reports />);

      // Check that buttons are accessible
      const exportButton = screen.getByRole('button', {
        name: /export report/i,
      });
      expect(exportButton).toBeInTheDocument();

      // Check that select is accessible
      const timeRangeSelect = screen.getByRole('combobox');
      expect(timeRangeSelect).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Reports />);

      // Tab to export button and press Enter
      await user.tab();
      await user.tab();
      await user.keyboard('{Enter}');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Exporting comprehensive report for:',
        '6'
      );
    });
  });
});
