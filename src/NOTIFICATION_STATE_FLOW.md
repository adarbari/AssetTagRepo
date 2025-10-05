# Notification Configuration State Flow

## Current Implementation Status ✅

All notification configurations are now stored in a **single, centralized object in App.tsx** that can be directly synced with your backend.

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│                                                              │
│  State: notificationConfigs                                  │
│  Type: Record<string, NotificationPreferences>               │
│                                                              │
│  {                                                           │
│    "user:current-user": { ...userConfig },                  │
│    "site:site-001": { ...siteOverride },                    │
│    "asset:asset-123": { ...assetOverride }                  │
│  }                                                           │
│                                                              │
│  Methods:                                                    │
│  ├─ loadNotificationConfigs()                               │
│  ├─ saveNotificationConfig(config)                          │
│  ├─ deleteNotificationConfig(level, id)                     │
│  ├─ getNotificationConfig(level, id)                        │
│  └─ getAllNotificationConfigs()                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Props passed down ↓
                     │
┌────────────────────┴────────────────────────────────────────┐
│              NotificationPreferencesNew                      │
│                                                              │
│  Receives:                                                   │
│  ├─ notificationConfigs (read-only state)                   │
│  ├─ onSaveConfig (save function)                            │
│  ├─ onDeleteConfig (delete function)                        │
│  └─ onGetConfig (get function)                              │
│                                                              │
│  User Actions:                                               │
│  ├─ Select level (User/Site/Asset)                          │
│  ├─ Configure channels, filters, quiet hours                │
│  ├─ Click Save → calls onSaveConfig()                       │
│  └─ Delete override → calls onDeleteConfig()                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Props passed down ↓
                     │
┌────────────────────┴────────────────────────────────────────┐
│              ConfigurationInspector                          │
│                                                              │
│  Receives:                                                   │
│  └─ notificationConfigs (for resolution)                    │
│                                                              │
│  Shows:                                                      │
│  ├─ Active configuration                                     │
│  ├─ Inheritance chain (User → Site → Asset)                 │
│  ├─ Available configs at each level                         │
│  └─ Active overrides                                         │
└──────────────────────────────────────────────────────────────┘
```

## Object Structure

### Key Format
```typescript
// Pattern: "{level}:{entityId}"
"user:current-user"     // User level
"site:site-001"         // Site level override
"asset:asset-123"       // Asset level override
```

### Value Format (NotificationPreferences)
```typescript
{
  id: string;                    // "user-current-user"
  level: "user" | "site" | "asset";
  entityId: string;              // "current-user", "site-001", "asset-123"
  
  channels: {
    email: {
      enabled: boolean;
      addresses: string[];
      verified: boolean;
    };
    sms: {
      enabled: boolean;
      phoneNumbers: string[];
      verified: boolean;
    };
    push: {
      enabled: boolean;
      devices: string[];
    };
    webhook: {
      enabled: boolean;
      endpoints: string[];
    };
  };
  
  filters: {
    types: AlertType[];           // Empty = all types
    severities: ("low" | "medium" | "high" | "critical")[];
    sites?: string[];             // Optional site filter
    assets?: string[];            // Optional asset filter
  };
  
  quietHours: {
    enabled: boolean;
    start: string;                // "22:00"
    end: string;                  // "08:00"
    timezone: string;             // "America/New_York"
    excludeCritical: boolean;
    daysOfWeek?: number[];        // 0-6, Sunday=0
  };
  
  frequency: {
    maxPerHour: number;
    maxPerDay: number;
    digestMode: boolean;
    digestFrequency?: "hourly" | "daily" | "weekly";
  };
  
  isOverride: boolean;            // true for site/asset levels
  overrideReason?: string;        // Optional explanation
  
  createdAt: string;              // ISO timestamp
  updatedAt: string;              // ISO timestamp
  createdBy?: string;
  updatedBy?: string;
}
```

## Complete Example

```typescript
// In App.tsx state
const notificationConfigs = {
  // User level (default for all assets)
  "user:john-123": {
    id: "user-john-123",
    level: "user",
    entityId: "john-123",
    channels: {
      email: {
        enabled: true,
        addresses: ["john@example.com"],
        verified: true,
      },
      sms: {
        enabled: true,
        phoneNumbers: ["+1-555-1234"],
        verified: true,
      },
      push: {
        enabled: true,
        devices: ["device-1"],
      },
      webhook: {
        enabled: false,
        endpoints: [],
      },
    },
    filters: {
      types: [], // All alert types
      severities: ["medium", "high", "critical"],
    },
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "08:00",
      timezone: "America/New_York",
      excludeCritical: true,
    },
    frequency: {
      maxPerHour: 20,
      maxPerDay: 100,
      digestMode: false,
    },
    isOverride: false,
    createdAt: "2025-01-04T10:00:00Z",
    updatedAt: "2025-01-04T15:30:00Z",
  },

  // Site level override (for Construction Site A)
  "site:site-001": {
    id: "site-site-001",
    level: "site",
    entityId: "site-001",
    channels: {
      email: {
        enabled: true,
        addresses: ["john@example.com"],
        verified: true,
      },
      sms: {
        enabled: false, // ← OVERRIDE: No SMS at construction sites
        phoneNumbers: [],
        verified: false,
      },
      push: {
        enabled: true,
        devices: ["device-1"],
      },
      webhook: {
        enabled: false,
        endpoints: [],
      },
    },
    filters: {
      types: [],
      severities: ["high", "critical"], // ← OVERRIDE: Higher severity threshold
    },
    quietHours: {
      enabled: false, // ← OVERRIDE: No quiet hours (24/7 site)
      start: "22:00",
      end: "08:00",
      timezone: "America/New_York",
      excludeCritical: true,
    },
    frequency: {
      maxPerHour: 10,
      maxPerDay: 50,
      digestMode: false,
    },
    isOverride: true,
    overrideReason: "Construction site - email only, 24/7 monitoring",
    createdAt: "2025-01-04T11:00:00Z",
    updatedAt: "2025-01-04T14:00:00Z",
  },

  // Asset level override (for high-value excavator)
  "asset:excavator-001": {
    id: "asset-excavator-001",
    level: "asset",
    entityId: "excavator-001",
    channels: {
      email: {
        enabled: true,
        addresses: ["john@example.com", "manager@example.com"],
        verified: true,
      },
      sms: {
        enabled: true,
        phoneNumbers: ["+1-555-1234", "+1-555-5678"],
        verified: true,
      },
      push: {
        enabled: true,
        devices: ["device-1"],
      },
      webhook: {
        enabled: true, // ← OVERRIDE: Webhook to external monitoring
        endpoints: ["https://monitor.example.com/webhook"],
      },
    },
    filters: {
      types: [],
      severities: ["critical"], // ← OVERRIDE: Critical only
    },
    quietHours: {
      enabled: false, // ← OVERRIDE: 24/7 monitoring
      start: "22:00",
      end: "08:00",
      timezone: "America/New_York",
      excludeCritical: true,
    },
    frequency: {
      maxPerHour: 100,
      maxPerDay: 1000,
      digestMode: false,
    },
    isOverride: true,
    overrideReason: "High-value asset - requires 24/7 monitoring with webhook",
    createdAt: "2025-01-04T12:00:00Z",
    updatedAt: "2025-01-04T16:00:00Z",
  },
};
```

## Hierarchy Resolution

When an alert is triggered for "excavator-001" at "site-001":

```typescript
// Step 1: Check asset level
const assetConfig = notificationConfigs["asset:excavator-001"];
if (assetConfig && assetConfig.isOverride) {
  // ✅ Use this config
  return assetConfig;
}

// Step 2: Check site level
const siteConfig = notificationConfigs["site:site-001"];
if (siteConfig && siteConfig.isOverride) {
  // Use this config
  return siteConfig;
}

// Step 3: Fall back to user level
const userConfig = notificationConfigs["user:john-123"];
return userConfig;
```

Result for "excavator-001":
```typescript
{
  activeConfig: notificationConfigs["asset:excavator-001"],
  source: {
    level: "asset",
    entityId: "excavator-001",
    entityName: "Excavator EX-001"
  },
  inheritanceChain: [
    { level: "user", isActive: false },
    { level: "site", isActive: false },
    { level: "asset", isActive: true }  // ← This one wins
  ]
}
```

## Backend Sync Points

### On App Load
```typescript
useEffect(() => {
  // Load from backend
  const loadNotificationConfigs = async () => {
    const configs = await api.getNotificationConfigs('current-user');
    setNotificationConfigs(configs);
  };
  
  loadNotificationConfigs();
}, []);
```

### On Save
```typescript
const saveNotificationConfig = async (config: NotificationPreferences) => {
  // Update backend
  await api.saveNotificationConfig(config);
  
  // Update local state
  const key = `${config.level}:${config.entityId}`;
  setNotificationConfigs(prev => ({
    ...prev,
    [key]: config,
  }));
};
```

### On Delete
```typescript
const deleteNotificationConfig = async (level: string, entityId: string) => {
  // Delete from backend
  await api.deleteNotificationConfig(level, entityId);
  
  // Update local state
  const key = `${level}:${entityId}`;
  const { [key]: removed, ...remaining } = notificationConfigs;
  setNotificationConfigs(remaining);
};
```

## Backend API Format

### GET /api/notification-configs
```json
{
  "success": true,
  "data": {
    "user:john-123": { ... },
    "site:site-001": { ... },
    "asset:excavator-001": { ... }
  }
}
```

### POST /api/notification-configs
Request:
```json
{
  "id": "site-site-001",
  "level": "site",
  "entityId": "site-001",
  "channels": { ... },
  "filters": { ... },
  "quietHours": { ... },
  "frequency": { ... },
  "isOverride": true,
  "overrideReason": "Construction site - email only",
  "updatedAt": "2025-01-04T14:00:00Z"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "site-site-001",
    "level": "site",
    ...
  }
}
```

### DELETE /api/notification-configs/site/site-001
```json
{
  "success": true,
  "message": "Override removed"
}
```

## Storage Size Estimate

Average configuration size: ~2KB
```
User config:     ~2KB
Site override:   ~2KB × 10 sites  = ~20KB
Asset override:  ~2KB × 5 assets  = ~10KB
Total:           ~32KB
```

For 1000 users: ~32MB
For 10,000 users: ~320MB

Very manageable!

## Summary

✅ **Single Source of Truth**: `notificationConfigs` in App.tsx
✅ **Simple Key-Value Structure**: Easy to serialize/deserialize
✅ **Type-Safe**: Full TypeScript support
✅ **Backend-Ready**: Direct mapping to API endpoints
✅ **Scalable**: Efficient storage and retrieval
✅ **Hierarchical**: User → Site → Asset resolution built-in

The entire notification configuration system can be synced with your backend by simply:
1. Loading `notificationConfigs` on app start
2. Saving changes to backend when user clicks "Save"
3. Deleting from backend when user removes override

No complex state management needed - it's just a plain JavaScript object!
