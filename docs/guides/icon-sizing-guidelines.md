# Icon Sizing Guidelines

This document establishes consistent icon sizing standards across the AssetTag application to ensure visual consistency and optimal user experience.

## Standard Icon Sizes

### 1. Button Icons
**Size**: `h-4 w-4` (16px)
**Usage**: All button icons, inline action icons
**Examples**:
```tsx
<Button>
  <Edit className="h-4 w-4 mr-2" />
  Edit
</Button>

<Button variant="outline">
  <Trash2 className="h-4 w-4 mr-2" />
  Delete
</Button>
```

### 2. Header Icons
**Size**: `h-5 w-5` (20px)
**Usage**: Page header icons, navigation icons, breadcrumb icons
**Examples**:
```tsx
<PageHeader
  title="Dashboard"
  icon={BarChart3} // Uses h-5 w-5 internally
/>

<Button variant="ghost" size="icon" onClick={onBack}>
  <ArrowLeft className="h-5 w-5" />
</Button>
```

### 3. Stats Card Icons
**Size**: `h-6 w-6` (24px)
**Usage**: StatsCard component icons, large display icons
**Examples**:
```tsx
<StatsCard
  title="Total Assets"
  value="1,234"
  icon={Package} // Uses h-6 w-6 internally
/>
```

### 4. Small Status Icons
**Size**: `h-3 w-3` (12px)
**Usage**: Small status indicators, inline badges
**Examples**:
```tsx
<Badge variant="outline" className="gap-1">
  <Activity className="h-3 w-3" />
  System Status: Online
</Badge>
```

### 5. Search Input Icons
**Size**: `h-4 w-4` (16px)
**Usage**: Search input icons, form input icons
**Examples**:
```tsx
<div className="relative flex-1">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input placeholder="Search..." />
</div>
```

## Icon Usage Patterns

### 1. Button Icons with Text
Always include `mr-2` spacing between icon and text:
```tsx
<Button>
  <Save className="h-4 w-4 mr-2" />
  Save Changes
</Button>
```

### 2. Icon-Only Buttons
Use `size="icon"` prop for icon-only buttons:
```tsx
<Button variant="ghost" size="icon">
  <MoreVertical className="h-4 w-4" />
</Button>
```

### 3. Status Icons in Badges
Use smaller icons with appropriate spacing:
```tsx
<Badge variant="outline" className="gap-1">
  <AlertTriangle className="h-3 w-3" />
  Active Alerts
</Badge>
```

### 4. Page Header Icons
PageHeader component automatically handles icon sizing:
```tsx
<PageHeader
  title="Asset Details"
  icon={Package} // Automatically sized to h-5 w-5
/>
```

## Component-Specific Guidelines

### PageHeader Component
- Icons are automatically sized to `h-5 w-5`
- No need to specify className for icons passed to PageHeader

### StatsCard Component
- Icons are automatically sized to `h-6 w-6`
- No need to specify className for icons passed to StatsCard

### Button Component
- Use `h-4 w-4` for all button icons
- Always include `mr-2` for icons with text
- Use `size="icon"` for icon-only buttons

### Badge Component
- Use `h-3 w-3` for small status icons
- Include `gap-1` or `gap-2` for spacing

## Common Icon Imports

```tsx
import {
  // Navigation
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  
  // Actions
  Edit,
  Save,
  Trash2,
  Plus,
  X,
  Check,
  
  // Status
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  
  // Content
  Package,
  MapPin,
  Users,
  Building2,
  BarChart3,
  
  // Interface
  Search,
  Filter,
  MoreVertical,
  Settings,
} from "lucide-react";
```

## Accessibility Considerations

### 1. Icon Labels
Always provide accessible labels for icon-only buttons:
```tsx
<Button variant="ghost" size="icon" aria-label="Edit item">
  <Edit className="h-4 w-4" />
</Button>
```

### 2. Color Contrast
Ensure icons have sufficient color contrast:
- Use `text-muted-foreground` for secondary icons
- Use semantic colors for status icons (red for errors, green for success)

### 3. Focus States
Icon buttons should have visible focus states:
```tsx
<Button variant="ghost" size="icon" className="focus:ring-2 focus:ring-primary">
  <Edit className="h-4 w-4" />
</Button>
```

## Implementation Checklist

When adding icons to components:

- [ ] Use the correct size class (`h-4 w-4`, `h-5 w-5`, `h-6 w-6`, or `h-3 w-3`)
- [ ] Include proper spacing (`mr-2` for button icons, `gap-1` for badges)
- [ ] Use semantic colors when appropriate
- [ ] Provide accessible labels for icon-only buttons
- [ ] Test focus states and keyboard navigation
- [ ] Ensure color contrast meets accessibility standards

## Migration Guide

### Converting Existing Icons

1. **Button Icons**: Change from `h-5 w-5` to `h-4 w-4`
2. **Header Icons**: Ensure `h-5 w-5` is used consistently
3. **Stats Icons**: Change from custom sizes to `h-6 w-6`
4. **Status Icons**: Use `h-3 w-3` for small indicators

### Example Migration

**Before**:
```tsx
<Button>
  <Edit className="h-5 w-5 mr-1" />
  Edit
</Button>
```

**After**:
```tsx
<Button>
  <Edit className="h-4 w-4 mr-2" />
  Edit
</Button>
```

## Tools and Validation

### ESLint Rules
Consider adding ESLint rules to enforce icon sizing:
```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "JSXAttribute[name.name='className'][value.value=/h-[0-9]+ w-[0-9]+/]",
        "message": "Use standard icon sizes: h-4 w-4, h-5 w-5, h-6 w-6, or h-3 w-3"
      }
    ]
  }
}
```

### Visual Testing
- Use Storybook to document icon usage patterns
- Create visual regression tests for icon consistency
- Test across different screen sizes and themes

---

## Summary

Following these guidelines ensures:
- **Visual Consistency**: All icons follow the same sizing standards
- **Better UX**: Appropriate icon sizes for different contexts
- **Accessibility**: Proper contrast and focus states
- **Maintainability**: Clear standards for future development

Remember: When in doubt, use `h-4 w-4` for buttons and `h-5 w-5` for headers as the default sizes.
