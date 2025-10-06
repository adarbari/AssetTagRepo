# Frontend Testing Guidelines

## Overview

This document outlines best practices and standards for writing tests in the frontend codebase.

## Test Structure

### File Organization
- Place test files next to the components they test in `__tests__` directories
- Name test files with `.test.tsx` or `.test.ts` extension
- Use descriptive test file names matching the component name

### Test Anatomy
```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Reset mocks, clear state
  })

  describe('Feature Group', () => {
    it('should do something specific', () => {
      // Arrange: Set up test data
      // Act: Perform action
      // Assert: Verify outcome
    })
  })
})
```

## Query Priority

Follow this priority when selecting elements:

1. **getByRole** (Preferred) - Most accessible
   ```typescript
   screen.getByRole('button', { name: /submit/i })
   ```

2. **getByLabelText** - For form fields
   ```typescript
   screen.getByLabelText(/email/i)
   ```

3. **getByPlaceholderText** - For inputs without labels
   ```typescript
   screen.getByPlaceholderText(/search/i)
   ```

4. **getByText** - For non-interactive elements
   ```typescript
   screen.getByText(/welcome/i)
   ```

5. **getByTestId** (Last resort) - Only when others don't work
   ```typescript
   screen.getByTestId('custom-widget')
   ```

## Accessibility Requirements

### Button Labels
All buttons must have accessible names:
```typescript
// Good - Text content
<Button>Submit</Button>

// Good - ARIA label for icon-only buttons
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Bad - No accessible name
<Button>
  <X className="h-4 w-4" />
</Button>
```

### Form Fields
All form fields must have labels:
```typescript
// Good
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Good - Using aria-label
<input aria-label="Search" type="search" />
```

### Dialogs
Dialogs must have proper ARIA attributes:
```typescript
<DialogContent aria-modal="true">
  <DialogTitle>Title</DialogTitle>
  {/* content */}
</DialogContent>
```

## Async Operations

### Waiting for Elements
```typescript
// For elements that appear asynchronously
const element = await screen.findByRole('button', { name: /submit/i })

// For state changes
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument()
})
```

### User Interactions
Always use `userEvent` instead of `fireEvent`:
```typescript
import userEvent from '@testing-library/user-event'

it('should handle click', async () => {
  const user = userEvent.setup()
  const button = screen.getByRole('button')
  await user.click(button)
})
```

## Mocking

### API Calls
Mock fetch globally in tests:
```typescript
beforeEach(() => {
  global.fetch = vi.fn(() => 
    Promise.resolve({
      ok: true,
      json: async () => ({ data: 'test' })
    })
  )
})
```

### Component Dependencies
Mock complex dependencies:
```typescript
vi.mock('../components/ComplexComponent', () => ({
  ComplexComponent: ({ children }) => <div>{children}</div>
}))
```

### Environment Variables
Use Vitest's env configuration:
```typescript
// vitest.config.ts
test: {
  env: {
    VITE_API_BASE_URL: 'http://localhost:3000'
  }
}
```

## Common Patterns

### Testing Forms
```typescript
it('should submit form with valid data', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()
  
  render(<MyForm onSubmit={onSubmit} />)
  
  // Fill in fields
  await user.type(screen.getByLabelText(/name/i), 'John Doe')
  await user.type(screen.getByLabelText(/email/i), 'john@example.com')
  
  // Submit
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  // Verify
  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com'
    })
  })
})
```

### Testing Dialogs
```typescript
it('should open and close dialog', async () => {
  const user = userEvent.setup()
  render(<MyComponent />)
  
  // Open dialog
  await user.click(screen.getByRole('button', { name: /open/i }))
  
  // Verify dialog is open
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  
  // Close dialog - be specific about which close button
  const closeButtons = screen.getAllByRole('button', { name: /close/i })
  await user.click(closeButtons[0]) // Header X button
  
  // Verify dialog is closed
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
```

### Testing Lists
```typescript
it('should render list items', () => {
  const items = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]
  render(<ItemList items={items} />)
  
  items.forEach(item => {
    expect(screen.getByText(item.name)).toBeInTheDocument()
  })
})
```

## Avoiding Common Pitfalls

### Don't Query by Implementation Details
```typescript
// Bad - Queries by class name
const element = container.querySelector('.my-class')

// Good - Queries by role
const element = screen.getByRole('button')
```

### Don't Assert on Intermediate States
```typescript
// Bad - Testing loading state when you care about final state
expect(screen.getByText(/loading/i)).toBeInTheDocument()
await waitFor(() => {
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
})

// Good - Just wait for final state
await waitFor(() => {
  expect(screen.getByText(/data loaded/i)).toBeInTheDocument()
})
```

### Don't Use `waitFor` for Everything
```typescript
// Bad - Unnecessary waitFor for synchronous queries
await waitFor(() => {
  expect(screen.getByText(/title/i)).toBeInTheDocument()
})

// Good - Direct query for synchronous rendering
expect(screen.getByText(/title/i)).toBeInTheDocument()

// Good - waitFor only when needed
await waitFor(() => {
  expect(screen.getByText(/async data/i)).toBeInTheDocument()
})
```

## Test Utilities

Use the helper functions in `src/test/helpers.ts`:

```typescript
import {
  clickButtonByName,
  waitForDialog,
  fillFormField,
  waitForAsyncData
} from '../test/helpers'

it('should work with helpers', async () => {
  render(<MyComponent />)
  
  await fillFormField(/name/i, 'John')
  await clickButtonByName(/submit/i)
  await waitForAsyncData()
  
  expect(screen.getByText(/success/i)).toBeInTheDocument()
})
```

## Performance

### Keep Tests Fast
- Mock expensive operations
- Don't test the same thing multiple times
- Use shallow rendering when deep rendering isn't needed

### Keep Tests Isolated
- Each test should be independent
- Clean up after each test
- Don't rely on test execution order

## Code Coverage

### What to Test
- User interactions
- State changes
- Error handling
- Edge cases
- Accessibility

### What NOT to Test
- Implementation details
- Third-party library internals
- Trivial code (getters/setters)

## Continuous Improvement

- Review test failures regularly
- Update tests when requirements change
- Refactor tests to reduce duplication
- Keep tests readable and maintainable

