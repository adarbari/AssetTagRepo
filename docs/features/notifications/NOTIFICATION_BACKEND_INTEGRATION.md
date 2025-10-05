# Notification Configuration - Backend Integration Guide

## Overview

The notification configuration system is now **backend-ready** with centralized state management in `App.tsx`. All configurations are stored in a single object that can be seamlessly synced with your backend API.

## Data Structure

### Centralized State Location
**File**: `/App.tsx`
**State Variable**: `notificationConfigs`

```typescript
// Type: Record<string, NotificationPreferences>
// Structure:
{
  "user:current-user": {
    id: "user-current-user",
    level: "user",
    entityId: "current-user",
    channels: { ... },
    filters: { ... },
    quietHours: { ... },
    frequency: { ... },
    isOverride: false,
    createdAt: "2025-01-04T10:00:00Z",
    updatedAt: "2025-01-04T15:30:00Z"
  },
  "site:site-001": {
    id: "site-site-001",
    level: "site",
    entityId: "site-001",
    channels: { ... },
    filters: { ... },
    isOverride: true,
    overrideReason: "Construction site requires email-only notifications",
    createdAt: "2025-01-04T11:00:00Z",
    updatedAt: "2025-01-04T14:00:00Z"
  },
  "asset:asset-123": {
    id: "asset-asset-123",
    level: "asset",
    entityId: "asset-123",
    channels: { ... },
    filters: { ... },
    isOverride: true,
    overrideReason: "High-value asset - 24/7 monitoring required",
    createdAt: "2025-01-04T12:00:00Z",
    updatedAt: "2025-01-04T16:00:00Z"
  }
}
```

### Key Format
Each configuration is stored with a key: `{level}:{entityId}`
- User level: `user:current-user`
- Site level: `site:{siteId}`
- Asset level: `asset:{assetId}`

## State Management Functions (App.tsx)

### 1. Load Configurations
```typescript
const loadNotificationConfigs = () => {
  // Currently loads from localStorage
  // TODO: Replace with API call
  
  // Production implementation:
  // const response = await api.getNotificationConfigs(userId);
  // setNotificationConfigs(response.data);
}
```

### 2. Save Configuration
```typescript
const saveNotificationConfig = async (config: NotificationPreferences) => {
  const key = `${config.level}:${config.entityId}`;
  
  // Update local state
  const updatedConfigs = {
    ...notificationConfigs,
    [key]: { ...config, updatedAt: new Date().toISOString() },
  };
  setNotificationConfigs(updatedConfigs);
  
  // Persist to backend
  // TODO: Replace localStorage with API call
  localStorage.setItem("notificationConfigurations", JSON.stringify(updatedConfigs));
  
  // Production implementation:
  // await api.saveNotificationConfig(config);
  
  return { success: true };
}
```

### 3. Delete Configuration
```typescript
const deleteNotificationConfig = async (level: string, entityId: string) => {
  // Cannot delete user-level (base configuration)
  if (level === "user") {
    return { success: false, error: "Cannot delete user-level configuration" };
  }

  const key = `${level}:${entityId}`;
  const { [key]: removed, ...remaining } = notificationConfigs;
  
  // Update local state
  setNotificationConfigs(remaining);
  
  // Persist to backend
  // TODO: Replace localStorage with API call
  localStorage.setItem("notificationConfigurations", JSON.stringify(remaining));
  
  // Production implementation:
  // await api.deleteNotificationConfig(level, entityId);
  
  return { success: true };
}
```

### 4. Get Configuration
```typescript
const getNotificationConfig = (level: string, entityId: string): NotificationPreferences | undefined => {
  const key = `${level}:${entityId}`;
  return notificationConfigs[key];
}
```

### 5. Get All Configurations
```typescript
const getAllNotificationConfigs = (): Record<string, NotificationPreferences> => {
  return notificationConfigs;
}
```

## Backend API Endpoints (To Implement)

### GET /api/notification-configs
**Purpose**: Load all notification configurations for the current user
**Response**:
```json
{
  "success": true,
  "data": {
    "user:user-123": { ... },
    "site:site-001": { ... },
    "asset:asset-456": { ... }
  }
}
```

### POST /api/notification-configs
**Purpose**: Create or update a notification configuration
**Request Body**:
```json
{
  "id": "user-user-123",
  "level": "user",
  "entityId": "user-123",
  "channels": {
    "email": {
      "enabled": true,
      "addresses": ["user@example.com"],
      "verified": true
    },
    "sms": {
      "enabled": true,
      "phoneNumbers": ["+1-555-0123"],
      "verified": true
    },
    "push": {
      "enabled": true,
      "devices": ["device-1", "device-2"]
    },
    "webhook": {
      "enabled": false,
      "endpoints": []
    }
  },
  "filters": {
    "types": [],
    "severities": ["medium", "high", "critical"]
  },
  "quietHours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00",
    "timezone": "America/New_York",
    "excludeCritical": true
  },
  "frequency": {
    "maxPerHour": 20,
    "maxPerDay": 100,
    "digestMode": false
  },
  "isOverride": false,
  "createdAt": "2025-01-04T10:00:00Z",
  "updatedAt": "2025-01-04T15:30:00Z"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user-user-123",
    "level": "user",
    ...
  }
}
```

### DELETE /api/notification-configs/:level/:entityId
**Purpose**: Delete a site or asset level override
**Example**: `DELETE /api/notification-configs/site/site-001`
**Response**:
```json
{
  "success": true,
  "message": "Configuration override removed"
}
```

### GET /api/notification-configs/effective/:entityType/:entityId
**Purpose**: Get the effective configuration after hierarchy resolution
**Example**: `GET /api/notification-configs/effective/asset/asset-123`
**Response**:
```json
{
  "success": true,
  "data": {
    "preferences": { ... },
    "source": {
      "level": "asset",
      "entityId": "asset-123",
      "entityName": "Excavator EX-100"
    },
    "inheritanceChain": [
      {
        "level": "user",
        "entityId": "user-123",
        "entityName": "Your Account",
        "isActive": false
      },
      {
        "level": "site",
        "entityId": "site-001",
        "entityName": "Construction Site A",
        "isActive": false
      },
      {
        "level": "asset",
        "entityId": "asset-123",
        "entityName": "Excavator EX-100",
        "isActive": true
      }
    ],
    "overrides": [
      {
        "field": "quietHours.enabled",
        "value": false,
        "source": "asset"
      }
    ]
  }
}
```

## Database Schema

### Table: notification_configurations

```sql
CREATE TABLE notification_configurations (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  level ENUM('user', 'site', 'asset') NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  
  -- Channels (JSONB for PostgreSQL, JSON for MySQL)
  channels JSONB NOT NULL,
  
  -- Filters
  filters JSONB NOT NULL,
  
  -- Quiet Hours
  quiet_hours JSONB NOT NULL,
  
  -- Frequency
  frequency JSONB NOT NULL,
  
  -- Override metadata
  is_override BOOLEAN DEFAULT FALSE,
  override_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  
  -- Indexes
  INDEX idx_user_level (user_id, level),
  INDEX idx_entity (level, entity_id),
  UNIQUE KEY unique_config (level, entity_id, user_id)
);
```

### Example Rows

```sql
-- User level
INSERT INTO notification_configurations VALUES (
  'user-user-123',
  'user-123',
  'user',
  'user-123',
  '{"email": {"enabled": true, "addresses": ["user@example.com"], "verified": true}, ...}',
  '{"types": [], "severities": ["medium", "high", "critical"]}',
  '{"enabled": true, "start": "22:00", "end": "08:00", ...}',
  '{"maxPerHour": 20, "maxPerDay": 100, "digestMode": false}',
  false,
  null,
  '2025-01-04 10:00:00',
  '2025-01-04 15:30:00',
  'user-123',
  'user-123'
);

-- Site level override
INSERT INTO notification_configurations VALUES (
  'site-site-001',
  'user-123',
  'site',
  'site-001',
  '{"email": {"enabled": true, ...}, "sms": {"enabled": false, ...}, ...}',
  '{"types": [], "severities": ["high", "critical"]}',
  '{"enabled": false, ...}',
  '{"maxPerHour": 10, "maxPerDay": 50, "digestMode": false}',
  true,
  'Construction site requires email-only notifications',
  '2025-01-04 11:00:00',
  '2025-01-04 14:00:00',
  'user-123',
  'user-123'
);

-- Asset level override
INSERT INTO notification_configurations VALUES (
  'asset-asset-123',
  'user-123',
  'asset',
  'asset-123',
  '{"email": {"enabled": true, ...}, "sms": {"enabled": true, ...}, "webhook": {"enabled": true, ...}, ...}',
  '{"types": [], "severities": ["critical"]}',
  '{"enabled": false, ...}',
  '{"maxPerHour": 100, "maxPerDay": 1000, "digestMode": false}',
  true,
  'High-value asset - 24/7 monitoring required',
  '2025-01-04 12:00:00',
  '2025-01-04 16:00:00',
  'user-123',
  'user-123'
);
```

## Migration Steps

### Step 1: Update App.tsx API Calls

**Current (localStorage)**:
```typescript
localStorage.setItem("notificationConfigurations", JSON.stringify(updatedConfigs));
```

**Replace with (API)**:
```typescript
await api.saveNotificationConfigs(updatedConfigs);
```

### Step 2: Create API Client Methods

**File**: `/services/api.ts`

```typescript
export const api = {
  // ... existing methods ...

  // Notification Configurations
  async getNotificationConfigs(userId: string): Promise<Record<string, NotificationPreferences>> {
    const response = await fetch(`/api/notification-configs?userId=${userId}`);
    const data = await response.json();
    return data.data;
  },

  async saveNotificationConfig(config: NotificationPreferences): Promise<NotificationPreferences> {
    const response = await fetch('/api/notification-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = await response.json();
    return data.data;
  },

  async deleteNotificationConfig(level: string, entityId: string): Promise<void> {
    await fetch(`/api/notification-configs/${level}/${entityId}`, {
      method: 'DELETE',
    });
  },

  async getEffectiveNotificationConfig(
    entityType: 'user' | 'site' | 'asset',
    entityId: string
  ): Promise<EffectiveNotificationConfig> {
    const response = await fetch(`/api/notification-configs/effective/${entityType}/${entityId}`);
    const data = await response.json();
    return data.data;
  },
};
```

### Step 3: Update loadNotificationConfigs in App.tsx

```typescript
const loadNotificationConfigs = async () => {
  try {
    // Call backend API
    const configs = await api.getNotificationConfigs('current-user');
    setNotificationConfigs(configs);
  } catch (error) {
    console.error("Failed to load notification configurations:", error);
    
    // Fallback to default
    const defaultConfig = createDefaultUserConfig();
    setNotificationConfigs({ "user:current-user": defaultConfig });
  }
};
```

### Step 4: Update saveNotificationConfig in App.tsx

```typescript
const saveNotificationConfig = async (config: NotificationPreferences) => {
  const key = `${config.level}:${config.entityId}`;
  
  try {
    // Save to backend
    const savedConfig = await api.saveNotificationConfig({
      ...config,
      updatedAt: new Date().toISOString(),
    });
    
    // Update local state after successful save
    setNotificationConfigs(prev => ({
      ...prev,
      [key]: savedConfig,
    }));
    
    return { success: true };
  } catch (error) {
    console.error("Failed to save notification configuration:", error);
    return { success: false, error };
  }
};
```

### Step 5: Update deleteNotificationConfig in App.tsx

```typescript
const deleteNotificationConfig = async (level: string, entityId: string) => {
  if (level === "user") {
    return { success: false, error: "Cannot delete user-level configuration" };
  }

  const key = `${level}:${entityId}`;

  try {
    // Delete from backend
    await api.deleteNotificationConfig(level, entityId);
    
    // Update local state after successful delete
    const { [key]: removed, ...remaining } = notificationConfigs;
    setNotificationConfigs(remaining);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete notification configuration:", error);
    return { success: false, error };
  }
};
```

## Testing

### Manual Testing Checklist

- [ ] Load notification configs on app start
- [ ] Save user-level configuration
- [ ] Create site-level override
- [ ] Create asset-level override
- [ ] Delete site-level override (should revert to user level)
- [ ] Delete asset-level override (should revert to site or user level)
- [ ] View Configuration Inspector to verify hierarchy
- [ ] Test with network errors (offline mode)
- [ ] Test concurrent updates (multiple tabs)

### API Testing with cURL

```bash
# Get all configs
curl -X GET http://localhost:3000/api/notification-configs?userId=user-123

# Save config
curl -X POST http://localhost:3000/api/notification-configs \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user-user-123",
    "level": "user",
    "entityId": "user-123",
    "channels": {...},
    ...
  }'

# Delete override
curl -X DELETE http://localhost:3000/api/notification-configs/site/site-001

# Get effective config
curl -X GET http://localhost:3000/api/notification-configs/effective/asset/asset-123
```

## Error Handling

### Network Errors
```typescript
const saveNotificationConfig = async (config: NotificationPreferences) => {
  try {
    const savedConfig = await api.saveNotificationConfig(config);
    // Success handling
  } catch (error) {
    if (error.message === 'Network request failed') {
      // Show offline indicator
      toast.error("You're offline", {
        description: "Changes will be saved when you're back online"
      });
      // Queue for retry
      queueForRetry(config);
    } else {
      // Show generic error
      toast.error("Failed to save preferences");
    }
  }
};
```

### Validation Errors
```typescript
if (!config.channels.email.enabled && !config.channels.sms.enabled && !config.channels.push.enabled) {
  return {
    success: false,
    error: "At least one notification channel must be enabled"
  };
}
```

### Permission Errors
```typescript
// User trying to modify another user's config
if (config.entityId !== currentUserId && config.level === 'user') {
  return {
    success: false,
    error: "You don't have permission to modify this configuration"
  };
}
```

## Sync Strategy

### Optimistic Updates
```typescript
// Update UI immediately
setNotificationConfigs(prev => ({
  ...prev,
  [key]: newConfig,
}));

// Save to backend in background
api.saveNotificationConfig(newConfig).catch(error => {
  // Rollback on error
  setNotificationConfigs(prev => ({
    ...prev,
    [key]: oldConfig,
  }));
  toast.error("Failed to save. Changes reverted.");
});
```

### Periodic Sync
```typescript
// In App.tsx useEffect
useEffect(() => {
  const syncInterval = setInterval(async () => {
    const serverConfigs = await api.getNotificationConfigs('current-user');
    setNotificationConfigs(serverConfigs);
  }, 60000); // Sync every minute

  return () => clearInterval(syncInterval);
}, []);
```

## Performance Optimization

### Debouncing Saves
```typescript
const debouncedSave = debounce(async (config: NotificationPreferences) => {
  await saveNotificationConfig(config);
}, 1000);

// In component
const handleChange = (updates: Partial<NotificationPreferences>) => {
  const newConfig = { ...preferences, ...updates };
  setPreferences(newConfig); // Update UI immediately
  debouncedSave(newConfig); // Save after 1 second of no changes
};
```

### Caching
```typescript
// Cache effective configs to avoid repeated calculations
const effectiveConfigCache = new Map<string, EffectiveNotificationConfig>();

const getEffectiveConfig = (entityType: string, entityId: string) => {
  const cacheKey = `${entityType}:${entityId}`;
  
  if (effectiveConfigCache.has(cacheKey)) {
    return effectiveConfigCache.get(cacheKey);
  }
  
  const config = resolveNotificationConfig(...);
  effectiveConfigCache.set(cacheKey, config);
  
  return config;
};

// Invalidate cache when configs change
const saveNotificationConfig = async (config: NotificationPreferences) => {
  await api.saveNotificationConfig(config);
  effectiveConfigCache.clear(); // Invalidate all cached configs
};
```

## Summary

✅ **Centralized State**: All configs in `App.tsx` → `notificationConfigs`
✅ **Backend Ready**: Simple object structure, easy to serialize
✅ **CRUD Operations**: Load, Save, Delete, Get all implemented
✅ **Hierarchical**: User → Site → Asset with proper resolution
✅ **Type Safe**: Full TypeScript support
✅ **Scalable**: Ready for API integration with minimal changes

**Next Steps**:
1. Implement backend API endpoints
2. Replace localStorage calls with API calls
3. Add error handling and retry logic
4. Test with real backend
5. Add webhook verification
6. Add email/SMS verification flows
