'use client';

import { create } from 'zustand';
import { api } from '@/services/api';

export interface JobStatus {
    value: string;
    label: string;
    color: string;
}

interface JobStatusStore {
    // Data
    statuses: JobStatus[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetch: () => Promise<void>;
    update: (statuses: JobStatus[]) => Promise<void>;
}

export const useJobStatuses = create<JobStatusStore>((set) => ({
    statuses: [],
    isLoading: false,
    error: null,

    fetch: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get<{ statuses: JobStatus[] }>('/settings/jobs/statuses');
            set({ statuses: response.statuses });
        } catch (error) {
            console.error('Failed to fetch job statuses:', error);
            set({ error: 'Failed to load job statuses' });
        } finally {
            set({ isLoading: false });
        }
    },

    update: async (statuses) => {
        try {
            set({ isLoading: true, error: null });
            await api.put('/settings/jobs/statuses', { 
                value: { statuses } 
            });
            set({ statuses });
        } catch (error) {
            console.error('Failed to update job statuses:', error);
            set({ error: 'Failed to save job statuses' });
            // Re-fetch to ensure store matches backend
            const store = useJobStatuses.getState();
            await store.fetch();
        } finally {
            set({ isLoading: false });
        }
    }
}));
