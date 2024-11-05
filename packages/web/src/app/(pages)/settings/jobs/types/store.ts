'use client';

import { create } from 'zustand';
import type { JobType } from '@/app/globalTypes/job';

interface JobTypeStore {
    // UI State
    editedTypes: JobType[];
    isEditing: boolean;

    // UI Actions
    setEditedTypes: (types: JobType[]) => void;
    updateType: (index: number, updates: Partial<JobType>) => void;
    startEditing: () => void;
    stopEditing: () => void;
}

export const useJobTypeStore = create<JobTypeStore>((set) => ({
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
