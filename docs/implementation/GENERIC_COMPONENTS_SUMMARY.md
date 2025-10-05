# Generic Components Summary

## Recently Created Generic Components

### 1. StatusBadge (`/components/common/StatusBadge.tsx`)
**Purpose**: Unified status badge with automatic color coding

**Usage**:
```tsx
import { StatusBadge } from "./components/common";

<StatusBadge status="active" type="asset" />
<StatusBadge status="in-progress" type="job" />
<StatusBadge status="maintenance" />
```

**Supported Statuses**:
- Asset: active, inactive, maintenance, in-transit, checked-out, offline, idle
- Job: planning, in-progress, on-hold, completed, cancelled
- Maintenance: pending, scheduled, overdue
- Issue: open, assigned, resolved, closed

**Replaces**:
- Duplicate status badge color logic in:
  - AssetInventory.tsx
  - Sites.tsx
  - JobManagement.tsx
  - VehicleAssetPairing.tsx
  - And many others

---

### 2. PriorityBadge (`/components/common/PriorityBadge.tsx`)
**Purpose**: Unified priority badge with automatic color coding

**Usage**:
```tsx
import { PriorityBadge } from "./components/common";

<PriorityBadge priority="critical" />
<PriorityBadge priority="high" />
```

**Supported Priorities**:
- critical (red)
- high (orange)
- medium (yellow)
- low (blue)

**Replaces**:
- Duplicate priority color logic in:
  - JobManagement.tsx
  - Maintenance.tsx
  - IssueTracking.tsx

---

### 3. InfoRow (`/components/common/InfoRow.tsx`)
**Purpose**: Icon + text combination pattern

**Usage**:
```tsx
import { InfoRow } from "./components/common";
import { MapPin, User } from "lucide-react";

<InfoRow icon={MapPin}>
  <span>Location: Building A</span>
</InfoRow>

<InfoRow icon={User} iconClassName="text-blue-600">
  <span>{driver.name}</span>
</InfoRow>
```

**Replaces**:
- Duplicate icon + text patterns in table cells and cards across many components

---

## Existing Generic Components

### 4. StatsCard (`/components/common/StatsCard.tsx`)
**Purpose**: Dashboard statistics cards
**Status**: ✅ Already created and in use

### 5. EmptyState (`/components/common/EmptyState.tsx`)
**Purpose**: Empty state placeholders
**Status**: ✅ Already created and in use

### 6. LoadingState (`/components/common/LoadingState.tsx`)
**Purpose**: Loading indicators
**Status**: ✅ Already created and in use

### 7. ErrorState (`/components/common/ErrorState.tsx`)
**Purpose**: Error messages
**Status**: ✅ Already created and in use

### 8. PageHeader (`/components/common/PageHeader.tsx`)
**Purpose**: Consistent page headers
**Status**: ✅ Already created and in use

### 9. Section (`/components/common/Section.tsx`)
**Purpose**: Content sections with consistent spacing
**Status**: ✅ Already created and in use

### 10. AlertCard (`/components/common/AlertCard.tsx`)
**Purpose**: Alert display cards
**Status**: ✅ Already created and in use

### 11. CapacityBar (`/components/common/CapacityBar.tsx`)
**Purpose**: Capacity/progress visualization
**Status**: ✅ Already created and in use

### 12. ConfigurationLevelWidget (`/components/common/ConfigurationLevelWidget.tsx`)
**Purpose**: Configuration level indicator
**Status**: ✅ Already created and in use

---

## Potential Future Generic Components

### NotificationCard
**Current State**: Custom implementation in multiple places
**Locations**: Dashboard alerts section, notification lists
**Benefit**: Unified notification display

### JobCard
**Current State**: Table rows in JobManagement
**Potential**: Could create card view option
**Benefit**: Alternative view mode for jobs

### AssetCard
**Current State**: Table rows in AssetInventory
**Potential**: Could create card/grid view option
**Benefit**: Visual browsing of assets

### SiteCard
**Current State**: Table rows in Sites
**Potential**: Could create card/grid view option
**Benefit**: Visual site overview

### GeofenceCard
**Current State**: Table rows in Geofences
**Potential**: Could create card view with map preview
**Benefit**: Visual geofence management

### VehicleCard
**Current State**: Already uses cards in VehicleAssetPairing
**Status**: ✅ Good implementation, no changes needed

---

## Adoption Strategy

### Phase 1: Update Existing Components to Use New Badges (Recommended)
1. Replace custom status badge logic with `<StatusBadge>`
2. Replace custom priority badge logic with `<PriorityBadge>`
3. Replace icon + text patterns with `<InfoRow>`

**Files to Update**:
- AssetInventory.tsx
- Sites.tsx
- JobManagement.tsx
- Geofences.tsx
- Maintenance.tsx
- IssueTracking.tsx
- JobDetails.tsx
- And others

### Phase 2: Consider View Mode Enhancements (Optional)
Add card/grid view options to list-heavy components using new card components

### Phase 3: Extract Common Dialog Patterns (Future)
If we find repetitive dialog patterns, create generic dialog components

---

## Integration Example

**Before**:
```tsx
<Badge
  variant="outline"
  className={
    job.status === "in-progress"
      ? "bg-green-100 text-green-700 border-green-200"
      : job.status === "on-hold"
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-gray-100 text-gray-700 border-gray-200"
  }
>
  {job.status}
</Badge>
```

**After**:
```tsx
import { StatusBadge } from "./components/common";

<StatusBadge status={job.status} type="job" />
```

**Benefits**:
- 80% less code
- Consistent colors across app
- Single source of truth for status colors
- Easier to update color scheme
