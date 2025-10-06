// Enhanced types for Asset Details page - Backend Ready

// Battery Telemetry Types
export interface BatteryTelemetry {
  id: string;
  assetId: string;
  timestamp: string; // ISO 8601
  batteryLevel: number; // 0-100
  voltage?: number;
  temperature?: number;
  isCharging?: boolean;
}

export interface BatteryHistory {
  assetId: string;
  startDate: string;
  endDate: string;
  dataPoints: Array<{
    time: string;
    battery: number;
  }>;
  statistics?: {
    average: number;
    min: number;
    max: number;
    currentLevel: number;
  };
}

// Location Tracking Types
export interface LocationPoint {
  id?: string;
  assetId?: string;
  timestamp: string;
  location: string;
  lat: number;
  lng: number;
  event: 'arrived' | 'departed' | 'moving' | 'idle' | 'stopped';
  speed?: number; // mph or km/h
  heading?: number; // degrees
  distance?: number; // cumulative distance traveled
  accuracy?: number; // meters
}

export interface LocationHistory {
  assetId: string;
  startDate: string;
  endDate: string;
  trackingPoints: LocationPoint[];
  totalDistance?: number;
  averageSpeed?: number;
  maxSpeed?: number;
}

// Activity Log Types
export interface ActivityLogEntry {
  id: string | number;
  assetId?: string;
  timestamp: string;
  type:
    | 'location'
    | 'status'
    | 'checkout'
    | 'checkin'
    | 'maintenance'
    | 'alert'
    | 'edit'
    | 'assignment'
    | 'geofence'
    | 'system';
  description: string;
  user?: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error';
}

export interface ActivityLog {
  assetId: string;
  entries: ActivityLogEntry[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

// Maintenance Types
export interface MaintenanceRecord {
  id: string | number;
  assetId?: string;
  assetName?: string;
  date: string;
  type: 'Scheduled' | 'Unscheduled' | 'Repair' | 'Inspection';
  description: string;
  technician?: string;
  technicianId?: string;
  status:
    | 'pending'
    | 'scheduled'
    | 'in-progress'
    | 'completed'
    | 'overdue'
    | 'cancelled';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo?: string;
  assignedToId?: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedDuration?: string;
  actualDuration?: string;
  estimatedCost?: number;
  actualCost?: number;
  nextDue?: string;
  workPerformed?: string;
  notes?: string;
  partsUsed?: Array<{
    partId: string;
    partName: string;
    quantity: number;
    cost: number;
  }>;
}

export interface MaintenanceSchedule {
  assetId: string;
  upcoming: MaintenanceRecord[];
  history: MaintenanceRecord[];
  nextMaintenance?: {
    id: string;
    date: string;
    type: string;
    description: string;
    daysUntil?: number;
  };
}

// Alert Types for Asset Details
export interface AssetAlert {
  id: string | number;
  assetId?: string;
  assetName?: string;
  date: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category:
    | 'Battery'
    | 'Geofence'
    | 'Maintenance'
    | 'Anomaly'
    | 'Theft'
    | 'Temperature'
    | 'Offline'
    | 'Movement';
  message: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  description?: string;
  location?: string;
  coordinates?: [number, number];
  threshold?: {
    parameter: string;
    value: number;
    limit: number;
    unit: string;
  };
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
}

export interface AssetAlertHistory {
  assetId: string;
  alerts: AssetAlert[];
  statistics?: {
    total: number;
    active: number;
    resolved: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

// Cost Center Type
export interface CostCenter {
  id: string;
  code: string; // e.g., "CC-001"
  name: string; // e.g., "Construction Division"
  description?: string;
  managerId?: string;
  managerName?: string;
  department?: string;
  isActive: boolean;
  budget?: number;
  spent?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Asset Details Composite Response (for composite endpoint)
export interface AssetDetailsResponse {
  asset: any; // Import Asset from main types
  batteryHistory?: BatteryHistory;
  locationHistory?: LocationHistory;
  activityLog?: ActivityLog;
  maintenanceSchedule?: MaintenanceSchedule;
  alerts?: AssetAlertHistory;
  costCenter?: CostCenter;
  summary?: {
    batteryLevel: number;
    lastUpdate: string;
    currentSite: string;
    assignedTo: string;
    upcomingMaintenance: number;
    activeAlerts: number;
  };
}

// API Request/Response Types
export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
  days?: number; // Alternative to startDate/endDate
  aggregation?: '1h' | '4h' | '1d' | '1w';
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

export interface AlertFilters {
  status?: 'active' | 'acknowledged' | 'resolved';
  severity?: 'critical' | 'high' | 'medium' | 'low';
  category?: string;
  startDate?: string;
  endDate?: string;
}

// Check-In/Out Types
export interface CheckInData {
  userId: string;
  userName?: string;
  siteId: string;
  siteName?: string;
  notes?: string;
  timestamp?: string;
}

export interface CheckOutData {
  userId: string;
  userName?: string;
  siteId: string;
  siteName?: string;
  destination?: string;
  expectedReturn?: string;
  purpose?: string;
  notes?: string;
  timestamp?: string;
}

// Maintenance Creation
export interface CreateMaintenanceData {
  assetId: string;
  type: string;
  scheduledDate: string;
  description: string;
  priority: string;
  assignedToId?: string;
  estimatedDuration?: string;
  estimatedCost?: number;
  notes?: string;
  recurrence?: {
    type: 'hours' | 'days' | 'weeks' | 'months';
    interval: number;
  };
}

export interface UpdateMaintenanceData {
  description?: string;
  scheduledDate?: string;
  priority?: string;
  assignedToId?: string;
  status?: string;
  notes?: string;
}

export interface CompletionData {
  completedDate: string;
  workPerformed: string;
  actualDuration?: string;
  actualCost?: number;
  partsUsed?: Array<{
    partId: string;
    partName: string;
    quantity: number;
    cost: number;
  }>;
  notes?: string;
  nextDue?: string;
}
