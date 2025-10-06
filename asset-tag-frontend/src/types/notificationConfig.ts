import { AlertType } from './index';

/**
 * Notification Configuration Hierarchy
 *
 * Supports four levels (matching alert configuration hierarchy):
 * 1. User Level (default) - Personal preferences
 * 2. Site Level - Override for specific sites
 * 3. Asset Level - Override for specific assets
 * 4. Job Level - Override for specific jobs
 *
 * Resolution order: Job → Asset → Site → User (most specific wins)
 */

export type NotificationLevel = 'user' | 'site' | 'asset' | 'job';

export type NotificationChannelType = 'email' | 'sms' | 'push' | 'webhook';

// Individual channel configuration
export interface ChannelConfig {
  enabled: boolean;
  addresses?: string[]; // For email
  phoneNumbers?: string[]; // For SMS
  devices?: string[]; // For push
  endpoints?: string[]; // For webhook
  verified?: boolean;
}

// Alert filtering preferences
export interface AlertFilters {
  types: AlertType[]; // Which alert types to receive (empty = all)
  severities: ('low' | 'medium' | 'high' | 'critical')[]; // Which severities (empty = all)
  sites?: string[]; // Site IDs to filter by (optional, empty = all)
  assets?: string[]; // Asset IDs to filter by (optional, empty = all)
}

// Quiet hours configuration
export interface QuietHours {
  enabled: boolean;
  start: string; // HH:mm format (e.g., "22:00")
  end: string; // HH:mm format (e.g., "08:00")
  timezone: string; // IANA timezone (e.g., "America/New_York")
  excludeCritical: boolean; // Send critical alerts even during quiet hours
  daysOfWeek?: number[]; // 0-6, Sunday=0 (empty = all days)
}

// Frequency limits
export interface FrequencyLimits {
  maxPerHour: number;
  maxPerDay: number;
  digestMode: boolean; // Bundle into digest notifications
  digestFrequency?: 'hourly' | 'daily' | 'weekly'; // When to send digests
}

// Base notification preferences
export interface NotificationPreferences {
  id: string;
  level: NotificationLevel;
  entityId: string; // userId, siteId, or assetId depending on level

  // Channel configurations
  channels: {
    email: ChannelConfig;
    sms: ChannelConfig;
    push: ChannelConfig;
    webhook: ChannelConfig;
  };

  // Filtering
  filters: AlertFilters;

  // Scheduling
  quietHours: QuietHours;

  // Rate limiting
  frequency: FrequencyLimits;

  // Override settings
  isOverride: boolean; // True if this overrides a parent level
  overrideReason?: string; // Optional note about why this override exists

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Effective configuration after resolution
export interface EffectiveNotificationConfig {
  preferences: NotificationPreferences;
  source: {
    level: NotificationLevel;
    entityId: string;
    entityName: string;
  };
  inheritanceChain: {
    level: NotificationLevel;
    entityId: string;
    entityName: string;
    isActive: boolean; // True if this level is being used
  }[];
  overrides: {
    field: string;
    value: any;
    source: NotificationLevel;
  }[];
}

// Configuration inspector result
export interface ConfigurationInspection {
  entityType: 'user' | 'site' | 'asset' | 'job';
  entityId: string;
  entityName: string;
  effectiveConfig: EffectiveNotificationConfig;
  availableLevels: {
    level: NotificationLevel;
    exists: boolean;
    config?: NotificationPreferences;
  }[];
}
