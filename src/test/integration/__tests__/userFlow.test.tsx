import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Reports } from '../../components/Reports'
import { useAsyncDataAll } from '../../hooks/useAsyncData'

// Mock the useAsyncDataAll hook
vi.mock('../../hooks/useAsyncData', () => ({
  useAsyncDataAll: vi.fn(),
}))

// Mock the GenerateReportDialog component
vi.mock('../../components/GenerateReportDialog', () => ({
  GenerateReportDialog: ({ open, onOpenChange, reportType }: any) => (
    <div data-testid="generate-report-dialog" data-open={open} data-report-type={reportType}>
      <button onClick={() => onOpenChange(false)}>Close Dialog</button>
    </div>
  ),
}))

// Mock recharts components
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ dataKey, name }: any) => <div data-testid={`bar-${dataKey}`} data-name={name} />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: ({ dataKey, name }: any) => <div data-testid={`line-${dataKey}`} data-name={name} />,
  XAxis: ({ dataKey }: any) => <div data-testid={`x-axis-${dataKey}`} />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  FileText: () => <div data-testid="file-text-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Battery: () => <div data-testid="battery-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Building2: () => <div data-testid="building-2-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  X: () => <div data-testid="x-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  MoreHorizontal: () => <div data-testid="more-horizontal-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-2-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  User: () => <div data-testid="user-icon" />,
  Home: () => <div data-testid="home-icon" />,
  BarChart3: () => <div data-testid="bar-chart-3-icon" />,
  PieChart: () => <div data-testid="pie-chart-icon" />,
  LineChart: () => <div data-testid="line-chart-icon" />,
  TrendingDown: () => <div data-testid="trending-down-icon" />,
  ArrowUp: () => <div data-testid="arrow-up-icon" />,
  ArrowDown: () => <div data-testid="arrow-down-icon" />,
  Check: () => <div data-testid="check-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  Info: () => <div data-testid="info-icon" />,
  HelpCircle: () => <div data-testid="help-circle-icon" />,
  ExternalLink: () => <div data-testid="external-link-icon" />,
  Copy: () => <div data-testid="copy-icon" />,
  Share: () => <div data-testid="share-icon" />,
  Heart: () => <div data-testid="heart-icon" />,
  Star: () => <div data-testid="star-icon" />,
  ThumbsUp: () => <div data-testid="thumbs-up-icon" />,
  ThumbsDown: () => <div data-testid="thumbs-down-icon" />,
  MessageCircle: () => <div data-testid="message-circle-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  Globe: () => <div data-testid="globe-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Unlock: () => <div data-testid="unlock-icon" />,
  Key: () => <div data-testid="key-icon" />,
  Wifi: () => <div data-testid="wifi-icon" />,
  WifiOff: () => <div data-testid="wifi-off-icon" />,
  Signal: () => <div data-testid="signal-icon" />,
  SignalZero: () => <div data-testid="signal-zero-icon" />,
  SignalLow: () => <div data-testid="signal-low-icon" />,
  SignalMedium: () => <div data-testid="signal-medium-icon" />,
  SignalHigh: () => <div data-testid="signal-high-icon" />,
  SignalMax: () => <div data-testid="signal-max-icon" />,
  Volume2: () => <div data-testid="volume-2-icon" />,
  VolumeX: () => <div data-testid="volume-x-icon" />,
  Play: () => <div data-testid="play-icon" />,
  Pause: () => <div data-testid="pause-icon" />,
  Stop: () => <div data-testid="stop-icon" />,
  SkipBack: () => <div data-testid="skip-back-icon" />,
  SkipForward: () => <div data-testid="skip-forward-icon" />,
  Repeat: () => <div data-testid="repeat-icon" />,
  Shuffle: () => <div data-testid="shuffle-icon" />,
  Music: () => <div data-testid="music-icon" />,
  Headphones: () => <div data-testid="headphones-icon" />,
  Mic: () => <div data-testid="mic-icon" />,
  MicOff: () => <div data-testid="mic-off-icon" />,
  Video: () => <div data-testid="video-icon" />,
  VideoOff: () => <div data-testid="video-off-icon" />,
  Camera: () => <div data-testid="camera-icon" />,
  CameraOff: () => <div data-testid="camera-off-icon" />,
  Image: () => <div data-testid="image-icon" />,
  ImageOff: () => <div data-testid="image-off-icon" />,
  File: () => <div data-testid="file-icon" />,
  FileImage: () => <div data-testid="file-image-icon" />,
  FileVideo: () => <div data-testid="file-video-icon" />,
  FileAudio: () => <div data-testid="file-audio-icon" />,
  FileArchive: () => <div data-testid="file-archive-icon" />,
  FileCode: () => <div data-testid="file-code-icon" />,
  FileSpreadsheet: () => <div data-testid="file-spreadsheet-icon" />,
  FilePdf: () => <div data-testid="file-pdf-icon" />,
  FileWord: () => <div data-testid="file-word-icon" />,
  FileExcel: () => <div data-testid="file-excel-icon" />,
  FilePowerpoint: () => <div data-testid="file-powerpoint-icon" />,
  Folder: () => <div data-testid="folder-icon" />,
  FolderOpen: () => <div data-testid="folder-open-icon" />,
  FolderPlus: () => <div data-testid="folder-plus-icon" />,
  FolderMinus: () => <div data-testid="folder-minus-icon" />,
  FolderX: () => <div data-testid="folder-x-icon" />,
  FolderCheck: () => <div data-testid="folder-check-icon" />,
  FolderLock: () => <div data-testid="folder-lock-icon" />,
  FolderUnlock: () => <div data-testid="folder-unlock-icon" />,
  FolderHeart: () => <div data-testid="folder-heart-icon" />,
  FolderStar: () => <div data-testid="folder-star-icon" />,
  FolderUp: () => <div data-testid="folder-up-icon" />,
  FolderDown: () => <div data-testid="folder-down-icon" />,
  FolderLeft: () => <div data-testid="folder-left-icon" />,
  FolderRight: () => <div data-testid="folder-right-icon" />,
  FolderInput: () => <div data-testid="folder-input-icon" />,
  FolderOutput: () => <div data-testid="folder-output-icon" />,
  FolderSync: () => <div data-testid="folder-sync-icon" />,
  FolderGit: () => <div data-testid="folder-git-icon" />,
  FolderGit2: () => <div data-testid="folder-git-2-icon" />,
  FolderGitBranch: () => <div data-testid="folder-git-branch-icon" />,
  FolderGitCommit: () => <div data-testid="folder-git-commit-icon" />,
  FolderGitPullRequest: () => <div data-testid="folder-git-pull-request-icon" />,
  FolderGitMerge: () => <div data-testid="folder-git-merge-icon" />,
  FolderGitDiff: () => <div data-testid="folder-git-diff-icon" />,
  FolderGitLog: () => <div data-testid="folder-git-log-icon" />,
  FolderGitRef: () => <div data-testid="folder-git-ref-icon" />,
  FolderGitTag: () => <div data-testid="folder-git-tag-icon" />,
  FolderGitTree: () => <div data-testid="folder-git-tree-icon" />,
  FolderGitWorktree: () => <div data-testid="folder-git-worktree-icon" />,
  FolderGitSubmodule: () => <div data-testid="folder-git-submodule-icon" />,
  FolderGitLfs: () => <div data-testid="folder-git-lfs-icon" />,
  FolderGitIgnore: () => <div data-testid="folder-git-ignore-icon" />,
  FolderGitAttributes: () => <div data-testid="folder-git-attributes-icon" />,
  FolderGitConfig: () => <div data-testid="folder-git-config-icon" />,
  FolderGitHooks: () => <div data-testid="folder-git-hooks-icon" />,
  FolderGitInfo: () => <div data-testid="folder-git-info-icon" />,
  FolderGitLogs: () => <div data-testid="folder-git-logs-icon" />,
  FolderGitObjects: () => <div data-testid="folder-git-objects-icon" />,
  FolderGitRefs: () => <div data-testid="folder-git-refs-icon" />,
  FolderGitRemotes: () => <div data-testid="folder-git-remotes-icon" />,
  FolderGitSparseCheckout: () => <div data-testid="folder-git-sparse-checkout-icon" />,
  FolderGitWorktrees: () => <div data-testid="folder-git-worktrees-icon" />,
}))

// Mock window.location.reload
const mockReload = vi.fn()
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
})

// Mock console.log
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

describe('User Flow Integration Tests', () => {
  const mockData = {
    utilization: [
      { month: 'Jan', utilization: 85, idle: 10, maintenance: 5 },
      { month: 'Feb', utilization: 90, idle: 5, maintenance: 5 },
    ],
    costSavings: [
      { month: 'Jan', theftPrevention: 10000, laborSaved: 5000, insurance: 2000, maintenanceSavings: 3000 },
      { month: 'Feb', theftPrevention: 12000, laborSaved: 6000, insurance: 2500, maintenanceSavings: 3500 },
    ],
    topAssets: [
      { id: '1', name: 'Asset 1', type: 'Equipment', utilization: 95, hours: 200, revenue: 50000, location: 'Site A' },
      { id: '2', name: 'Asset 2', type: 'Vehicle', utilization: 88, hours: 180, revenue: 45000, location: 'Site B' },
    ],
    templates: [
      { id: '1', name: 'Monthly Report', type: 'monthly', description: 'Monthly asset report', lastGenerated: '2024-01-01' },
      { id: '2', name: 'Quarterly Report', type: 'quarterly', description: 'Quarterly summary', lastGenerated: '2024-01-01' },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockConsoleLog.mockClear()
    mockReload.mockClear()
  })

  describe('Complete Reports User Flow', () => {
    it('should complete the full reports workflow from loading to report generation', async () => {
      const user = userEvent.setup()
      
      // Start with loading state
      ;(useAsyncDataAll as any).mockReturnValue({
        data: null,
        loading: true,
        error: null,
      })

      const { rerender } = render(<Reports />)
      
      // Verify loading state
      expect(screen.getByText('Loading reports...')).toBeInTheDocument()
      
      // Simulate data loading completion
      ;(useAsyncDataAll as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      })

      rerender(<Reports />)
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Reports & Analytics')).toBeInTheDocument()
      })
      
      // Verify all sections are rendered
      expect(screen.getByText('Total ROI')).toBeInTheDocument()
      expect(screen.getByText('Theft Prevention')).toBeInTheDocument()
      expect(screen.getByText('Labor Savings')).toBeInTheDocument()
      expect(screen.getByText('Insurance Reduction')).toBeInTheDocument()
      
      // Verify charts are rendered
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      
      // Verify top assets are displayed
      expect(screen.getByText('Asset 1')).toBeInTheDocument()
      expect(screen.getByText('Asset 2')).toBeInTheDocument()
      
      // Verify report templates are displayed
      expect(screen.getByText('Monthly Report')).toBeInTheDocument()
      expect(screen.getByText('Quarterly Report')).toBeInTheDocument()
      
      // Test time range change
      const timeRangeSelect = screen.getByDisplayValue('Last 6 months')
      await user.click(timeRangeSelect)
      
      const option = screen.getByText('Last 12 months')
      await user.click(option)
      
      expect(screen.getByDisplayValue('Last 12 months')).toBeInTheDocument()
      
      // Test report generation
      const monthlyReportButton = screen.getByText('Monthly Report')
      await user.click(monthlyReportButton)
      
      const dialog = screen.getByTestId('generate-report-dialog')
      expect(dialog).toHaveAttribute('data-open', 'true')
      expect(dialog).toHaveAttribute('data-report-type', 'monthly')
      
      // Test export functionality
      const exportButton = screen.getByText('Export Report')
      await user.click(exportButton)
      
      expect(mockConsoleLog).toHaveBeenCalledWith('Exporting comprehensive report for:', '12')
      
      // Test dialog closure
      const closeButton = screen.getByText('Close Dialog')
      await user.click(closeButton)
      
      expect(dialog).toHaveAttribute('data-open', 'false')
    })

    it('should handle error recovery flow', async () => {
      const user = userEvent.setup()
      
      // Start with error state
      ;(useAsyncDataAll as any).mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Network error'),
      })

      render(<Reports />)
      
      // Verify error state
      expect(screen.getByText('Failed to load reports')).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
      
      // Test error recovery
      const tryAgainButton = screen.getByText('Try Again')
      await user.click(tryAgainButton)
      
      expect(mockReload).toHaveBeenCalledTimes(1)
    })

    it('should handle empty data states gracefully', async () => {
      const emptyData = {
        utilization: [],
        costSavings: [],
        topAssets: [],
        templates: [],
      }
      
      ;(useAsyncDataAll as any).mockReturnValue({
        data: emptyData,
        loading: false,
        error: null,
      })

      render(<Reports />)
      
      // Verify empty states are handled
      expect(screen.getByText('No asset data available')).toBeInTheDocument()
      expect(screen.getByText('No report templates')).toBeInTheDocument()
    })
  })

  describe('Data Flow Integration', () => {
    it('should properly integrate data fetching with component rendering', () => {
      ;(useAsyncDataAll as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      })

      render(<Reports />)
      
      // Verify useAsyncDataAll was called with correct parameters
      expect(useAsyncDataAll).toHaveBeenCalledWith(
        {
          utilization: expect.any(Function),
          costSavings: expect.any(Function),
          topAssets: expect.any(Function),
          templates: expect.any(Function),
        },
        { deps: [6] }
      )
      
      // Verify data is properly displayed
      expect(screen.getByText('45K')).toBeInTheDocument() // Total ROI
      expect(screen.getByText('22K')).toBeInTheDocument() // Theft Prevention
      expect(screen.getByText('11.0K')).toBeInTheDocument() // Labor Savings
      expect(screen.getByText('4.5K')).toBeInTheDocument() // Insurance Reduction
    })

    it('should handle dependency changes correctly', async () => {
      const user = userEvent.setup()
      
      ;(useAsyncDataAll as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      })

      const { rerender } = render(<Reports />)
      
      // Change time range
      const timeRangeSelect = screen.getByDisplayValue('Last 6 months')
      await user.click(timeRangeSelect)
      
      const option = screen.getByText('Last 3 months')
      await user.click(option)
      
      // Verify dependency change triggers new data fetch
      expect(useAsyncDataAll).toHaveBeenCalledWith(
        expect.any(Object),
        { deps: [3] }
      )
    })
  })

  describe('Accessibility Integration', () => {
    it('should maintain accessibility throughout user interactions', async () => {
      const user = userEvent.setup()
      
      ;(useAsyncDataAll as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      })

      render(<Reports />)
      
      // Test keyboard navigation
      await user.tab()
      await user.tab()
      await user.keyboard('{Enter}')
      
      expect(mockConsoleLog).toHaveBeenCalledWith('Exporting comprehensive report for:', '6')
      
      // Test ARIA labels and roles
      const exportButton = screen.getByRole('button', { name: /export report/i })
      expect(exportButton).toBeInTheDocument()
      
      const timeRangeSelect = screen.getByRole('combobox')
      expect(timeRangeSelect).toBeInTheDocument()
    })
  })
})
