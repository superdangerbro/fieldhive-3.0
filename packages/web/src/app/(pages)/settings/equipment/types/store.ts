'use client';

import { create } from 'zustand';
import { api } from '@/services/api';

export interface EquipmentType {
    name: string;
    fields: any[]; // TODO: Define field types when needed
}

interface EquipmentTypeStore {
    // Data
    types: EquipmentType[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetch: () => Promise<void>;
    update: (types: EquipmentType[]) => Promise<void>;
}

export const useEquipmentTypes = create<EquipmentTypeStore>((set) => ({
    types: [],
    isLoading: false,
    error: null,

    fetch: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get<EquipmentType[]>('/settings/equipment/types');
            set({ types: response });
        } catch (error) {
            console.error('Failed to fetch equipment types:', error);
            set({ error: 'Failed to load equipment types' });
        } finally {
            set({ isLoading: false });
        }
    },

    update: async (types) => {
        try {
            set({ isLoading: true, error: null });
            await api.put('/settings/equipment/types', types);
            set({ types });
        } catch (error) {
            console.error('Failed to update equipment types:', error);
            set({ error: 'Failed to save equipment types' });
            // Re-fetch to ensure store matches backend
            const store = useEquipmentTypes.getState();
            await store.fetch();
        } finally {
            set({ isLoading: false });
        }
    }
}));
