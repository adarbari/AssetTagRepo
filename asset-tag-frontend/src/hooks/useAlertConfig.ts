import { useState, useEffect } from 'react';
import type { AlertConfigurationsStore } from '../types/alertConfig';

/**
 * Custom hook for managing alert configurations
 * Handles loading, saving, and deleting alert configurations across the hierarchy
 */
export function useAlertConfig() {
  const [configs, setConfigs] = useState<AlertConfigurationsStore>({});

  // Load alert configurations on mount
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    try {
      const saved = localStorage.getItem('alertConfigurations');
      if (saved) {
        setConfigs(JSON.parse(saved));
      } else {
        setConfigs({});
      }
    } catch (error) {
// console.error('Failed to load alert configurations:', error);
    }
  };

  const saveConfig = async (config: AlertConfigurationsStore[string]) => {
    const key = `${config.level}:${config.entityId}:${config.type}`;

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
        'alertConfigurations',
        JSON.stringify(updatedConfigs)
      );
      // TODO: Backend integration
      // await api.saveAlertConfig(config);
      return { success: true };
    } catch (error) {
// console.error('Failed to save alert configuration:', error);
      return { success: false, error };
    }
  };

  const deleteConfig = async (
    level: string,
    entityId: string,
    alertType: string
  ) => {
    if (level === 'user') {
      return {
        success: false,
        error: 'Cannot delete user-level configuration',
      };
    }

    const key = `${level}:${entityId}:${alertType}`;
    const { [key]: _removed, ...remaining } = configs;

    setConfigs(remaining);

    try {
      localStorage.setItem('alertConfigurations', JSON.stringify(remaining));
      // TODO: Backend integration
      // await api.deleteAlertConfig(level, entityId, alertType);
      return { success: true };
    } catch (error) {
// console.error('Failed to delete alert configuration:', error);
      return { success: false, error };
    }
  };

  const getConfig = (level: string, entityId: string, alertType: string) => {
    const key = `${level}:${entityId}:${alertType}`;
    return configs[key];
  };

  return {
    configs,
    saveConfig,
    deleteConfig,
    getConfig,
  };
}
