/**
 * Mock Dashboard Data
 *
 * Centralized data for dashboard statistics and charts.
 * In production, this will be replaced with API calls to fetch real-time data.
 */

export interface DashboardStats {
  totalAssets: number;
  assetsAddedThisMonth: number;
  activeLocations: number;
  locationsOnline: number;
  trackingAccuracy: number;
  criticalAlerts: number;
  activeAlerts: number;
  batteryAlerts: number;
  lowBatteryAssets: number;
  avgBatteryLevel: number;
  assetUtilization: number;
  utilizationChange: number;
  systemStatus: 'online' | 'degraded' | 'offline';
  totalObservationsToday: number;
  observationsChange: number;
  geofenceViolations: number;
  violationsChange: number;
}

export interface LocationDataPoint {
  time: string;
  observations: number;
  assets: number;
}

export interface AssetTypeDistribution {
  name: string;
  value: number;
  color: string;
}

export interface BatteryStatusRange {
  range: string;
  count: number;
}

export interface RecentActivity {
  id: string;
  type:
    | 'asset_movement'
    | 'geofence_violation'
    | 'battery_low'
    | 'maintenance_due'
    | 'alert_triggered';
  asset: string;
  assetId: string;
  description: string;
  time: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlertBreakdown {
  type: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

// Main dashboard statistics
export const dashboardStats: DashboardStats = {
  totalAssets: 6211,
  assetsAddedThisMonth: 48,
  activeLocations: 127,
  locationsOnline: 124,
  trackingAccuracy: 94.9,
  criticalAlerts: 23,
  activeAlerts: 156,
  batteryAlerts: 91,
  lowBatteryAssets: 91,
  avgBatteryLevel: 78,
  assetUtilization: 84,
  utilizationChange: 2.4,
  systemStatus: 'online',
  totalObservationsToday: 2847231,
  observationsChange: 12.3,
  geofenceViolations: 8,
  violationsChange: -15.2,
};

// Location tracking data (24-hour timeline)
export const locationData: LocationDataPoint[] = [
  { time: '00:00', observations: 45000, assets: 3200 },
  { time: '04:00', observations: 32000, assets: 2800 },
  { time: '08:00', observations: 78000, assets: 4500 },
  { time: '12:00', observations: 95000, assets: 5200 },
  { time: '16:00', observations: 88000, assets: 4900 },
  { time: '20:00', observations: 62000, assets: 4100 },
];

// Assets by type distribution
export const assetsByType: AssetTypeDistribution[] = [
  { name: 'Tools', value: 3240, color: 'var(--chart-1)' },
  { name: 'Vehicles', value: 892, color: 'var(--chart-2)' },
  { name: 'Equipment', value: 1456, color: 'var(--chart-3)' },
  { name: 'Containers', value: 623, color: 'var(--chart-4)' },
];

// Battery status distribution
export const batteryStatus: BatteryStatusRange[] = [
  { range: '80-100%', count: 4280 },
  { range: '60-80%', count: 1120 },
  { range: '40-60%', count: 340 },
  { range: '20-40%', count: 180 },
  { range: '<20%', count: 91 },
];

// Recent activity feed
export const recentActivity: RecentActivity[] = [
  {
    id: 'act-001',
    type: 'geofence_violation',
    asset: 'Excavator CAT 320',
    assetId: 'AT-42891',
    description: 'Left authorized zone at Construction Site A',
    time: '2 min ago',
    severity: 'high',
  },
  {
    id: 'act-002',
    type: 'battery_low',
    asset: 'Trailer Flatbed 20ft',
    assetId: 'AT-42895',
    description: 'Battery level dropped to 12%',
    time: '15 min ago',
    severity: 'critical',
  },
  {
    id: 'act-003',
    type: 'asset_movement',
    asset: 'Concrete Mixer M400',
    assetId: 'AT-42893',
    description: 'Started moving on Route 95 North',
    time: '1 hour ago',
    severity: 'low',
  },
  {
    id: 'act-004',
    type: 'maintenance_due',
    asset: 'Tool Kit Professional',
    assetId: 'AT-42894',
    description: 'Scheduled maintenance due in 5 days',
    time: '2 hours ago',
    severity: 'medium',
  },
  {
    id: 'act-005',
    type: 'alert_triggered',
    asset: 'Generator Diesel 50kW',
    assetId: 'AT-42892',
    description: 'Temperature exceeded threshold (85°C)',
    time: '3 hours ago',
    severity: 'high',
  },
];

// Alert breakdown by type
export const alertBreakdown: AlertBreakdown[] = [
  { type: 'Geofence Violations', count: 45, severity: 'high', trend: 'down' },
  { type: 'Battery Low', count: 23, severity: 'critical', trend: 'up' },
  { type: 'Maintenance Due', count: 18, severity: 'medium', trend: 'stable' },
  { type: 'Temperature Alert', count: 12, severity: 'high', trend: 'down' },
  { type: 'Unauthorized Movement', count: 8, severity: 'high', trend: 'up' },
  { type: 'Asset Offline', count: 7, severity: 'medium', trend: 'stable' },
  { type: 'Compliance Issues', count: 5, severity: 'medium', trend: 'down' },
];

/**
 * Helper function to calculate percentage change
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Helper function to format large numbers
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Get dashboard stats summary
 * In production, this would be an API call
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return dashboardStats;
}

/**
 * Get location data for charts
 * In production, this would be an API call with date range parameters
 */
export async function getLocationData(
  timeRange: '24h' | '7d' | '30d' = '24h'
): Promise<LocationDataPoint[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return locationData;
}

/**
 * Get assets by type distribution
 */
export async function getAssetsByType(): Promise<AssetTypeDistribution[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return assetsByType;
}

/**
 * Get battery status distribution
 */
export async function getBatteryStatus(): Promise<BatteryStatusRange[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return batteryStatus;
}

/**
 * Get recent activity feed
 */
export async function getRecentActivity(
  limit: number = 10
): Promise<RecentActivity[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return recentActivity.slice(0, limit);
}

/**
 * Get alert breakdown
 */
export async function getAlertBreakdown(): Promise<AlertBreakdown[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return alertBreakdown;
}
