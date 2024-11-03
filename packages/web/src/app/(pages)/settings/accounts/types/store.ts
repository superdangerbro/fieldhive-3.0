'use client';

import { create } from 'zustand';
import { api } from '@/services/api';

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
            const response = await api.get<AccountType[]>('/settings/accounts/types');
            set({ types: response });
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
            await api.put('/settings/accounts/types', types);
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
