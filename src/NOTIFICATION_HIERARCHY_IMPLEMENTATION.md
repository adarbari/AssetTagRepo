# Notification Hierarchy Implementation

## Summary of Changes

We've successfully refactored the notification system to follow best practices:

### 1. **Separated Concerns** ✅

**Alert Configuration** (System/Admin Level):
- ✅ Defines WHAT triggers alerts (thresholds, conditions)
- ✅ Sets alert severity levels (low, medium, high, critical)
- ✅ Configures alert suppression rules
- ✅ Manages escalation policies
- ❌ NO LONGER manages notification channels

**Notification Preferences** (User/Site/Asset Level):
- ✅ Defines HOW users receive notifications
- ✅ Manages notification channels (Email, SMS, Push, Webhook)
- ✅ Contact information for each channel
- ✅ Quiet hours and frequency limits
- ✅ Alert type and severity filtering
- ✅ **NEW**: Hierarchical configuration (User → Site → Asset)

### 2. **Created Hierarchy System** ✅

**Three Levels of Configuration:**
1. **User Level** (Default) - Your personal notification preferences
2. **Site Level** (Optional Override) - Custom notifications for specific sites
3. **Asset Level** (Optional Override) - Custom notifications for specific assets

**Resolution Order:** Asset → Site → User (most specific wins)

### 3. **Added Configuration Inspector** ✅

New component that shows:
- Which configuration is currently active
- The complete inheritance chain
- Which overrides are in effect
- Why a specific configuration is being used

## Files Created

### 1. `/types/notificationConfig.ts`
Defines the new hierarchical notification preference types:
- `NotificationPreferences` - Base configuration structure
- `EffectiveNotificationConfig` - Resolved configuration after inheritance
- `ConfigurationInspection` - Debug/inspection results
- Supports User/Site/Asset levels with override capability

### 2. `/services/notificationConfigService.ts`
Service layer for managing notification configurations:
- `resolveNotificationConfig()` - Resolves inheritance chain
- `inspectConfiguration()` - Shows which config is active and why
- `saveNotificationPreferences()` - Saves configuration
- `deleteNotificationPreferences()` - Removes override
- `createOverride()` - Creates site/asset override from parent config

### 3. `/components/ConfigurationInspector.tsx`
UI component for viewing configuration inheritance:
- Shows active configuration
- Displays inheritance chain with visual hierarchy
- Lists available configurations at each level
- Highlights active overrides
- Provides helpful explanations
- Three display modes: button, inline, card

## Files Modified

### 1. `/types/alertConfig.ts` ✅
**Changes:**
- Removed `NotificationChannel` interface
- Updated `AlertRuleConfig` to remove `notifications` field
- Added `suppressionRules` field
- Added `escalationPolicy` field
- Changed severity type from `'info' | 'warning' | 'critical'` to `'low' | 'medium' | 'high' | 'critical'`

**Old Structure:**
```typescript
interface AlertRuleConfig {
  enabled: boolean;
  severity: 'info' | 'warning' | 'critical';
  notifications: {  // ❌ REMOVED
    channels: NotificationChannel[];
    throttle?: number;
    digestEnabled?: boolean;
  };
}
```

**New Structure:**
```typescript
interface AlertRuleConfig {
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suppressionRules?: {  // ✅ ADDED
    enabled: boolean;
    duration?: number;
  };
  escalationPolicy?: string;  // ✅ ADDED
}
```

### 2. `/components/AlertConfiguration.tsx` ✅
**Changes:**
- Removed notification channel toggles (Email, SMS, Push, Webhook)
- Removed notification throttle and digest settings
- Added alert suppression configuration
- Added informational card explaining where to configure notifications
- Added "Go to Notification Preferences" button
- Removed `updateNotificationChannel()` function
- Added `updateSuppressionRules()` function

**What Users See Now:**
- **Alert Conditions**: Configure thresholds and detection methods
- **Alert Severity**: Set severity level for each alert type
- **Alert Suppression**: Prevent alert fatigue with cooldown periods
- **Info Card**: Directs users to Notification Preferences for channel config
- **Examples & Recommendations**: Helpful guidance (unchanged)

### 3. `/App.tsx` ✅
**Changes:**
- Added `onNavigateToNotifications` prop to AlertConfiguration
- Connected navigation to Notification Preferences page

## How It Works

### Example 1: User-Level Configuration (Default)

```
User "John" sets:
  - Email: ✓ Enabled
  - SMS: ✓ Enabled
  - Quiet Hours: 22:00 - 08:00
  - Min Severity: Medium

All assets for John use these settings by default.
```

### Example 2: Site-Level Override

```
User "John" (default):
  - Email: ✓, SMS: ✓
  - Min Severity: Medium

Site "Construction Zone A" (override):
  - Email: ✓, SMS: ✗  
  - Min Severity: High
  - Reason: "Construction site - email only, critical alerts"

For assets in "Construction Zone A":
  → Uses Site override
  → Only email notifications
  → Only High+ severity alerts
```

### Example 3: Asset-Level Override

```
User "John" (default):
  - Email: ✓, SMS: ✓
  - Quiet Hours: 22:00 - 08:00

Site "Warehouse B" (no override):
  → Inherits from User

Asset "Bulldozer-005" (override):
  - Email: ✓, SMS: ✓, Webhook: ✓
  - No quiet hours (24/7 monitoring)
  - Reason: "High-value asset requires 24/7 monitoring"

For "Bulldozer-005":
  → Uses Asset override
  → All channels including webhook
  → No quiet hours
```

## Using the Configuration Inspector

### In AssetDetails View:
```tsx
<ConfigurationInspector
  entityType="asset"
  entityId={asset.id}
  entityName={asset.name}
  userId="current-user"
  assetId={asset.id}
  asset={asset}
  siteId={asset.siteId}
  site={site}
  variant="button"
/>
```

This shows:
- ✅ Which config is active for this asset
- ✅ Is it using user, site, or asset-level settings?
- ✅ Why is this config being used?
- ✅ What overrides are in effect?

### In SiteDetails View:
```tsx
<ConfigurationInspector
  entityType="site"
  entityId={site.id}
  entityName={site.name}
  userId="current-user"
  siteId={site.id}
  site={site}
  variant="card"
/>
```

### In Settings/Debug View:
```tsx
<ConfigurationInspector
  entityType="user"
  entityId="current-user"
  entityName="Your Account"
  userId="current-user"
  variant="inline"
/>
```

## Next Steps

### Phase 1: Enhance NotificationPreferences Component (TODO)
- [ ] Add hierarchy level selector (User / Site / Asset)
- [ ] Add site/asset selector when creating overrides
- [ ] Show inheritance indicators
- [ ] Add "Remove Override" button for site/asset levels
- [ ] Add alert type filtering UI
- [ ] Add severity filtering UI
- [ ] Add frequency limits configuration

### Phase 2: Integrate Configuration Inspector (TODO)
- [ ] Add to AssetDetails page (tab or section)
- [ ] Add to SiteDetails page (tab or section)
- [ ] Add to Settings page for user-level view
- [ ] Add quick access from alert notifications

### Phase 3: Backend Integration (TODO)
- [ ] API endpoints for CRUD operations on notification preferences
- [ ] Webhook configuration and testing
- [ ] Email/SMS verification flows
- [ ] Configuration history/audit trail
- [ ] Bulk operations (e.g., "apply to all assets")

### Phase 4: Advanced Features (TODO)
- [ ] Escalation policies
- [ ] On-call schedules
- [ ] Team-level notifications
- [ ] Notification templates
- [ ] A/B testing for notification effectiveness

## Migration Guide

### For Existing Alert Configurations

Old alert configurations with embedded notification settings will need migration:

```typescript
// OLD FORMAT (in localStorage)
{
  "theft": {
    "enabled": true,
    "severity": "critical",
    "notifications": {
      "channels": [
        { "type": "email", "enabled": true },
        { "type": "sms", "enabled": true }
      ],
      "throttle": 30
    }
  }
}

// NEW FORMAT (in localStorage)
// Alert Configuration:
{
  "theft": {
    "enabled": true,
    "severity": "critical",
    "suppressionRules": {
      "enabled": true,
      "duration": 30
    }
  }
}

// Notification Preferences (separate):
{
  "id": "user-current-user",
  "level": "user",
  "entityId": "current-user",
  "channels": {
    "email": { "enabled": true, "addresses": [...] },
    "sms": { "enabled": true, "phoneNumbers": [...] }
  },
  "filters": {
    "types": [], // All types
    "severities": ["medium", "high", "critical"]
  }
}
```

### Migration Script (TODO)

```typescript
function migrateAlertConfigurations() {
  const oldConfigs = localStorage.getItem('alertRuleConfigurations');
  if (!oldConfigs) return;
  
  const configs = JSON.parse(oldConfigs);
  const userPreferences = {
    channels: {
      email: { enabled: false },
      sms: { enabled: false },
      push: { enabled: false },
      webhook: { enabled: false },
    }
  };
  
  // Extract channel settings from first enabled alert
  for (const [type, config] of Object.entries(configs)) {
    if (config.notifications?.channels) {
      config.notifications.channels.forEach(ch => {
        if (ch.enabled) {
          userPreferences.channels[ch.type].enabled = true;
        }
      });
      
      // Remove notifications from config
      delete config.notifications;
      
      // Add suppression rules
      config.suppressionRules = {
        enabled: true,
        duration: config.notifications?.throttle || 30
      };
    }
  }
  
  // Save migrated configs
  localStorage.setItem('alertRuleConfigurations', JSON.stringify(configs));
  localStorage.setItem('notificationPreferences', JSON.stringify(userPreferences));
}
```

## Benefits

### 1. Clear Separation of Concerns ✅
- System admins configure alert rules
- Individual users configure their notification preferences
- No confusion about where to configure what

### 2. Flexibility ✅
- Default user-level preferences for convenience
- Site-level overrides for location-specific requirements
- Asset-level overrides for high-value or special assets

### 3. Visibility ✅
- Configuration Inspector shows exactly what's being used
- Clear inheritance chain
- Easy debugging of "why am I getting/not getting this alert?"

### 4. Maintainability ✅
- Cleaner code structure
- Easier to extend (add new channels, features)
- Better testing (separated concerns)

### 5. User Experience ✅
- Intuitive: "Configure WHAT triggers alerts" vs "Configure HOW I'm notified"
- Powerful: Override at any level as needed
- Transparent: Always know which config is active

## Testing Checklist

- [x] Alert Configuration loads without errors
- [x] Alert Configuration saves successfully
- [x] Notification channel section removed from Alert Configuration
- [x] Alert suppression settings work correctly
- [x] "Go to Notification Preferences" button navigates correctly
- [x] Configuration Inspector displays correctly
- [x] Configuration hierarchy resolves correctly
- [ ] NotificationPreferences supports hierarchy (TODO)
- [ ] Site-level overrides can be created
- [ ] Asset-level overrides can be created
- [ ] Configuration Inspector shows correct inheritance
- [ ] Backend API integration (when available)

## Conclusion

This refactor transforms the notification system from a monolithic configuration to a clean, hierarchical, and maintainable architecture. Users now have clear mental models of where to configure what, and power users can leverage the hierarchy for sophisticated notification strategies.

The system follows industry best practices and matches patterns used by Slack, GitHub, JIRA, and other enterprise platforms.
