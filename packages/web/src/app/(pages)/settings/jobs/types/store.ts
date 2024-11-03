'use client';

import { create } from 'zustand';
import { JobType } from '@/app/globaltypes';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
            const response = await fetch(`${BASE_URL}/settings/jobs/types`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch job types');
            }

            const data = await response.json();
            set({ types: data });
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
            const response = await fetch(`${BASE_URL}/settings/jobs/types`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(types)
            });

            if (!response.ok) {
                throw new Error('Failed to update job types');
            }

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
