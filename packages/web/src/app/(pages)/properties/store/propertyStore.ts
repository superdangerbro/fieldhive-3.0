import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Property } from '@/app/globalTypes/property';
import { ENV_CONFIG } from '@/config/environment';

interface PropertyStore {
  properties: Property[];
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  setProperties: (properties: Property[]) => void;
  refreshProperty: (propertyId: string) => Promise<void>;
  updatePropertyInStore: (updatedProperty: Property) => void;
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      properties: [],
      selectedProperty: null,
      setSelectedProperty: (property) => set({ selectedProperty: property }),
      setProperties: (properties) => set({ properties }),
      
      refreshProperty: async (propertyId: string) => {
        try {
          const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/${propertyId}`, {
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            throw new Error('Failed to refresh property');
          }

          const property = await response.json();
          
          // Update in both arrays and selected
          set(state => ({
            properties: state.properties.map(p => 
              p.property_id === propertyId ? property : p
            ),
            selectedProperty: state.selectedProperty?.property_id === propertyId ? 
              property : state.selectedProperty
          }));
        } catch (error) {
          console.error('Failed to refresh property:', error);
          throw error;
        }
      },

      updatePropertyInStore: (updatedProperty: Property) => {
        set(state => ({
          properties: state.properties.map(p => 
            p.property_id === updatedProperty.property_id ? updatedProperty : p
          ),
          selectedProperty: state.selectedProperty?.property_id === updatedProperty.property_id ? 
            updatedProperty : state.selectedProperty
        }));
      }
    }),
    {
      name: 'property-store',
      // Only persist the property IDs
      partialize: (state) => ({ 
        properties: state.properties.map(p => ({ property_id: p.property_id })),
        selectedProperty: state.selectedProperty ? { 
          property_id: state.selectedProperty.property_id 
        } : null 
      }),
      // Rehydrate by fetching fresh data
      onRehydrateStorage: () => async (state) => {
        if (state) {
          try {
            // Fetch all properties
            const propertiesResponse = await fetch(
              `${ENV_CONFIG.api.baseUrl}/properties`,
              { headers: { 'Content-Type': 'application/json' } }
            );

            if (propertiesResponse.ok) {
              const { properties } = await propertiesResponse.json();
              state.setProperties(properties);
            }

            // Fetch selected property if exists
            if (state.selectedProperty?.property_id) {
              const response = await fetch(
                `${ENV_CONFIG.api.baseUrl}/properties/${state.selectedProperty.property_id}`,
                { headers: { 'Content-Type': 'application/json' } }
              );

              if (response.ok) {
                const property = await response.json();
                state.setSelectedProperty(property);
              }
            }
          } catch (error) {
            console.error('Failed to rehydrate properties:', error);
          }
        }
      }
    }
  )
);
