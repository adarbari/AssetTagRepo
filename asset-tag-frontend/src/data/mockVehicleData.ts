/**
 * Mock Vehicle Data
 *
 * Centralized data for vehicles and vehicle-asset pairings.
 * In production, this will be replaced with API calls.
 */

import type { Vehicle } from '../types';

export interface VehiclePairing {
  id: string;
  vehicleId: string;
  vehicleName: string;
  assetIds: string[];
  assetNames: string[];
  pairedAt: string;
  pairedBy: string;
  unpairedAt?: string;
  purpose?: string;
  jobId?: string;
  jobName?: string;
  active: boolean;
}

export interface PairingHistory {
  id: string;
  vehicleId: string;
  vehicleName: string;
  assetId: string;
  assetName: string;
  pairedAt: string;
  unpairedAt?: string;
  duration?: number; // minutes
  distance?: number; // miles
  purpose?: string;
}

// Mock vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: 'veh-001',
    name: 'Truck F-350',
    type: 'Pickup Truck',
    licensePlate: 'ABC-123',
    status: 'active',
    location: {
      lat: 37.7749,
      lng: -122.4194,
    },
    assignedDriver: 'John Smith',
    lastSeen: '2 min ago',
  },
  {
    id: 'veh-002',
    name: 'Van Transit 250',
    type: 'Cargo Van',
    licensePlate: 'XYZ-789',
    status: 'active',
    location: {
      lat: 37.7849,
      lng: -122.4094,
    },
    assignedDriver: 'Jane Doe',
    lastSeen: '5 min ago',
  },
  {
    id: 'veh-003',
    name: 'Flatbed Truck',
    type: 'Flatbed',
    licensePlate: 'FLT-456',
    status: 'active',
    location: {
      lat: 37.7649,
      lng: -122.4294,
    },
    assignedDriver: 'Mike Johnson',
    lastSeen: '1 min ago',
  },
  {
    id: 'veh-004',
    name: 'SUV Explorer',
    type: 'SUV',
    licensePlate: 'SUV-321',
    status: 'maintenance',
    lastSeen: '2 hours ago',
  },
  {
    id: 'veh-005',
    name: 'Box Truck',
    type: 'Box Truck',
    licensePlate: 'BOX-654',
    status: 'inactive',
    lastSeen: '1 day ago',
  },
];

// Mock active pairings
export const mockPairings: VehiclePairing[] = [
  {
    id: 'pair-001',
    vehicleId: 'veh-001',
    vehicleName: 'Truck F-350',
    assetIds: ['AT-42891', 'AT-42894'],
    assetNames: ['Excavator CAT 320', 'Tool Kit Professional'],
    pairedAt: '2025-01-04T08:00:00Z',
    pairedBy: 'John Smith',
    purpose: 'Construction Job',
    jobId: 'job-001',
    jobName: 'Downtown Construction',
    active: true,
  },
  {
    id: 'pair-002',
    vehicleId: 'veh-002',
    vehicleName: 'Van Transit 250',
    assetIds: ['AT-42892'],
    assetNames: ['Generator Diesel 50kW'],
    pairedAt: '2025-01-04T07:30:00Z',
    pairedBy: 'Jane Doe',
    purpose: 'Emergency Power Supply',
    active: true,
  },
  {
    id: 'pair-003',
    vehicleId: 'veh-003',
    vehicleName: 'Flatbed Truck',
    assetIds: ['AT-42893'],
    assetNames: ['Concrete Mixer M400'],
    pairedAt: '2025-01-04T09:00:00Z',
    pairedBy: 'Mike Johnson',
    purpose: 'Site Delivery',
    active: true,
  },
];

// Mock pairing history
export const mockPairingHistory: PairingHistory[] = [
  {
    id: 'hist-001',
    vehicleId: 'veh-001',
    vehicleName: 'Truck F-350',
    assetId: 'AT-42891',
    assetName: 'Excavator CAT 320',
    pairedAt: '2025-01-03T08:00:00Z',
    unpairedAt: '2025-01-03T17:00:00Z',
    duration: 540, // 9 hours
    distance: 45,
    purpose: 'Construction Job',
  },
  {
    id: 'hist-002',
    vehicleId: 'veh-002',
    vehicleName: 'Van Transit 250',
    assetId: 'AT-42892',
    assetName: 'Generator Diesel 50kW',
    pairedAt: '2025-01-02T09:00:00Z',
    unpairedAt: '2025-01-02T14:00:00Z',
    duration: 300, // 5 hours
    distance: 25,
    purpose: 'Power Supply',
  },
  {
    id: 'hist-003',
    vehicleId: 'veh-003',
    vehicleName: 'Flatbed Truck',
    assetId: 'AT-42893',
    assetName: 'Concrete Mixer M400',
    pairedAt: '2025-01-01T07:00:00Z',
    unpairedAt: '2025-01-01T16:00:00Z',
    duration: 540,
    distance: 60,
    purpose: 'Site Delivery',
  },
];

/**
 * API Functions (will be real API calls in production)
 */

export async function getVehicles(): Promise<Vehicle[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockVehicles;
}

export async function getVehicleById(id: string): Promise<Vehicle | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockVehicles.find(v => v.id === id);
}

export async function getActivePairings(): Promise<VehiclePairing[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockPairings.filter(p => p.active);
}

export async function getPairingHistory(
  vehicleId?: string,
  assetId?: string
): Promise<PairingHistory[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  let history = mockPairingHistory;

  if (vehicleId) {
    history = history.filter(h => h.vehicleId === vehicleId);
  }

  if (assetId) {
    history = history.filter(h => h.assetId === assetId);
  }

  return history;
}

export async function createPairing(
  pairing: Omit<VehiclePairing, 'id' | 'pairedAt'>
): Promise<VehiclePairing> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const newPairing: VehiclePairing = {
    ...pairing,
    id: `pair-${Date.now()}`,
    pairedAt: new Date().toISOString(),
    active: true,
  };

  return newPairing;
}

export async function unpairAssets(_pairingId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200));
  // In production, this would call the API to unpair
}

export async function updateVehicleLocation(
  vehicleId: string,
  location: { lat: number; lng: number }
): Promise<Vehicle> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const vehicle = mockVehicles.find(v => v.id === vehicleId);
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  return {
    ...vehicle,
    location,
    lastSeen: 'Just now',
  };
}
