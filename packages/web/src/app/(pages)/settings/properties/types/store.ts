'use client';

import { create } from 'zustand';
import { api } from '@/services/api';

export interface PropertyType {
    name: string;
    fields: any[]; // TODO: Define field types when needed
}

interface PropertyTypeStore {
    // Data
    types: PropertyType[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetch: () => Promise<void>;
    update: (types: PropertyType[]) => Promise<void>;
}

export const usePropertyTypes = create<PropertyTypeStore>((set) => ({
    types: [],
    isLoading: false,
    error: null,

    fetch: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get<PropertyType[]>('/settings/properties/types');
            set({ types: response });
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
            await api.put('/settings/properties/types', types);
            set({ types });
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
