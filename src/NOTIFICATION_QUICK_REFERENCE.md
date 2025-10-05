# Notification Configuration - Quick Reference

## 🎯 TL;DR

All notification configurations are stored in **one object** in `App.tsx`:

```typescript
// App.tsx
const [notificationConfigs, setNotificationConfigs] = useState<Record<string, NotificationPreferences>>({
  "user:current-user": { /* user config */ },
  "site:site-001": { /* site override */ },
  "asset:asset-123": { /* asset override */ },
});
```

This object can be **directly synced with your backend** - no complex state management needed!

## 📦 Object Structure

```typescript
{
  // Key format: "{level}:{entityId}"
  "user:john-123": {
    id: "user-john-123",
    level: "user",
    entityId: "john-123",
    channels: {
      email: { enabled: true, addresses: [...], verified: true },
      sms: { enabled: true, phoneNumbers: [...], verified: true },
      push: { enabled: true, devices: [...] },
      webhook: { enabled: false, endpoints: [] },
    },
    filters: {
      types: [],  // Empty = all types
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
  }
}
```

## 🔧 App.tsx Methods

```typescript
// Load (on app start)
loadNotificationConfigs()

// Save (when user clicks "Save")
await saveNotificationConfig(config)

// Delete (when user removes override)
await deleteNotificationConfig(level, entityId)

// Get one
getNotificationConfig(level, entityId)

// Get all
getAllNotificationConfigs()
```

## 🌲 Hierarchy

```
User Level (default)
  ↓
Site Level (optional override)
  ↓
Asset Level (optional override)
```

**Resolution**: Most specific wins (Asset > Site > User)

## 🔌 Backend Integration

### Current (Temporary)
```typescript
localStorage.setItem("notificationConfigurations", JSON.stringify(configs));
```

### Production (To Implement)
```typescript
await api.saveNotificationConfigs(configs);
```

## 📡 API Endpoints Needed

```
GET    /api/notification-configs              → Load all
POST   /api/notification-configs              → Save/update
DELETE /api/notification-configs/:level/:id   → Delete override
```

## 💾 Database Schema

```sql
CREATE TABLE notification_configurations (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  level ENUM('user', 'site', 'asset') NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  channels JSONB NOT NULL,
  filters JSONB NOT NULL,
  quiet_hours JSONB NOT NULL,
  frequency JSONB NOT NULL,
  is_override BOOLEAN DEFAULT FALSE,
  override_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (level, entity_id, user_id)
);
```

## 🎨 UI Components

### NotificationPreferencesNew
**Location**: `/components/NotificationPreferencesNew.tsx`
**Features**:
- Three-level selector (User / Site / Asset)
- Channel toggles
- Severity filters
- Quiet hours
- Frequency limits
- Configuration Inspector

### ConfigurationInspector
**Location**: `/components/ConfigurationInspector.tsx`
**Features**:
- Shows active config
- Displays inheritance chain
- Lists overrides

## 📝 Example Usage

### Save User Config
```typescript
const userConfig: NotificationPreferences = {
  id: "user-john-123",
  level: "user",
  entityId: "john-123",
  channels: { email: { enabled: true, ... }, ... },
  filters: { severities: ["medium", "high", "critical"] },
  quietHours: { enabled: true, start: "22:00", end: "08:00", ... },
  frequency: { maxPerHour: 20, maxPerDay: 100, ... },
  isOverride: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

await saveNotificationConfig(userConfig);
```

### Create Site Override
```typescript
const siteConfig: NotificationPreferences = {
  ...userConfig,  // Start with user config
  id: "site-site-001",
  level: "site",
  entityId: "site-001",
  channels: {
    ...userConfig.channels,
    sms: { enabled: false, ... },  // Override: No SMS
  },
  quietHours: { enabled: false, ... },  // Override: 24/7
  isOverride: true,
  overrideReason: "Construction site - email only",
  updatedAt: new Date().toISOString(),
};

await saveNotificationConfig(siteConfig);
```

### Get Effective Config for Asset
```typescript
import { resolveNotificationConfig } from './services/notificationConfigService';

const effectiveConfig = resolveNotificationConfig(
  'john-123',        // userId
  'site-001',        // siteId
  'asset-123',       // assetId
  asset,             // asset object
  site,              // site object
  notificationConfigs  // from App.tsx state
);

// Use it
if (effectiveConfig.preferences.channels.email.enabled) {
  sendEmail(effectiveConfig.preferences.channels.email.addresses);
}
```

## 🧪 Testing

```bash
# User creates default preferences
1. Go to Settings → Notification Preferences
2. Configure channels, filters, quiet hours
3. Click Save
4. Check: notificationConfigs["user:current-user"] updated

# User creates site override
1. Switch to "Site Level" tab
2. Select a site
3. Change settings (e.g., disable SMS)
4. Click Save
5. Check: notificationConfigs["site:site-001"] created

# View what's active
1. Go to Asset Details → Notifications tab
2. See Configuration Inspector
3. Verify: Shows which config is active and why

# Delete override
1. In Notification Preferences → Site Level
2. Click "Remove Override"
3. Check: notificationConfigs["site:site-001"] deleted
```

## 📊 Data Size

- User config: ~2KB
- Site override: ~2KB
- Asset override: ~2KB
- 10 sites + 5 assets: ~32KB
- 1000 users: ~32MB

Very efficient!

## ✅ Checklist for Backend Team

- [ ] Create database table
- [ ] Implement GET /api/notification-configs
- [ ] Implement POST /api/notification-configs
- [ ] Implement DELETE /api/notification-configs/:level/:id
- [ ] Add authentication
- [ ] Add validation
- [ ] Add error handling
- [ ] Test with frontend

## 📚 Full Documentation

- Design: `/NOTIFICATION_DESIGN_REFACTOR.md`
- Implementation: `/NOTIFICATION_HIERARCHY_IMPLEMENTATION.md`
- Backend: `/NOTIFICATION_BACKEND_INTEGRATION.md`
- Data Flow: `/NOTIFICATION_STATE_FLOW.md`
- Status: `/NOTIFICATION_IMPLEMENTATION_COMPLETE.md`

## 🎉 Ready to Go!

The notification system is **complete and backend-ready**. Just implement the API endpoints and replace localStorage calls with API calls. That's it!

---

**Questions?** Check the full docs or ask! 🚀
