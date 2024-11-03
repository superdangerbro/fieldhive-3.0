'use client';

import { create } from 'zustand';
import { api } from '@/services/api';

export interface PropertyStatus {
    value: string;
    label: string;
    color: string;
}

interface PropertyStatusStore {
    // Data
    statuses: PropertyStatus[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetch: () => Promise<void>;
    update: (statuses: PropertyStatus[]) => Promise<void>;
}

export const usePropertyStatuses = create<PropertyStatusStore>((set) => ({
    statuses: [],
    isLoading: false,
    error: null,

    fetch: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get<{ statuses: PropertyStatus[] }>('/settings/properties/statuses');
            set({ statuses: response.statuses });
        } catch (error) {
            console.error('Failed to fetch property statuses:', error);
            set({ error: 'Failed to load property statuses' });
        } finally {
            set({ isLoading: false });
        }
    },

    update: async (statuses) => {
        try {
            set({ isLoading: true, error: null });
            await api.put('/settings/properties/statuses', { 
                value: { statuses } 
            });
            set({ statuses });
        } catch (error) {
            console.error('Failed to update property statuses:', error);
            set({ error: 'Failed to save property statuses' });
            // Re-fetch to ensure store matches backend
            const store = usePropertyStatuses.getState();
            await store.fetch();
        } finally {
            set({ isLoading: false });
        }
    }
}));
