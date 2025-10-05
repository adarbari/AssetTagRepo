# Example: Adding a New Alert Type

This example demonstrates how easy it is to add a new alert type to the system using the configuration-driven architecture.

## Scenario: Add "Temperature Alert"

Let's add a new alert type that monitors asset temperature and alerts when it goes outside safe operating ranges.

## Step 1: Define the Configuration

In `/data/alertConfigurations.ts`, add:

```typescript
import { Thermometer } from "lucide-react";

const temperatureAlertConfig: AlertTypeConfig = {
  type: 'temperature',
  label: 'Temperature Monitoring',
  description: 'Monitor asset temperature and detect unsafe operating conditions',
  icon: Thermometer,
  category: 'operational',
  color: 'text-cyan-600',
  defaultSeverity: 'warning',
  fields: [
    {
      key: 'minTemperature',
      label: 'Minimum Safe Temperature',
      type: 'number',
      description: 'Alert when temperature drops below this value',
      defaultValue: 32,
      min: -50,
      max: 200,
      unit: '°F',
      required: true,
      helpText: 'Set to 32°F to detect freezing conditions',
    },
    {
      key: 'maxTemperature',
      label: 'Maximum Safe Temperature',
      type: 'number',
      description: 'Alert when temperature exceeds this value',
      defaultValue: 150,
      min: 0,
      max: 300,
      unit: '°F',
      required: true,
      helpText: 'Set based on equipment specifications',
    },
    {
      key: 'criticalLowTemperature',
      label: 'Critical Low Temperature',
      type: 'number',
      description: 'Critical alert threshold for low temperature',
      defaultValue: 0,
      min: -100,
      max: 100,
      unit: '°F',
      validation: (value) => {
        // Will be validated against minTemperature in component
        return null;
      },
    },
    {
      key: 'criticalHighTemperature',
      label: 'Critical High Temperature',
      type: 'number',
      description: 'Critical alert threshold for high temperature',
      defaultValue: 200,
      min: 100,
      max: 400,
      unit: '°F',
    },
    {
      key: 'temperatureUnit',
      label: 'Temperature Unit',
      type: 'select',
      description: 'Display temperature in Fahrenheit or Celsius',
      defaultValue: 'fahrenheit',
      options: [
        { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
        { value: 'celsius', label: 'Celsius (°C)' },
      ],
    },
    {
      key: 'rateOfChangeAlert',
      label: 'Rate of Change Alert',
      type: 'toggle',
      description: 'Alert on rapid temperature changes',
      defaultValue: false,
      helpText: 'Useful for detecting equipment malfunctions',
    },
    {
      key: 'rateThreshold',
      label: 'Temperature Change Rate',
      type: 'number',
      description: 'Alert if temperature changes by this amount per minute',
      defaultValue: 10,
      min: 1,
      max: 100,
      unit: '°F/min',
      dependsOn: { field: 'rateOfChangeAlert', value: true },
    },
    {
      key: 'excludeNonOperating',
      label: 'Exclude Non-Operating Assets',
      type: 'toggle',
      description: 'Don\'t alert for assets that are powered off',
      defaultValue: true,
    },
    commonFields.checkInterval,
    commonFields.cooldownPeriod,
    commonFields.affectedCategories,
  ],
  examples: [
    'Generator #5 temperature at 210°F - exceeds max safe operating temp of 150°F',
    'Refrigerated container dropped to 25°F - below minimum threshold',
    'Compressor #12 temperature increased 45°F in 3 minutes - possible malfunction',
  ],
  recommendations: [
    'Set thresholds based on manufacturer specifications',
    'Enable rate-of-change alerts for early detection of failures',
    'Use different thresholds for summer vs winter months',
    'Exclude non-operating assets to reduce false alerts',
  ],
  integrations: {
    cmms: true,
  },
};
```

## Step 2: Update Type Definition

In `/types/index.ts`, add the new type:

```typescript
export type AlertType = 
  | "theft"
  | "battery"
  | "compliance"
  | "underutilized"
  | "offline"
  | "unauthorized-zone"
  | "predictive-maintenance"
  | "temperature";  // ← Add this
```

## Step 3: Add to Configuration Map

In `/data/alertConfigurations.ts`, update the export:

```typescript
export const alertTypeConfigurations: Record<AlertType, AlertTypeConfig> = {
  'theft': theftAlertConfig,
  'battery': batteryAlertConfig,
  'compliance': complianceAlertConfig,
  'underutilized': underutilizedAlertConfig,
  'offline': offlineAlertConfig,
  'unauthorized-zone': unauthorizedZoneAlertConfig,
  'predictive-maintenance': predictiveMaintenanceAlertConfig,
  'temperature': temperatureAlertConfig,  // ← Add this
};
```

## Step 4: Add Mock Data (Optional)

In `/data/mockData.ts`, add some temperature alerts:

```typescript
{
  id: "TEMP-001",
  type: "temperature",
  severity: "critical",
  asset: "Generator #5",
  assetId: "GEN-005",
  message: "Temperature critically high at 210°F",
  timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  status: "active",
  location: "East Warehouse",
  reason: "Operating temperature exceeds maximum safe threshold of 150°F",
  suggestedAction: "Shut down equipment immediately and inspect cooling system",
  metadata: {
    currentTemp: 210,
    maxSafeTemp: 150,
    criticalTemp: 200,
    trendDirection: 'increasing'
  }
},
```

## Step 5: Implement Backend Logic

In your backend service:

```typescript
// Backend: Alert Processing Engine
async function processTemperatureAlerts() {
  // 1. Load configuration for this organization
  const config = await db.getAlertConfig(orgId, 'temperature');
  
  if (!config.enabled) return;
  
  // 2. Extract field values
  const {
    minTemperature,
    maxTemperature,
    criticalLowTemperature,
    criticalHighTemperature,
    rateOfChangeAlert,
    rateThreshold,
    excludeNonOperating,
    affectedCategories,
    checkInterval,
    cooldownPeriod
  } = config.field_values;
  
  // 3. Query assets with temperature sensors
  const assets = await db.getAssets({
    hasTemperatureSensor: true,
    categories: affectedCategories,
    excludePoweredOff: excludeNonOperating
  });
  
  // 4. Process each asset
  for (const asset of assets) {
    const currentTemp = asset.temperature;
    
    // Check if in cooldown period
    const lastAlert = await db.getLastAlert(asset.id, 'temperature');
    if (lastAlert && isWithinCooldown(lastAlert, cooldownPeriod)) {
      continue;
    }
    
    let severity: AlertSeverity = config.severity;
    let message = '';
    let shouldAlert = false;
    
    // Check temperature thresholds
    if (currentTemp < criticalLowTemperature) {
      severity = 'critical';
      message = `Temperature critically low at ${currentTemp}°F`;
      shouldAlert = true;
    } else if (currentTemp > criticalHighTemperature) {
      severity = 'critical';
      message = `Temperature critically high at ${currentTemp}°F`;
      shouldAlert = true;
    } else if (currentTemp < minTemperature) {
      severity = 'warning';
      message = `Temperature low at ${currentTemp}°F`;
      shouldAlert = true;
    } else if (currentTemp > maxTemperature) {
      severity = 'warning';
      message = `Temperature high at ${currentTemp}°F`;
      shouldAlert = true;
    }
    
    // Check rate of change (if enabled)
    if (rateOfChangeAlert) {
      const previousReading = await db.getPreviousTemperature(asset.id, checkInterval);
      if (previousReading) {
        const rateOfChange = Math.abs(currentTemp - previousReading.temp) / checkInterval;
        
        if (rateOfChange > rateThreshold) {
          severity = 'warning';
          message = `Rapid temperature change: ${rateOfChange.toFixed(1)}°F/min`;
          shouldAlert = true;
        }
      }
    }
    
    // 5. Generate alert if conditions met
    if (shouldAlert) {
      const alert = await createAlert({
        type: 'temperature',
        severity,
        assetId: asset.id,
        assetName: asset.name,
        message,
        reason: `Current: ${currentTemp}°F, Safe range: ${minTemperature}-${maxTemperature}°F`,
        suggestedAction: severity === 'critical' 
          ? 'Shut down equipment and inspect immediately'
          : 'Monitor closely and schedule inspection',
        metadata: {
          currentTemp,
          minTemp: minTemperature,
          maxTemp: maxTemperature,
          criticalLow: criticalLowTemperature,
          criticalHigh: criticalHighTemperature,
        }
      });
      
      // 6. Send notifications based on channel settings
      await sendNotifications(config.notification_settings, alert);
    }
  }
}

// Schedule to run every checkInterval
scheduleJob(`*/${config.field_values.checkInterval} * * * *`, processTemperatureAlerts);
```

## That's It!

### What You Get Automatically:

✅ **UI Tab** - Automatically appears in Configure Alert Rules dialog  
✅ **Form Fields** - All fields render automatically based on configuration  
✅ **Validation** - Field validation works out of the box  
✅ **Persistence** - Saves/loads through the existing service layer  
✅ **Type Safety** - Full TypeScript support  
✅ **Dependencies** - Conditional fields show/hide correctly  
✅ **Help Text** - Tooltips and descriptions display automatically  
✅ **Sidebar Integration** - Count updates in real-time  
✅ **Export/Import** - Configuration can be exported and shared  

### What You Need to Implement:

🔧 Backend alert processing logic (example above)  
🔧 Temperature sensor integration  
🔧 Notification delivery  

## Advanced: Custom Field Type

If you need a field type that doesn't exist, add it to `AlertConfigFieldRenderer.tsx`:

```typescript
case 'temperature-range':
  return (
    <div className="space-y-2">
      <Label>{field.label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={currentValue.min}
          onChange={(e) => onChange({ ...currentValue, min: parseFloat(e.target.value) })}
          placeholder="Min"
        />
        <span>to</span>
        <Input
          type="number"
          value={currentValue.max}
          onChange={(e) => onChange({ ...currentValue, max: parseFloat(e.target.value) })}
          placeholder="Max"
        />
        <Badge variant="outline">{field.unit}</Badge>
      </div>
    </div>
  );
```

Then use it in your configuration:

```typescript
{
  key: 'safeRange',
  label: 'Safe Temperature Range',
  type: 'temperature-range',
  defaultValue: { min: 32, max: 150 },
  unit: '°F'
}
```

## Benefits Demonstrated

1. **No UI Code Changes** - The entire temperature alert UI was created by just defining a configuration object
2. **Backend-Ready** - The configuration structure maps directly to what the backend needs
3. **Maintainable** - All temperature alert logic is in one place
4. **Extensible** - Easy to add more fields or modify behavior
5. **Consistent** - Same UX patterns as all other alert types

This is the power of **configuration-driven development**! 🚀
