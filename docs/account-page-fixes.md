# Account Page Fixes

## Current Issues
- Module not found: Can't resolve '@/services/api'
- Similar to the issues fixed in settings pages

## Steps to Fix

1. Update Account Types in globaltypes.ts:
```typescript
// Add to globaltypes.ts
export interface Account {
    account_id: string;
    name: string;
    type: string;
    status: string;
    // ... other fields
}

export interface AccountDialogProps {
    open: boolean;
    onClose: () => void;
    // ... other props
}
```

2. Update Account Stores:
```typescript
// Replace api service with direct fetch
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Example store pattern
interface AccountStore {
    accounts: Account[];
    isLoading: boolean;
    error: string | null;
    fetch: () => Promise<void>;
    delete: (id: string) => Promise<void>;
    // ... other actions
}

export const useAccounts = create<AccountStore>((set) => ({
    accounts: [],
    isLoading: false,
    error: null,

    fetch: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}/accounts`);
            if (!response.ok) throw new Error('Failed to fetch accounts');
            const data = await response.json();
            set({ accounts: data });
        } catch (error) {
            set({ error: 'Failed to load accounts' });
        } finally {
            set({ isLoading: false });
        }
    },

    delete: async (id) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}/accounts/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete account');
            // Update local state
            set(state => ({
                accounts: state.accounts.filter(a => a.account_id !== id)
            }));
        } catch (error) {
            set({ error: 'Failed to delete account' });
            // Re-fetch to ensure consistency
            useAccounts.getState().fetch();
        } finally {
            set({ isLoading: false });
        }
    }
}));
```

3. Update Account Dialogs:
```typescript
// DeleteAccountDialog.tsx
import { Account } from '@/app/globaltypes';

interface DeleteAccountDialogProps {
    open: boolean;
    account: Account | null;
    onClose: () => void;
}

export function DeleteAccountDialog({ open, account, onClose }: DeleteAccountDialogProps) {
    const { delete: deleteAccount, isLoading, error } = useAccounts();
    
    const handleDelete = async () => {
        if (!account) return;
        await deleteAccount(account.account_id);
        if (!error) onClose();
    };
    // ... rest of component
}
```

4. Follow Settings Page Patterns:
- Domain-driven folder structure
- Co-located stores with components
- Consistent error handling
- Loading states in UI
- Type safety throughout

## Key Points

1. No More API Service:
- Remove all @/services/api imports
- Use direct fetch with BASE_URL
- Proper error handling
- Loading states

2. Type Safety:
- Use types from globaltypes.ts
- Consistent interface patterns
- Full TypeScript coverage

3. Store Pattern:
- Zustand stores with direct fetch
- Loading and error states
- Re-fetch on failed operations
- Consistent patterns across domains

4. Component Organization:
- Domain-driven structure
- Co-located stores
- Shared types in globaltypes.ts
- Clear separation of concerns
