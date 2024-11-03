'use client';

import { create } from 'zustand';
import { api } from '@/services/api';

export interface AccountStatus {
    value: string;
    label: string;
    color: string;
}

interface AccountStatusStore {
    // Data
    statuses: AccountStatus[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetch: () => Promise<void>;
    update: (statuses: AccountStatus[]) => Promise<void>;
}

export const useAccountStatuses = create<AccountStatusStore>((set) => ({
    statuses: [],
    isLoading: false,
    error: null,

    fetch: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get<{ statuses: AccountStatus[] }>('/settings/accounts/statuses');
            set({ statuses: response.statuses });
        } catch (error) {
            console.error('Failed to fetch account statuses:', error);
            set({ error: 'Failed to load account statuses' });
        } finally {
            set({ isLoading: false });
        }
    },

    update: async (statuses) => {
        try {
            set({ isLoading: true, error: null });
            await api.put('/settings/accounts/statuses', { 
                value: { statuses } 
            });
            set({ statuses });
        } catch (error) {
            console.error('Failed to update account statuses:', error);
            set({ error: 'Failed to save account statuses' });
            // Re-fetch to ensure store matches backend
            const store = useAccountStatuses.getState();
            await store.fetch();
        } finally {
            set({ isLoading: false });
        }
    }
}));
