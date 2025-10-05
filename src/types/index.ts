// Common types shared across the application

export type AssetAvailability = 
  | "available"
  | "assigned"
  | "in-use"
  | "maintenance"
  | "reserved"
  | "unavailable";

export interface Asset {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "maintenance" | "in-transit" | "checked-out";
  location: string;
  lastSeen: string;
  battery: number;
  site?: string;
  assignedTo?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  coordinates?: [number, number];
  temperature?: number;
  movement?: "stationary" | "moving";
  // Pricing and availability
  hourlyRate?: number;
  availability?: AssetAvailability;
  assignedJobId?: string;
  assignedJobName?: string;
  assignmentStartDate?: string;  // ISO timestamp - when asset was assigned to job
  assignmentEndDate?: string;    // ISO timestamp - when asset assignment ends
}

export interface Site {
  id: string;
  name: string;
  location: string;
  assets: number; // Computed from assetIds.length
  area: string;
  status: "active" | "inactive";
  manager?: string;
  coordinates?: {
    lat: number;
    lng: number;
    radius: number; // Site boundary radius in feet
  };
  tolerance?: number; // Buffer zone tolerance in feet
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  geofenceId?: string; // Associated geofence
  assetIds: string[]; // IDs of assets currently at this site
  personnelIds: string[]; // IDs of personnel currently at this site
}

export interface Geofence {
  id: string;
  name: string;
  type: "circular" | "polygon";
  status: "active" | "inactive";
  assets: number;
  center?: [number, number];
  radius?: number;
  coordinates?: [number, number][];
  siteId?: string; // Associated site
  siteName?: string; // Site name for display
  tolerance?: number; // Buffer zone tolerance in feet
  alertOnEntry?: boolean; // Trigger alerts when assets enter
  alertOnExit?: boolean; // Trigger alerts when assets exit
  geofenceType?: "authorized" | "restricted"; // Zone classification
  expectedAssetIds?: string[]; // Assets that should be within this geofence
  // Vehicle-based geofencing support
  locationMode?: "static" | "vehicle-based"; // NEW: Static location or follows vehicle
  vehicleId?: string; // NEW: ID of vehicle to follow (for vehicle-based mode)
  vehicleName?: string; // NEW: Name of vehicle (for display)
  // Asset attachment
  assetId?: string; // Specific asset this geofence is attached to
  assetName?: string; // Asset name for display
  // Attachment type (helps determine how to display the geofence)
  attachmentType?: "site" | "vehicle" | "asset" | "none";
}

// Vehicle type for vehicle-based geofencing
export interface Vehicle {
  id: string;
  name: string;
  type: string;
  licensePlate: string;
  status: "active" | "inactive" | "maintenance";
  location?: {
    lat: number;
    lng: number;
  };
  assignedDriver?: string;
  lastSeen?: string;
}

export type AlertType = 
  | "theft"                    // Out of hours, unusual movement pattern
  | "battery"                  // Low battery alert
  | "compliance"               // Compliance violations (geofence, certification)
  | "underutilized"           // Asset not being used effectively
  | "offline"                  // Not reachable/no signal
  | "unauthorized-zone"        // Entered restricted area
  | "predictive-maintenance"; // Predicted failure/maintenance needed

export interface Alert {
  id: string;
  type: AlertType;
  severity: "critical" | "warning" | "info";
  asset: string;
  assetId?: string;
  message: string;
  timestamp: string;
  status: "active" | "acknowledged" | "resolved";
  location?: string;
  geofenceId?: string;         // For geofence-related alerts
  reason?: string;             // Additional context
  suggestedAction?: string;    // Recommended action to take
  autoResolvable?: boolean;    // Can be auto-resolved
  metadata?: Record<string, any>; // Additional alert-specific data
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  type: "scheduled" | "unscheduled" | "inspection";
  status: "pending" | "in-progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high" | "critical";
  scheduledDate: string;
  completedDate?: string;
  assignedTo?: string;
  description: string;
  estimatedDuration?: string;
  cost?: number;
  notes?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "maintenance";
  driver?: string;
  location: string;
  lastSeen: string;
}

export interface CheckInOutRecord {
  id: string;
  assetId: string;
  assetName: string;
  type: "check-in" | "check-out";
  timestamp: string;
  user: string;
  location: string;
  notes?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: Date;
  siteId: string;
  siteName: string;
  type: "arrival" | "departure";
}

export interface Personnel {
  id: string;
  name: string;
  role: string;
  status: "on-duty" | "off-duty" | "on-break";
  currentSite?: string;
  activityHistory: ActivityEvent[];
}

// Extended Asset interface with activity tracking
export interface AssetWithActivity extends Asset {
  activityHistory: ActivityEvent[];
}

// Re-export issue types
export type { Issue, IssueType, IssueSeverity, IssueStatus, CreateIssueInput, UpdateIssueInput } from './issue';
