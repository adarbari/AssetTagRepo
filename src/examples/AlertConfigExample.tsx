/**
 * Alert Configuration System - Example Usage
 * 
 * This file demonstrates how to use the alert configuration system
 * in your components. It's not part of the main application but serves
 * as a reference implementation.
 */

import { useEffect, useState } from 'react';
import { AlertType } from '../types';
import { AlertRuleConfig } from '../types/alertConfig';
import { 
  loadAlertConfigurations,
  saveAlertConfigurations,
  loadAlertConfigByType,
  updateAlertConfig,
  validateConfiguration,
  getConfigurationSummary
} from '../services/alertConfigService';
import { alertTypeConfigurations } from '../data/alertConfigurations';

/**
 * Example 1: Load and display all configurations
 */
export function DisplayAlertConfigurations() {
  const [configs, setConfigs] = useState<Record<AlertType, AlertRuleConfig> | null>(null);

  useEffect(() => {
    async function load() {
      const loadedConfigs = await loadAlertConfigurations();
      setConfigs(loadedConfigs);
    }
    load();
  }, []);

  if (!configs) return <div>Loading...</div>;

  return (
    <div>
      <h2>Alert Configurations</h2>
      {Object.entries(configs).map(([type, config]) => {
        const typeConfig = alertTypeConfigurations[type as AlertType];
        return (
          <div key={type}>
            <h3>{typeConfig.label}</h3>
            <p>Enabled: {config.enabled ? 'Yes' : 'No'}</p>
            <p>Severity: {config.severity}</p>
            <pre>{JSON.stringify(config.fields, null, 2)}</pre>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Example 2: Update a specific alert configuration
 */
export function UpdateBatteryAlertThreshold() {
  const [threshold, setThreshold] = useState(20);

  const handleSave = async () => {
    // Load current config
    const config = await loadAlertConfigByType('battery');
    if (!config) return;

    // Update the threshold
    config.fields.lowBatteryThreshold = threshold;

    // Validate
    const validation = validateConfiguration('battery', config);
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      return;
    }

    // Save
    await updateAlertConfig('battery', config, 'current-user-id');
    alert('Battery threshold updated!');
  };

  return (
    <div>
      <label>
        Low Battery Threshold: 
        <input 
          type="number" 
          value={threshold} 
          onChange={(e) => setThreshold(Number(e.target.value))}
          min={5}
          max={50}
        />
        %
      </label>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

/**
 * Example 3: Display configuration summary
 */
export function AlertConfigurationSummary({ type }: { type: AlertType }) {
  const [summary, setSummary] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const config = await loadAlertConfigByType(type);
      if (config) {
        const sum = getConfigurationSummary(type, config);
        setSummary(sum);
      }
    }
    load();
  }, [type]);

  const typeConfig = alertTypeConfigurations[type];

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold">{typeConfig.label} Configuration</h3>
      <ul className="list-disc pl-4 mt-2">
        {summary.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 4: Bulk enable/disable alert types
 */
export function BulkToggleAlerts() {
  const handleEnableAll = async () => {
    const configs = await loadAlertConfigurations();
    
    // Enable all alert types
    Object.keys(configs).forEach(type => {
      configs[type as AlertType].enabled = true;
    });

    await saveAlertConfigurations(configs, 'current-user-id');
    alert('All alerts enabled!');
  };

  const handleDisableAll = async () => {
    const configs = await loadAlertConfigurations();
    
    // Disable all alert types
    Object.keys(configs).forEach(type => {
      configs[type as AlertType].enabled = false;
    });

    await saveAlertConfigurations(configs, 'current-user-id');
    alert('All alerts disabled!');
  };

  return (
    <div>
      <button onClick={handleEnableAll}>Enable All Alerts</button>
      <button onClick={handleDisableAll}>Disable All Alerts</button>
    </div>
  );
}

/**
 * Example 5: Custom preset application
 */
export function ApplySecurityPreset() {
  const handleApply = async () => {
    const configs = await loadAlertConfigurations();

    // Apply security-focused preset
    configs.theft.enabled = true;
    configs.theft.severity = 'critical';
    configs.theft.autoEscalate = true;
    configs.theft.escalationTime = 15; // 15 minutes
    configs.theft.fields.detectionMethod = 'combined';
    configs.theft.fields.requireMultipleIndicators = true;
    configs.theft.notifications.channels.forEach(ch => {
      if (ch.type === 'email' || ch.type === 'sms' || ch.type === 'push') {
        ch.enabled = true;
      }
    });

    configs['unauthorized-zone'].enabled = true;
    configs['unauthorized-zone'].severity = 'critical';
    configs['unauthorized-zone'].fields.dwellTime = 0; // Immediate
    configs['unauthorized-zone'].fields.alertOnEntry = true;

    await saveAlertConfigurations(configs, 'current-user-id');
    alert('Security preset applied!');
  };

  return (
    <button onClick={handleApply}>Apply High Security Preset</button>
  );
}

/**
 * Example 6: Field validation in action
 */
export function ValidateTheftConfiguration() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = async () => {
    const config = await loadAlertConfigByType('theft');
    if (!config) return;

    const validation = validateConfiguration('theft', config);
    
    if (validation.valid) {
      alert('Configuration is valid!');
      setErrors({});
    } else {
      setErrors(validation.errors);
    }
  };

  return (
    <div>
      <button onClick={validate}>Validate Theft Config</button>
      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <h4 className="font-bold text-red-700">Validation Errors:</h4>
          <ul className="list-disc pl-4">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="text-red-600">
                <strong>{field}:</strong> {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Example 7: Backend Integration Pattern
 */
export async function backendIntegrationExample() {
  /**
   * This is how you would integrate with a real backend API
   * Replace the service layer functions with API calls
   */

  // Before (localStorage):
  // const configs = await loadAlertConfigurations();

  // After (with backend):
  /*
  const configs = await fetch('/api/alert-configs', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-Id': orgId
    }
  }).then(res => res.json());
  */

  // Before (localStorage):
  // await saveAlertConfigurations(configs, userId);

  // After (with backend):
  /*
  await fetch('/api/alert-configs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Organization-Id': orgId
    },
    body: JSON.stringify({
      configurations: configs,
      userId,
      timestamp: new Date().toISOString()
    })
  });
  */
}

/**
 * Example 8: Dynamic field access
 */
export function AccessConfigurationFields() {
  const [batteryThreshold, setBatteryThreshold] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const config = await loadAlertConfigByType('battery');
      if (config) {
        // Access specific field value
        setBatteryThreshold(config.fields.lowBatteryThreshold);
      }
    }
    load();
  }, []);

  return (
    <div>
      Current battery alert threshold: {batteryThreshold}%
    </div>
  );
}

/**
 * Example 9: Get all enabled alert types
 */
export async function getEnabledAlertTypes(): Promise<AlertType[]> {
  const configs = await loadAlertConfigurations();
  
  return Object.entries(configs)
    .filter(([_, config]) => config.enabled)
    .map(([type, _]) => type as AlertType);
}

/**
 * Example 10: Configuration change detection
 */
export function DetectConfigurationChanges() {
  const [hasChanges, setHasChanges] = useState(false);
  const [originalConfigs, setOriginalConfigs] = useState<Record<AlertType, AlertRuleConfig> | null>(null);
  const [currentConfigs, setCurrentConfigs] = useState<Record<AlertType, AlertRuleConfig> | null>(null);

  useEffect(() => {
    async function load() {
      const configs = await loadAlertConfigurations();
      setOriginalConfigs(configs);
      setCurrentConfigs(configs);
    }
    load();
  }, []);

  useEffect(() => {
    if (originalConfigs && currentConfigs) {
      const changed = JSON.stringify(originalConfigs) !== JSON.stringify(currentConfigs);
      setHasChanges(changed);
    }
  }, [originalConfigs, currentConfigs]);

  return (
    <div>
      {hasChanges && (
        <div className="p-2 bg-yellow-100 text-yellow-800">
          You have unsaved changes
        </div>
      )}
    </div>
  );
}
