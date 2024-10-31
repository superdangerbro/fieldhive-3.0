import { create } from 'zustand';
import { ViewState } from 'react-map-gl';
import { getProperties } from '../services/api';

interface Property {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface FloorPlan {
  id: string;
  name: string;
  visible: boolean;
  imageUrl: string;
  floor: number;
  propertyId: string;
}

interface FieldMapStore {
  viewState: ViewState;
  setViewState: (viewState: ViewState) => void;
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  properties: Property[];
  fetchPropertiesInBounds: (bounds: [number, number, number, number], searchTerm?: string) => Promise<void>;
  flyToProperty: (property: Property) => void;
  floorPlans: FloorPlan[];
  activeFloorPlan: string | null;
  setActiveFloorPlan: (id: string) => void;
  toggleFloorPlanVisibility: (id: string) => void;
  addFloorPlan: (floorPlan: FloorPlan) => void;
}

const INITIAL_VIEW_STATE: ViewState = {
  longitude: -123.1207,
  latitude: 49.2827,
  zoom: 11,
  pitch: 0,
  bearing: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 }
};

export const useFieldMapStore = create<FieldMapStore>((set, get) => ({
  viewState: INITIAL_VIEW_STATE,
  setViewState: (viewState) => set({ viewState }),
  selectedProperty: null,
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  properties: [],
  fetchPropertiesInBounds: async (bounds, searchTerm) => {
    try {
      const [west, south, east, north] = bounds;
      let searchQuery = `${west},${south},${east},${north}`;
      if (searchTerm) {
        searchQuery += `,${searchTerm}`;
      }
      const response = await getProperties({ search: searchQuery });
      console.log('API Response:', JSON.stringify(response, null, 2)); // Detailed logging

      if (response && Array.isArray(response.properties)) {
        const properties = response.properties.map((prop: any) => {
          if (!prop || !prop.location || !Array.isArray(prop.location.coordinates)) {
            console.error('Invalid property data:', prop);
            return null;
          }
          return {
            id: prop.id,
            name: prop.name,
            location: {
              latitude: prop.location.coordinates[1],
              longitude: prop.location.coordinates[0]
            }
          };
        }).filter((prop): prop is Property => prop !== null);

        console.log('Mapped Properties:', properties);
        set({ properties });
      } else {
        console.error('Invalid response structure:', response);
        set({ properties: [] });
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      set({ properties: [] });
    }
  },
  flyToProperty: (property) => {
    set({
      viewState: {
        ...get().viewState,
        latitude: property.location.latitude,
        longitude: property.location.longitude,
        zoom: 18,
      }
    });
  },
  floorPlans: [],
  activeFloorPlan: null,
  setActiveFloorPlan: (id) => set({ activeFloorPlan: id }),
  toggleFloorPlanVisibility: (id) => set((state) => ({
    floorPlans: state.floorPlans.map(fp =>
      fp.id === id ? { ...fp, visible: !fp.visible } : fp
    )
  })),
  addFloorPlan: (floorPlan) => set((state) => ({
    floorPlans: [...state.floorPlans, floorPlan]
  }))
}));
