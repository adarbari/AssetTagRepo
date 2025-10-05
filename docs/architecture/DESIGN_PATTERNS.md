# Design Patterns & UI/UX Guidelines

This document captures the established design patterns and UI/UX guidelines used throughout the AssetTag application to ensure consistency and maintainability.

## Table of Contents

1. [Page Layout Patterns](#page-layout-patterns)
2. [Navigation Patterns](#navigation-patterns)
3. [Form & Edit Patterns](#form--edit-patterns)
4. [Component Structure](#component-structure)
5. [Button & Action Patterns](#button--action-patterns)
6. [Data Display Patterns](#data-display-patterns)
7. [Filter UI Patterns](#filter-ui-patterns)
8. [Breadcrumb Usage Guidelines](#breadcrumb-usage-guidelines)
9. [Tab Usage Patterns](#tab-usage-patterns)
10. [Max-Width Guidelines](#max-width-guidelines)
11. [Error Handling](#error-handling)
12. [Code Organization](#code-organization)

---

## Page Layout Patterns

### Full Page Detail/Edit Pages

**Pattern**: All detail and edit pages follow a consistent full-page layout structure.

```tsx
// Standard structure for detail/edit pages
<div className="h-full flex flex-col">
  <PageHeader 
    title="Page Title"
    description="Optional description"
    onBack={onBack}
    actions={
      <div className="flex items-center gap-2">
        {/* Action buttons */}
      </div>
    }
  />
  
  <div className="flex-1 overflow-auto p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page content */}
    </div>
  </div>
</div>
```

**Examples**: `IssueDetails`, `JobDetails`, `AssetDetails`, `EditJob`, `CreateJob`

**Key Principles**:
- Use `h-full flex flex-col` for full-page layout
- PageHeader handles the header with back button and actions
- Content area uses `flex-1 overflow-auto p-6` for proper scrolling
- Content is wrapped in `max-w-7xl mx-auto space-y-6` for consistent width and spacing

### List/Management Pages

**Pattern**: Pages that display lists of items with filtering and actions.

```tsx
// Standard structure for list/management pages
<div className="h-screen flex flex-col">
  <div className="border-b bg-background px-8 py-6">
    <PageHeader
      title="Page Title"
      description="Page description"
      icon={IconComponent}
    />
  </div>
  
  <div className="flex-1 overflow-auto p-8">
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Stats cards, filters, and data table */}
    </div>
  </div>
</div>
```

**Examples**: `IssueTracking`, `JobManagement`, `AssetInventory`

---

## Navigation Patterns

### Back Navigation

**Pattern**: Consistent back navigation across all pages.

```tsx
// PageHeader automatically handles back button
<PageHeader 
  title="Page Title"
  onBack={onBack}  // This creates the back button automatically
  actions={/* other actions */}
/>

// Actions should NOT include duplicate back buttons
actions={
  <div className="flex items-center gap-2">
    {/* Only relevant action buttons, NO back button */}
    <Button onClick={handleEdit}>
      <Edit className="h-4 w-4 mr-2" />
      Edit
    </Button>
  </div>
}
```

**Key Principles**:
- Use `PageHeader` with `onBack` prop for automatic back button
- Never add duplicate back buttons in actions
- Back button is always on the left side of the header
- Actions are always on the right side of the header

### Navigation Flow

**Pattern**: Consistent navigation flow for detail/edit operations.

```
List Page → Click Item → Detail Page → Edit → Save/Cancel → Back to List
```

**Examples**:
- Issue Tracking → Click Issue → Issue Details → Edit Issue → Save → Back to Issue Tracking
- Job Management → Click Job → Job Details → Edit Job → Save → Back to Job Management

---

## Form & Edit Patterns

### Unified View/Edit Interface

**Pattern**: Single interface that handles both viewing and editing.

```tsx
// Single interface with view/edit mode toggle
const [isEditing, setIsEditing] = useState(false);

// Header actions change based on mode
actions={
  <div className="flex items-center gap-2">
    {isEditing ? (
      <>
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
        <Button type="submit" form="form-id">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </>
    ) : (
      <Button onClick={() => setIsEditing(true)}>
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
    )}
  </div>
}

// Content changes based on mode
{isEditing ? (
  <FormComponent onSubmit={handleSubmit} onCancel={() => setIsEditing(false)} />
) : (
  <ViewComponent data={data} />
)}
```

**Key Principles**:
- Single interface for both viewing and editing
- Clear mode toggle with appropriate actions
- Save operations navigate back to the previous page
- Cancel operations return to view mode without saving

### Form Submission Flow

**Pattern**: Consistent form submission and navigation flow.

```tsx
const handleFormSubmit = async (formData: FormData): Promise<{ success: boolean; error?: any }> => {
  try {
    const result = await onSubmit(formData);
    
    if (result.success) {
      toast.success("Operation completed successfully");
      onBack(); // Navigate back to previous page
      return { success: true };
    } else {
      toast.error("Operation failed");
      return { success: false, error: result.error };
    }
  } catch (error) {
    toast.error("Operation failed");
    return { success: false, error };
  }
};
```

---

## Component Structure

### PageHeader Component

**Pattern**: Consistent header structure across all pages.

```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: { label: string; variant?: string };
  actions?: React.ReactNode;
  onBack?: () => void; // Automatically creates back button
}
```

**Usage**:
```tsx
<PageHeader 
  title="Issue Details"
  description="Asset: Vehicle-001 (VH-001)"
  onBack={onBack}
  actions={
    <div className="flex items-center gap-2">
      <Button onClick={handleEdit}>
        <Edit className="h-4 w-4 mr-2" />
        Edit Issue
      </Button>
    </div>
  }
/>
```

### Card Layout Patterns

**Pattern**: Consistent card-based layout for information display.

```tsx
// Two-column layout for related information
<div className="grid gap-6 lg:grid-cols-2">
  <Card>
    <CardHeader>
      <CardTitle>Primary Information</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Content */}
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader>
      <CardTitle>Secondary Information</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Content */}
    </CardContent>
  </Card>
</div>

// Full-width cards for important content
<Card>
  <CardHeader>
    <CardTitle>Description</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

---

## Button & Action Patterns

### Action Button Placement

**Pattern**: Consistent placement and styling of action buttons.

```tsx
// Header actions (right side)
actions={
  <div className="flex items-center gap-2">
    <Button variant="outline" onClick={handleCancel}>
      Cancel
    </Button>
    <Button onClick={handleSave}>
      <Save className="h-4 w-4 mr-2" />
      Save Changes
    </Button>
  </div>
}

// Inline actions (within content)
<div className="flex gap-2">
  <Button variant="outline" size="sm">
    <Edit className="h-4 w-4 mr-2" />
    Edit
  </Button>
  <Button variant="outline" size="sm">
    <Trash2 className="h-4 w-4 mr-2" />
    Delete
  </Button>
</div>
```

### Button Variants

**Pattern**: Consistent button variants for different actions.

- `variant="outline"`: Secondary actions (Cancel, Edit, Delete)
- `variant="default"`: Primary actions (Save, Create, Submit)
- `variant="ghost"`: Subtle actions (Back button in PageHeader)
- `variant="destructive"`: Destructive actions (Delete, Remove)

### Icon Usage

**Pattern**: Consistent icon usage with proper sizing and spacing.

```tsx
// Standard icon pattern
<Button>
  <IconName className="h-4 w-4 mr-2" />
  Button Text
</Button>

// Common icons
- ArrowLeft: Back navigation
- Edit: Edit actions
- Save: Save actions
- Trash2: Delete actions
- Plus: Add/Create actions
- X: Close/Cancel actions
```

---

## Data Display Patterns

### Status Badges

**Pattern**: Consistent status badge styling and colors.

```tsx
// Status badge variants
const getStatusBadge = (status: string) => {
  const variants = {
    open: { className: "bg-red-100 text-red-700 border-red-300" },
    acknowledged: { className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    "in-progress": { className: "bg-blue-100 text-blue-700 border-blue-300" },
    resolved: { className: "bg-green-100 text-green-700 border-green-300" },
    closed: { className: "bg-gray-100 text-gray-700 border-gray-300" },
  };
  
  return (
    <Badge className={variants[status]?.className || ""}>
      {status.replace("-", " ")}
    </Badge>
  );
};
```

### Data Tables

**Pattern**: Consistent table structure and styling.

```tsx
<div className="border rounded-lg">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Column 1</TableHead>
        <TableHead>Column 2</TableHead>
        <TableHead className="w-[50px]"></TableHead> {/* Actions column */}
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item) => (
        <TableRow 
          key={item.id} 
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => handleRowClick(item)}
        >
          <TableCell>{item.field1}</TableCell>
          <TableCell>{item.field2}</TableCell>
          <TableCell>
            <DropdownMenu>
              {/* Actions dropdown */}
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

---

## Error Handling

### Toast Notifications

**Pattern**: Consistent error and success messaging.

```tsx
import { toast } from "sonner";

// Success messages
toast.success("Operation completed successfully");

// Error messages
toast.error("Operation failed");

// Loading states
toast.loading("Processing...");
```

### Form Validation

**Pattern**: Consistent form validation and error display.

```tsx
const handleSubmit = async (data: FormData) => {
  try {
    const result = await onSubmit(data);
    
    if (result.success) {
      toast.success("Saved successfully");
      onBack();
    } else {
      toast.error(result.error || "Save failed");
    }
  } catch (error) {
    toast.error("An unexpected error occurred");
    console.error("Error:", error);
  }
};
```

---

## Code Organization

### File Structure

**Pattern**: Consistent file organization and naming.

```
src/components/
├── ComponentName.tsx          # Main component
├── ComponentName.test.tsx     # Tests
├── types/
│   └── component.ts           # Type definitions
└── hooks/
    └── useComponent.ts        # Custom hooks
```

### Import Organization

**Pattern**: Consistent import ordering.

```tsx
// 1. React imports
import React, { useState, useEffect } from "react";

// 2. UI component imports
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// 3. Icon imports
import { ArrowLeft, Edit, Save } from "lucide-react";

// 4. Utility imports
import { toast } from "sonner";

// 5. Type imports
import type { ComponentType } from "../types/component";

// 6. Local imports
import { PageHeader } from "./common";
```

### Component Props

**Pattern**: Consistent prop interfaces and naming.

```tsx
interface ComponentProps {
  // Required props first
  data: DataType;
  onBack: () => void;
  
  // Optional props with defaults
  title?: string;
  description?: string;
  
  // Event handlers
  onSubmit: (data: FormData) => Promise<{ success: boolean; error?: any }>;
  onCancel?: () => void;
  
  // State props
  loading?: boolean;
  disabled?: boolean;
}
```

---

## Best Practices

### 1. Consistency First
- Always follow established patterns
- Use existing components before creating new ones
- Maintain consistent spacing, colors, and typography

### 2. User Experience
- Provide clear navigation paths
- Use consistent button placement and styling
- Show loading states and provide feedback

### 3. Code Quality
- Use TypeScript for type safety
- Follow consistent naming conventions
- Keep components focused and reusable

### 4. Performance
- Use proper React patterns (hooks, memoization)
- Implement proper loading states
- Optimize for user interactions

### 5. Accessibility
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation works

---

## Examples

### Complete Detail Page Example

```tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, Edit, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "./common";
import { FormComponent } from "./FormComponent";
import type { DataType } from "../types/data";

interface DetailPageProps {
  data: DataType;
  onBack: () => void;
  onUpdate: (data: DataType) => Promise<{ success: boolean; error?: any }>;
}

export function DetailPage({ data, onBack, onUpdate }: DetailPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any): Promise<{ success: boolean; error?: any }> => {
    setLoading(true);
    try {
      const result = await onUpdate(formData);
      if (result.success) {
        toast.success("Updated successfully");
        setIsEditing(false);
        onBack();
        return { success: true };
      } else {
        toast.error("Update failed");
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error("Update failed");
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title={data.title}
        description={data.description}
        onBack={onBack}
        actions={
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" form="detail-form" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        }
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {isEditing ? (
            <FormComponent
              initialData={data}
              onSubmit={handleSubmit}
              onCancel={() => setIsEditing(false)}
              loading={loading}
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Display data */}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Filter UI Patterns

### Standardized FilterBar Component

**Pattern**: Use the `FilterBar` component for consistent filter UI across all list pages.

```tsx
import { FilterBar, type FilterConfig } from "../common";

const filters: FilterConfig[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "all", label: "All Status" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
    currentValue: statusFilter,
    onValueChange: setStatusFilter,
  },
  {
    key: "type",
    label: "Type",
    options: [
      { value: "all", label: "All Types" },
      { value: "equipment", label: "Equipment" },
      { value: "tools", label: "Tools" },
    ],
    currentValue: typeFilter,
    onValueChange: setTypeFilter,
  },
];

<FilterBar
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="Search items..."
  filters={filters}
  showAdvancedFilters={showAdvancedFilters}
  onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
  activeFiltersCount={activeFiltersCount}
  onClearAllFilters={handleClearAllFilters}
/>
```

**Key Principles**:
- First 2 filters shown inline with search
- Additional filters in collapsible advanced section
- Active filters displayed as removable badges
- Clear all filters button when filters are active
- Consistent search input with icon

### Filter Configuration

**Pattern**: Define filter configurations with consistent structure.

```tsx
interface FilterConfig {
  key: string;
  label: string;
  placeholder?: string;
  options: FilterOption[];
  currentValue: string;
  onValueChange: (value: string) => void;
  width?: string;
}
```

---

## Breadcrumb Usage Guidelines

### When to Use Breadcrumbs

**Pattern**: Use breadcrumbs for sub-actions from detail pages, not for top-level navigation.

**✅ Correct Usage**:
- Asset Details → Report Issue
- Asset Details → Check In/Out
- Asset Details → Schedule Maintenance
- Site Details → Create Geofence

**❌ Incorrect Usage**:
- List Page → Create New Item (use PageHeader with onBack)
- Dashboard → Any page (use sidebar navigation)

### Breadcrumb Implementation

**Pattern**: Breadcrumbs appear in a separate header section before PageHeader.

```tsx
<div className="h-screen flex flex-col">
  {/* Header with Breadcrumbs */}
  <div className="border-b bg-background px-8 py-4">
    <div className="flex items-center gap-4 mb-4">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={onBack} className="cursor-pointer">
              {parentPageName}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current Action</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
    <PageHeader
      title="Current Action"
      description="Description of current action"
      icon={ActionIcon}
    />
  </div>
  
  {/* Content */}
  <div className="flex-1 overflow-auto p-8">
    {/* Page content */}
  </div>
</div>
```

---

## Tab Usage Patterns

### When to Use Tabs

**Pattern**: Use tabs for organizing related content within a single page.

**✅ Good Tab Usage**:
- Detail pages with multiple sections (AssetDetails, SiteDetails, JobDetails)
- List pages with different status views (IssueTracking, Maintenance)
- Configuration pages with different categories (Settings)

**❌ Avoid Tabs For**:
- Simple forms (use single page)
- Navigation between different pages (use sidebar)

### Tab Implementation

**Pattern**: Consistent tab structure with proper content organization.

```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>

  <TabsContent value="overview" className="space-y-4">
    {/* Overview content */}
  </TabsContent>
  
  <TabsContent value="details" className="space-y-4">
    {/* Details content */}
  </TabsContent>
</Tabs>
```

### Tab Content Guidelines

- Use `space-y-4` or `space-y-6` for consistent spacing
- Keep tab content focused and related
- Use consistent card layouts within tabs
- Provide clear visual hierarchy

---

## Max-Width Guidelines

### Page Type Max-Width Standards

**Pattern**: Consistent max-width values based on page type and content.

```tsx
// Forms and Create/Edit pages
<div className="max-w-4xl mx-auto">
  {/* Form content */}
</div>

// Detail pages with comprehensive information
<div className="max-w-7xl mx-auto space-y-6">
  {/* Detail content */}
</div>

// List/Management pages with tables
<div className="max-w-[1600px] mx-auto space-y-6">
  {/* List content */}
</div>

// Dashboard (full width with internal constraints)
<div className="p-8 space-y-8">
  {/* Dashboard content with internal max-widths */}
</div>
```

### Max-Width Guidelines by Page Type

| Page Type | Max-Width | Use Case |
|-----------|-----------|----------|
| Forms | `max-w-4xl` | Create/Edit forms, simple detail pages |
| Detail Pages | `max-w-7xl` | Comprehensive detail pages with tabs |
| List Pages | `max-w-[1600px]` | Tables and data-heavy list pages |
| Dashboard | Full width | Dashboard with internal card constraints |

### Responsive Considerations

- Use responsive classes: `max-w-4xl mx-auto`
- Ensure content is readable on all screen sizes
- Consider mobile-first design principles
- Use appropriate padding: `p-6` for detail pages, `p-8` for list pages

---

## Component Usage Guidelines

### When to Use Each Generic Component

**PageHeader**: All pages that need a header with title, description, and actions
**EmptyState**: Empty lists, tables, or content areas
**LoadingState**: Async operations and data loading
**StatsCard**: Dashboard summaries and key metrics
**AssetContextCard**: Asset-related forms and actions
**FilterBar**: List pages with filtering needs
**StatusBadge**: Status indicators with consistent colors
**AuditLogList**: Change history and activity logs

### Component Import Pattern

```tsx
// Import from common index
import { 
  PageHeader, 
  EmptyState, 
  LoadingState, 
  StatsCard,
  FilterBar,
  type FilterConfig 
} from "../common";
```

---

This document serves as a living guide for maintaining consistency across the application. When adding new features or components, always refer to these patterns to ensure a cohesive user experience.
