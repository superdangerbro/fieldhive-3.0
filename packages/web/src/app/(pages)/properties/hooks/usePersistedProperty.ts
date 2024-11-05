'use client';

import { create } from 'zustand';
import { Property } from '@/app/globalTypes/property';
import { usePropertyStore } from '../store/propertyStore';

interface PersistedPropertyStore {
    // State
    selectedProperty: Property | null;

    // Actions
    setSelectedProperty: (property: Property | null) => void;
}

export const usePersistedProperty = create<PersistedPropertyStore>()(
    (set) => ({
        selectedProperty: null,
        setSelectedProperty: (property) => set({ selectedProperty: property }),
    })
);

// Hook to sync selected property with URL
export function useSyncSelectedProperty() {
    const { selectedProperty, setSelectedProperty } = usePersistedProperty();
    const { properties } = usePropertyStore();

    // Function to sync property from URL param
    const syncFromParam = (propertyId: string | null) => {
        if (!propertyId) {
            setSelectedProperty(null);
            return;
        }

        // Find property in store
        const property = properties.find((p: Property) => p.property_id === propertyId);
        if (property && (!selectedProperty || selectedProperty.property_id !== propertyId)) {
            setSelectedProperty(property);
        }
    };

    return { syncFromParam };
}
