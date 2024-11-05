'use client';

import { create } from 'zustand';
import type { PropertyStatus } from '@/app/globalTypes/property';

interface PropertyStatusStore {
    // UI State
    editedStatuses: PropertyStatus[];
    isEditing: boolean;

    // UI Actions
    setEditedStatuses: (statuses: PropertyStatus[]) => void;
    updateStatus: (index: number, updates: Partial<PropertyStatus>) => void;
    startEditing: () => void;
    stopEditing: () => void;
}

export const usePropertyStatusStore = create<PropertyStatusStore>((set) => ({
    editedStatuses: [],
    isEditing: false,

    setEditedStatuses: (statuses) => set({ editedStatuses: statuses }),
    updateStatus: (index, updates) => set(state => ({
        editedStatuses: state.editedStatuses.map((status, i) => 
            i === index ? { ...status, ...updates } : status
        )
    })),
    startEditing: () => set({ isEditing: true }),
    stopEditing: () => set({ isEditing: false })
}));
