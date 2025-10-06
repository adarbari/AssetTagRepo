import { AlertType } from '../types';
import {
  SavedAlertConfig,
  AlertRuleConfig,
  AlertConfigPreset,
} from '../types/alertConfig';
import { alertTypeConfigurations } from '../data/alertConfigurations';

/**
 * Alert Configuration Service
 *
 * This service handles all alert configuration operations.
 * Currently uses localStorage for persistence, but can be easily
 * switched to backend API calls.
 *
 * To integrate with backend:
 * 1. Replace localStorage calls with API client calls
 * 2. Add authentication headers
 * 3. Handle async operations
 * 4. Add error handling and retry logic
 */

const STORAGE_KEY = 'alertRuleConfigurations';
const PRESETS_KEY = 'alertConfigPresets';
const VERSION = '1.0.0';

/**
 * Load all alert configurations
 * Backend equivalent: GET /api/alert-configs
 */
export const loadAlertConfigurations = async (): Promise<
  Record<AlertType, AlertRuleConfig>
> => {
  try {
    // Current: localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }

    // Return defaults if nothing saved
    return getDefaultConfigurations();

    // Backend implementation would be:
    // const response = await apiClient.get('/api/alert-configs');
    // return response.data;
  } catch (error) {
// // // // // // // console.error('Failed to load alert configurations:', error);
    throw error;
  }
};

/**
 * Save all alert configurations
 * Backend equivalent: POST /api/alert-configs
 */
export const saveAlertConfigurations = async (
  configurations: Record<AlertType, AlertRuleConfig>,
  userId?: string
): Promise<void> => {
  try {
    // Prepare saved configs with metadata
    const savedConfigs: Record<string, SavedAlertConfig> = {};

    Object.entries(configurations).forEach(([type, config]) => {
      savedConfigs[type] = {
        id: `alert-config-${type}-${Date.now()}`,
        type: type as AlertType,
        version: VERSION,
        config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
        updatedBy: userId,
      };
    });

    // Current: localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configurations));

    // Backend implementation would be:
    // await apiClient.post('/api/alert-configs', {
    //   configurations: savedConfigs,
    //   userId,
    //   timestamp: new Date().toISOString(),
    // });
  } catch (error) {
// // // // // // // console.error('Failed to save alert configurations:', error);
    throw error;
  }
};

/**
 * Get default configurations for all alert types
 */
export const getDefaultConfigurations = (): Record<
  AlertType,
  AlertRuleConfig
> => {
  const defaults: Record<AlertType, AlertRuleConfig> = {} as any;

  Object.entries(alertTypeConfigurations).forEach(([type, typeConfig]) => {
    const fields: Record<string, unknown> = {};

    typeConfig.fields.forEach(field => {
      fields[field.key] = field.defaultValue;
    });

    defaults[type as AlertType] = {
      enabled: true,
      severity: typeConfig.defaultSeverity,
      autoEscalate: false,
      escalationTime: 60,
      fields,
      notifications: {
        channels: [
          { type: 'email', enabled: true, recipients: [] },
          { type: 'sms', enabled: false, recipients: [] },
          { type: 'push', enabled: true },
          { type: 'webhook', enabled: false, webhookUrl: '' },
        ],
        throttle: 30,
        digestEnabled: false,
      },
    };
  });

  return defaults;
};

/**
 * Load configuration for a specific alert type
 * Backend equivalent: GET /api/alert-configs/:type
 */
export const loadAlertConfigByType = async (
  type: AlertType
): Promise<AlertRuleConfig | null> => {
  try {
    const allConfigs = await loadAlertConfigurations();
    return allConfigs[type] || null;

    // Backend implementation:
    // const response = await apiClient.get(`/api/alert-configs/${type}`);
    // return response.data;
  } catch (error) {
// // // // // // // console.error(`Failed to load configuration for ${type}:`, error);
    return null;
  }
};

/**
 * Update configuration for a specific alert type
 * Backend equivalent: PATCH /api/alert-configs/:type
 */
export const updateAlertConfig = async (
  type: AlertType,
  config: AlertRuleConfig,
  userId?: string
): Promise<void> => {
  try {
    const allConfigs = await loadAlertConfigurations();
    allConfigs[type] = config;
    await saveAlertConfigurations(allConfigs, userId);

    // Backend implementation:
    // await apiClient.patch(`/api/alert-configs/${type}`, {
    //   config,
    //   userId,
    //   updatedAt: new Date().toISOString(),
    // });
  } catch (error) {
// // // // // // // console.error(`Failed to update configuration for ${type}:`, error);
    throw error;
  }
};

/**
 * Enable/disable a specific alert type
 * Backend equivalent: PATCH /api/alert-configs/:type/toggle
 */
export const toggleAlertType = async (
  type: AlertType,
  enabled: boolean,
  userId?: string
): Promise<void> => {
  try {
    const allConfigs = await loadAlertConfigurations();
    if (allConfigs[type]) {
      allConfigs[type].enabled = enabled;
      await saveAlertConfigurations(allConfigs, userId);
    }

    // Backend implementation:
    // await apiClient.patch(`/api/alert-configs/${type}/toggle`, {
    //   enabled,
    //   userId,
    // });
  } catch (error) {
// // // // // // // console.error(`Failed to toggle ${type}:`, error);
    throw error;
  }
};

/**
 * Export configurations as JSON
 */
export const exportConfigurations = async (): Promise<string> => {
  const configs = await loadAlertConfigurations();
  return JSON.stringify(configs, null, 2);
};

/**
 * Import configurations from JSON
 * Backend equivalent: POST /api/alert-configs/import
 */
export const importConfigurations = async (
  jsonData: string,
  userId?: string
): Promise<void> => {
  try {
    const configs = JSON.parse(jsonData);

    // Validate the structure
    Object.keys(configs).forEach(type => {
      if (!alertTypeConfigurations[type as AlertType]) {
        throw new Error(`Invalid alert type: ${type}`);
      }
    });

    await saveAlertConfigurations(configs, userId);

    // Backend implementation:
    // await apiClient.post('/api/alert-configs/import', {
    //   configurations: configs,
    //   userId,
    //   importedAt: new Date().toISOString(),
    // });
  } catch (error) {
// // // // // // // console.error('Failed to import configurations:', error);
    throw error;
  }
};

/**
 * Presets Management
 */

/**
 * Save a configuration preset
 * Backend equivalent: POST /api/alert-presets
 */
export const savePreset = async (
  preset: Omit<AlertConfigPreset, 'id'>
): Promise<void> => {
  try {
    const presets = await loadPresets();
    const newPreset: AlertConfigPreset = {
      ...preset,
      id: `preset-${Date.now()}`,
    };
    presets.push(newPreset);

    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));

    // Backend implementation:
    // await apiClient.post('/api/alert-presets', newPreset);
  } catch (error) {
// // // // // // // console.error('Failed to save preset:', error);
    throw error;
  }
};

/**
 * Load all presets
 * Backend equivalent: GET /api/alert-presets
 */
export const loadPresets = async (): Promise<AlertConfigPreset[]> => {
  try {
    const saved = localStorage.getItem(PRESETS_KEY);
    return saved ? JSON.parse(saved) : [];

    // Backend implementation:
    // const response = await apiClient.get('/api/alert-presets');
    // return response.data;
  } catch (error) {
// // // // // // // console.error('Failed to load presets:', error);
    return [];
  }
};

/**
 * Apply a preset to current configuration
 */
export const applyPreset = async (
  presetId: string,
  userId?: string
): Promise<void> => {
  try {
    const presets = await loadPresets();
    const preset = presets.find(p => p.id === presetId);

    if (!preset) {
      throw new Error('Preset not found');
    }

    await updateAlertConfig(preset.type, preset.config, userId);
  } catch (error) {
// // // // // // // console.error('Failed to apply preset:', error);
    throw error;
  }
};

/**
 * Validation helpers
 */

/**
 * Validate a configuration against its schema
 */
export const validateConfiguration = (
  type: AlertType,
  config: AlertRuleConfig
): { valid: boolean; errors: Record<string, string> } => {
  const typeConfig = alertTypeConfigurations[type];
  const errors: Record<string, string> = {};

  typeConfig.fields.forEach(field => {
    const value = config.fields[field.key];

    // Check required fields
    if (
      field.required &&
      (value === undefined || value === null || value === '')
    ) {
      errors[field.key] = `${field.label} is required`;
    }

    // Check min/max for numbers
    if (
      field.type === 'number' ||
      field.type === 'duration' ||
      field.type === 'percentage'
    ) {
      if (field.min !== undefined && value < field.min) {
        errors[field.key] = `${field.label} must be at least ${field.min}`;
      }
      if (field.max !== undefined && value > field.max) {
        errors[field.key] = `${field.label} must be at most ${field.max}`;
      }
    }

    // Custom validation
    if (field.validation && value !== undefined) {
      const error = field.validation(value);
      if (error) {
        errors[field.key] = error;
      }
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Get configuration summary for display
 */
export const getConfigurationSummary = (
  type: AlertType,
  config: AlertRuleConfig
): string[] => {
  const typeConfig = alertTypeConfigurations[type];
  const summary: string[] = [];

  summary.push(`Status: ${config.enabled ? 'Enabled' : 'Disabled'}`);
  summary.push(`Severity: ${config.severity}`);

  typeConfig.fields.forEach(field => {
    const value = config.fields[field.key];
    if (value !== undefined && value !== null && value !== '') {
      let displayValue = value;
      if (field.unit) {
        displayValue = `${value} ${field.unit}`;
      }
      if (field.type === 'toggle') {
        displayValue = value ? 'Yes' : 'No';
      }
      if (field.options) {
        const option = field.options.find(o => o.value === value);
        displayValue = option?.label || value;
      }
      summary.push(`${field.label}: ${displayValue}`);
    }
  });

  return summary;
};
