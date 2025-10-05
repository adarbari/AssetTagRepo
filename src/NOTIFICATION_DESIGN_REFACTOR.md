# Notification Settings Design Refactor

## Problem Statement

Currently, notification settings appear in two places:
1. **Alert Configuration** - Has notification channel toggles (Email, SMS, Push, Webhook) per alert type
2. **Notification Preferences** - Also has notification settings

This creates confusion, duplication, and potential conflicts. Users don't know where to configure their notification preferences.

## Root Cause

Lack of clear separation between:
- **System-level configuration** (What triggers alerts)
- **User-level preferences** (How users want to be notified)

## Recommended Design Pattern

### ✅ Alert Configuration (System/Admin Level)

**Purpose**: Define WHAT triggers alerts and WHEN

**Should contain**:
- ✅ Alert thresholds (battery < 15%, geofence violations, etc.)
- ✅ Alert conditions and rules
- ✅ Alert severity/priority levels
- ✅ Default escalation policies
- ✅ Organization-wide alert policies
- ✅ Alert suppression rules

**Should NOT contain**:
- ❌ User notification channels (email, SMS, push)
- ❌ User contact information
- ❌ User quiet hours

**Access**: Typically admin/manager level

---

### ✅ Notification Preferences (User Level)

**Purpose**: Define HOW and WHEN each user wants to be notified

**Should contain**:
- ✅ Notification channels (Email, SMS, Push, Webhook)
- ✅ Contact information (email addresses, phone numbers)
- ✅ Per-channel preferences
- ✅ Quiet hours / Do Not Disturb schedules
- ✅ Alert type filtering (which alerts to receive)
- ✅ Alert severity filtering (only critical, high+critical, etc.)
- ✅ Notification frequency limits (max per hour/day)
- ✅ Delivery preferences (immediate, digest, etc.)

**Access**: Individual user level

---

## Implementation Strategy

### Option 1: Remove Notification Channels from Alert Configuration (Recommended)

**Pros**:
- ✅ Clean separation of concerns
- ✅ No duplication or conflicts
- ✅ Simpler to understand and maintain
- ✅ Follows industry best practices

**Cons**:
- ⚠️ Requires refactoring Alert Configuration
- ⚠️ Need to communicate changes to users

**Changes needed**:
```typescript
// BEFORE (Alert Configuration)
interface AlertConfiguration {
  id: string;
  type: AlertType;
  enabled: boolean;
  thresholds: Record<string, any>;
  notifications: {  // ❌ REMOVE THIS
    email: boolean;
    sms: boolean;
    push: boolean;
    webhook: boolean;
  };
}

// AFTER (Alert Configuration)
interface AlertConfiguration {
  id: string;
  type: AlertType;
  enabled: boolean;
  thresholds: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';  // ✅ ADD THIS
  escalationPolicy?: string;  // ✅ ADD THIS (optional)
}

// User Notification Preferences (already exists, enhance it)
interface NotificationPreferences {
  userId: string;
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
  alertFilters: {
    types: AlertType[];  // Which alert types to receive
    severities: string[];  // Which severities to receive
    sites?: string[];  // Optional: only alerts from certain sites
  };
  quietHours: {
    enabled: boolean;
    start: string;  // "22:00"
    end: string;    // "08:00"
    timezone: string;
    excludeCritical: boolean;  // Send critical alerts even during quiet hours
  };
  frequency: {
    maxPerHour: number;
    maxPerDay: number;
    digestMode: boolean;  // Bundle into digest emails
  };
}
```

---

### Option 2: Keep Both but Clarify Hierarchy (Not Recommended)

**Hierarchy logic**:
1. Alert Configuration defines system-wide defaults
2. User Notification Preferences override for individual users
3. Clear UI indication of which takes precedence

**Pros**:
- ⚠️ Keeps existing code mostly intact
- ⚠️ Provides flexibility

**Cons**:
- ❌ Still confusing to users
- ❌ More complex to implement correctly
- ❌ Potential for conflicts and bugs
- ❌ Harder to maintain

---

## Recommended Refactor Plan

### Phase 1: Update Alert Configuration Component

1. **Remove notification channel toggles** from Alert Configuration
2. **Add severity selector** to each alert type
3. **Simplify UI** to focus on thresholds and conditions
4. **Update data model** in `/data/alertConfigurations.ts`

### Phase 2: Enhance Notification Preferences Component

1. **Make it the single source of truth** for notification channels
2. **Add alert type filtering** (checkboxes for which alert types to receive)
3. **Add severity filtering** (minimum severity to notify)
4. **Add quiet hours** configuration
5. **Add frequency limits** (max notifications per hour/day)
6. **Add digest mode** option

### Phase 3: Update Documentation

1. Update all documentation to reflect new design
2. Add user guides explaining where to configure what
3. Update backend integration docs

---

## Updated User Flows

### Flow 1: User Wants to Change Battery Alert Threshold (15% → 20%)

**Before** (Confusing):
- Go to Alert Configuration?
- Go to Notification Preferences?
- Both? 🤔

**After** (Clear):
- Go to **Alert Configuration**
- Find "Battery Low" alert type
- Change threshold from 15% to 20%
- Done ✅

---

### Flow 2: User Wants to Stop Receiving SMS Notifications

**Before** (Confusing):
- Go to Alert Configuration and disable SMS for each alert type?
- Go to Notification Preferences?
- Both? 🤔

**After** (Clear):
- Go to **Notification Preferences**
- Toggle SMS channel off
- Done ✅

---

### Flow 3: User Wants Quiet Hours (No Notifications 10 PM - 8 AM)

**Before** (Impossible):
- Not available in Alert Configuration
- Not available in Notification Preferences
- Can't do it 😞

**After** (Clear):
- Go to **Notification Preferences**
- Enable Quiet Hours
- Set start: 22:00, end: 08:00
- Check "Send critical alerts anyway" if needed
- Done ✅

---

## Visual Comparison

### Current Design (Confusing)

```
Alert Configuration                 Notification Preferences
├─ Battery Low                     ├─ Email Settings
│  ├─ Threshold: 15%              │  └─ Enabled: ✓
│  ├─ Email: ✓                    ├─ SMS Settings
│  ├─ SMS: ✓                      │  └─ Enabled: ✓
│  └─ Push: ✓                     ├─ Push Settings
├─ Geofence Violation              │  └─ Enabled: ✓
│  ├─ Email: ✓                    └─ Webhook Settings
│  ├─ SMS: ✗                         └─ Enabled: ✗
│  └─ Push: ✓
└─ ...

❌ Where do I disable SMS?
❌ Which setting wins?
❌ Do I configure in both places?
```

---

### Proposed Design (Clear)

```
Alert Configuration (System)       Notification Preferences (User)
├─ Battery Low                     ├─ Channels
│  ├─ Threshold: 15%              │  ├─ Email: ✓ [email@example.com]
│  ├─ Severity: High              │  ├─ SMS: ✓ [+1-555-0123]
│  └─ Enabled: ✓                  │  ├─ Push: ✓ [2 devices]
├─ Geofence Violation              │  └─ Webhook: ✗
│  ├─ Buffer: ±10 ft              ├─ Alert Filters
│  ├─ Severity: Critical          │  ├─ Types: [✓ All]
│  └─ Enabled: ✓                  │  └─ Min Severity: High
└─ Connectivity Loss               ├─ Quiet Hours
   ├─ Duration: 5 min             │  ├─ Enabled: ✓
   ├─ Severity: Medium            │  ├─ 22:00 - 08:00
   └─ Enabled: ✓                  │  └─ Except Critical: ✓
                                   └─ Frequency Limits
✅ Clear: Configure alert rules       ├─ Max/hour: 10
   here                               └─ Digest mode: ✗

                                   ✅ Clear: Configure how I want
                                      to be notified here
```

---

## Implementation Checklist

### Alert Configuration Updates

- [ ] Remove notification channel toggles from UI
- [ ] Add severity selector (Low, Medium, High, Critical)
- [ ] Update `AlertConfiguration` interface to remove `notifications`
- [ ] Update `/data/alertConfigurations.ts` to remove channel data
- [ ] Update `AlertConfigFieldRenderer.tsx` to remove channel rendering
- [ ] Simplify UI to focus on thresholds/conditions
- [ ] Update documentation

### Notification Preferences Updates

- [ ] Add alert type filter checkboxes (which alerts to receive)
- [ ] Add severity filter dropdown (minimum severity)
- [ ] Add quiet hours configuration section
- [ ] Add frequency limits section
- [ ] Add digest mode toggle
- [ ] Enhance channel configuration with contact verification
- [ ] Add preview/test notification feature
- [ ] Update documentation

### Backend Integration

- [ ] Update API endpoints to reflect new structure
- [ ] Update alert generation logic to:
  1. Check if alert is enabled (from Alert Configuration)
  2. Determine alert severity (from Alert Configuration)
  3. Find users to notify based on alert type + severity
  4. Respect each user's channel preferences
  5. Respect quiet hours and frequency limits
- [ ] Update database schema

---

## Benefits of This Approach

1. **Clear Mental Model**: Users know exactly where to go
   - System config → Alert Configuration
   - Personal preferences → Notification Preferences

2. **No Duplication**: Each setting exists in exactly one place

3. **No Conflicts**: No possibility of contradictory settings

4. **Better Scalability**: Easy to add new features
   - New alert types → Add to Alert Configuration
   - New notification channels → Add to Notification Preferences
   - New user preferences → Add to Notification Preferences

5. **Industry Standard**: Matches how other platforms work
   - Slack: Workspace settings vs. Personal preferences
   - GitHub: Repository settings vs. Personal notifications
   - JIRA: Project settings vs. Personal notifications

6. **Easier Testing**: Clear separation makes testing simpler

7. **Better UX**: Users configure once in the right place

---

## Migration Strategy

### For Existing Users

1. **Data migration**: Move user channel preferences from Alert Configuration to Notification Preferences
2. **Default behavior**: 
   - All alert types enabled by default
   - All channels that were previously enabled remain enabled
   - No quiet hours initially
   - No frequency limits initially
3. **User communication**: 
   - In-app notification about the change
   - Guide users to Notification Preferences for channel config

### For New Users

1. **Onboarding wizard**: Guide through Notification Preferences setup
2. **Sensible defaults**: 
   - Email enabled by default
   - SMS, Push, Webhook disabled by default
   - All alert types enabled
   - Minimum severity: Medium
3. **Easy discovery**: Clear navigation and helpful tooltips

---

## Conclusion

**Recommendation**: Implement Option 1 (Remove notification channels from Alert Configuration)

This provides:
- ✅ Clear separation of concerns
- ✅ Better user experience
- ✅ Easier to maintain and extend
- ✅ Industry-standard design pattern
- ✅ No duplication or conflicts

The refactor is straightforward and will significantly improve the application's usability and maintainability.