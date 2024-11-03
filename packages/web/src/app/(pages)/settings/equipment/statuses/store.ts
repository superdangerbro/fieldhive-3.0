'use client';

import { create } from 'zustand';
import { api } from '@/services/api';

export interface EquipmentStatus {
    value: string;
    label: string;
    color: string;
}

interface EquipmentStatusStore {
    // Data
    statuses: EquipmentStatus[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetch: () => Promise<void>;
    update: (statuses: EquipmentStatus[]) => Promise<void>;
}

export const useEquipmentStatuses = create<EquipmentStatusStore>((set) => ({
    statuses: [],
    isLoading: false,
    error: null,

    fetch: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get<{ statuses: EquipmentStatus[] }>('/settings/equipment/statuses');
            set({ statuses: response.statuses });
        } catch (error) {
            console.error('Failed to fetch equipment statuses:', error);
            set({ error: 'Failed to load equipment statuses' });
        } finally {
            set({ isLoading: false });
        }
    },

    update: async (statuses) => {
        try {
            set({ isLoading: true, error: null });
            await api.put('/settings/equipment/statuses', { 
                value: { statuses } 
            });
            set({ statuses });
        } catch (error) {
            console.error('Failed to update equipment statuses:', error);
            set({ error: 'Failed to save equipment statuses' });
            // Re-fetch to ensure store matches backend
            const store = useEquipmentStatuses.getState();
            await store.fetch();
        } finally {
            set({ isLoading: false });
        }
    }
}));
