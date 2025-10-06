/**
 * Job Management Types
 *
 * Jobs represent projects or tasks that:
 * - Associate multiple assets to a job
 * - Define which vehicle to use
 * - Track budget and costs
 * - Generate cost allocation reports
 */

export type JobStatus =
  | 'planning'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'on-hold';
export type JobPriority = 'low' | 'medium' | 'high' | 'critical';

export interface JobAsset {
  assetId: string;
  assetName: string;
  assetType: string;
  required: boolean; // Is this asset required for the job?
  loadedOnVehicle?: boolean; // Has it been loaded on the vehicle?
  loadedAt?: string; // ISO timestamp
  cost?: number; // Cost allocation for this asset
  assignmentStartDate?: string; // ISO timestamp - when asset was assigned
  assignmentEndDate?: string; // ISO timestamp - when asset assignment ends
  useFullJobDuration?: boolean; // If true, uses job's start/end dates
}

export interface JobVehicle {
  vehicleId: string;
  vehicleName: string;
  driverId?: string;
  driverName?: string;
  departureTime?: string; // ISO timestamp
  returnTime?: string; // ISO timestamp
  isAtGroundStation: boolean;
}

export interface JobBudget {
  total: number;
  labor: number;
  equipment: number;
  materials: number;
  other: number;
}

export interface JobActualCosts {
  total: number;
  labor: number;
  equipment: number;
  materials: number;
  other: number;
  lastUpdated: string; // ISO timestamp
}

export interface Job {
  id: string;
  name: string;
  description: string;
  jobNumber: string; // Unique job number (e.g., "JOB-2025-001")

  // Hierarchy
  siteId?: string;
  siteName?: string;
  clientId?: string;
  clientName?: string;

  // Status
  status: JobStatus;
  priority: JobPriority;

  // Timeline
  startDate: string; // ISO timestamp
  endDate: string; // ISO timestamp
  estimatedDuration: number; // Hours
  actualDuration?: number; // Hours

  // Assets & Vehicle
  vehicle?: JobVehicle;
  assets: JobAsset[];

  // Financial
  budget: JobBudget;
  actualCosts: JobActualCosts;
  variance: number; // budget.total - actualCosts.total
  variancePercentage: number; // (variance / budget.total) * 100

  // Ground Station (for vehicle return validation)
  groundStationGeofenceId?: string;
  groundStationName?: string;
  groundStationLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };

  // Alerts
  hasActiveAlerts: boolean;
  missingAssets?: string[]; // Asset IDs that are required but not loaded

  // People
  projectManager?: string;
  assignedTeam?: string[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  completedAt?: string;

  // Notes
  notes?: string;
  tags?: string[];
}

export interface CreateJobInput {
  name: string;
  description: string;
  siteId?: string;
  clientId?: string;
  startDate: string;
  endDate: string;
  budget: JobBudget;
  priority?: JobPriority;
  projectManager?: string;
  groundStationGeofenceId?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateJobInput {
  name?: string;
  description?: string;
  status?: JobStatus;
  priority?: JobPriority;
  startDate?: string;
  endDate?: string;
  budget?: Partial<JobBudget>;
  actualCosts?: Partial<JobActualCosts>;
  vehicle?: Partial<JobVehicle>;
  projectManager?: string;
  assignedTeam?: string[];
  clientId?: string;
  groundStationGeofenceId?: string;
  notes?: string;
  tags?: string[];
}

export interface JobCostReport {
  jobId: string;
  jobName: string;
  jobNumber: string;
  period: {
    start: string;
    end: string;
  };
  budget: JobBudget;
  actualCosts: JobActualCosts;
  variance: number;
  variancePercentage: number;
  breakdown: {
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
    variancePercentage: number;
  }[];
  assetCosts: {
    assetId: string;
    assetName: string;
    assetType: string;
    cost: number;
    hours: number;
    costPerHour: number;
  }[];
  timeline: {
    date: string;
    dailyCost: number;
    cumulativeCost: number;
    cumulativeBudget: number;
  }[];
}

export interface JobAlert {
  id: string;
  jobId: string;
  jobName: string;
  type: 'missing-assets' | 'vehicle-departed' | 'budget-exceeded' | 'overdue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: {
    vehicleId?: string;
    vehicleName?: string;
    missingAssets?: string[];
    budgetVariance?: number;
    daysOverdue?: number;
  };
  createdAt: string;
  resolvedAt?: string;
  active: boolean;
}
