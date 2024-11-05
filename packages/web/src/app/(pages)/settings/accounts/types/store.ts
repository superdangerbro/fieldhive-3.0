'use client';

import { create } from 'zustand';
import type { AccountType } from '@/app/globalTypes/account';

interface AccountTypeStore {
    // UI State
    editedTypes: AccountType[];
    isEditing: boolean;

    // UI Actions
    setEditedTypes: (types: AccountType[]) => void;
    updateType: (index: number, updates: Partial<AccountType>) => void;
    startEditing: () => void;
    stopEditing: () => void;
}

export const useAccountTypeStore = create<AccountTypeStore>((set) => ({
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
