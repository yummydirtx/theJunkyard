# Manual Budget TanStack Query Implementation

This directory contains the TanStack Query implementation for the manual budget feature, providing better data caching, background updates, and optimistic updates.

## Structure

### Query Keys (`queries/queryKeys.ts`)
Centralized query key factory that ensures consistent cache invalidation and query identification.

### Query Functions (`queries/queryFunctions.ts`)
Pure functions that handle data fetching from Firebase Firestore. These are used by TanStack Query hooks.

### Query Hooks (`hooks/queries/`)
Individual hooks that manage specific data domains:

- **`useUserData`** - User profile data (name, settings)
- **`useCategories`** - Budget categories for a specific month
- **`useRecurringExpenses`** - Recurring expense definitions
- **`useMonthSummary`** - Comprehensive month data with calculated totals

### Main Hook (`useManualBudgetDataQuery.ts`)
Combines all query hooks into a single interface that replaces the original `useManualBudgetData` hook.

## Benefits

1. **Automatic Caching** - Data is cached automatically and shared across components
2. **Background Updates** - Data refreshes in the background when stale
3. **Optimistic Updates** - UI updates immediately, reverts on error
4. **Loading States** - Built-in loading and error states for each operation
5. **Cache Invalidation** - Smart cache invalidation when related data changes

## Usage

### Basic Usage
```typescript
import useManualBudgetDataQuery from './hooks/useManualBudgetDataQuery';

function BudgetComponent() {
  const {
    loading,
    categories,
    totalSpent,
    updateCategories,
    isUpdatingCategories
  } = useManualBudgetDataQuery();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Total Spent: ${totalSpent}</h2>
      {categories.map(category => (
        <div key={category.name}>{category.name}: ${category.spent}</div>
      ))}
    </div>
  );
}
```

### Individual Query Hooks
```typescript
import { useCategories, useUserData } from './hooks/queries';

function CategoryManager() {
  const { userData, createUser } = useUserData();
  const { categories, updateCategories } = useCategories('2025-01');

  // Use individual hooks for more granular control
}
```

## Migration from Original Hooks

The new `useManualBudgetDataQuery` hook maintains the same interface as the original `useManualBudgetData` hook, making migration straightforward:

```typescript
// Before
import useManualBudgetData from './hooks/useManualBudgetData';

// After
import useManualBudgetDataQuery from './hooks/useManualBudgetDataQuery';

// Usage remains the same
const { loading, categories, updateCategories } = useManualBudgetDataQuery();
```

## Configuration

TanStack Query is configured in `App.tsx` with:
- 5 minute stale time for most queries
- 10 minute garbage collection time
- 1 retry on failure

Individual hooks may override these defaults for specific use cases.
