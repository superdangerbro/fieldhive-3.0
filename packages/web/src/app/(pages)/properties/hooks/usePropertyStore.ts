'use client';

import { create } from 'zustand';
import type { Property } from '@fieldhive/shared';
import { getProperties } from '@/services/api';

interface PropertyStore {
  selectedProperty: Property | null;
  properties: Property[];
  setSelectedProperty: (property: Property | null) => void;
  setProperties: (properties: Property[]) => void;
  refreshProperties: () => Promise<void>;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  selectedProperty: null,
  properties: [],
  setSelectedProperty: (property) => {
    set({ selectedProperty: property });
    if (property) {
      localStorage.setItem('selectedPropertyId', property.property_id);
    } else {
      localStorage.removeItem('selectedPropertyId');
    }
  },
  setProperties: (properties) => set({ properties }),
  refreshProperties: async () => {
    const { selectedProperty } = get();
    if (selectedProperty) {
      try {
        const response = await getProperties({
          search: selectedProperty.property_id
        });
        
        if (response.properties.length > 0) {
          const updatedProperty = response.properties[0] as Property;
          set((state) => ({
            selectedProperty: updatedProperty,
            properties: state.properties.map(property => 
              property.property_id === updatedProperty.property_id ? updatedProperty : property
            )
          }));
        }
      } catch (error) {
        console.error('Failed to refresh properties:', error);
      }
    }
  }
}));
