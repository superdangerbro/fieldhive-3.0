'use client';

import { create } from 'zustand';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
            const response = await fetch(`${BASE_URL}/settings/accounts/statuses`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch account statuses');
            }

            const data = await response.json();
            set({ statuses: data.statuses });
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
            const response = await fetch(`${BASE_URL}/settings/accounts/statuses`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    value: { statuses } 
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update account statuses');
            }

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
