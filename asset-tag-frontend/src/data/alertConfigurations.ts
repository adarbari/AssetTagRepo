import {
  Shield,
  Battery,
  AlertTriangle,
  TrendingDown,
  WifiOff,
  MapPin,
  Wrench,
} from 'lucide-react';
import { AlertTypeConfig, AlertConfigField } from '../types/alertConfig';
import { AlertType } from '../types';

// Field configurations reusable across alert types
const commonFields = {
  checkInterval: {
    key: 'checkInterval',
    label: 'Check Interval',
    type: 'duration' as const,
    description: 'How often to check this condition',
    defaultValue: 5,
    min: 1,
    max: 60,
    unit: 'minutes',
    required: true,
    helpText:
      'Shorter intervals provide faster detection but increase system load',
  },
  cooldownPeriod: {
    key: 'cooldownPeriod',
    label: 'Cooldown Period',
    type: 'duration' as const,
    description: 'Minimum time between repeated alerts for the same asset',
    defaultValue: 30,
    min: 5,
    max: 1440,
    unit: 'minutes',
    helpText: 'Prevents alert fatigue from repeated notifications',
  },
  affectedCategories: {
    key: 'affectedCategories',
    label: 'Asset Categories',
    type: 'multiselect' as const,
    description: 'Which asset categories to monitor',
    defaultValue: ['all'],
    options: [
      { value: 'all', label: 'All Categories' },
      { value: 'heavy-equipment', label: 'Heavy Equipment' },
      { value: 'vehicles', label: 'Vehicles' },
      { value: 'tools', label: 'Tools' },
      { value: 'containers', label: 'Containers' },
      { value: 'electronics', label: 'Electronics' },
    ],
  },
};

// Theft Alert Configuration
const theftAlertConfig: AlertTypeConfig = {
  type: 'theft',
  label: 'Theft Detection',
  description:
    'Detect unauthorized asset movement and potential theft scenarios',
  icon: Shield,
  category: 'security',
  color: 'text-red-600',
  defaultSeverity: 'critical',
  fields: [
    {
      key: 'detectionMethod',
      label: 'Detection Method',
      type: 'select',
      description: 'How to detect potential theft',
      defaultValue: 'movement',
      required: true,
      options: [
        { value: 'movement', label: 'Unauthorized Movement' },
        { value: 'geofence', label: 'Geofence Breach' },
        { value: 'velocity', label: 'Abnormal Velocity' },
        { value: 'combined', label: 'Combined Indicators' },
      ],
    },
    {
      key: 'movementThreshold',
      label: 'Movement Distance Threshold',
      type: 'number',
      description: 'Alert if asset moves more than this distance',
      defaultValue: 500,
      min: 10,
      max: 10000,
      unit: 'feet',
      dependsOn: { field: 'detectionMethod', value: 'movement' },
    },
    {
      key: 'velocityThreshold',
      label: 'Speed Threshold',
      type: 'number',
      description: 'Alert if asset moves faster than this speed',
      defaultValue: 45,
      min: 5,
      max: 100,
      unit: 'mph',
      dependsOn: { field: 'detectionMethod', value: 'velocity' },
    },
    {
      key: 'afterHoursOnly',
      label: 'After Hours Only',
      type: 'toggle',
      description: 'Only trigger alerts outside business hours',
      defaultValue: false,
      helpText: 'Configure business hours in Settings',
    },
    {
      key: 'requireMultipleIndicators',
      label: 'Require Multiple Indicators',
      type: 'toggle',
      description: 'Reduce false positives by requiring 2+ indicators',
      defaultValue: true,
      helpText: 'Recommended to reduce false alarms',
    },
    commonFields.checkInterval,
    commonFields.cooldownPeriod,
    commonFields.affectedCategories,
  ],
  examples: [
    'Asset moved 1,000 ft from last known location after hours',
    'High-value equipment detected outside geofence',
    'Asset moving at 60 mph when max expected is 35 mph',
  ],
  recommendations: [
    'Enable multi-factor detection to reduce false positives',
    'Configure geofences for high-value asset storage areas',
    'Set up after-hours monitoring for critical equipment',
  ],
  integrations: {
    gps: true,
  },
};

// Battery Alert Configuration
const batteryAlertConfig: AlertTypeConfig = {
  type: 'battery',
  label: 'Battery Monitoring',
  description: 'Proactive battery life management and low battery alerts',
  icon: Battery,
  category: 'operational',
  color: 'text-orange-600',
  defaultSeverity: 'warning',
  fields: [
    {
      key: 'lowBatteryThreshold',
      label: 'Low Battery Threshold',
      type: 'percentage',
      description: 'Alert when battery drops below this level',
      defaultValue: 20,
      min: 5,
      max: 50,
      unit: '%',
      required: true,
    },
    {
      key: 'criticalBatteryThreshold',
      label: 'Critical Battery Threshold',
      type: 'percentage',
      description: 'Critical alert threshold',
      defaultValue: 10,
      min: 1,
      max: 25,
      unit: '%',
      required: true,
      validation: value => {
        // This will be validated against lowBatteryThreshold in the component
        return null;
      },
    },
    {
      key: 'predictiveAlerts',
      label: 'Predictive Alerts',
      type: 'toggle',
      description: 'Alert before battery reaches threshold based on drain rate',
      defaultValue: true,
      helpText: 'Uses ML to predict when battery will be depleted',
    },
    {
      key: 'estimatedHoursNotice',
      label: 'Advanced Notice',
      type: 'number',
      description: 'Hours of advance warning desired',
      defaultValue: 24,
      min: 4,
      max: 72,
      unit: 'hours',
      dependsOn: { field: 'predictiveAlerts', value: true },
    },
    {
      key: 'excludeCharging',
      label: 'Exclude While Charging',
      type: 'toggle',
      description: "Don't alert when asset is actively charging",
      defaultValue: true,
    },
    commonFields.checkInterval,
    commonFields.cooldownPeriod,
    commonFields.affectedCategories,
  ],
  examples: [
    'Forklift #234 battery at 15% - needs charging within 2 hours',
    'GPS tracker on Excavator #5 battery critically low (8%)',
  ],
  recommendations: [
    'Enable predictive alerts for mission-critical assets',
    'Set different thresholds for different asset categories',
    'Integrate with CMMS for battery replacement scheduling',
  ],
  integrations: {
    cmms: true,
  },
};

// Compliance Alert Configuration
const complianceAlertConfig: AlertTypeConfig = {
  type: 'compliance',
  label: 'Compliance Monitoring',
  description: 'Track certifications, inspections, and regulatory requirements',
  icon: AlertTriangle,
  category: 'compliance',
  color: 'text-yellow-600',
  defaultSeverity: 'warning',
  fields: [
    {
      key: 'complianceType',
      label: 'Compliance Type',
      type: 'multiselect',
      description: 'Which compliance items to monitor',
      defaultValue: ['all'],
      options: [
        { value: 'all', label: 'All Compliance Items' },
        { value: 'inspection', label: 'Inspections' },
        { value: 'certification', label: 'Certifications' },
        { value: 'license', label: 'Licenses & Permits' },
        { value: 'maintenance', label: 'Maintenance Due' },
        { value: 'custom', label: 'Custom Compliance' },
      ],
    },
    {
      key: 'advanceWarningDays',
      label: 'Advance Warning',
      type: 'number',
      description: 'Days before expiration to send warning',
      defaultValue: 30,
      min: 1,
      max: 365,
      unit: 'days',
      required: true,
    },
    {
      key: 'criticalWarningDays',
      label: 'Critical Warning',
      type: 'number',
      description: 'Days before expiration for critical alert',
      defaultValue: 7,
      min: 1,
      max: 60,
      unit: 'days',
      required: true,
    },
    {
      key: 'alertAfterExpiration',
      label: 'Alert After Expiration',
      type: 'toggle',
      description: 'Continue alerting after item has expired',
      defaultValue: true,
      helpText: 'Recommended for regulatory compliance',
    },
    {
      key: 'blockAssetUse',
      label: 'Block Asset Use',
      type: 'toggle',
      description: 'Flag asset as unavailable if compliance item expired',
      defaultValue: false,
      helpText: 'Requires integration with asset management system',
    },
    {
      key: 'escalationChain',
      label: 'Escalation Chain',
      type: 'toggle',
      description: 'Escalate to management if not resolved',
      defaultValue: true,
    },
    commonFields.checkInterval,
    commonFields.affectedCategories,
  ],
  examples: [
    'Crane #12 annual inspection due in 15 days',
    'Forklift operator certification expires in 3 days',
    'DOT compliance expired 2 days ago for Truck #45',
  ],
  recommendations: [
    'Set advance warnings to allow time for scheduling inspections',
    'Enable asset blocking for safety-critical compliance items',
    'Configure escalation chains for expired compliance items',
  ],
  integrations: {
    cmms: true,
    erp: true,
  },
};

// Underutilized Asset Configuration
const underutilizedAlertConfig: AlertTypeConfig = {
  type: 'underutilized',
  label: 'Underutilization Detection',
  description: 'Identify idle or underutilized assets for optimization',
  icon: TrendingDown,
  category: 'operational',
  color: 'text-blue-600',
  defaultSeverity: 'info',
  fields: [
    {
      key: 'idleThreshold',
      label: 'Idle Threshold',
      type: 'number',
      description: 'Days without movement to consider idle',
      defaultValue: 7,
      min: 1,
      max: 90,
      unit: 'days',
      required: true,
    },
    {
      key: 'utilizationMetric',
      label: 'Utilization Metric',
      type: 'select',
      description: 'How to measure utilization',
      defaultValue: 'movement',
      options: [
        { value: 'movement', label: 'Movement Activity' },
        { value: 'hours', label: 'Operating Hours' },
        { value: 'distance', label: 'Distance Traveled' },
        { value: 'combined', label: 'Combined Score' },
      ],
    },
    {
      key: 'utilizationThreshold',
      label: 'Utilization Threshold',
      type: 'percentage',
      description: 'Alert when utilization falls below this percentage',
      defaultValue: 30,
      min: 5,
      max: 80,
      unit: '%',
    },
    {
      key: 'evaluationPeriod',
      label: 'Evaluation Period',
      type: 'number',
      description: 'Time period for utilization calculation',
      defaultValue: 30,
      min: 7,
      max: 90,
      unit: 'days',
      helpText: 'Longer periods smooth out seasonal variations',
    },
    {
      key: 'excludeWeekends',
      label: 'Exclude Weekends',
      type: 'toggle',
      description: "Don't count weekends in utilization calculation",
      defaultValue: true,
    },
    {
      key: 'excludeSeasonalAssets',
      label: 'Exclude Seasonal Assets',
      type: 'toggle',
      description: "Don't alert for assets marked as seasonal",
      defaultValue: true,
    },
    {
      key: 'costThreshold',
      label: 'Cost Threshold',
      type: 'number',
      description: 'Only alert for assets above this value',
      defaultValue: 5000,
      min: 0,
      max: 1000000,
      unit: '$',
      helpText: 'Focus on high-value underutilized assets',
    },
    commonFields.checkInterval,
    commonFields.affectedCategories,
  ],
  examples: [
    'Excavator #23 idle for 14 days - only 15% utilized this month',
    "Generator #8 hasn't moved in 21 days - consider redeployment",
  ],
  recommendations: [
    'Set thresholds based on asset rental cost vs utilization',
    'Use longer evaluation periods (30-60 days) for accurate trends',
    'Exclude seasonal equipment to avoid false alerts',
  ],
  integrations: {
    erp: true,
  },
};

// Offline Alert Configuration
const offlineAlertConfig: AlertTypeConfig = {
  type: 'offline',
  label: 'Connectivity Monitoring',
  description: 'Monitor asset connectivity and detect offline devices',
  icon: WifiOff,
  category: 'operational',
  color: 'text-gray-600',
  defaultSeverity: 'warning',
  fields: [
    {
      key: 'offlineThreshold',
      label: 'Offline Threshold',
      type: 'duration',
      description: 'Time without signal before considering offline',
      defaultValue: 60,
      min: 15,
      max: 1440,
      unit: 'minutes',
      required: true,
    },
    {
      key: 'criticalOfflineThreshold',
      label: 'Critical Offline Threshold',
      type: 'duration',
      description: 'Time offline before escalating to critical',
      defaultValue: 240,
      min: 60,
      max: 2880,
      unit: 'minutes',
    },
    {
      key: 'excludeKnownDeadZones',
      label: 'Exclude Dead Zones',
      type: 'toggle',
      description: "Don't alert when asset is in known coverage gaps",
      defaultValue: true,
      helpText: 'Configure dead zones in geofence settings',
    },
    {
      key: 'distinguishPowerOff',
      label: 'Distinguish Power Off',
      type: 'toggle',
      description: 'Treat intentional power-off differently from lost signal',
      defaultValue: true,
      helpText: 'Requires device with power state reporting',
    },
    {
      key: 'alertOnReconnect',
      label: 'Alert on Reconnect',
      type: 'toggle',
      description: 'Send notification when offline asset comes back online',
      defaultValue: false,
    },
    {
      key: 'batteryCorrelation',
      label: 'Correlate with Battery',
      type: 'toggle',
      description: 'Check if offline due to dead battery',
      defaultValue: true,
    },
    commonFields.checkInterval,
    commonFields.cooldownPeriod,
    commonFields.affectedCategories,
  ],
  examples: [
    'GPS tracker on Bulldozer #15 offline for 3 hours',
    'Vehicle Gateway V-234 lost connection - last seen at North Yard',
  ],
  recommendations: [
    'Set longer thresholds for assets in areas with spotty coverage',
    'Enable battery correlation to identify root cause',
    'Configure dead zone geofences to reduce false alerts',
  ],
  integrations: {
    gps: true,
  },
};

// Unauthorized Zone Configuration
const unauthorizedZoneAlertConfig: AlertTypeConfig = {
  type: 'unauthorized-zone',
  label: 'Unauthorized Zone Detection',
  description: 'Alert when assets enter restricted or unauthorized areas',
  icon: MapPin,
  category: 'security',
  color: 'text-red-600',
  defaultSeverity: 'critical',
  fields: [
    {
      key: 'zoneType',
      label: 'Zone Type',
      type: 'select',
      description: 'Type of unauthorized zone',
      defaultValue: 'restricted',
      options: [
        { value: 'restricted', label: 'Restricted Area' },
        { value: 'competitor', label: 'Competitor Site' },
        { value: 'off-limits', label: 'Off-Limits Zone' },
        { value: 'hazard', label: 'Hazardous Area' },
        { value: 'custom', label: 'Custom Zone' },
      ],
    },
    {
      key: 'dwellTime',
      label: 'Dwell Time',
      type: 'duration',
      description: 'Minutes in zone before alerting',
      defaultValue: 5,
      min: 0,
      max: 60,
      unit: 'minutes',
      helpText: 'Set to 0 for immediate alerts',
    },
    {
      key: 'alertOnEntry',
      label: 'Alert on Entry',
      type: 'toggle',
      description: 'Send alert when asset enters zone',
      defaultValue: true,
    },
    {
      key: 'alertOnExit',
      label: 'Alert on Exit',
      type: 'toggle',
      description: 'Send alert when asset exits zone',
      defaultValue: false,
    },
    {
      key: 'timeBasedRules',
      label: 'Time-Based Rules',
      type: 'toggle',
      description: 'Apply different rules based on time of day',
      defaultValue: false,
      helpText: 'Configure schedules in advanced settings',
    },
    {
      key: 'assetSpecificZones',
      label: 'Asset-Specific Zones',
      type: 'toggle',
      description: 'Different assets can have different unauthorized zones',
      defaultValue: true,
    },
    commonFields.checkInterval,
    commonFields.cooldownPeriod,
    commonFields.affectedCategories,
  ],
  examples: [
    'Compressor #45 entered competitor jobsite - alert superintendent',
    'Crane detected in restricted hazard zone - immediate evacuation',
  ],
  recommendations: [
    'Set immediate alerts (0 dwell time) for high-security zones',
    'Use time-based rules for zones that are only restricted at certain times',
    'Enable both entry and exit alerts for complete tracking',
  ],
  integrations: {
    gps: true,
  },
};

// Predictive Maintenance Configuration
const predictiveMaintenanceAlertConfig: AlertTypeConfig = {
  type: 'predictive-maintenance',
  label: 'Predictive Maintenance',
  description: 'ML-powered maintenance prediction and anomaly detection',
  icon: Wrench,
  category: 'maintenance',
  color: 'text-purple-600',
  defaultSeverity: 'warning',
  fields: [
    {
      key: 'predictionModel',
      label: 'Prediction Model',
      type: 'select',
      description: 'Which predictive model to use',
      defaultValue: 'usage-based',
      options: [
        { value: 'usage-based', label: 'Usage-Based (Hours/Miles)' },
        { value: 'time-based', label: 'Time-Based (Calendar)' },
        { value: 'condition-based', label: 'Condition-Based (Sensors)' },
        { value: 'ml-hybrid', label: 'ML Hybrid (All Factors)' },
      ],
    },
    {
      key: 'confidenceThreshold',
      label: 'Confidence Threshold',
      type: 'percentage',
      description: 'Minimum ML confidence to trigger alert',
      defaultValue: 70,
      min: 50,
      max: 95,
      unit: '%',
      helpText: 'Higher values reduce false positives but may miss some issues',
    },
    {
      key: 'leadTime',
      label: 'Maintenance Lead Time',
      type: 'number',
      description: 'Days of advance notice needed',
      defaultValue: 14,
      min: 1,
      max: 90,
      unit: 'days',
      helpText: 'Time needed to schedule and perform maintenance',
    },
    {
      key: 'anomalyDetection',
      label: 'Anomaly Detection',
      type: 'toggle',
      description: 'Alert on unusual patterns or behavior',
      defaultValue: true,
    },
    {
      key: 'anomalySensitivity',
      label: 'Anomaly Sensitivity',
      type: 'select',
      description: 'How sensitive to anomalies',
      defaultValue: 'medium',
      options: [
        { value: 'low', label: 'Low - Only obvious anomalies' },
        { value: 'medium', label: 'Medium - Balanced approach' },
        { value: 'high', label: 'High - Detect subtle changes' },
      ],
      dependsOn: { field: 'anomalyDetection', value: true },
    },
    {
      key: 'autoSchedule',
      label: 'Auto-Schedule Maintenance',
      type: 'toggle',
      description: 'Automatically create maintenance tasks in CMMS',
      defaultValue: false,
      helpText: 'Requires CMMS integration',
    },
    {
      key: 'historicalDataPoints',
      label: 'Historical Data Points',
      type: 'number',
      description: 'Minimum data points required for prediction',
      defaultValue: 30,
      min: 10,
      max: 365,
      unit: 'days',
    },
    commonFields.checkInterval,
    commonFields.affectedCategories,
  ],
  examples: [
    'Excavator #12 predicted to need hydraulic service in 10 days (85% confidence)',
    'Unusual vibration pattern detected on Generator #5 - inspect soon',
  ],
  recommendations: [
    'Start with usage-based model and upgrade to ML hybrid as data accumulates',
    'Set lead time based on your maintenance scheduling capacity',
    'Enable auto-scheduling once you trust the predictions',
  ],
  integrations: {
    cmms: true,
    erp: true,
  },
};

// Export all configurations as a map
export const alertTypeConfigurations: Record<AlertType, AlertTypeConfig> = {
  theft: theftAlertConfig,
  battery: batteryAlertConfig,
  compliance: complianceAlertConfig,
  underutilized: underutilizedAlertConfig,
  offline: offlineAlertConfig,
  'unauthorized-zone': unauthorizedZoneAlertConfig,
  'predictive-maintenance': predictiveMaintenanceAlertConfig,
};

// Helper to get configuration for a specific alert type
export const getAlertTypeConfig = (type: AlertType): AlertTypeConfig => {
  return alertTypeConfigurations[type];
};

// Helper to get all alert types
export const getAllAlertTypes = (): AlertType[] => {
  return Object.keys(alertTypeConfigurations) as AlertType[];
};

// Helper to get alert types by category
export const getAlertTypesByCategory = (
  category: 'security' | 'operational' | 'maintenance' | 'compliance'
): AlertTypeConfig[] => {
  return Object.values(alertTypeConfigurations).filter(
    config => config.category === category
  );
};
