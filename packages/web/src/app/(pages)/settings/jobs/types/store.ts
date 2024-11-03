'use client';

import { create } from 'zustand';
import { api } from '@/services/api';

export interface JobType {
    name: string;
    fields: any[]; // TODO: Define field types when needed
}

interface JobTypeStore {
    // Data
    types: JobType[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetch: () => Promise<void>;
    update: (types: JobType[]) => Promise<void>;
}

export const useJobTypes = create<JobTypeStore>((set) => ({
    types: [],
    isLoading: false,
    error: null,

    fetch: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get<JobType[]>('/settings/jobs/types');
            set({ types: response });
        } catch (error) {
            console.error('Failed to fetch job types:', error);
            set({ error: 'Failed to load job types' });
        } finally {
            set({ isLoading: false });
        }
    },

    update: async (types) => {
        try {
            set({ isLoading: true, error: null });
            await api.put('/settings/jobs/types', types);
            set({ types });
        } catch (error) {
            console.error('Failed to update job types:', error);
            set({ error: 'Failed to save job types' });
            // Re-fetch to ensure store matches backend
            const store = useJobTypes.getState();
            await store.fetch();
        } finally {
            set({ isLoading: false });
        }
    }
}));
