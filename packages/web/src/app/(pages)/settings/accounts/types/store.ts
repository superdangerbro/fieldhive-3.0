'use client';

import { create } from 'zustand';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface AccountType {
    value: string;
    label: string;
}

interface AccountTypeStore {
    // Data
    types: AccountType[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetch: () => Promise<void>;
    update: (types: AccountType[]) => Promise<void>;
}

export const useAccountTypes = create<AccountTypeStore>((set) => ({
    types: [],
    isLoading: false,
    error: null,

    fetch: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}/settings/accounts/types`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch account types');
            }

            const data = await response.json();
            set({ types: data });
        } catch (error) {
            console.error('Failed to fetch account types:', error);
            set({ error: 'Failed to load account types' });
        } finally {
            set({ isLoading: false });
        }
    },

    update: async (types) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}/settings/accounts/types`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(types)
            });

            if (!response.ok) {
                throw new Error('Failed to update account types');
            }

            set({ types });
        } catch (error) {
            console.error('Failed to update account types:', error);
            set({ error: 'Failed to save account types' });
            // Re-fetch to ensure store matches backend
            const store = useAccountTypes.getState();
            await store.fetch();
        } finally {
            set({ isLoading: false });
        }
    }
}));
