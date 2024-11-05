'use client';

import { create } from 'zustand';
import type { EquipmentStatus } from '@/app/globalTypes/equipment';

interface EquipmentStatusStore {
    // UI State
    editedStatuses: EquipmentStatus[];
    isEditing: boolean;

    // UI Actions
    setEditedStatuses: (statuses: EquipmentStatus[]) => void;
    updateStatus: (index: number, updates: Partial<EquipmentStatus>) => void;
    startEditing: () => void;
    stopEditing: () => void;
}

export const useEquipmentStatusStore = create<EquipmentStatusStore>((set) => ({
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
