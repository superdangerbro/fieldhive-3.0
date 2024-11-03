'use client';

import { create } from 'zustand';
import { EquipmentStatus } from '@/app/globaltypes';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
            const response = await fetch(`${BASE_URL}/settings/equipment/statuses`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch equipment statuses');
            }

            const data = await response.json();
            set({ statuses: data.statuses });
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
            const response = await fetch(`${BASE_URL}/settings/equipment/statuses`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    value: { statuses } 
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update equipment statuses');
            }

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
