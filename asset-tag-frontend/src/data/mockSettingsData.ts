/**
 * Mock Settings Data
 *
 * Centralized data for all application settings.
 * In production, this will be replaced with API calls.
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  avatar?: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface CompanySettings {
  name: string;
  industry: string;
  size: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  website: string;
  logo?: string;
}

export interface SystemPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  alerts: {
    sound: boolean;
    desktop: boolean;
    volume: number;
  };
  map: {
    defaultView: 'satellite' | 'street' | 'hybrid';
    defaultZoom: number;
    clusterMarkers: boolean;
    showTrails: boolean;
  };
  dashboard: {
    refreshInterval: number; // seconds
    defaultView: 'overview' | 'alerts' | 'assets';
    compactMode: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    shareLocation: boolean;
    allowCookies: boolean;
  };
}

export interface IntegrationSettings {
  erp: {
    enabled: boolean;
    provider: string;
    apiKey: string;
    lastSync: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  cmms: {
    enabled: boolean;
    provider: string;
    apiKey: string;
    lastSync: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  gps: {
    enabled: boolean;
    provider: string;
    apiKey: string;
    refreshRate: number; // seconds
    status: 'connected' | 'disconnected' | 'error';
  };
  webhooks: {
    enabled: boolean;
    endpoints: {
      id: string;
      name: string;
      url: string;
      events: string[];
      active: boolean;
    }[];
  };
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
  permissions: string[];
}

export interface BillingInfo {
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  nextBillingDate: string;
  paymentMethod: {
    type: 'card' | 'bank' | 'invoice';
    last4: string;
    expiry: string;
  };
  usage: {
    assets: number;
    assetsLimit: number;
    observations: number;
    observationsLimit: number;
    storage: number; // GB
    storageLimit: number; // GB
  };
}

// Mock data
export const userProfile: UserProfile = {
  id: 'user-001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  role: 'Administrator',
  department: 'Operations',
  location: 'San Francisco, CA',
  timezone: 'America/Los_Angeles',
  language: 'en-US',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
};

export const companySettings: CompanySettings = {
  name: 'Acme Construction Co.',
  industry: 'Construction',
  size: '500-1000 employees',
  address: '123 Main Street',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94105',
  country: 'United States',
  phone: '+1 (555) 987-6543',
  website: 'www.acmeconstruction.com',
};

export const systemPreferences: SystemPreferences = {
  theme: 'light',
  notifications: {
    email: true,
    sms: true,
    push: true,
    inApp: true,
  },
  alerts: {
    sound: true,
    desktop: true,
    volume: 75,
  },
  map: {
    defaultView: 'satellite',
    defaultZoom: 12,
    clusterMarkers: true,
    showTrails: false,
  },
  dashboard: {
    refreshInterval: 30,
    defaultView: 'overview',
    compactMode: false,
  },
  privacy: {
    shareAnalytics: true,
    shareLocation: true,
    allowCookies: true,
  },
};

export const integrationSettings: IntegrationSettings = {
  erp: {
    enabled: false,
    provider: 'SAP',
    apiKey: '',
    lastSync: 'Never',
    status: 'disconnected',
  },
  cmms: {
    enabled: false,
    provider: 'Maximo',
    apiKey: '',
    lastSync: 'Never',
    status: 'disconnected',
  },
  gps: {
    enabled: true,
    provider: 'Traccar',
    apiKey: 'trk_live_abc123xyz',
    refreshRate: 30,
    status: 'connected',
  },
  webhooks: {
    enabled: true,
    endpoints: [
      {
        id: 'wh-001',
        name: 'Slack Notifications',
        url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX',
        events: ['geofence_violation', 'battery_low', 'asset_offline'],
        active: true,
      },
    ],
  },
};

export const teamMembers: TeamMember[] = [
  {
    id: 'tm-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    department: 'Operations',
    status: 'active',
    lastActive: '2 min ago',
    permissions: ['all'],
  },
  {
    id: 'tm-002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'manager',
    department: 'Fleet Management',
    status: 'active',
    lastActive: '15 min ago',
    permissions: ['view_assets', 'edit_assets', 'view_reports'],
  },
  {
    id: 'tm-003',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'operator',
    department: 'Field Operations',
    status: 'active',
    lastActive: '1 hour ago',
    permissions: ['view_assets', 'check_in_out'],
  },
  {
    id: 'tm-004',
    name: 'Sarah Connor',
    email: 'sarah.connor@example.com',
    role: 'manager',
    department: 'Maintenance',
    status: 'active',
    lastActive: '3 hours ago',
    permissions: ['view_assets', 'edit_assets', 'schedule_maintenance'],
  },
];

export const billingInfo: BillingInfo = {
  plan: 'professional',
  billingCycle: 'monthly',
  nextBillingDate: '2025-02-01',
  paymentMethod: {
    type: 'card',
    last4: '4242',
    expiry: '12/2026',
  },
  usage: {
    assets: 6211,
    assetsLimit: 10000,
    observations: 2847231,
    observationsLimit: 5000000,
    storage: 145,
    storageLimit: 500,
  },
};

/**
 * API functions (will be real API calls in production)
 */

export async function getUserProfile(): Promise<UserProfile> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return userProfile;
}

export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return { ...userProfile, ...updates };
}

export async function getCompanySettings(): Promise<CompanySettings> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return companySettings;
}

export async function updateCompanySettings(
  updates: Partial<CompanySettings>
): Promise<CompanySettings> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return { ...companySettings, ...updates };
}

export async function getSystemPreferences(): Promise<SystemPreferences> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return systemPreferences;
}

export async function updateSystemPreferences(
  updates: Partial<SystemPreferences>
): Promise<SystemPreferences> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return { ...systemPreferences, ...updates };
}

export async function getIntegrationSettings(): Promise<IntegrationSettings> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return integrationSettings;
}

export async function updateIntegrationSettings(
  updates: Partial<IntegrationSettings>
): Promise<IntegrationSettings> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return { ...integrationSettings, ...updates };
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return teamMembers;
}

export async function inviteTeamMember(
  email: string,
  role: TeamMember['role']
): Promise<TeamMember> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newMember: TeamMember = {
    id: `tm-${Date.now()}`,
    name: email.split('@')[0],
    email,
    role,
    department: 'Unassigned',
    status: 'pending',
    lastActive: 'Never',
    permissions: role === 'admin' ? ['all'] : ['view_assets'],
  };
  return newMember;
}

export async function removeTeamMember(_string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200));
}

export async function getBillingInfo(): Promise<BillingInfo> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return billingInfo;
}

export async function updatePaymentMethod(
  paymentMethod: BillingInfo['paymentMethod']
): Promise<BillingInfo> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return { ...billingInfo, paymentMethod };
}

export async function changePlan(
  plan: BillingInfo['plan'],
  billingCycle: BillingInfo['billingCycle']
): Promise<BillingInfo> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return { ...billingInfo, plan, billingCycle };
}
