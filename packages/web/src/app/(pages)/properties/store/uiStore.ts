'use client';

import { create } from 'zustand';
import type { Property } from '@/app/globalTypes';

interface PropertyUIState {
    // UI State
    selectedProperty: Property | null;
    visibleColumns: string[];
    filterText: string;

    // UI Actions
    setSelectedProperty: (property: Property | null) => void;
    setVisibleColumns: (columns: string[]) => void;
    toggleColumn: (field: string) => void;
    setFilterText: (text: string) => void;
    resetUI: () => void;
}

// Update default columns to include accounts
const defaultColumns = ['name', 'type', 'accounts', 'status'];

export const usePropertyUIStore = create<PropertyUIState>((set) => ({
    // Initial state
    selectedProperty: null,
    visibleColumns: defaultColumns,
    filterText: '',

    // UI Actions
    setSelectedProperty: (property) => set({ selectedProperty: property }),
    
    setVisibleColumns: (columns) => set({ visibleColumns: columns }),
    
    toggleColumn: (field) => set((state) => ({
        visibleColumns: state.visibleColumns.includes(field)
            ? state.visibleColumns.filter(f => f !== field)
            : [...state.visibleColumns, field]
    })),
    
    setFilterText: (text) => set({ filterText: text }),
    
    resetUI: () => set({
        selectedProperty: null,
        visibleColumns: defaultColumns,
        filterText: ''
    })
}));
