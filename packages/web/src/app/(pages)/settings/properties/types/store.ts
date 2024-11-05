'use client';

import { create } from 'zustand';
import { ENV_CONFIG } from '@/config/environment';

interface PropertyTypeStore {
    // Data
    types: string[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetch: () => Promise<void>;
    update: (types: string[]) => Promise<void>;
}

export const usePropertyTypes = create<PropertyTypeStore>((set) => ({
    types: [],
    isLoading: false,
    error: null,

    fetch: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${ENV_CONFIG.api.baseUrl}/settings/properties/types`, {
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout)
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch property types');
            }

            const data = await response.json();
            set({ types: data });
        } catch (error) {
            console.error('Failed to fetch property types:', error);
            set({ error: 'Failed to load property types' });
        } finally {
            set({ isLoading: false });
        }
    },

    update: async (types) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${ENV_CONFIG.api.baseUrl}/settings/properties/types`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ types }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout)
            });

            if (!response.ok) {
                throw new Error('Failed to update property types');
            }

            const data = await response.json();
            set({ types: data });
        } catch (error) {
            console.error('Failed to update property types:', error);
            set({ error: 'Failed to save property types' });
            // Re-fetch to ensure store matches backend
            const store = usePropertyTypes.getState();
            await store.fetch();
        } finally {
            set({ isLoading: false });
        }
    }
}));
