# Dropdown Options System Guide

## Overview

This application uses a centralized system for managing dropdown options (asset types, statuses, owners, etc.) that will eventually be fetched from the backend API.

## Current Implementation

All dropdown options are defined in `/data/dropdownOptions.ts` with the following structure:

```typescript
export interface DropdownOption {
  value: string;  // Internal value used for storage/API
  label: string;  // Display text shown to users
}
```

## Available Dropdown Options

### Asset Management
- **assetTypes**: Types of assets (Heavy Equipment, Tools, Vehicles, etc.)
- **assetStatuses**: Asset status options (Active, Inactive, In Transit, etc.)
- **assetOwners**: Personnel who can be assigned assets
- **manufacturers**: Common equipment manufacturers

### Projects & Sites
- **projects**: Available projects/work orders
- **siteTypes**: Types of physical sites
- **geofenceTypes**: Types of geofence boundaries

### Alerts & Notifications
- **alertTypes**: Types of alerts that can be triggered
- **alertSeverities**: Severity levels for alerts
- **notificationChannels**: Available notification methods
- **lostItemMechanisms**: Triggers for lost item alerts

### Maintenance
- **maintenanceTypes**: Types of maintenance activities
- **maintenancePriorities**: Priority levels for maintenance tasks

## Usage Examples

### Basic Usage in a Component

```typescript
import { assetTypes, assetStatuses } from "../data/dropdownOptions";

function MyComponent() {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select type" />
      </SelectTrigger>
      <SelectContent>
        {assetTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Using Helper Functions

```typescript
import { getOptionLabel, getOptionValue } from "../data/dropdownOptions";

// Convert value to label for display
const displayText = getOptionLabel(assetTypes, "heavy-equipment");
// Returns: "Heavy Equipment"

// Convert label to value for storage
const storageValue = getOptionValue(assetTypes, "Heavy Equipment");
// Returns: "heavy-equipment"
```

### Using the Hook (Recommended for Future API Integration)

```typescript
import { useDropdownOptions } from "../hooks/useDropdownOptions";

function MyComponent() {
  const { options, loading, error } = useDropdownOptions('assetTypes');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading options</div>;

  return (
    <Select>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
}
```

## Migration to Backend API

When the backend is ready, follow these steps:

### Step 1: Update the API Service

Add endpoint functions to `/services/api.ts`:

```typescript
export async function getDropdownOptions(optionType: string) {
  return api.get(`/dropdown-options/${optionType}`);
}
```

### Step 2: Update the Hook

Modify `/hooks/useDropdownOptions.ts` to fetch from the API:

```typescript
useEffect(() => {
  const fetchOptions = async () => {
    setLoading(true);
    try {
      const response = await getDropdownOptions(optionType);
      setOptions(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  fetchOptions();
}, [optionType]);
```

### Step 3: Update Components

Components already using `useDropdownOptions` will automatically fetch from the API.

For components using direct imports, replace:

```typescript
// Before
import { assetTypes } from "../data/dropdownOptions";

// After
const { options: assetTypes } = useDropdownOptions('assetTypes');
```

## Backend API Requirements

The backend should expose these endpoints:

```
GET /api/dropdown-options/asset-types
GET /api/dropdown-options/asset-statuses
GET /api/dropdown-options/asset-owners
GET /api/dropdown-options/projects
GET /api/dropdown-options/manufacturers
GET /api/dropdown-options/notification-channels
GET /api/dropdown-options/lost-item-mechanisms
GET /api/dropdown-options/site-types
GET /api/dropdown-options/geofence-types
GET /api/dropdown-options/alert-types
GET /api/dropdown-options/alert-severities
GET /api/dropdown-options/maintenance-types
GET /api/dropdown-options/maintenance-priorities
```

### Expected Response Format

All endpoints should return an array of objects with this structure:

```json
[
  {
    "value": "heavy-equipment",
    "label": "Heavy Equipment"
  },
  {
    "value": "tools",
    "label": "Tools"
  }
]
```

## Best Practices

1. **Always use `value` for storage**: Store the `value` field in your database, not the `label`
2. **Display the `label` to users**: Show the `label` field in the UI
3. **Handle missing options gracefully**: Use fallback text when a value doesn't match any option
4. **Avoid empty string values**: Use meaningful values like "no-site" or "unassigned" instead of ""
5. **Keep labels user-friendly**: Use clear, descriptive text for labels

## Adding New Dropdown Types

1. Add the new option array to `/data/dropdownOptions.ts`:

```typescript
export const myNewOptions: DropdownOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
];
```

2. Export it from `/data/mockData.ts` for backward compatibility:

```typescript
export { myNewOptions } from "./dropdownOptions";
```

3. Use it in your components:

```typescript
import { myNewOptions } from "../data/dropdownOptions";
```

## Troubleshooting

### Issue: Select shows value instead of label

**Problem**: You're storing labels in your data instead of values.

**Solution**: Use the `getOptionValue` helper to convert labels to values before storing:

```typescript
const valueToStore = getOptionValue(assetTypes, selectedLabel);
```

### Issue: Select dropdown is empty

**Problem**: The value stored doesn't match any option value.

**Solution**: Check that you're comparing the same format (labels vs values):

```typescript
// Wrong - comparing label to value
<Select value={asset.type}> // "Heavy Equipment"
  <SelectItem value="heavy-equipment">...</SelectItem>

// Right - converting label to value first
const typeValue = getOptionValue(assetTypes, asset.type);
<Select value={typeValue}>
  <SelectItem value="heavy-equipment">...</SelectItem>
```

### Issue: Options not updating after backend integration

**Problem**: Components using direct imports won't automatically update.

**Solution**: Replace direct imports with the `useDropdownOptions` hook to enable dynamic fetching.
