# Settings Page Improvements

## New System Structure

The settings system has been reorganized for better maintainability:

### API Structure
```
domains/settings/
  accounts/
    statuses/
      handler.ts  - GET/PUT handlers for account statuses
      route.ts    - Route definitions
    types/
      handler.ts  - GET/PUT handlers for account types
      route.ts    - Route definitions
  equipment/
    statuses/
    types/
  jobs/
    statuses/
    types/
  properties/
    statuses/
    types/
  entities/
    Setting.ts    - Setting entity definition
```

### Web Structure
```
app/(pages)/settings/
  accounts/
    statuses/
      section.tsx - UI component
      store.ts    - Zustand store with API calls
    types/
      section.tsx
      store.ts
  equipment/
    statuses/
    types/
  jobs/
    statuses/
    types/
  properties/
    statuses/
    types/
```

## Fixing Account Page Errors

The account page errors are similar to what we fixed in the settings page. To fix:

1. Update import paths in account dialogs:
   - Remove '@/services/api' imports
   - Replace with direct fetch calls using BASE_URL pattern

2. Move account-related types to globaltypes.ts:
   ```typescript
   // Add to globaltypes.ts
   export interface AccountDialogProps {
     open: boolean;
     // ... other props
   }
   ```

3. Update account stores to use direct fetch:
   ```typescript
   const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

   // Replace api.delete with
   await fetch(`${BASE_URL}/accounts/${id}`, {
     method: 'DELETE',
     headers: {
       'Content-Type': 'application/json'
     }
   });
   ```

4. Follow the same patterns established in settings:
   - Centralized types in globaltypes.ts
   - Direct fetch calls with proper error handling
   - Consistent store patterns across domains

## Key Points

1. No more services/api:
   - All API calls use direct fetch
   - BASE_URL from environment
   - Proper error handling

2. Type Management:
   - All shared types in globaltypes.ts
   - Domain-specific types in domain folders
   - Consistent interface patterns

3. Store Pattern:
   - Zustand stores with direct fetch
   - Loading and error states
   - Re-fetch on failed updates

4. File Organization:
   - Domain-driven structure
   - Co-located components and stores
   - Shared types in global location
