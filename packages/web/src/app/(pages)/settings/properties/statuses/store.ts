'use client';

import { create } from 'zustand';
import { PropertyStatus } from '@/app/globaltypes';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
            const response = await fetch(`${BASE_URL}/settings/properties/statuses`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch property statuses');
            }

            const data = await response.json();
            set({ statuses: data.statuses });
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
            const response = await fetch(`${BASE_URL}/settings/properties/statuses`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    value: { statuses } 
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update property statuses');
            }

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
