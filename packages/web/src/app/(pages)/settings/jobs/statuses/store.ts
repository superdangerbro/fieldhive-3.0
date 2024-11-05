'use client';

import { create } from 'zustand';
import type { JobStatus } from '@/app/globalTypes/job';

interface JobStatusStore {
    // UI State
    editedStatuses: JobStatus[];
    isEditing: boolean;

    // UI Actions
    setEditedStatuses: (statuses: JobStatus[]) => void;
    updateStatus: (index: number, updates: Partial<JobStatus>) => void;
    startEditing: () => void;
    stopEditing: () => void;
}

export const useJobStatusStore = create<JobStatusStore>((set) => ({
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
