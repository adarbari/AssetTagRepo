/**
 * Centralized dropdown options for the application
 *
 * In production, these will be fetched from the backend API.
 * For now, they serve as mock data with a structure that matches
 * what the API will eventually return.
 *
 * Each option follows the pattern: { value: string, label: string }
 * This makes it easy to switch to API data later.
 */

export interface DropdownOption {
  value: string;
  label: string;
}

// Asset Types
export const assetTypes: DropdownOption[] = [
  { value: 'heavy-equipment', label: 'Heavy Equipment' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'tools', label: 'Tools' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'trailer', label: 'Trailer' },
  { value: 'generator', label: 'Generator' },
  { value: 'compressor', label: 'Compressor' },
  { value: 'scaffolding', label: 'Scaffolding' },
];

// Asset Statuses
export const assetStatuses: DropdownOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'in-transit', label: 'In Transit' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'checked-out', label: 'Checked Out' },
  { value: 'retired', label: 'Retired' },
  { value: 'lost', label: 'Lost' },
];

// Asset Owners / Personnel
export const assetOwners: DropdownOption[] = [
  { value: 'john-smith', label: 'John Smith' },
  { value: 'mike-johnson', label: 'Mike Johnson' },
  { value: 'sarah-connor', label: 'Sarah Connor' },
  { value: 'david-brown', label: 'David Brown' },
  { value: 'maria-garcia', label: 'Maria Garcia' },
  { value: 'unassigned', label: 'Unassigned' },
];

// Projects / Work Orders
export const projects: DropdownOption[] = [
  { value: 'alpha', label: 'Project Alpha - Downtown Construction' },
  { value: 'beta', label: 'Project Beta - Highway Expansion' },
  { value: 'gamma', label: 'Project Gamma - Bridge Repair' },
  { value: 'delta', label: 'Project Delta - Residential Complex' },
  { value: 'none', label: 'No Project' },
];

// Notification Channels
export const notificationChannels: DropdownOption[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push Notification' },
  { value: 'webhook', label: 'Webhook' },
];

// Lost Item Notification Mechanisms
export const lostItemMechanisms: DropdownOption[] = [
  { value: 'immediate', label: 'Immediate - Alert on signal loss' },
  { value: '15min', label: 'After 15 minutes offline' },
  { value: '30min', label: 'After 30 minutes offline' },
  { value: '1hour', label: 'After 1 hour offline' },
  { value: '2hours', label: 'After 2 hours offline' },
  { value: 'geofence', label: 'On geofence violation' },
];

// Manufacturers (common ones - can be extended)
export const manufacturers: DropdownOption[] = [
  { value: 'caterpillar', label: 'Caterpillar' },
  { value: 'generac', label: 'Generac' },
  { value: 'multiquip', label: 'Multiquip' },
  { value: 'milwaukee', label: 'Milwaukee' },
  { value: 'pj-trailers', label: 'PJ Trailers' },
  { value: 'deere', label: 'John Deere' },
  { value: 'kubota', label: 'Kubota' },
  { value: 'volvo', label: 'Volvo' },
  { value: 'komatsu', label: 'Komatsu' },
  { value: 'bobcat', label: 'Bobcat' },
  { value: 'other', label: 'Other' },
];

// Alert Types
export const alertTypes: DropdownOption[] = [
  { value: 'geofence', label: 'Geofence Violation' },
  { value: 'battery', label: 'Low Battery' },
  { value: 'movement', label: 'Unauthorized Movement' },
  { value: 'offline', label: 'Device Offline' },
  { value: 'maintenance', label: 'Maintenance Due' },
  { value: 'temperature', label: 'Temperature Alert' },
];

// Alert Severities
export const alertSeverities: DropdownOption[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];

// Site Types
export const siteTypes: DropdownOption[] = [
  { value: 'construction', label: 'Construction Site' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'depot', label: 'Storage Depot' },
  { value: 'office', label: 'Office' },
  { value: 'yard', label: 'Equipment Yard' },
  { value: 'other', label: 'Other' },
];

// Geofence Types
export const geofenceTypes: DropdownOption[] = [
  { value: 'circular', label: 'Circular' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'site-boundary', label: 'Site Boundary' },
];

// Maintenance Types
export const maintenanceTypes: DropdownOption[] = [
  { value: 'preventive', label: 'Preventive Maintenance' },
  { value: 'corrective', label: 'Corrective Maintenance' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'calibration', label: 'Calibration' },
  { value: 'repair', label: 'Repair' },
];

// Maintenance Priorities
export const maintenancePriorities: DropdownOption[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

// Maintenance Statuses
export const maintenanceStatuses: DropdownOption[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Priority Levels (general use)
export const priorityLevels: DropdownOption[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

// Technicians / Maintenance Personnel
export const technicians: DropdownOption[] = [
  { value: 'mike-wilson', label: 'Mike Wilson' },
  { value: 'sarah-johnson', label: 'Sarah Johnson' },
  { value: 'john-smith', label: 'John Smith' },
  { value: 'emily-davis', label: 'Emily Davis' },
  { value: 'robert-jones', label: 'Robert Jones' },
  { value: 'lisa-brown', label: 'Lisa Brown' },
];

// Issue Types (for reporting issues)
export const issueTypes: DropdownOption[] = [
  { value: 'mechanical', label: 'Mechanical Failure' },
  { value: 'electrical', label: 'Electrical Issue' },
  { value: 'battery', label: 'Battery Problem' },
  { value: 'connectivity', label: 'Connectivity Issue' },
  { value: 'damage', label: 'Physical Damage' },
  { value: 'tracking', label: 'Tracking Malfunction' },
  { value: 'software', label: 'Software/Firmware Issue' },
  { value: 'other', label: 'Other' },
];

// Issue Severities
export const issueSeverities: DropdownOption[] = [
  { value: 'low', label: 'Low - Minor issue, can wait' },
  { value: 'medium', label: 'Medium - Needs attention soon' },
  { value: 'high', label: 'High - Urgent, affects operations' },
  { value: 'critical', label: 'Critical - Immediate attention required' },
];

// Clients
export const clients: DropdownOption[] = [
  { value: 'client-001', label: 'ABC Construction Corp' },
  { value: 'client-002', label: 'Metro Infrastructure Ltd' },
  { value: 'client-003', label: 'BuildRight Solutions' },
  { value: 'client-004', label: 'Premier Development Group' },
  { value: 'client-005', label: 'Urban Builders Inc' },
];

// Project Managers
export const projectManagers: DropdownOption[] = [
  { value: 'pm-001', label: 'James Anderson' },
  { value: 'pm-002', label: 'Maria Rodriguez' },
  { value: 'pm-003', label: 'David Chen' },
  { value: 'pm-004', label: 'Sarah Thompson' },
  { value: 'pm-005', label: 'Michael Brown' },
];

// Job Priorities
export const jobPriorities: DropdownOption[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

// Job Statuses
export const jobStatuses: DropdownOption[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Vehicle Types
export const vehicleTypes: DropdownOption[] = [
  { value: 'pickup-truck', label: 'Pickup Truck' },
  { value: 'box-truck', label: 'Box Truck' },
  { value: 'cargo-van', label: 'Cargo Van' },
  { value: 'flatbed-truck', label: 'Flatbed Truck' },
  { value: 'service-truck', label: 'Service Truck' },
  { value: 'trailer', label: 'Trailer' },
];

// Drivers
export const drivers: DropdownOption[] = [
  { value: 'mike-wilson', label: 'Mike Wilson' },
  { value: 'sarah-johnson', label: 'Sarah Johnson' },
  { value: 'john-smith', label: 'John Smith' },
  { value: 'emily-davis', label: 'Emily Davis' },
  { value: 'robert-jones', label: 'Robert Jones' },
  { value: 'unassigned', label: 'Unassigned' },
];

// Asset Availability
export const assetAvailability: DropdownOption[] = [
  { value: 'available', label: 'Available' },
  { value: 'assigned', label: 'Assigned to Job' },
  { value: 'in-use', label: 'In Use' },
  { value: 'maintenance', label: 'In Maintenance' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'unavailable', label: 'Unavailable' },
];

// Team Members (Active personnel for job assignments)
export const teamMembers: DropdownOption[] = [
  { value: 'tm-001', label: 'John Smith - Foreman' },
  { value: 'tm-002', label: 'Sarah Connor - Equipment Operator' },
  { value: 'tm-003', label: 'Mike Johnson - Site Supervisor' },
  { value: 'tm-004', label: 'Emily Davis - Safety Officer' },
  { value: 'tm-005', label: 'David Brown - Lead Technician' },
  { value: 'tm-006', label: 'Maria Garcia - Quality Inspector' },
  { value: 'tm-007', label: 'Robert Jones - Electrician' },
  { value: 'tm-008', label: 'Lisa Brown - Mechanic' },
  { value: 'tm-009', label: 'James Wilson - Carpenter' },
  { value: 'tm-010', label: 'Anna Martinez - Project Coordinator' },
];

// Vehicle-Asset Pairing Expiration Mechanisms
export const expirationMechanisms: DropdownOption[] = [
  { value: 'manual', label: 'Manual Unload Only' },
  { value: 'time-based', label: 'Time-Based Expiration' },
  { value: 'geofence-exit', label: 'Unload on Geofence Exit' },
  { value: 'geofence-enter', label: 'Unload on Geofence Entry' },
  { value: 'time-and-geofence', label: 'Time + Geofence Combined' },
];

/**
 * Helper function to get label from value
 */
export function getOptionLabel(
  options: DropdownOption[],
  value: string
): string {
  return options.find(opt => opt.value === value)?.label || value;
}

/**
 * Helper function to get value from label (reverse lookup)
 */
export function getOptionValue(
  options: DropdownOption[],
  label: string
): string {
  return options.find(opt => opt.label === label)?.value || label;
}

/**
 * Future API integration points
 *
 * When backend is ready, replace the above constants with these async functions:
 *
 * export async function fetchAssetTypes(): Promise<DropdownOption[]> {
 *   const response = await fetch('/api/dropdown-options/asset-types');
 *   return response.json();
 * }
 *
 * export async function fetchAssetStatuses(): Promise<DropdownOption[]> {
 *   const response = await fetch('/api/dropdown-options/asset-statuses');
 *   return response.json();
 * }
 *
 * ... and so on for each dropdown type
 */
