'use client';

import { create } from 'zustand';
import { ENV_CONFIG } from '@/config/environment';

export interface PropertyStatus {
    value: string;
    color: string;
}

interface PropertyStatusStore {
    // Data
    statuses: PropertyStatus[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetch: () => Promise<void>;
    update: (statuses: PropertyStatus[]) => Promise<void>;
}

// Default colors for statuses
const DEFAULT_COLORS: Record<string, string> = {
    active: '#4caf50',    // Green
    inactive: '#9e9e9e',  // Grey
    pending: '#ff9800',   // Orange
    archived: '#f44336',  // Red
};

// Convert string array to status objects
const stringsToStatuses = (strings: string[]): PropertyStatus[] => 
    strings.map(value => ({
        value,
        color: DEFAULT_COLORS[value.toLowerCase()] || '#94a3b8'
    }));

// Convert status objects to string array
const statusesToStrings = (statuses: PropertyStatus[]): string[] => 
    statuses.map(status => status.value);

export const usePropertyStatuses = create<PropertyStatusStore>((set) => ({
    statuses: [],
    isLoading: false,
    error: null,

    fetch: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${ENV_CONFIG.api.baseUrl}/settings/properties/statuses`, {
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout)
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch property statuses');
            }

            const data = await response.json();
            set({ statuses: stringsToStatuses(data) });
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
            const response = await fetch(`${ENV_CONFIG.api.baseUrl}/settings/properties/statuses`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    statuses: statusesToStrings(statuses)
                }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout)
            });

            if (!response.ok) {
                throw new Error('Failed to update property statuses');
            }

            const data = await response.json();
            set({ statuses: stringsToStatuses(data) });
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
