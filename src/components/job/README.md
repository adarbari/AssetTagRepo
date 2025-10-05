# Job Form Components

Reusable components for job creation and editing forms.

## Components

### JobInformationSection

Basic job information fields including name, description, dates, priority, project manager, and client.

**Usage:**
```tsx
import { JobInformationSection } from './job/JobInformationSection';

<JobInformationSection
  name={name}
  onNameChange={setName}
  description={description}
  onDescriptionChange={setDescription}
  startDate={startDate}
  onStartDateChange={setStartDate}
  endDate={endDate}
  onEndDateChange={setEndDate}
  priority={priority}
  onPriorityChange={setPriority}
  projectManager={projectManager}
  onProjectManagerChange={setProjectManager}
  clientId={clientId}
  onClientIdChange={setClientId}
  jobNumber={job?.jobNumber} // Optional - only for edit mode
  showClientField={true} // Optional - defaults to false
/>
```

### BudgetSection

Budget allocation fields for total, labor, equipment, materials, and other costs.

**Usage:**
```tsx
import { BudgetSection } from './job/BudgetSection';

<BudgetSection
  totalBudget={totalBudget}
  onTotalBudgetChange={setTotalBudget}
  laborBudget={laborBudget}
  onLaborBudgetChange={setLaborBudget}
  equipmentBudget={equipmentBudget}
  onEquipmentBudgetChange={setEquipmentBudget}
  materialsBudget={materialsBudget}
  onMaterialsBudgetChange={setMaterialsBudget}
  otherBudget={otherBudget}
  onOtherBudgetChange={setOtherBudget}
/>
```

### NotesSection

Simple notes textarea for additional job information.

**Usage:**
```tsx
import { NotesSection } from './job/NotesSection';

<NotesSection
  notes={notes}
  onNotesChange={setNotes}
/>
```

### TagsSection

Tag management with add/remove functionality and built-in dialog.

**Usage:**
```tsx
import { TagsSection } from './job/TagsSection';

// As a full section with header
<TagsSection
  tags={tags}
  onTagsChange={setTags}
  showAsSection={true}
/>

// As inline field
<TagsSection
  tags={tags}
  onTagsChange={setTags}
  showAsSection={false}
/>
```

## Design Principles

1. **Controlled Components**: All components are fully controlled with props
2. **No Internal State**: State is managed by parent components
3. **Type Safety**: All props are fully typed
4. **Configuration Driven**: Options pulled from `/data/dropdownOptions.ts`
5. **Reusable**: Can be used in any job-related form

## Data Flow

```
Parent Component (CreateJob/EditJob)
  ├─ State (useState hooks)
  ├─ Handlers (setState functions)
  └─ Child Components
      ├─ JobInformationSection
      ├─ BudgetSection
      ├─ NotesSection
      └─ TagsSection
```

## Benefits

- **Consistency**: Same UI across create and edit
- **Maintainability**: Single source of truth for form fields
- **Type Safety**: TypeScript ensures correct prop usage
- **Testability**: Components can be tested in isolation
- **Extensibility**: Easy to add new fields or modify existing ones
