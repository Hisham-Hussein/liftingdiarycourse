# UI Coding Standards

This document defines the **mandatory** UI coding standards for the Lifting Diary Course project. These rules must be followed at all times, without exception.

---

## Component Library: shadcn/ui ONLY

### Core Rule
**ONLY [shadcn/ui](https://ui.shadcn.com/) components shall be used for all UI elements in this project.**

### Critical Guidelines

- ✅ **ALWAYS** use shadcn/ui components for all UI needs
- ❌ **NEVER** create custom components from scratch
- ❌ **NEVER** build UI elements using raw HTML or basic React components
- ❌ **NEVER** import components from other UI libraries (Material-UI, Chakra UI, etc.)

### Installation

When you need a component, install it using the shadcn/ui CLI:

```bash
npx shadcn@latest add <component-name>
```

Examples:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add input
```

### Component Composition

If you need a specialized UI element:

1. **First**: Check if shadcn/ui has a component for it
2. **Second**: Compose multiple shadcn/ui components together
3. **Never**: Build a custom component from scratch

#### Example: DO This
```tsx
// Compose shadcn components to create specialized UI
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function WorkoutCard({ workout }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{workout.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{workout.description}</p>
        <Button>Start Workout</Button>
      </CardContent>
    </Card>
  )
}
```

#### Example: DON'T Do This
```tsx
// ❌ NEVER create custom UI components from scratch
export function CustomButton({ children }) {
  return (
    <button className="px-4 py-2 rounded bg-blue-500">
      {children}
    </button>
  )
}
```

### Available shadcn/ui Components

Always refer to [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for the full list. Common components include:

- **Layout**: Card, Separator, Tabs, Accordion
- **Form**: Input, Textarea, Select, Checkbox, Radio Group, Switch, Label, Form
- **Feedback**: Alert, Toast, Dialog, Alert Dialog, Progress, Skeleton
- **Navigation**: Button, Dropdown Menu, Navigation Menu, Command
- **Data Display**: Table, Badge, Avatar, Calendar
- **Overlay**: Sheet, Popover, Tooltip, Hover Card

---

## Date Formatting

### Library: date-fns ONLY

**All date formatting must be done using [date-fns](https://date-fns.org/).**

### Installation

```bash
npm install date-fns
```

### Required Date Format

Dates must be formatted as: **Ordinal Day + Abbreviated Month + Full Year**

**Format Pattern**: `"do MMM yyyy"`

#### Examples
- 1st Sep 2025
- 2nd Aug 2024
- 3rd Jul 2026
- 4th Jan 2023
- 21st Dec 2025
- 23rd Mar 2024

### Implementation

```tsx
import { format } from 'date-fns'

// Format a date
const date = new Date('2025-09-01')
const formattedDate = format(date, 'do MMM yyyy')
// Result: "1st Sep 2025"

// In a component
export function WorkoutDate({ date }: { date: Date }) {
  return <span>{format(date, 'do MMM yyyy')}</span>
}
```

### DO NOT Use

- ❌ Native JavaScript `toLocaleDateString()`
- ❌ Manual date string construction
- ❌ Any other date libraries (moment.js, dayjs, luxon)
- ❌ Different date formats

---

## Enforcement

These standards are **non-negotiable**. Any code that violates these rules must be refactored before merging.

### Code Review Checklist

- [ ] All UI components are from shadcn/ui
- [ ] No custom UI components created from scratch
- [ ] All dates formatted using date-fns with `'do MMM yyyy'` pattern
- [ ] No other UI libraries imported

---

## Questions?

- **shadcn/ui**: https://ui.shadcn.com/
- **date-fns**: https://date-fns.org/

Last updated: 4th Dec 2025
