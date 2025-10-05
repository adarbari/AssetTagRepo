# Job Form Synchronization

## Overview

This document explains the synchronization between CreateJob and EditJob components, ensuring both use the same data structure that matches the backend API types.

## Reusable Components

We've created reusable sub-components in `/components/job/` directory:

### 1. JobInformationSection
- **Purpose**: Handles basic job information (name, description, dates, priority, project manager, client)
- **Props**: All fields with onChange handlers
- **Used in**: CreateJob, EditJob
- **Features**:
  - Job name (required)
  - Job number (read-only, only shown in edit mode)
  - Description
  - Start/End dates (string format for consistency)
  - Priority (from config)
  - Project Manager (from config)
  - Client (optional, can be toggled)

### 2. BudgetSection
- **Purpose**: Handles budget allocation fields
- **Props**: All budget fields with onChange handlers
- **Used in**: CreateJob, EditJob
- **Features**:
  - Total budget
  - Labor budget
  - Equipment budget
  - Materials budget
  - Other budget

### 3. NotesSection
- **Purpose**: Handles job notes
- **Props**: notes, onNotesChange
- **Used in**: CreateJob, EditJob
- **Features**: Simple textarea for additional notes

### 4. TagsSection
- **Purpose**: Manages job tags with add/remove functionality
- **Props**: tags array, onTagsChange, showAsSection (optional)
- **Used in**: CreateJob, EditJob
- **Features**:
  - Display existing tags
  - Add new tags via dialog
  - Remove tags
  - Can be shown as full section or inline

## Data Structure Synchronization

### CreateJobInput (Backend Type)
```typescript
interface CreateJobInput {
  name: string;
  description: string;
  siteId?: string;
  clientId?: string;
  startDate: string;
  endDate: string;
  budget: JobBudget;
  priority?: JobPriority;
  projectManager?: string;
  groundStationGeofenceId?: string;
  notes?: string;
  tags?: string[];
}
```

### UpdateJobInput (Backend Type)
```typescript
interface UpdateJobInput {
  name?: string;
  description?: string;
  status?: JobStatus;
  priority?: JobPriority;
  startDate?: string;
  endDate?: string;
  budget?: Partial<JobBudget>;
  actualCosts?: Partial<JobActualCosts>;
  vehicle?: Partial<JobVehicle>;
  projectManager?: string;
  assignedTeam?: string[];
  clientId?: string;
  groundStationGeofenceId?: string;
  notes?: string;
  tags?: string[];
}
```

## CreateJob Component

### Collected Fields
- ✅ name (required)
- ✅ description
- ✅ startDate (required, string format)
- ✅ endDate (required, string format)
- ✅ priority (defaults to "medium")
- ✅ projectManager (optional)
- ✅ clientId (optional)
- ✅ siteId (prepared, not shown in UI yet)
- ✅ groundStationGeofenceId (prepared, not shown in UI yet)
- ✅ notes (optional)
- ✅ tags (optional array)
- ✅ budget (all fields: total, labor, equipment, materials, other)

### Form Validation
- Name, start date, and end date are required
- End date must be after start date
- Empty optional fields are sent as undefined (not empty strings)

## EditJob Component

### Collected Fields (All from UpdateJobInput)
- ✅ name
- ✅ description
- ✅ status (shown only in edit mode)
- ✅ priority
- ✅ startDate (string format for consistency)
- ✅ endDate (string format for consistency)
- ✅ projectManager (optional)
- ✅ clientId (optional)
- ✅ assignedTeam (managed via Team Members section)
- ✅ notes (optional)
- ✅ tags (optional array)
- ✅ budget (all fields: total, labor, equipment, materials, other)

### Additional Features (Edit Only)
- Status field (not in create)
- Job number (read-only display)
- Team member assignment
- Asset assignment with custom date ranges
- Actual costs display
- Budget variance display

## Key Synchronization Points

### 1. Date Handling
Both components now use **string dates** for consistency:
- CreateJob: Uses `<input type="date">` which returns string
- EditJob: Converts ISO dates to date strings (`split('T')[0]`)
- On submit: Converts to ISO format (`new Date(dateString).toISOString()`)

### 2. Configuration Sources
Both components pull options from `/data/dropdownOptions.ts`:
- ✅ jobPriorities
- ✅ projectManagers
- ✅ clients
- ✅ teamMembers (EditJob only)
- ✅ jobStatuses (EditJob only)

**Note**: No hardcoded values - all options come from config.

### 3. Optional Field Handling
Both components properly handle optional fields:
```typescript
projectManager: projectManager || undefined,
clientId: clientId || undefined,
tags: tags.length > 0 ? tags : undefined,
```

This ensures empty values are sent as `undefined` rather than empty strings.

### 4. Budget Structure
Both use identical budget structure:
```typescript
budget: {
  total: parseFloat(totalBudget) || 0,
  labor: parseFloat(laborBudget) || 0,
  equipment: parseFloat(equipmentBudget) || 0,
  materials: parseFloat(materialsBudget) || 0,
  other: parseFloat(otherBudget) || 0,
}
```

## UI Differences

### CreateJob Specific
- Info card explaining what can be done after creation
- Simpler layout (no status field)
- No asset/team management (done after creation)

### EditJob Specific
- Status field at top
- Job number display (read-only)
- Team member management section
- Asset assignment section with custom date ranges
- Actual costs vs budget comparison
- Variance display

## Future Backend Integration

When integrating with backend:

1. **Create Job Flow**:
   ```typescript
   POST /api/jobs
   Body: CreateJobInput
   Response: { success: boolean, job?: Job }
   ```

2. **Update Job Flow**:
   ```typescript
   PATCH /api/jobs/:jobId
   Body: UpdateJobInput
   Response: { success: boolean, job?: Job }
   ```

3. **Dropdown Options**:
   All dropdown options should be fetched from:
   ```typescript
   GET /api/dropdown-options/{optionType}
   ```

## Benefits of This Approach

1. **Type Safety**: Both forms use exact backend types
2. **DRY Principle**: Shared components eliminate duplication
3. **Maintainability**: Changes to form fields only need to be made in one place
4. **Consistency**: Users see identical UI for similar fields
5. **Backend Ready**: Data structures match API contracts exactly
6. **Configuration Driven**: All options pulled from centralized config

## Testing Checklist

When testing job creation/editing:

- [ ] Create job with all required fields
- [ ] Create job with optional fields (client, project manager, tags)
- [ ] Edit job and verify all fields populate correctly
- [ ] Change dates and verify validation works
- [ ] Add/remove tags in both create and edit
- [ ] Verify budget fields accept decimal values
- [ ] Ensure empty optional fields are sent as undefined
- [ ] Check that status field only appears in edit mode
- [ ] Verify job number is read-only in edit mode
- [ ] Test team member assignment (edit only)
- [ ] Test asset assignment (edit only)
