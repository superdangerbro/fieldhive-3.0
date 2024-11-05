'use client';

import { create } from 'zustand';
import type { PropertyType } from '@/app/globalTypes/property';

interface PropertyTypeStore {
    // UI State
    editedTypes: PropertyType[];
    isEditing: boolean;

    // UI Actions
    setEditedTypes: (types: PropertyType[]) => void;
    updateType: (index: number, updates: Partial<PropertyType>) => void;
    startEditing: () => void;
    stopEditing: () => void;
}

export const usePropertyTypeStore = create<PropertyTypeStore>((set) => ({
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
