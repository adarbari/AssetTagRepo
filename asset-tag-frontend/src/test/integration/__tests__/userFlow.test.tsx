import { render, screen, waitFor } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { vi, describe, it, expect, beforeEach } from &apos;vitest&apos;;
import { Reports } from &apos;../../../components/reports/Reports&apos;;
import { useAsyncDataAll } from &apos;../../../hooks/useAsyncData&apos;;

// Mock the useAsyncDataAll hook
vi.mock(&apos;../../../hooks/useAsyncData&apos;, () => ({
  useAsyncDataAll: vi.fn(),
}));

// Mock the GenerateReportDialog component
vi.mock(&apos;../../../components/GenerateReportDialog&apos;, () => ({
  GenerateReportDialog: ({ open, onOpenChange, reportType }: any) => (
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
  BarChart: ({ children }: any) => (
    <div data-testid=&apos;bar-chart&apos;>{children}</div>
  ),
  Bar: ({ dataKey, name }: any) => (
    <div data-testid={`bar-${dataKey}`} data-name={name} />
  ),
  LineChart: ({ children }: any) => (
    <div data-testid=&apos;line-chart&apos;>{children}</div>
  ),
  Line: ({ dataKey, name }: any) => (
    <div data-testid={`line-${dataKey}`} data-name={name} />
  ),
  XAxis: ({ dataKey }: any) => <div data-testid={`x-axis-${dataKey}`} />,
  YAxis: () => <div data-testid=&apos;y-axis&apos; />,
  CartesianGrid: () => <div data-testid=&apos;cartesian-grid&apos; />,
  Tooltip: () => <div data-testid=&apos;tooltip&apos; />,
  Legend: () => <div data-testid=&apos;legend&apos; />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid=&apos;responsive-container&apos;>{children}</div>
  ),
}));

// Mock lucide-react icons
vi.mock(&apos;lucide-react&apos;, () => ({
  FileText: () => <div data-testid=&apos;file-text-icon&apos; />,
  Download: () => <div data-testid=&apos;download-icon&apos; />,
  Calendar: () => <div data-testid=&apos;calendar-icon&apos; />,
  TrendingUp: () => <div data-testid=&apos;trending-up-icon&apos; />,
  DollarSign: () => <div data-testid=&apos;dollar-sign-icon&apos; />,
  Clock: () => <div data-testid=&apos;clock-icon&apos; />,
  Activity: () => <div data-testid=&apos;activity-icon&apos; />,
  Shield: () => <div data-testid=&apos;shield-icon&apos; />,
  Battery: () => <div data-testid=&apos;battery-icon&apos; />,
  AlertTriangle: () => <div data-testid=&apos;alert-triangle-icon&apos; />,
  MapPin: () => <div data-testid=&apos;map-pin-icon&apos; />,
  Building2: () => <div data-testid=&apos;building-2-icon&apos; />,
  Plus: () => <div data-testid=&apos;plus-icon&apos; />,
  ChevronDown: () => <div data-testid=&apos;chevron-down-icon&apos; />,
  X: () => <div data-testid=&apos;x-icon&apos; />,
  Search: () => <div data-testid=&apos;search-icon&apos; />,
  Filter: () => <div data-testid=&apos;filter-icon&apos; />,
  MoreHorizontal: () => <div data-testid=&apos;more-horizontal-icon&apos; />,
  Edit: () => <div data-testid=&apos;edit-icon&apos; />,
  Trash2: () => <div data-testid=&apos;trash-2-icon&apos; />,
  Eye: () => <div data-testid=&apos;eye-icon&apos; />,
  Settings: () => <div data-testid=&apos;settings-icon&apos; />,
  Bell: () => <div data-testid=&apos;bell-icon&apos; />,
  User: () => <div data-testid=&apos;user-icon&apos; />,
  Home: () => <div data-testid=&apos;home-icon&apos; />,
  BarChart3: () => <div data-testid=&apos;bar-chart-3-icon&apos; />,
  PieChart: () => <div data-testid=&apos;pie-chart-icon&apos; />,
  LineChart: () => <div data-testid=&apos;line-chart-icon&apos; />,
  TrendingDown: () => <div data-testid=&apos;trending-down-icon&apos; />,
  ArrowUp: () => <div data-testid=&apos;arrow-up-icon&apos; />,
  ArrowDown: () => <div data-testid=&apos;arrow-down-icon&apos; />,
  Check: () => <div data-testid=&apos;check-icon&apos; />,
  AlertCircle: () => <div data-testid=&apos;alert-circle-icon&apos; />,
  Info: () => <div data-testid=&apos;info-icon&apos; />,
  HelpCircle: () => <div data-testid=&apos;help-circle-icon&apos; />,
  ExternalLink: () => <div data-testid=&apos;external-link-icon&apos; />,
  Copy: () => <div data-testid=&apos;copy-icon&apos; />,
  Share: () => <div data-testid=&apos;share-icon&apos; />,
  Heart: () => <div data-testid=&apos;heart-icon&apos; />,
  Star: () => <div data-testid=&apos;star-icon&apos; />,
  ThumbsUp: () => <div data-testid=&apos;thumbs-up-icon&apos; />,
  ThumbsDown: () => <div data-testid=&apos;thumbs-down-icon&apos; />,
  MessageCircle: () => <div data-testid=&apos;message-circle-icon&apos; />,
  Mail: () => <div data-testid=&apos;mail-icon&apos; />,
  Phone: () => <div data-testid=&apos;phone-icon&apos; />,
  Globe: () => <div data-testid=&apos;globe-icon&apos; />,
  Lock: () => <div data-testid=&apos;lock-icon&apos; />,
  Unlock: () => <div data-testid=&apos;unlock-icon&apos; />,
  Key: () => <div data-testid=&apos;key-icon&apos; />,
  Wifi: () => <div data-testid=&apos;wifi-icon&apos; />,
  WifiOff: () => <div data-testid=&apos;wifi-off-icon&apos; />,
  Signal: () => <div data-testid=&apos;signal-icon&apos; />,
  SignalZero: () => <div data-testid=&apos;signal-zero-icon&apos; />,
  SignalLow: () => <div data-testid=&apos;signal-low-icon&apos; />,
  SignalMedium: () => <div data-testid=&apos;signal-medium-icon&apos; />,
  SignalHigh: () => <div data-testid=&apos;signal-high-icon&apos; />,
  SignalMax: () => <div data-testid=&apos;signal-max-icon&apos; />,
  Volume2: () => <div data-testid=&apos;volume-2-icon&apos; />,
  VolumeX: () => <div data-testid=&apos;volume-x-icon&apos; />,
  Play: () => <div data-testid=&apos;play-icon&apos; />,
  Pause: () => <div data-testid=&apos;pause-icon&apos; />,
  Stop: () => <div data-testid=&apos;stop-icon&apos; />,
  SkipBack: () => <div data-testid=&apos;skip-back-icon&apos; />,
  SkipForward: () => <div data-testid=&apos;skip-forward-icon&apos; />,
  Repeat: () => <div data-testid=&apos;repeat-icon&apos; />,
  Shuffle: () => <div data-testid=&apos;shuffle-icon&apos; />,
  Music: () => <div data-testid=&apos;music-icon&apos; />,
  Headphones: () => <div data-testid=&apos;headphones-icon&apos; />,
  Mic: () => <div data-testid=&apos;mic-icon&apos; />,
  MicOff: () => <div data-testid=&apos;mic-off-icon&apos; />,
  Video: () => <div data-testid=&apos;video-icon&apos; />,
  VideoOff: () => <div data-testid=&apos;video-off-icon&apos; />,
  Camera: () => <div data-testid=&apos;camera-icon&apos; />,
  CameraOff: () => <div data-testid=&apos;camera-off-icon&apos; />,
  Image: () => <div data-testid=&apos;image-icon&apos; />,
  ImageOff: () => <div data-testid=&apos;image-off-icon&apos; />,
  File: () => <div data-testid=&apos;file-icon&apos; />,
  FileImage: () => <div data-testid=&apos;file-image-icon&apos; />,
  FileVideo: () => <div data-testid=&apos;file-video-icon&apos; />,
  FileAudio: () => <div data-testid=&apos;file-audio-icon&apos; />,
  FileArchive: () => <div data-testid=&apos;file-archive-icon&apos; />,
  FileCode: () => <div data-testid=&apos;file-code-icon&apos; />,
  FileSpreadsheet: () => <div data-testid=&apos;file-spreadsheet-icon&apos; />,
  FilePdf: () => <div data-testid=&apos;file-pdf-icon&apos; />,
  FileWord: () => <div data-testid=&apos;file-word-icon&apos; />,
  FileExcel: () => <div data-testid=&apos;file-excel-icon&apos; />,
  FilePowerpoint: () => <div data-testid=&apos;file-powerpoint-icon&apos; />,
  Folder: () => <div data-testid=&apos;folder-icon&apos; />,
  FolderOpen: () => <div data-testid=&apos;folder-open-icon&apos; />,
  FolderPlus: () => <div data-testid=&apos;folder-plus-icon&apos; />,
  FolderMinus: () => <div data-testid=&apos;folder-minus-icon&apos; />,
  FolderX: () => <div data-testid=&apos;folder-x-icon&apos; />,
  FolderCheck: () => <div data-testid=&apos;folder-check-icon&apos; />,
  FolderLock: () => <div data-testid=&apos;folder-lock-icon&apos; />,
  FolderUnlock: () => <div data-testid=&apos;folder-unlock-icon&apos; />,
  FolderHeart: () => <div data-testid=&apos;folder-heart-icon&apos; />,
  FolderStar: () => <div data-testid=&apos;folder-star-icon&apos; />,
  FolderUp: () => <div data-testid=&apos;folder-up-icon&apos; />,
  FolderDown: () => <div data-testid=&apos;folder-down-icon&apos; />,
  FolderLeft: () => <div data-testid=&apos;folder-left-icon&apos; />,
  FolderRight: () => <div data-testid=&apos;folder-right-icon&apos; />,
  FolderInput: () => <div data-testid=&apos;folder-input-icon&apos; />,
  FolderOutput: () => <div data-testid=&apos;folder-output-icon&apos; />,
  FolderSync: () => <div data-testid=&apos;folder-sync-icon&apos; />,
  FolderGit: () => <div data-testid=&apos;folder-git-icon&apos; />,
  FolderGit2: () => <div data-testid=&apos;folder-git-2-icon&apos; />,
  FolderGitBranch: () => <div data-testid=&apos;folder-git-branch-icon&apos; />,
  FolderGitCommit: () => <div data-testid=&apos;folder-git-commit-icon&apos; />,
  FolderGitPullRequest: () => (
    <div data-testid=&apos;folder-git-pull-request-icon&apos; />
  ),
  FolderGitMerge: () => <div data-testid=&apos;folder-git-merge-icon&apos; />,
  FolderGitDiff: () => <div data-testid=&apos;folder-git-diff-icon&apos; />,
  FolderGitLog: () => <div data-testid=&apos;folder-git-log-icon&apos; />,
  FolderGitRef: () => <div data-testid=&apos;folder-git-ref-icon&apos; />,
  FolderGitTag: () => <div data-testid=&apos;folder-git-tag-icon&apos; />,
  FolderGitTree: () => <div data-testid=&apos;folder-git-tree-icon&apos; />,
  FolderGitWorktree: () => <div data-testid=&apos;folder-git-worktree-icon&apos; />,
  FolderGitSubmodule: () => <div data-testid=&apos;folder-git-submodule-icon&apos; />,
  FolderGitLfs: () => <div data-testid=&apos;folder-git-lfs-icon&apos; />,
  FolderGitIgnore: () => <div data-testid=&apos;folder-git-ignore-icon&apos; />,
  FolderGitAttributes: () => <div data-testid=&apos;folder-git-attributes-icon&apos; />,
  FolderGitConfig: () => <div data-testid=&apos;folder-git-config-icon&apos; />,
  FolderGitHooks: () => <div data-testid=&apos;folder-git-hooks-icon&apos; />,
  FolderGitInfo: () => <div data-testid=&apos;folder-git-info-icon&apos; />,
  FolderGitLogs: () => <div data-testid=&apos;folder-git-logs-icon&apos; />,
  FolderGitObjects: () => <div data-testid=&apos;folder-git-objects-icon&apos; />,
  FolderGitRefs: () => <div data-testid=&apos;folder-git-refs-icon&apos; />,
  FolderGitRemotes: () => <div data-testid=&apos;folder-git-remotes-icon&apos; />,
  FolderGitSparseCheckout: () => (
    <div data-testid=&apos;folder-git-sparse-checkout-icon&apos; />
  ),
  FolderGitWorktrees: () => <div data-testid=&apos;folder-git-worktrees-icon&apos; />,
}));

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, &apos;location&apos;, {
  value: { reload: mockReload },
  writable: true,
});

// Mock console.log
const mockConsoleLog = vi.spyOn(console, &apos;log&apos;).mockImplementation(() => {});

describe(&apos;User Flow Integration Tests&apos;, () => {
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

  describe(&apos;Complete Reports User Flow&apos;, () => {
    it(&apos;should complete the full reports workflow from loading to report generation&apos;, async () => {
      const user = userEvent.setup();

      // Start with loading state
      (useAsyncDataAll as any).mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });

      const { rerender: _rerender } = render(<Reports />);

      // Verify loading state
      expect(screen.getByText(&apos;Loading reports...&apos;)).toBeInTheDocument();

      // Simulate data loading completion
      (useAsyncDataAll as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      });

      rerender(<Reports />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText(&apos;Reports & Analytics&apos;)).toBeInTheDocument();
      });

      // Verify all sections are rendered
      expect(screen.getByText(&apos;Total ROI&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Theft Prevention&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Labor Savings&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Insurance Reduction&apos;)).toBeInTheDocument();

      // Verify charts are rendered
      expect(screen.getByTestId(&apos;bar-chart&apos;)).toBeInTheDocument();
      expect(screen.getByTestId(&apos;line-chart&apos;)).toBeInTheDocument();

      // Verify top assets are displayed
      expect(screen.getByText(&apos;Asset 1&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Asset 2&apos;)).toBeInTheDocument();

      // Verify report templates are displayed
      expect(screen.getByText(&apos;Monthly Report&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Quarterly Report&apos;)).toBeInTheDocument();

      // Test time range change
      const timeRangeSelect = screen.getByDisplayValue(&apos;Last 6 months&apos;);
      await user.click(timeRangeSelect);

      const option = screen.getByText(&apos;Last 12 months&apos;);
      await user.click(option);

      expect(screen.getByDisplayValue(&apos;Last 12 months&apos;)).toBeInTheDocument();

      // Test report generation
      const monthlyReportButton = screen.getByText(&apos;Monthly Report&apos;);
      await user.click(monthlyReportButton);

      const dialog = screen.getByTestId(&apos;generate-report-dialog&apos;);
      expect(dialog).toHaveAttribute(&apos;data-open&apos;, &apos;true&apos;);
      expect(dialog).toHaveAttribute(&apos;data-report-type&apos;, &apos;monthly&apos;);

      // Test export functionality
      const exportButton = screen.getByText(&apos;Export Report&apos;);
      await user.click(exportButton);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        &apos;Exporting comprehensive report for:&apos;,
        &apos;12&apos;
      );

      // Test dialog closure
      const closeButton = screen.getByText(&apos;Close Dialog&apos;);
      await user.click(closeButton);

      expect(dialog).toHaveAttribute(&apos;data-open&apos;, &apos;false&apos;);
    });

    it(&apos;should handle error recovery flow&apos;, async () => {
      const user = userEvent.setup();

      // Start with error state
      (useAsyncDataAll as any).mockReturnValue({
        data: null,
        loading: false,
        error: new Error(&apos;Network error&apos;),
      });

      render(<Reports />);

      // Verify error state
      expect(screen.getByText(&apos;Failed to load reports&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Network error&apos;)).toBeInTheDocument();

      // Test error recovery
      const tryAgainButton = screen.getByText(&apos;Try Again&apos;);
      await user.click(tryAgainButton);

      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle empty data states gracefully&apos;, async () => {
      const emptyData = {
        utilization: [],
        costSavings: [],
        topAssets: [],
        templates: [],
      };

      (useAsyncDataAll as any).mockReturnValue({
        data: emptyData,
        loading: false,
        error: null,
      });

      render(<Reports />);

      // Verify empty states are handled
      expect(screen.getByText(&apos;No asset data available&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;No report templates&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Data Flow Integration&apos;, () => {
    it(&apos;should properly integrate data fetching with component rendering&apos;, () => {
      (useAsyncDataAll as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      });

      render(<Reports />);

      // Verify useAsyncDataAll was called with correct parameters
      expect(useAsyncDataAll).toHaveBeenCalledWith(
        {
          utilization: expect.any(Function),
          costSavings: expect.any(Function),
          topAssets: expect.any(Function),
          templates: expect.any(Function),
        },
        { deps: [6] }
      );

      // Verify data is properly displayed
      expect(screen.getByText(&apos;45K&apos;)).toBeInTheDocument(); // Total ROI
      expect(screen.getByText(&apos;22K&apos;)).toBeInTheDocument(); // Theft Prevention
      expect(screen.getByText(&apos;11.0K&apos;)).toBeInTheDocument(); // Labor Savings
      expect(screen.getByText(&apos;4.5K&apos;)).toBeInTheDocument(); // Insurance Reduction
    });

    it(&apos;should handle dependency changes correctly&apos;, async () => {
      const user = userEvent.setup();

      (useAsyncDataAll as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      });

      const { rerender: _rerender } = render(<Reports />);

      // Change time range
      const timeRangeSelect = screen.getByDisplayValue(&apos;Last 6 months&apos;);
      await user.click(timeRangeSelect);

      const option = screen.getByText(&apos;Last 3 months&apos;);
      await user.click(option);

      // Verify dependency change triggers new data fetch
      expect(useAsyncDataAll).toHaveBeenCalledWith(expect.any(Object), {
        deps: [3],
      });
    });
  });

  describe(&apos;Accessibility Integration&apos;, () => {
    it(&apos;should maintain accessibility throughout user interactions&apos;, async () => {
      const user = userEvent.setup();

      (useAsyncDataAll as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      });

      render(<Reports />);

      // Test keyboard navigation
      await user.tab();
      await user.tab();
      await user.keyboard(&apos;{Enter}&apos;);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        &apos;Exporting comprehensive report for:&apos;,
        &apos;6&apos;
      );

      // Test ARIA labels and roles
      const exportButton = screen.getByRole(&apos;button&apos;, {
        name: /export report/i,
      });
      expect(exportButton).toBeInTheDocument();

      const timeRangeSelect = screen.getByRole(&apos;combobox&apos;);
      expect(timeRangeSelect).toBeInTheDocument();
    });
  });
});
