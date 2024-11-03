'use client';

import { create } from 'zustand';
import { JobStatus } from '@/app/globaltypes';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
            const response = await fetch(`${BASE_URL}/settings/jobs/statuses`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch job statuses');
            }

            const data = await response.json();
            set({ statuses: data.statuses });
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
            const response = await fetch(`${BASE_URL}/settings/jobs/statuses`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    value: { statuses } 
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update job statuses');
            }

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
