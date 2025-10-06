/**
 * Notification Configuration Service
 *
 * Handles hierarchical notification preferences:
 * - User Level (default)
 * - Site Level (overrides user)
 * - Asset Level (overrides site and user)
 *
 * Provides configuration resolution and inspection tools.
 */

import type {
  NotificationPreferences,
  EffectiveNotificationConfig,
  ConfigurationInspection,
  NotificationLevel,
} from '../types/notificationConfig';
import type { Asset, Site } from '../types';

/**
 * Mock storage for notification preferences
 * In production, this would be replaced with API calls
 */
class NotificationConfigStore {
  private configs: Map<string, NotificationPreferences> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Default user-level config
    const userConfig: NotificationPreferences = {
      id: 'user-default-001',
      level: 'user',
      entityId: 'current-user',
      channels: {
        email: {
          enabled: true,
          addresses: ['user@example.com'],
          verified: true,
        },
        sms: {
          enabled: true,
          phoneNumbers: ['+1-555-0123'],
          verified: true,
        },
        push: {
          enabled: true,
          devices: ['device-1', 'device-2'],
        },
        webhook: {
          enabled: false,
          endpoints: [],
        },
      },
      filters: {
        types: [], // All types
        severities: ['medium', 'high', 'critical'], // Skip low severity
        sites: [],
        assets: [],
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'America/New_York',
        excludeCritical: true,
        daysOfWeek: [],
      },
      frequency: {
        maxPerHour: 10,
        maxPerDay: 50,
        digestMode: false,
      },
      isOverride: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.configs.set(this.getKey('user', 'current-user'), userConfig);
  }

  private getKey(level: NotificationLevel, entityId: string): string {
    return `${level}:${entityId}`;
  }

  get(
    level: NotificationLevel,
    entityId: string
  ): NotificationPreferences | undefined {
    return this.configs.get(this.getKey(level, entityId));
  }

  set(config: NotificationPreferences): void {
    this.configs.set(this.getKey(config.level, config.entityId), config);
  }

  delete(level: NotificationLevel, entityId: string): boolean {
    return this.configs.delete(this.getKey(level, entityId));
  }

  getAll(): NotificationPreferences[] {
    return Array.from(this.configs.values());
  }
}

// Singleton store instance
const configStore = new NotificationConfigStore();

/**
 * Resolve effective notification configuration for a given context
 *
 * Resolution order: Asset → Site → User (most specific wins)
 *
 * @param configs - Optional external configs (from App.tsx state). If not provided, uses internal store.
 */
export function resolveNotificationConfig(
  userId: string,
  siteId?: string,
  assetId?: string,
  asset?: Asset,
  site?: Site,
  configs?: Record<string, NotificationPreferences>
): EffectiveNotificationConfig {
  // Helper to get config from either external source or internal store
  const getConfig = (
    level: NotificationLevel,
    entityId: string
  ): NotificationPreferences | undefined => {
    if (configs) {
      const key = `${level}:${entityId}`;
      return configs[key];
    }
    return configStore.get(level, entityId);
  };
  const inheritanceChain: EffectiveNotificationConfig['inheritanceChain'] = [];
  let effectiveConfig: NotificationPreferences | undefined;
  let activeLevel: NotificationLevel = 'user';

  // Check user level (base level)
  const userConfig = getConfig('user', userId);
  if (userConfig) {
    inheritanceChain.push({
      level: 'user',
      entityId: userId,
      entityName: 'Your Account',
      isActive: true, // May be set to false later if overridden
    });
    effectiveConfig = userConfig;
  }

  // Check site level
  if (siteId && site) {
    const siteConfig = getConfig('site', siteId);
    if (siteConfig && siteConfig.isOverride) {
      inheritanceChain.push({
        level: 'site',
        entityId: siteId,
        entityName: site.name,
        isActive: true,
      });
      // Mark previous levels as inactive
      inheritanceChain.forEach((item, idx) => {
        if (idx < inheritanceChain.length - 1) {
          item.isActive = false;
        }
      });
      effectiveConfig = siteConfig;
      activeLevel = 'site';
    } else if (site) {
      inheritanceChain.push({
        level: 'site',
        entityId: siteId,
        entityName: site.name,
        isActive: false,
      });
    }
  }

  // Check asset level
  if (assetId && asset) {
    const assetConfig = getConfig('asset', assetId);
    if (assetConfig && assetConfig.isOverride) {
      inheritanceChain.push({
        level: 'asset',
        entityId: assetId,
        entityName: asset.name,
        isActive: true,
      });
      // Mark previous levels as inactive
      inheritanceChain.forEach((item, idx) => {
        if (idx < inheritanceChain.length - 1) {
          item.isActive = false;
        }
      });
      effectiveConfig = assetConfig;
      activeLevel = 'asset';
    } else if (asset) {
      inheritanceChain.push({
        level: 'asset',
        entityId: assetId,
        entityName: asset.name,
        isActive: false,
      });
    }
  }

  // Determine overrides
  const overrides: EffectiveNotificationConfig['overrides'] = [];
  if (activeLevel !== 'user') {
    // Compare effective config with user config to find overrides
    if (userConfig && effectiveConfig) {
      // This is simplified - in production, you'd do a deep comparison
      if (
        effectiveConfig.channels.email.enabled !==
        userConfig.channels.email.enabled
      ) {
        overrides.push({
          field: 'channels.email.enabled',
          value: effectiveConfig.channels.email.enabled,
          source: activeLevel,
        });
      }
      // Add more field comparisons as needed
    }
  }

  // Default to user config if nothing else found
  if (!effectiveConfig && userConfig) {
    effectiveConfig = userConfig;
  }

  // Create effective config result
  const result: EffectiveNotificationConfig = {
    preferences: effectiveConfig || createDefaultPreferences(userId),
    source: {
      level: activeLevel,
      entityId:
        activeLevel === 'user'
          ? userId
          : activeLevel === 'site'
            ? siteId!
            : assetId!,
      entityName:
        activeLevel === 'user'
          ? 'Your Account'
          : activeLevel === 'site'
            ? site?.name || 'Unknown Site'
            : asset?.name || 'Unknown Asset',
    },
    inheritanceChain,
    overrides,
  };

  return result;
}

/**
 * Create default preferences
 */
function createDefaultPreferences(userId: string): NotificationPreferences {
  return {
    id: `user-${userId}`,
    level: 'user',
    entityId: userId,
    channels: {
      email: { enabled: true, addresses: [], verified: false },
      sms: { enabled: false, phoneNumbers: [], verified: false },
      push: { enabled: true, devices: [] },
      webhook: { enabled: false, endpoints: [] },
    },
    filters: {
      types: [],
      severities: ['high', 'critical'],
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      excludeCritical: true,
    },
    frequency: {
      maxPerHour: 20,
      maxPerDay: 100,
      digestMode: false,
    },
    isOverride: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Inspect configuration for debugging
 *
 * @param configs - Optional external configs (from App.tsx state). If not provided, uses internal store.
 */
export function inspectConfiguration(
  entityType: 'user' | 'site' | 'asset',
  entityId: string,
  entityName: string,
  userId: string,
  siteId?: string,
  assetId?: string,
  asset?: Asset,
  site?: Site,
  configs?: Record<string, NotificationPreferences>
): ConfigurationInspection {
  const effectiveConfig = resolveNotificationConfig(
    userId,
    siteId,
    assetId,
    asset,
    site,
    configs
  );

  // Helper to get config from either external source or internal store
  const getConfig = (
    level: NotificationLevel,
    entityId: string
  ): NotificationPreferences | undefined => {
    if (configs) {
      const key = `${level}:${entityId}`;
      return configs[key];
    }
    return configStore.get(level, entityId);
  };

  // Check which levels have configurations
  const availableLevels: ConfigurationInspection['availableLevels'] = [
    {
      level: 'user',
      exists: !!getConfig('user', userId),
      config: getConfig('user', userId),
    },
  ];

  if (siteId) {
    availableLevels.push({
      level: 'site',
      exists: !!getConfig('site', siteId),
      config: getConfig('site', siteId),
    });
  }

  if (assetId) {
    availableLevels.push({
      level: 'asset',
      exists: !!getConfig('asset', assetId),
      config: getConfig('asset', assetId),
    });
  }

  return {
    entityType,
    entityId,
    entityName,
    effectiveConfig,
    availableLevels,
  };
}

/**
 * Save notification preferences
 */
export async function saveNotificationPreferences(
  config: NotificationPreferences
): Promise<void> {
  // In production, this would call the backend API
  configStore.set(config);
}

/**
 * Delete notification preferences (removes override)
 */
export async function deleteNotificationPreferences(
  level: NotificationLevel,
  entityId: string
): Promise<void> {
  // In production, this would call the backend API
  configStore.delete(level, entityId);
}

/**
 * Get notification preferences for a specific level
 */
export function getNotificationPreferences(
  level: NotificationLevel,
  entityId: string
): NotificationPreferences | undefined {
  return configStore.get(level, entityId);
}

/**
 * Create a new override configuration based on parent
 */
export function createOverride(
  parentConfig: NotificationPreferences,
  level: NotificationLevel,
  entityId: string,
  reason?: string
): NotificationPreferences {
  return {
    ...parentConfig,
    id: `${level}-${entityId}-${Date.now()}`,
    level,
    entityId,
    isOverride: true,
    overrideReason: reason,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Export store for testing/demo purposes
export { configStore };
