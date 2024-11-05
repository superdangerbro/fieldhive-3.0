'use client';

import { create } from 'zustand';
import type { AccountStatus } from '@/app/globalTypes/account';

interface AccountStatusStore {
    // UI State
    editedStatuses: AccountStatus[];
    isEditing: boolean;

    // UI Actions
    setEditedStatuses: (statuses: AccountStatus[]) => void;
    updateStatus: (index: number, updates: Partial<AccountStatus>) => void;
    startEditing: () => void;
    stopEditing: () => void;
}

export const useAccountStatusStore = create<AccountStatusStore>((set) => ({
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
