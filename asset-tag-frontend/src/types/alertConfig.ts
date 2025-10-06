import { LucideIcon } from 'lucide-react';
import { AlertType } from './index';

// Field types supported in alert configuration
export type AlertConfigFieldType =
  | 'number'
  | 'text'
  | 'select'
  | 'toggle'
  | 'multiselect'
  | 'duration'
  | 'percentage'
  | 'threshold';

// Configuration field definition
export interface AlertConfigField {
  key: string;
  label: string;
  type: AlertConfigFieldType;
  description?: string;
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { value: string | number; label: string }[];
  validation?: (value: any) => string | null; // Returns error message or null
  dependsOn?: {
    field: string;
    value: any;
  };
  helpText?: string;
}

/**
 * Alert Configuration Level
 * Similar to NotificationPreferences hierarchy
 */
export type AlertConfigLevel = 'user' | 'site' | 'asset' | 'job';

// Alert rule configuration
// Note: Notification channels are now managed in NotificationPreferences (user/site/asset level)
export interface AlertRuleConfig {
  id?: string; // Unique ID for the config
  level?: AlertConfigLevel; // Configuration level
  entityId?: string; // ID of user/site/asset/job
  isOverride?: boolean; // Is this an override of parent level?
  overrideReason?: string; // Why this override exists

  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoEscalate: boolean;
  escalationTime?: number; // minutes
  escalationPolicy?: string; // ID of escalation policy
  fields: Record<string, any>; // Dynamic field values based on AlertConfigField keys
  suppressionRules?: {
    enabled: boolean;
    duration?: number; // minutes to suppress duplicate alerts
    conditions?: Record<string, any>; // Additional suppression conditions
  };

  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Alert type configuration schema
export interface AlertTypeConfig {
  type: AlertType;
  label: string;
  description: string;
  icon: LucideIcon;
  category: 'security' | 'operational' | 'maintenance' | 'compliance';
  color: string;
  defaultSeverity: 'low' | 'medium' | 'high' | 'critical';
  fields: AlertConfigField[];
  examples?: string[];
  recommendations?: string[];
  integrations?: {
    erp?: boolean;
    cmms?: boolean;
    gps?: boolean;
  };
}

// Saved alert configuration (what gets stored in backend)
// Now supports hierarchical configuration: User → Site → Asset → Job
export interface SavedAlertConfig {
  id: string;
  type: AlertType;
  level: AlertConfigLevel; // user/site/asset/job
  entityId: string; // ID of the entity (user-id, site-id, asset-id, job-id)
  version: string; // For config versioning
  config: AlertRuleConfig;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Hierarchical alert configurations storage
// Key format: "{level}:{entityId}:{alertType}"
// Example: "user:john-123:battery", "site:site-001:geofence", "job:job-001:missing-assets"
export type AlertConfigurationsStore = Record<string, SavedAlertConfig>;

// Alert configuration preset
export interface AlertConfigPreset {
  id: string;
  name: string;
  description: string;
  type: AlertType;
  config: AlertRuleConfig;
}
