import type {
  Asset,
  Site,
  Alert,
  MaintenanceRecord,
  Geofence,
  Personnel,
  ActivityEvent,
} from '../types';

// Shared mock assets - used across all components to ensure consistency
export const mockAssets: Asset[] = [
  {
    id: 'AT-42891',
    name: 'Excavator CAT 320',
    type: 'Heavy Equipment',
    status: 'checked-out',
    location: 'Job Site Alpha',
    site: 'Construction Site A',
    lastSeen: '2 min ago',
    battery: 87,
    assignedTo: 'John Smith',
    serialNumber: 'CAT320-2019-8472',
    manufacturer: 'Caterpillar',
    model: '320 GC',
    purchaseDate: '2019-03-15',
    warrantyExpiry: '2025-03-15',
    lastMaintenance: '2024-09-15',
    nextMaintenance: '2025-03-15',
    coordinates: [37.7749, -122.4194],
    temperature: 72,
    movement: 'stationary',
    hourlyRate: 125.0,
    availability: 'assigned',
    assignedJobId: 'JOB-001',
    assignedJobName: 'Downtown Construction Project',
    assignmentStartDate: '2025-10-01T08:00:00Z',
    assignmentEndDate: '2025-12-31T17:00:00Z',
  },
  {
    id: 'AT-42892',
    name: 'Generator Diesel 50kW',
    type: 'Equipment',
    status: 'active',
    location: 'Warehouse B',
    site: 'Main Warehouse',
    lastSeen: '15 min ago',
    battery: 92,
    assignedTo: 'Unassigned',
    serialNumber: 'GEN50KW-2020-3421',
    manufacturer: 'Generac',
    model: 'RD50A',
    purchaseDate: '2020-06-20',
    warrantyExpiry: '2025-06-20',
    lastMaintenance: '2024-08-20',
    nextMaintenance: '2025-02-20',
    coordinates: [37.7849, -122.4094],
    temperature: 68,
    movement: 'stationary',
    hourlyRate: 45.0,
    availability: 'available',
  },
  {
    id: 'AT-42893',
    name: 'Concrete Mixer M400',
    type: 'Equipment',
    status: 'in-transit',
    location: 'Route 95 North',
    site: 'In Transit',
    lastSeen: '1 min ago',
    battery: 76,
    assignedTo: 'Mike Johnson',
    serialNumber: 'MIX400-2021-9823',
    manufacturer: 'Multiquip',
    model: 'M400H',
    purchaseDate: '2021-01-10',
    warrantyExpiry: '2026-01-10',
    lastMaintenance: '2024-09-01',
    nextMaintenance: '2025-03-01',
    coordinates: [37.7949, -122.3994],
    temperature: 75,
    movement: 'moving',
    hourlyRate: 65.0,
    availability: 'in-use',
  },
  {
    id: 'AT-42894',
    name: 'Tool Kit Professional',
    type: 'Tools',
    status: 'active',
    location: 'Job Site Beta',
    site: 'Construction Site B',
    lastSeen: '5 min ago',
    battery: 45,
    assignedTo: 'Sarah Connor',
    serialNumber: 'TK-PRO-2022-5612',
    manufacturer: 'Milwaukee',
    model: 'PRO-KIT-200',
    purchaseDate: '2022-04-12',
    warrantyExpiry: '2027-04-12',
    lastMaintenance: '2024-07-12',
    nextMaintenance: '2025-01-12',
    coordinates: [37.7649, -122.4294],
    temperature: 70,
    movement: 'stationary',
    hourlyRate: 15.0,
    availability: 'assigned',
    assignedJobId: 'JOB-002',
    assignedJobName: 'Highway Expansion Project',
    assignmentStartDate: '2025-09-15T08:00:00Z',
    assignmentEndDate: '2025-11-30T17:00:00Z',
  },
  {
    id: 'AT-42895',
    name: 'Trailer Flatbed 20ft',
    type: 'Vehicle',
    status: 'active',
    location: 'Unknown - Outside Boundary',
    site: 'Storage Depot',
    lastSeen: '1 hour ago',
    battery: 12,
    assignedTo: 'Unassigned',
    serialNumber: 'FLAT20-2018-7734',
    manufacturer: 'PJ Trailers',
    model: 'F8-20',
    purchaseDate: '2018-08-22',
    warrantyExpiry: '2023-08-22',
    lastMaintenance: '2024-06-22',
    nextMaintenance: '2024-12-22',
    coordinates: [37.745, -122.45], // Outside GEO-004 boundary (125ft radius)
    temperature: 65,
    movement: 'stationary',
    hourlyRate: 35.0,
    availability: 'available',
  },
  {
    id: 'AT-42896',
    name: 'Air Compressor 185CFM',
    type: 'Equipment',
    status: 'active',
    location: 'Unknown - Outside Boundary',
    site: 'Construction Site A',
    lastSeen: '3 min ago',
    battery: 98,
    assignedTo: 'Tom Brady',
    serialNumber: 'AC185-2020-4421',
    manufacturer: 'Atlas Copco',
    model: 'XAHS 186',
    purchaseDate: '2020-11-05',
    warrantyExpiry: '2025-11-05',
    lastMaintenance: '2024-09-05',
    hourlyRate: 55.0,
    availability: 'maintenance',
    nextMaintenance: '2025-03-05',
    coordinates: [37.79, -122.405], // Outside GEO-001 boundary
    temperature: 73,
    movement: 'stationary',
  },
  {
    id: 'AT-42897',
    name: 'Forklift Toyota 8FGU25',
    type: 'Vehicle',
    status: 'maintenance',
    location: 'Unknown - Outside Boundary',
    site: 'Main Warehouse',
    lastSeen: '3 hours ago',
    battery: 5,
    assignedTo: 'Unassigned',
    serialNumber: 'FORK25-2017-2891',
    manufacturer: 'Toyota',
    model: '8FGU25',
    purchaseDate: '2017-05-18',
    warrantyExpiry: '2022-05-18',
    lastMaintenance: '2024-08-18',
    nextMaintenance: '2024-11-18',
    coordinates: [37.775, -122.4], // Outside GEO-002 boundary (100ft radius)
    temperature: 66,
    movement: 'stationary',
  },
];

// Helper function to map site names to site IDs
const siteNameToIdMap: Record<string, string> = {
  'Construction Site A': 'SITE-001',
  'Main Warehouse': 'SITE-002',
  'Construction Site B': 'SITE-003',
  'Storage Depot': 'SITE-004',
  'In Transit': 'SITE-TRANSIT', // Special site for in-transit assets
};

export const mockSites: Site[] = [
  {
    id: 'SITE-001',
    name: 'Construction Site A',
    location: '123 Main St, San Francisco, CA',
    assets: 0, // Will be computed from assetIds.length
    area: '50,000 sq ft',
    status: 'active',
    manager: 'John Smith',
    coordinates: {
      lat: 37.7749,
      lng: -122.4194,
      radius: 800,
    },
    tolerance: 50,
    address: '123 Main St, San Francisco, CA 94102',
    phone: '+1 (415) 555-0100',
    email: 'site-a@company.com',
    description: 'Primary construction site for downtown development project',
    assetIds: [],
    personnelIds: [],
  },
  {
    id: 'SITE-002',
    name: 'Main Warehouse',
    location: '456 Oak Ave, San Francisco, CA',
    assets: 0, // Will be computed from assetIds.length
    area: '75,000 sq ft',
    status: 'active',
    manager: 'Sarah Connor',
    coordinates: {
      lat: 37.7849,
      lng: -122.4094,
      radius: 1000,
    },
    tolerance: 30,
    address: '456 Oak Ave, San Francisco, CA 94103',
    phone: '+1 (415) 555-0200',
    email: 'warehouse@company.com',
    description: 'Central storage and distribution facility',
    assetIds: [],
    personnelIds: [],
  },
  {
    id: 'SITE-003',
    name: 'Construction Site B',
    location: '789 Pine Blvd, Oakland, CA',
    assets: 0, // Will be computed from assetIds.length
    area: '35,000 sq ft',
    status: 'active',
    manager: 'Mike Johnson',
    coordinates: {
      lat: 37.7649,
      lng: -122.4294,
      radius: 600,
    },
    tolerance: 40,
    address: '789 Pine Blvd, Oakland, CA 94607',
    phone: '+1 (510) 555-0300',
    email: 'site-b@company.com',
    description: 'Oakland commercial development site',
    assetIds: [],
    personnelIds: [],
  },
  {
    id: 'SITE-004',
    name: 'Storage Depot',
    location: '321 Elm Rd, Berkeley, CA',
    assets: 0, // Will be computed from assetIds.length
    area: '25,000 sq ft',
    status: 'active',
    manager: 'Tom Brady',
    coordinates: {
      lat: 37.7549,
      lng: -122.4394,
      radius: 500,
    },
    tolerance: 25,
    address: '321 Elm Rd, Berkeley, CA 94704',
    phone: '+1 (510) 555-0400',
    email: 'depot@company.com',
    description: 'Equipment storage and staging area',
    assetIds: [],
    personnelIds: [],
  },
];

// Populate assetIds and personnelIds for each site based on asset.site and personnel.currentSite
function populateSiteRelationships() {
  // Clear existing relationships
  mockSites.forEach(site => {
    site.assetIds = [];
    site.personnelIds = [];
  });

  // Populate asset relationships
  mockAssets.forEach(asset => {
    if (asset.site) {
      const siteId = siteNameToIdMap[asset.site];
      if (siteId) {
        const site = mockSites.find(s => s.id === siteId);
        if (site && !site.assetIds.includes(asset.id)) {
          site.assetIds.push(asset.id);
        }
      }
    }
  });

  // Populate personnel relationships (will be called after mockPersonnel is defined)
  try {
    if (typeof mockPersonnel !== 'undefined' && mockPersonnel) {
      mockPersonnel.forEach(person => {
        if (person.currentSite) {
          const site = mockSites.find(s => s.id === person.currentSite);
          if (site && !site.personnelIds.includes(person.id)) {
            site.personnelIds.push(person.id);
          }
        }
      });
    }
  } catch (error) {
    // mockPersonnel not yet defined, will be populated later
    // console.log('Personnel relationships will be populated after mockPersonnel is defined');
  }

  // Update assets count
  mockSites.forEach(site => {
    site.assets = site.assetIds.length;
  });
}

// Initial population of asset relationships will be called after mockPersonnel is defined

export const mockAlerts: Alert[] = [
  // Theft Alerts
  {
    id: 'ALT-1001',
    type: 'theft',
    severity: 'critical',
    asset: 'Concrete Mixer M400',
    assetId: 'AT-42893',
    message: 'Asset movement detected outside operational hours',
    timestamp: '2024-10-04T02:35:00',
    status: 'active',
    location: 'Route 95 North',
    reason:
      'Movement detected at 2:35 AM (outside 6 AM - 8 PM operating hours)',
    suggestedAction: 'Contact security team and verify authorized access',
    metadata: {
      movementSpeed: '45 mph',
      lastAuthorizedUser: 'John Smith',
      operatingHours: '6 AM - 8 PM',
    },
  },
  {
    id: 'ALT-1002',
    type: 'theft',
    severity: 'critical',
    asset: 'Generator 50kW',
    assetId: 'AT-42898',
    message: 'Unusual movement pattern detected',
    timestamp: '2024-10-04T03:12:00',
    status: 'active',
    location: 'Unknown',
    reason: 'Asset moved 15 miles in unexpected direction from normal site',
    suggestedAction: 'Initiate theft protocol and notify law enforcement',
    metadata: {
      expectedLocation: 'Construction Site A',
      currentDistance: '15.3 miles',
      normalPattern: 'stationary at night',
    },
  },

  // Battery Alerts
  {
    id: 'ALT-1003',
    type: 'battery',
    severity: 'critical',
    asset: 'Trailer Flatbed 20ft',
    assetId: 'AT-42895',
    message: 'Battery level critically low (8%)',
    timestamp: '2024-10-04T10:30:00',
    status: 'active',
    location: 'Depot C',
    reason: 'Battery below critical threshold of 10%',
    suggestedAction: 'Replace or recharge tracker battery immediately',
    autoResolvable: false,
    metadata: {
      batteryLevel: 8,
      threshold: 10,
      estimatedTimeRemaining: '6 hours',
    },
  },
  {
    id: 'ALT-1004',
    type: 'battery',
    severity: 'warning',
    asset: 'Forklift Toyota 8FGU25',
    assetId: 'AT-42897',
    message: 'Battery level low (18%)',
    timestamp: '2024-10-04T11:45:00',
    status: 'active',
    location: 'Warehouse B',
    reason: 'Battery below warning threshold of 20%',
    suggestedAction: 'Schedule battery replacement within 48 hours',
    autoResolvable: false,
    metadata: {
      batteryLevel: 18,
      threshold: 20,
      estimatedTimeRemaining: '2 days',
    },
  },

  // Compliance Alerts
  {
    id: 'ALT-1005',
    type: 'compliance',
    severity: 'critical',
    asset: 'Excavator CAT 320',
    assetId: 'AT-42891',
    message: 'Asset outside designated geofence boundary',
    timestamp: '2024-10-04T09:20:00',
    status: 'active',
    location: '3.2 miles from Construction Zone A',
    geofenceId: 'GF-001',
    reason: 'Required to be within Construction Zone A geofence',
    suggestedAction:
      'Return asset to authorized zone or update compliance requirements',
    metadata: {
      geofenceName: 'Construction Zone A',
      distanceFromBoundary: '3.2 miles',
      expectedLocation: 'Construction Zone A',
    },
  },
  {
    id: 'ALT-1006',
    type: 'compliance',
    severity: 'warning',
    asset: 'Hydraulic Pump HP-500',
    assetId: 'AT-42896',
    message: 'Certification expiring in 7 days',
    timestamp: '2024-10-04T08:00:00',
    status: 'acknowledged',
    location: 'Main Warehouse',
    reason: 'Safety certification expires on Oct 11, 2024',
    suggestedAction: 'Schedule recertification inspection before expiry',
    metadata: {
      certificationType: 'Safety Inspection',
      expiryDate: '2024-10-11',
      daysRemaining: 7,
    },
  },

  // Underutilized Alerts
  {
    id: 'ALT-1007',
    type: 'underutilized',
    severity: 'info',
    asset: 'Scissor Lift SL-30',
    assetId: 'AT-42892',
    message: 'Asset unused for 14 days',
    timestamp: '2024-10-04T07:00:00',
    status: 'active',
    location: 'Warehouse A',
    reason: 'No movement or checkout activity in past 2 weeks',
    suggestedAction:
      'Consider relocating to active site or scheduling for rental',
    metadata: {
      daysIdle: 14,
      lastUsedDate: '2024-09-20',
      utilizationRate: '12%',
      potentialSavings: '$450/month',
    },
  },
  {
    id: 'ALT-1008',
    type: 'underutilized',
    severity: 'warning',
    asset: 'Compressor AC-200',
    assetId: 'AT-42899',
    message: 'Low utilization rate (8% over 30 days)',
    timestamp: '2024-10-04T07:00:00',
    status: 'active',
    location: 'Storage Yard',
    reason: 'Asset active only 2.4 days in past month',
    suggestedAction: 'Review asset allocation or consider disposition',
    metadata: {
      utilizationRate: 8,
      daysActive: 2.4,
      periodDays: 30,
      targetUtilization: 60,
    },
  },

  // Offline/Not Reachable Alerts
  {
    id: 'ALT-1009',
    type: 'offline',
    severity: 'critical',
    asset: 'Welding Machine W-450',
    assetId: 'AT-42894',
    message: 'Asset offline for 6 hours',
    timestamp: '2024-10-04T05:30:00',
    status: 'active',
    location: 'Last known: Construction Site B',
    reason: 'No GPS signal received since 11:30 PM',
    suggestedAction:
      'Check tracker power/connectivity or physically locate asset',
    metadata: {
      lastSeen: '2024-10-03T23:30:00',
      offlineDuration: '6 hours',
      lastBatteryLevel: 45,
      possibleCauses: [
        'Dead tracker battery',
        'Signal obstruction',
        'Device tampered',
      ],
    },
  },
  {
    id: 'ALT-1010',
    type: 'offline',
    severity: 'warning',
    asset: 'Chainsaw Stihl MS-250',
    assetId: 'AT-42900',
    message: 'Intermittent connectivity issues',
    timestamp: '2024-10-04T08:45:00',
    status: 'active',
    location: 'Last known: Forest Site',
    reason: 'GPS signal lost/regained 8 times in past 24 hours',
    suggestedAction: 'Check tracker mounting and antenna connection',
    metadata: {
      signalDrops: 8,
      period: '24 hours',
      averageSignalStrength: 'weak',
    },
  },

  // Unauthorized Zone Entry Alerts
  {
    id: 'ALT-1011',
    type: 'unauthorized-zone',
    severity: 'critical',
    asset: 'Service Truck F-150',
    assetId: 'AT-42901',
    message: 'Asset entered restricted area',
    timestamp: '2024-10-04T13:22:00',
    status: 'active',
    location: 'Hazardous Materials Zone',
    geofenceId: 'GF-005',
    reason: 'Entered Hazardous Materials Zone without authorization',
    suggestedAction: 'Immediately contact driver and exit restricted area',
    metadata: {
      restrictedZone: 'Hazardous Materials Zone',
      entryTime: '2024-10-04T13:22:00',
      authorizationRequired: true,
      securityLevel: 'high',
    },
  },
  {
    id: 'ALT-1012',
    type: 'unauthorized-zone',
    severity: 'warning',
    asset: 'Pallet Jack PJ-100',
    assetId: 'AT-42902',
    message: 'Asset in unauthorized zone',
    timestamp: '2024-10-04T14:05:00',
    status: 'acknowledged',
    location: 'Competitor Site Boundary',
    geofenceId: 'GF-008',
    reason: 'Asset detected within competitor facility boundary',
    suggestedAction: 'Verify asset location and retrieve if unauthorized',
    metadata: {
      zone: 'Competitor Site',
      alertThreshold: 'immediate',
    },
  },

  // Predictive Maintenance Alerts
  {
    id: 'ALT-1013',
    type: 'predictive-maintenance',
    severity: 'warning',
    asset: 'Air Compressor AC-300',
    assetId: 'AT-42903',
    message: 'Vibration levels above normal threshold',
    timestamp: '2024-10-04T12:30:00',
    status: 'active',
    location: 'Workshop',
    reason:
      'Sensor detecting abnormal vibration patterns indicating bearing wear',
    suggestedAction: 'Schedule inspection within 7 days to prevent failure',
    metadata: {
      vibrationLevel: 'high',
      normalRange: '0.1-0.3 mm/s',
      currentLevel: '0.8 mm/s',
      predictedFailure: '14-21 days',
      confidence: '82%',
    },
  },
  {
    id: 'ALT-1014',
    type: 'predictive-maintenance',
    severity: 'critical',
    asset: 'Hydraulic Press HP-1000',
    assetId: 'AT-42904',
    message: 'Temperature anomaly detected',
    timestamp: '2024-10-04T15:10:00',
    status: 'active',
    location: 'Manufacturing Floor',
    reason:
      'Operating temperature 15°C above normal, indicating potential hydraulic fluid issue',
    suggestedAction: 'Stop operations and inspect hydraulic system immediately',
    metadata: {
      currentTemp: 85,
      normalTemp: 70,
      threshold: 75,
      possibleIssues: [
        'Low hydraulic fluid',
        'Cooling system failure',
        'Pump malfunction',
      ],
      recommendedAction: 'immediate inspection',
    },
  },
  {
    id: 'ALT-1015',
    type: 'predictive-maintenance',
    severity: 'info',
    asset: 'Generator 50kW',
    assetId: 'AT-42898',
    message: 'Usage pattern suggests maintenance due soon',
    timestamp: '2024-10-04T07:00:00',
    status: 'active',
    location: 'Remote Site',
    reason: 'Running hours approaching maintenance threshold',
    suggestedAction: 'Schedule preventive maintenance within 30 days',
    metadata: {
      runningHours: 980,
      maintenanceInterval: 1000,
      hoursRemaining: 20,
      estimatedDays: 25,
    },
  },
];

export const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'MAINT-001',
    assetId: 'AT-42897',
    assetName: 'Forklift Toyota 8FGU25',
    type: 'scheduled',
    status: 'overdue',
    priority: 'high',
    scheduledDate: '2024-11-18',
    assignedTo: 'Mike Johnson',
    description: 'Quarterly maintenance inspection and oil change',
    estimatedDuration: '3 hours',
    cost: 450,
  },
  {
    id: 'MAINT-002',
    assetId: 'AT-42891',
    assetName: 'Excavator CAT 320',
    type: 'scheduled',
    status: 'pending',
    priority: 'medium',
    scheduledDate: '2025-03-15',
    assignedTo: 'Tom Brady',
    description: 'Annual service and hydraulic system check',
    estimatedDuration: '6 hours',
    cost: 1200,
  },
];

export const mockGeofences: Geofence[] = [
  {
    id: 'GEO-001',
    name: 'Construction Site A Perimeter',
    type: 'polygon',
    status: 'active',
    assets: 15,
    coordinates: [
      [37.7749, -122.4194],
      [37.7759, -122.4194],
      [37.7759, -122.4184],
      [37.7749, -122.4184],
    ],
    siteId: 'SITE-001',
    tolerance: 50,
    alertOnEntry: true,
    alertOnExit: true,
    geofenceType: 'authorized',
    expectedAssetIds: ['AT-42891', 'AT-42896', 'AT-42893'], // Excavator (inside), Air Compressor (VIOLATION - outside), Concrete Mixer (VIOLATION - in transit)
  },
  {
    id: 'GEO-002',
    name: 'Warehouse B Zone',
    type: 'circular',
    status: 'active',
    assets: 28,
    center: [37.7849, -122.4094],
    radius: 100,
    siteId: 'SITE-002',
    tolerance: 30,
    alertOnEntry: true,
    alertOnExit: true,
    geofenceType: 'authorized',
    expectedAssetIds: ['AT-42892', 'AT-42897'], // Generator (inside), Forklift (VIOLATION - outside)
  },
  {
    id: 'GEO-003',
    name: 'Job Site Beta Boundary',
    type: 'circular',
    status: 'active',
    assets: 12,
    center: [37.7649, -122.4294],
    radius: 150,
    siteId: 'SITE-003',
    tolerance: 40,
    alertOnEntry: true,
    alertOnExit: false,
    geofenceType: 'authorized',
    expectedAssetIds: ['AT-42894'], // Tool Kit (inside) - no violations
  },
  {
    id: 'GEO-004',
    name: 'Storage Depot Zone',
    type: 'circular',
    status: 'active',
    assets: 8,
    center: [37.7549, -122.4394],
    radius: 125,
    siteId: 'SITE-004',
    tolerance: 25,
    alertOnEntry: false,
    alertOnExit: true,
    geofenceType: 'authorized',
    expectedAssetIds: ['AT-42895'], // Trailer (VIOLATION - outside)
  },
  {
    id: 'GEO-005',
    name: 'Restricted Zone - Airport',
    type: 'circular',
    status: 'active',
    assets: 0,
    center: [37.8, -122.45],
    radius: 3000,
    tolerance: 100,
    alertOnEntry: true,
    alertOnExit: false,
    geofenceType: 'restricted',
    expectedAssetIds: [], // No assets should be in restricted zones
  },
];

// Helper function to update a site in the mock data
// In production, this would be an API call
export function updateSite(siteId: string, updates: Partial<Site>): Site {
  const siteIndex = mockSites.findIndex(s => s.id === siteId);
  if (siteIndex === -1) {
    throw new Error(`Site ${siteId} not found`);
  }

  mockSites[siteIndex] = { ...mockSites[siteIndex], ...updates };
  return mockSites[siteIndex];
}

// Helper function to get a site by ID
export function getSiteById(siteId: string): Site | undefined {
  return mockSites.find(s => s.id === siteId);
}

// Helper function to create a new geofence in the mock data
// In production, this would be an API call
export function createGeofence(geofence: Geofence): Geofence {
  // Check if geofence with this ID already exists
  const exists = mockGeofences.find(g => g.id === geofence.id);
  if (exists) {
    throw new Error(`Geofence ${geofence.id} already exists`);
  }

  mockGeofences.push(geofence);
  return geofence;
}

// Helper function to update a geofence in the mock data
// In production, this would be an API call
export function updateGeofence(
  geofenceId: string,
  updates: Partial<Geofence>
): Geofence {
  const geofenceIndex = mockGeofences.findIndex(g => g.id === geofenceId);
  if (geofenceIndex === -1) {
    throw new Error(`Geofence ${geofenceId} not found`);
  }

  mockGeofences[geofenceIndex] = {
    ...mockGeofences[geofenceIndex],
    ...updates,
  };
  return mockGeofences[geofenceIndex];
}

// Helper function to get a geofence by ID
export function getGeofenceById(geofenceId: string): Geofence | undefined {
  return mockGeofences.find(g => g.id === geofenceId);
}

// Helper function to generate a unique geofence ID
export function generateGeofenceId(): string {
  const maxId = mockGeofences.reduce((max, g) => {
    const num = parseInt(g.id.replace('GEO-', ''));
    return num > max ? num : max;
  }, 0);
  return `GEO-${String(maxId + 1).padStart(3, '0')}`;
}

// Helper function to delete a geofence from the mock data
// In production, this would be an API call
export function deleteGeofence(geofenceId: string): boolean {
  const geofenceIndex = mockGeofences.findIndex(g => g.id === geofenceId);
  if (geofenceIndex === -1) {
    return false;
  }

  mockGeofences.splice(geofenceIndex, 1);
  return true;
}

// Helper function to generate activity events for assets and personnel
function generateActivityHistory(
  entityId: string,
  _currentSiteId?: string
): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const now = new Date();
  const sites = mockSites;

  // Generate events for the last 30 days
  for (let day = 30; day >= 0; day--) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);

    // Randomly generate 0-3 site visits per day
    const visitsToday = Math.floor(Math.random() * 4);

    for (let visit = 0; visit < visitsToday; visit++) {
      const site = sites[Math.floor(Math.random() * sites.length)];
      const arrivalHour = 6 + Math.floor(Math.random() * 10); // 6 AM to 4 PM
      const durationHours = 2 + Math.floor(Math.random() * 6); // 2-8 hours

      const arrival = new Date(date);
      arrival.setHours(arrivalHour, Math.floor(Math.random() * 60), 0, 0);

      const departure = new Date(arrival);
      departure.setHours(
        arrival.getHours() + durationHours,
        Math.floor(Math.random() * 60),
        0,
        0
      );

      events.push({
        id: `${entityId}-arrival-${date.toISOString()}-${visit}`,
        timestamp: arrival,
        siteId: site.id,
        siteName: site.name,
        type: 'arrival',
      });

      events.push({
        id: `${entityId}-departure-${date.toISOString()}-${visit}`,
        timestamp: departure,
        siteId: site.id,
        siteName: site.name,
        type: 'departure',
      });
    }
  }

  // Sort by timestamp
  events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return events;
}

// Generate activity history for each asset
export const assetActivityMap = new Map<string, ActivityEvent[]>();
mockAssets.forEach(asset => {
  assetActivityMap.set(asset.id, generateActivityHistory(asset.id, asset.site));
});

// Mock personnel with activity tracking
export const mockPersonnel: Personnel[] = [
  {
    id: 'PERSON-001',
    name: 'John Smith',
    role: 'Site Manager',
    status: 'on-duty',
    currentSite: 'SITE-001',
    activityHistory: generateActivityHistory('PERSON-001', 'SITE-001'),
  },
  {
    id: 'PERSON-002',
    name: 'Sarah Connor',
    role: 'Warehouse Manager',
    status: 'on-duty',
    currentSite: 'SITE-002',
    activityHistory: generateActivityHistory('PERSON-002', 'SITE-002'),
  },
  {
    id: 'PERSON-003',
    name: 'Mike Johnson',
    role: 'Equipment Operator',
    status: 'on-duty',
    currentSite: 'SITE-003',
    activityHistory: generateActivityHistory('PERSON-003', 'SITE-003'),
  },
  {
    id: 'PERSON-004',
    name: 'Tom Brady',
    role: 'Foreman',
    status: 'on-duty',
    currentSite: 'SITE-001',
    activityHistory: generateActivityHistory('PERSON-004', 'SITE-001'),
  },
  {
    id: 'PERSON-005',
    name: 'Lisa Anderson',
    role: 'Safety Inspector',
    status: 'on-duty',
    currentSite: 'SITE-002',
    activityHistory: generateActivityHistory('PERSON-005', 'SITE-002'),
  },
  {
    id: 'PERSON-006',
    name: 'David Martinez',
    role: 'Equipment Operator',
    status: 'on-duty',
    currentSite: 'SITE-003',
    activityHistory: generateActivityHistory('PERSON-006', 'SITE-003'),
  },
  {
    id: 'PERSON-007',
    name: 'Emily Chen',
    role: 'Maintenance Tech',
    status: 'on-duty',
    currentSite: 'SITE-001',
    activityHistory: generateActivityHistory('PERSON-007', 'SITE-001'),
  },
  {
    id: 'PERSON-008',
    name: 'Robert Wilson',
    role: 'Logistics Coordinator',
    status: 'on-duty',
    currentSite: 'SITE-002',
    activityHistory: generateActivityHistory('PERSON-008', 'SITE-002'),
  },
];

// Populate personnel relationships now that mockPersonnel is defined
populateSiteRelationships();

// Helper function to get activity history for an asset
export function getAssetActivity(assetId: string): ActivityEvent[] {
  return assetActivityMap.get(assetId) || [];
}

// Helper function to get activity history for personnel
export function getPersonnelActivity(personnelId: string): ActivityEvent[] {
  const person = mockPersonnel.find(p => p.id === personnelId);
  return person?.activityHistory || [];
}

// Helper function to get all assets at a site
export function getAssetsAtSite(siteId: string): Asset[] {
  const site = mockSites.find(s => s.id === siteId);
  if (!site) return [];

  return mockAssets.filter(asset => site.assetIds.includes(asset.id));
}

// Helper function to get all personnel at a site
export function getPersonnelAtSite(siteId: string): Personnel[] {
  const site = mockSites.find(s => s.id === siteId);
  if (!site) return [];

  return mockPersonnel.filter(person => site.personnelIds.includes(person.id));
}

// Helper function to get asset by ID
export function getAssetById(assetId: string): Asset | undefined {
  return mockAssets.find(a => a.id === assetId);
}

// Helper function to get personnel by ID
export function getPersonnelById(personnelId: string): Personnel | undefined {
  return mockPersonnel.find(p => p.id === personnelId);
}

// Helper function to add asset to site
export function addAssetToSite(assetId: string, siteId: string): void {
  const site = mockSites.find(s => s.id === siteId);
  const asset = mockAssets.find(a => a.id === assetId);

  if (!site || !asset) return;

  // Remove from previous site
  mockSites.forEach(s => {
    const index = s.assetIds.indexOf(assetId);
    if (index > -1) {
      s.assetIds.splice(index, 1);
      s.assets = s.assetIds.length;
    }
  });

  // Add to new site
  if (!site.assetIds.includes(assetId)) {
    site.assetIds.push(assetId);
    site.assets = site.assetIds.length;
  }

  // Update asset's site field
  asset.site = site.name;
}

// Helper function to add personnel to site
export function addPersonnelToSite(personnelId: string, siteId: string): void {
  const site = mockSites.find(s => s.id === siteId);
  const person = mockPersonnel.find(p => p.id === personnelId);

  if (!site || !person) return;

  // Remove from previous site
  mockSites.forEach(s => {
    const index = s.personnelIds.indexOf(personnelId);
    if (index > -1) {
      s.personnelIds.splice(index, 1);
    }
  });

  // Add to new site
  if (!site.personnelIds.includes(personnelId)) {
    site.personnelIds.push(personnelId);
  }

  // Update personnel's currentSite field
  person.currentSite = siteId;
}

// Helper function to update an asset in the mock data
// In production, this would be an API call
export function updateAsset(assetId: string, updates: Partial<Asset>): Asset {
  const assetIndex = mockAssets.findIndex(a => a.id === assetId);
  if (assetIndex === -1) {
    throw new Error(`Asset ${assetId} not found`);
  }

  mockAssets[assetIndex] = { ...mockAssets[assetIndex], ...updates };

  // If site was updated, refresh site relationships
  if (updates.site !== undefined) {
    populateSiteRelationships();
  }

  return mockAssets[assetIndex];
}

// Helper function to get all assets
// In production, this would be an API call
export function getAllAssets(): Asset[] {
  return mockAssets;
}

// Helper function to add a new asset to the mock data
// In production, this would be an API call
export function addAsset(assetData: Omit<Asset, 'id'>): Asset {
  // Generate a new unique ID
  const maxId = mockAssets.reduce((max, asset) => {
    const idNum = parseInt(asset.id.split('-')[1]);
    return idNum > max ? idNum : max;
  }, 42890);

  const newAsset: Asset = {
    id: `AT-${maxId + 1}`,
    ...assetData,
  };

  mockAssets.push(newAsset);

  // If asset has a site, update site relationships
  if (newAsset.site) {
    populateSiteRelationships();
  }

  return newAsset;
}

// Helper function to update an existing asset
// In production, this would be an API call
export function updateMockAsset(
  assetId: string,
  updates: Partial<Asset>
): Asset | null {
  const assetIndex = mockAssets.findIndex(a => a.id === assetId);

  if (assetIndex === -1) {
// // // // // // // console.warn(`Asset ${assetId} not found`);
    return null;
  }

  // Update the asset
  mockAssets[assetIndex] = {
    ...mockAssets[assetIndex],
    ...updates,
  };

  // If site was updated, refresh site relationships
  if (updates.site !== undefined) {
    populateSiteRelationships();
  }

  return mockAssets[assetIndex];
}

// Re-export dropdown options from centralized location
// This maintains backward compatibility while centralizing the data
export {
  assetTypes,
  assetOwners,
  projects,
  assetStatuses,
  manufacturers,
  notificationChannels,
  lostItemMechanisms,
} from './dropdownOptions';

// Get available sites for dropdowns
export function getAvailableSites() {
  return mockSites.map(site => ({
    value: site.id,
    label: site.name,
  }));
}

// Get available geofences for dropdowns
export function getAvailableGeofences() {
  return mockGeofences.map(geofence => ({
    value: geofence.id,
    label: geofence.name,
  }));
}

// Helper function to check if a point is within a circular geofence
// Simple distance calculation (not accounting for Earth's curvature - good enough for mock data)
function isPointInCircle(
  point: [number, number],
  center: [number, number],
  radiusInFeet: number
): boolean {
  const [lat1, lng1] = point;
  const [lat2, lng2] = center;

  // Approximate conversion: 1 degree ≈ 364,000 feet at this latitude
  const feetPerDegree = 364000;
  const dx = (lng1 - lng2) * feetPerDegree * Math.cos((lat1 * Math.PI) / 180);
  const dy = (lat1 - lat2) * feetPerDegree;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= radiusInFeet;
}

// Helper function to check if a point is within a polygon geofence
function isPointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

// Helper function to get assets that are expected in a geofence but are outside
export function getGeofenceViolatingAssets(geofenceId: string): Asset[] {
  const geofence = mockGeofences.find(g => g.id === geofenceId);
  if (
    !geofence ||
    !geofence.expectedAssetIds ||
    geofence.expectedAssetIds.length === 0
  ) {
    return [];
  }

  const violatingAssets: Asset[] = [];

  for (const assetId of geofence.expectedAssetIds) {
    const asset = mockAssets.find(a => a.id === assetId);
    if (!asset || !asset.coordinates) continue;

    let isInside = false;

    if (geofence.type === 'circular' && geofence.center && geofence.radius) {
      isInside = isPointInCircle(
        asset.coordinates,
        geofence.center,
        geofence.radius
      );
    } else if (geofence.type === 'polygon' && geofence.coordinates) {
      isInside = isPointInPolygon(asset.coordinates, geofence.coordinates);
    }

    // If asset is expected to be inside but is outside, it's violating
    if (!isInside) {
      violatingAssets.push(asset);
    }
  }

  return violatingAssets;
}

// Helper function to get assets that are expected in a geofence
export function getGeofenceExpectedAssets(geofenceId: string): Asset[] {
  const geofence = mockGeofences.find(g => g.id === geofenceId);
  if (!geofence || !geofence.expectedAssetIds) {
    return [];
  }

  return mockAssets.filter(asset =>
    geofence.expectedAssetIds?.includes(asset.id)
  );
}

// Helper function to get assets that are actually inside a geofence (from the expected list)
export function getGeofenceActualAssets(geofenceId: string): Asset[] {
  const geofence = mockGeofences.find(g => g.id === geofenceId);
  if (
    !geofence ||
    !geofence.expectedAssetIds ||
    geofence.expectedAssetIds.length === 0
  ) {
    return [];
  }

  const actualAssets: Asset[] = [];

  for (const assetId of geofence.expectedAssetIds) {
    const asset = mockAssets.find(a => a.id === assetId);
    if (!asset || !asset.coordinates) continue;

    let isInside = false;

    if (geofence.type === 'circular' && geofence.center && geofence.radius) {
      isInside = isPointInCircle(
        asset.coordinates,
        geofence.center,
        geofence.radius
      );
    } else if (geofence.type === 'polygon' && geofence.coordinates) {
      isInside = isPointInPolygon(asset.coordinates, geofence.coordinates);
    }

    // If asset is actually inside, add it to the list
    if (isInside) {
      actualAssets.push(asset);
    }
  }

  return actualAssets;
}

// Helper function to get geofence compliance stats
export function getGeofenceComplianceStats(geofenceId: string): {
  expected: number;
  inside: number;
  outside: number;
  complianceRate: number;
} {
  const geofence = mockGeofences.find(g => g.id === geofenceId);
  if (!geofence || !geofence.expectedAssetIds) {
    return { expected: 0, inside: 0, outside: 0, complianceRate: 100 };
  }

  const expected = geofence.expectedAssetIds.length;
  const violating = getGeofenceViolatingAssets(geofenceId);
  const outside = violating.length;
  const inside = expected - outside;
  const complianceRate =
    expected > 0 ? Math.round((inside / expected) * 100) : 100;

  return { expected, inside, outside, complianceRate };
}
