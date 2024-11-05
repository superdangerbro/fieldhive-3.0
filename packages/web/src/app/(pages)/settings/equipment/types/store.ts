'use client';

import { create } from 'zustand';
import type { EquipmentType } from '@/app/globalTypes/equipment';

interface EquipmentTypeStore {
    // UI State
    editedTypes: EquipmentType[];
    isEditing: boolean;

    // UI Actions
    setEditedTypes: (types: EquipmentType[]) => void;
    updateType: (index: number, updates: Partial<EquipmentType>) => void;
    startEditing: () => void;
    stopEditing: () => void;
}

export const useEquipmentTypeStore = create<EquipmentTypeStore>((set) => ({
    editedTypes: [],
    isEditing: false,

    setEditedTypes: (types) => set({ editedTypes: types }),
    updateType: (index, updates) => set(state => ({
        editedTypes: state.editedTypes.map((type, i) => 
            i === index ? { ...type, ...updates } : type
        )
    })),
    startEditing: () => set({ isEditing: true }),
    stopEditing: () => set({ isEditing: false })
}));
