# React Query Migration Guide

## Overview

We're migrating from Zustand-only state management to a combined approach:
- React Query: Server state management
- Zustand: UI state management

## Why React Query?

1. **Better Data Management**
   - Automatic caching
   - Background refetching
   - Optimistic updates
   - Automatic error handling
   - Loading states
   - Data synchronization

2. **Developer Experience**
   - Built-in DevTools
   - Simpler code organization
   - Type safety
   - Easier testing

## Implementation Pattern

### 1. Directory Structure
```
src/
  domains/
    [domain]/
      hooks/           # React Query hooks
        useProperties.ts
        useAccounts.ts
      store/           # Zustand UI state
        uiStore.ts
      components/
```

### 2. Features We're Implementing

For each domain, we implement:
- ✅ Automatic caching
- ✅ Prefetching on hover
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Error handling
- ✅ Loading states
- ✅ DevTools

### 3. Migration Steps per Domain

1. Create domain-specific hooks directory
2. Move API calls to React Query hooks
3. Simplify store to handle only UI state
4. Update components to use new hooks
5. Delete old store file
6. Implement prefetching where appropriate

### 4. What to Delete

After migrating each domain:
- Delete the old store file (e.g., `store.ts`)
- Remove API-related code from components
- Remove unnecessary loading/error state management

## Progress Tracker

### Properties Domain
- [x] Set up React Query hooks
- [x] Implement prefetching
- [ ] Convert all components to use hooks
- [ ] Clean up old store
- [ ] Test and verify functionality

### Accounts Domain
- [ ] Set up React Query hooks
- [ ] Implement prefetching
- [ ] Convert all components to use hooks
- [ ] Clean up old store
- [ ] Test and verify functionality

## Environment Variables

We use environment variables for all API endpoints:

```env
# Development (.env.development)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Production (.env.production)
NEXT_PUBLIC_API_URL=https://api.production.com
```

## Example Implementation

### React Query Hook
```typescript
// hooks/useProperties.ts
export const useProperties = (options?: UsePropertiesOptions) => {
  return useQuery({
    queryKey: ['properties', options],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
};
```

### UI Store
```typescript
// store/uiStore.ts
export const usePropertyUIStore = create<PropertyUIState>((set) => ({
  selectedProperty: null,
  visibleColumns: defaultColumns,
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  // ... other UI-only state
}));
```

### Component Usage
```typescript
function PropertiesTable() {
  // Data fetching with React Query
  const { data, isLoading } = useProperties();
  
  // UI state with Zustand
  const { selectedProperty, setSelectedProperty } = usePropertyUIStore();
  
  // ... rest of component
}
```

## Best Practices

1. **Separation of Concerns**
   - React Query: Server state
   - Zustand: UI state
   - Components: Presentation

2. **Prefetching Strategy**
   - Hover prefetching for details
   - Next page prefetching for lists
   - Route prefetching where appropriate

3. **Error Handling**
   - Use error boundaries for unexpected errors
   - Show user-friendly error messages
   - Provide retry functionality

4. **Performance**
   - Configure appropriate stale times
   - Use prefetching judiciously
   - Implement infinite queries for long lists

## Common Patterns

### 1. List + Detail Pattern
```typescript
// Fetch list
const { data: properties } = useProperties();

// Prefetch on hover
const handleRowMouseEnter = (id: string) => {
  queryClient.prefetchQuery(['property', id], () => fetchProperty(id));
};
```

### 2. Optimistic Updates
```typescript
const { mutate } = useMutation({
  mutationFn: updateProperty,
  onMutate: async (newProperty) => {
    // Cancel queries
    await queryClient.cancelQueries(['properties']);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['properties']);
    
    // Optimistically update
    queryClient.setQueryData(['properties'], old => [...]);
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Roll back on error
    queryClient.setQueryData(['properties'], context.previous);
  }
});
```

## Testing

1. **Mock Service Worker**
   - Set up MSW for API mocking
   - Test loading states
   - Test error states
   - Test success states

2. **React Query Helpers**
   - Use `createWrapper` for tests
   - Test cache behavior
   - Test prefetching
