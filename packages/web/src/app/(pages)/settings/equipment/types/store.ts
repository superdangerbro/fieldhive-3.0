'use client';

import { create } from 'zustand';
import { EquipmentType } from '@/app/globaltypes';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
            const response = await fetch(`${BASE_URL}/settings/equipment/types`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch equipment types');
            }

            const data = await response.json();
            set({ types: data });
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
            const response = await fetch(`${BASE_URL}/settings/equipment/types`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(types)
            });

            if (!response.ok) {
                throw new Error('Failed to update equipment types');
            }

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
