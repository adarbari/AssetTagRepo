# Job Management Modal Fixes

## Issues Addressed

### 1. Add Asset Modal Rendering Issues
**Problem:** Modal appearing dimmed/behind other content, Select dropdowns not working properly
**Solution:** 
- Increased z-index for SelectContent from `z-50` to `z-[10000]` (above dialog at 9999)
- Increased z-index for PopoverContent from `z-50` to `z-[10001]` (above select)
- Added proper Portal rendering for both components

### 2. Asset Data Not Loading
**Problem:** Assets not appearing in dropdown
**Solution:**
- Added debug logging with useEffect to track available assets
- Verified mockAssets import and filtering logic
- Added empty state handling with helpful message when no assets available
- Added conditional rendering to prevent errors

### 3. Date AND Time Selection
**Problem:** Only date selection was available, not time
**Solution:**
- Created new `DateTimeInput` component (`/components/ui/datetime-input.tsx`)
- Combines date picker (Calendar) with HTML5 time input
- Displays selected datetime in friendly format: "Jan 15, 2025 at 9:00 AM"
- Validates min/max dates
- Proper state management for both date and time

### 4. Custom Date Range Validation
**Problem:** No validation for custom assignment dates
**Solution:**
- Added validation in `handleAddAsset`:
  - Requires both start and end datetime when using custom duration
  - Validates end datetime is after start datetime
  - Shows clear error messages via toast
- Added real-time validation indicator in UI (red text if invalid)

### 5. Config-Based Data
**Problem:** Data might be hardcoded instead of pulled from config
**Solution:**
- Verified all dropdowns use centralized `/data/dropdownOptions.ts`
- Team members pull from `teamMembers` config
- Job statuses pull from `jobStatuses` config
- Assets pull from `mockAssets` (shared data source)
- All ready for backend API integration

## Files Modified

### New Files Created
1. `/components/ui/datetime-input.tsx` - New DateTime input component
2. `/JOBS_MODAL_FIXES.md` - This documentation

### Files Updated
1. `/components/EditJob.tsx`
   - Replaced date-only inputs with DateTimeInput component
   - Added datetime validation in handleAddAsset
   - Added debug logging for asset availability
   - Improved empty state handling
   - Enhanced error messages and user feedback

2. `/components/ui/select.tsx`
   - Updated z-index from `z-50` to `z-[10000]`
   - Ensures dropdown appears above dialog modal

3. `/components/ui/popover.tsx`
   - Updated z-index from `z-50` to `z-[10001]`
   - Ensures calendar popover appears above select dropdown

## Component Hierarchy & Z-Index

```
Dialog Overlay:        z-[9999]  (dims background)
Dialog Content:        z-[9999]  (modal content)
Select Dropdown:       z-[10000] (above dialog)
Popover (Calendar):    z-[10001] (above select)
```

## DateTimeInput Component Features

### Props
```typescript
interface DateTimeInputProps {
  value?: Date;                    // Current datetime value
  onChange: (date: Date | undefined) => void;  // Change handler
  label?: string;                  // Field label
  placeholder?: string;            // Placeholder text
  disabled?: boolean;              // Disable input
  minDate?: Date;                  // Minimum allowed date
  maxDate?: Date;                  // Maximum allowed date
  className?: string;              // Additional classes
}
```

### Usage Example
```tsx
<DateTimeInput
  label="Assignment Start Date & Time *"
  value={customStartDate}
  onChange={setCustomStartDate}
  placeholder="Select start date and time"
  minDate={new Date(startDate)}
  maxDate={new Date(endDate)}
/>
```

### Features
- Combined date and time selection in one component
- Calendar-based date picker
- HTML5 time input (24-hour format with AM/PM display)
- Validation for min/max dates
- Friendly datetime display format
- Proper state synchronization between date and time

## Asset Assignment Flow

### Full Job Duration (Default)
1. User selects asset from dropdown
2. Toggle "Required Asset" if needed
3. Click "Add Asset"
4. Asset assigned for entire job period

### Custom Duration
1. User selects asset from dropdown
2. Toggle "Use Full Job Duration" OFF
3. Custom date/time fields appear
4. Select start date & time
5. Select end date & time
6. Validation ensures end > start
7. Click "Add Asset"
8. Asset assigned for specific period

## Validation Rules

### Asset Selection
- Must select an asset from dropdown
- Cannot select if no assets available

### Custom Date/Time
- Both start and end datetime required
- End datetime must be after start datetime
- Dates must be within job start/end range
- Visual indicator shows invalid state

## User Feedback

### Success Messages
- "Excavator CAT 320 added to job with full job duration"
- "Generator Diesel 50kW added to job with custom schedule"

### Error Messages
- "Please select an asset"
- "Please select both start and end date/time for custom assignment"
- "End date/time must be after start date/time"
- "Asset not found"

## Debug Logging

Added console logging to track:
- Available assets count and list
- Current job assets
- Total mock assets
- Helps diagnose asset loading issues

## Empty States

### No Available Assets
```
Select dropdown shows: "No available assets"
Helper text: "All assets have been assigned to this job"
Add Asset button: Disabled
```

### Team Members
Similar pattern for consistency across the UI

## Backend Integration Ready

All components are designed to work with backend API:

### Current (Mock Data)
```typescript
import { mockAssets } from "../data/mockData";
```

### Future (Backend API)
```typescript
const { data: assets } = await fetchAssets();
```

All dropdown options follow the same pattern from `/data/dropdownOptions.ts`

## Testing Checklist

- [ ] Modal opens and displays properly (not dimmed)
- [ ] Asset dropdown shows available assets
- [ ] Can select assets from dropdown
- [ ] Required toggle works
- [ ] Full duration toggle works
- [ ] Custom date/time pickers open properly
- [ ] Calendar appears above select
- [ ] Time input accepts valid times
- [ ] Validation prevents invalid submissions
- [ ] Success/error toasts appear correctly
- [ ] Assets added appear in table
- [ ] Assignment periods display correctly
- [ ] All data pulls from config objects

## Known Limitations

1. **Time Format**: Uses HTML5 time input which may vary by browser
2. **Mobile UX**: Native time pickers on mobile may differ
3. **Timezone**: Currently assumes local timezone, may need UTC handling for backend
4. **Date Range**: Limited to job start/end dates for custom assignments

## Future Enhancements

1. Add timezone selector for multi-region operations
2. Add recurring assignment patterns
3. Add conflict detection (asset already assigned elsewhere)
4. Add asset availability calendar view
5. Add bulk asset assignment
6. Add asset swapping functionality
