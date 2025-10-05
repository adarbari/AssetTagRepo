/**
 * Configuration Service
 * 
 * Centralized service for managing system configurations like
 * asset types, site types, user roles, etc.
 * 
 * In production, this will fetch from the backend API.
 * For now, it provides a consistent interface that can be easily
 * switched to API calls.
 */

import * as dropdownOptions from '../data/dropdownOptions';
import type { DropdownOption } from '../data/dropdownOptions';
import { mockAssets, getAvailableSites, getAvailableGeofences } from '../data/mockData';
import { mockVehicles } from '../data/mockVehicleData';

// Type for all configuration options
export type ConfigType = keyof typeof dropdownOptions;

/**
 * Fetch configuration options by type
 * Currently returns static data, but designed to be replaced with API calls
 */
export async function fetchConfig(type: ConfigType): Promise<DropdownOption[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/config/${type}`);
  // return response.json();
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const data = dropdownOptions[type];
  if (Array.isArray(data)) {
    return data as DropdownOption[];
  }
  return [];
}

/**
 * Fetch multiple configuration types at once
 */
export async function fetchMultipleConfigs(types: ConfigType[]): Promise<Record<string, DropdownOption[]>> {
  const results = await Promise.all(
    types.map(type => fetchConfig(type))
  );
  
  const configMap: Record<string, DropdownOption[]> = {};
  types.forEach((type, index) => {
    configMap[type] = results[index];
  });
  
  return configMap;
}

/**
 * Fetch users by role
 * This allows filtering users for specific purposes (e.g., only inspectors)
 */
export async function fetchUsersByRole(role?: string): Promise<DropdownOption[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/users?role=${role}`);
  // return response.json();
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Mock data - in production, this would come from the backend
  const allUsers: DropdownOption[] = [
    { value: "user-001", label: "John Smith (Inspector)" },
    { value: "user-002", label: "Sarah Connor (Inspector)" },
    { value: "user-003", label: "Mike Wilson (Technician)" },
    { value: "user-004", label: "Emily Davis (Inspector)" },
    { value: "user-005", label: "David Brown (Manager)" },
    { value: "user-006", label: "Maria Garcia (Operator)" },
    { value: "user-007", label: "Robert Jones (Technician)" },
    { value: "user-008", label: "Lisa Brown (Inspector)" },
  ];
  
  if (role === "inspector") {
    return allUsers.filter(u => u.label.includes("Inspector"));
  }
  
  if (role === "technician") {
    return allUsers.filter(u => u.label.includes("Technician"));
  }
  
  return allUsers;
}

/**
 * Fetch available assets for assignment
 */
export async function fetchAvailableAssets(): Promise<DropdownOption[]> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/assets/available');
  // return response.json();
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return mockAssets.map(asset => ({
    value: asset.id,
    label: `${asset.name} (${asset.id})`
  }));
}

/**
 * Fetch available sites
 */
export async function fetchAvailableSites(): Promise<DropdownOption[]> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/sites/available');
  // return response.json();
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return getAvailableSites();
}

/**
 * Fetch available geofences
 */
export async function fetchAvailableGeofences(): Promise<DropdownOption[]> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/geofences/available');
  // return response.json();
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return getAvailableGeofences();
}

/**
 * Fetch available vehicles
 */
export async function fetchAvailableVehicles(): Promise<DropdownOption[]> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/vehicles/available');
  // return response.json();
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return mockVehicles.map(vehicle => ({
    value: vehicle.id,
    label: `${vehicle.name} - ${vehicle.licensePlate}`
  }));
}

/**
 * Save configuration (for admin settings)
 */
export async function saveConfig(type: ConfigType, options: DropdownOption[]): Promise<void> {
  // TODO: Replace with actual API call
  // await fetch(`/api/config/${type}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(options)
  // });
  
  console.log(`Would save ${type} config to backend:`, options);
}

/**
 * Get label for a value from a specific config type
 */
export function getConfigLabel(type: ConfigType, value: string): string {
  const data = dropdownOptions[type];
  if (Array.isArray(data)) {
    const option = (data as DropdownOption[]).find(opt => opt.value === value);
    return option?.label || value;
  }
  return value;
}

/**
 * Interface for backend-ready entities
 * All create/update operations should conform to these interfaces
 */

export interface BackendAsset {
  id?: string;
  name: string;
  barcodeRfid: string;
  type: string;
  owner?: string;
  project?: string;
  cost?: number;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  site?: string;
  geofence?: string;
  inMotionTracking?: boolean;
  offHourMovementAlert?: boolean;
  notificationChannels?: string[];
  lostItemMechanism?: string;
  hourlyRate?: number;
  availability?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendVehicle {
  id?: string;
  name: string;
  type: string;
  licensePlate: string;
  driver?: string;
  capacity?: number;
  location?: string;
  assetsLoaded?: string[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendJob {
  id?: string;
  name: string;
  client: string;
  projectManager: string;
  site?: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  priority: string;
  status: string;
  assets?: string[];
  description?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendMaintenance {
  id?: string;
  assetId: string;
  type: string;
  priority: string;
  scheduledDate: string;
  assignedTo?: string;
  description?: string;
  estimatedDuration?: number;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendSite {
  id?: string;
  name: string;
  type: string;
  address?: string;
  latitude: number;
  longitude: number;
  radius?: number;
  tolerance?: number;
  manager?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendGeofence {
  id?: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  radius?: number;
  polygon?: Array<{ lat: number; lng: number }>;
  site?: string;
  alertOnEntry?: boolean;
  alertOnExit?: boolean;
  // New fields for tagging
  taggedTo?: 'vehicle' | 'asset' | 'fixed-location';
  vehicleId?: string;
  assetId?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
