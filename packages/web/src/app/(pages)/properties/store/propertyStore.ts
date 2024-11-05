import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Property } from '@/app/globalTypes/property';
import { ENV_CONFIG } from '@/config/environment';

interface PropertyStore {
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  refreshProperty: (propertyId: string) => Promise<void>;
  updatePropertyInStore: (updatedProperty: Property) => void;
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      selectedProperty: null,
      setSelectedProperty: (property) => set({ selectedProperty: property }),
      
      refreshProperty: async (propertyId: string) => {
        try {
          const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/${propertyId}`, {
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            throw new Error('Failed to refresh property');
          }

          const property = await response.json();
          
          // Only update if this is the currently selected property
          if (get().selectedProperty?.property_id === propertyId) {
            set({ selectedProperty: property });
          }
        } catch (error) {
          console.error('Failed to refresh property:', error);
          throw error;
        }
      },

      updatePropertyInStore: (updatedProperty: Property) => {
        const currentProperty = get().selectedProperty;
        if (currentProperty?.property_id === updatedProperty.property_id) {
          set({ selectedProperty: updatedProperty });
        }
      }
    }),
    {
      name: 'property-store',
      // Only persist the property ID
      partialize: (state) => ({ 
        selectedProperty: state.selectedProperty ? { 
          property_id: state.selectedProperty.property_id 
        } : null 
      }),
      // Rehydrate by fetching fresh data
      onRehydrateStorage: () => async (state) => {
        if (state?.selectedProperty?.property_id) {
          try {
            const response = await fetch(
              `${ENV_CONFIG.api.baseUrl}/properties/${state.selectedProperty.property_id}`,
              { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.ok) {
              const property = await response.json();
              state.setSelectedProperty(property);
            }
          } catch (error) {
            console.error('Failed to rehydrate property:', error);
          }
        }
      }
    }
  )
);
