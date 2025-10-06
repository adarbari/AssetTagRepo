import { useState, useEffect } from 'react';
import type { NotificationPreferences } from '../types/notificationConfig';

/**
 * Custom hook for managing notification configurations
 * Handles loading, saving, and deleting notification preferences
 */
export function useNotificationConfig() {
  const [configs, setConfigs] = useState<
    Record<string, NotificationPreferences>
  >({});

  // Load notification configurations on mount
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    try {
      const saved = localStorage.getItem('notificationConfigurations');
      if (saved) {
        setConfigs(JSON.parse(saved));
      } else {
        // Initialize with default user-level config
        const defaultUserConfig: NotificationPreferences = {
          id: 'user-current-user',
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
            types: [],
            severities: ['medium', 'high', 'critical'],
          },
          quietHours: {
            enabled: true,
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

        const initialConfigs = {
          'user:current-user': defaultUserConfig,
        };

        setConfigs(initialConfigs);
        localStorage.setItem(
          'notificationConfigurations',
          JSON.stringify(initialConfigs)
        );
      }
    } catch (error) {
      // console.error('Failed to load notification configurations:', error);
    }
  };

  const saveConfig = async (config: NotificationPreferences) => {
    const key = `${config.level}:${config.entityId}`;

    const updatedConfigs = {
      ...configs,
      [key]: {
        ...config,
        updatedAt: new Date().toISOString(),
      },
    };

    setConfigs(updatedConfigs);

    try {
      localStorage.setItem(
        'notificationConfigurations',
        JSON.stringify(updatedConfigs)
      );
      // TODO: Backend integration
      // await api.saveNotificationConfig(config);
      return { success: true };
    } catch (error) {
      // console.error('Failed to save notification configuration:', error);
      return { success: false, error };
    }
  };

  const deleteConfig = async (level: string, entityId: string) => {
    if (level === 'user') {
      return {
        success: false,
        error: 'Cannot delete user-level configuration',
      };
    }

    const key = `${level}:${entityId}`;
    const { [key]: _removed, ...remaining } = configs;

    setConfigs(remaining);

    try {
      localStorage.setItem(
        'notificationConfigurations',
        JSON.stringify(remaining)
      );
      // TODO: Backend integration
      // await api.deleteNotificationConfig(level, entityId);
      return { success: true };
    } catch (error) {
      // console.error('Failed to delete notification configuration:', error);
      return { success: false, error };
    }
  };

  const getConfig = (
    level: string,
    entityId: string
  ): NotificationPreferences | undefined => {
    const key = `${level}:${entityId}`;
    return configs[key];
  };

  return {
    configs,
    saveConfig,
    deleteConfig,
    getConfig,
  };
}
