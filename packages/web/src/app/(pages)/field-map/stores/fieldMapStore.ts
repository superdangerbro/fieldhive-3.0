import { create } from 'zustand';
import { ViewState } from 'react-map-gl';
import { getPropertiesInBounds } from '@/services/api';
import type { Property } from '@fieldhive/shared';
import type { MapProperty } from '../types';

interface SelectedProperty {
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

interface PlacementState {
  imageUrl: string;
  propertyId: string | null;
}

interface FieldMapStore {
  viewState: ViewState;
  setViewState: (viewState: ViewState) => void;
  selectedProperty: SelectedProperty | null;
  setSelectedProperty: (property: SelectedProperty | null) => void;
  properties: MapProperty[];
  fetchPropertiesInBounds: (bounds: [number, number, number, number]) => Promise<void>;
  flyToProperty: (property: SelectedProperty) => void;
  floorPlans: FloorPlan[];
  activeFloorPlan: string | null;
  setActiveFloorPlan: (id: string) => void;
  toggleFloorPlanVisibility: (id: string) => void;
  addFloorPlan: (floorPlan: FloorPlan) => void;
  placementState: PlacementState | null;
  startPlacingFloorPlan: (imageUrl: string, propertyId: string) => void;
  cancelPlacingFloorPlan: () => void;
  confirmFloorPlanPlacement: (bounds: {
    west: number;
    east: number;
    north: number;
    south: number;
    coordinates: [number, number][];
  }) => void;
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
  fetchPropertiesInBounds: async (bounds) => {
    try {
      const response = await getPropertiesInBounds(bounds);
      console.log('API Response:', JSON.stringify(response, null, 2));

      if (response && Array.isArray(response.properties)) {
        set({ properties: response.properties as MapProperty[] });
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
    floorPlans: state.floorPlans.map((fp: FloorPlan) => 
      fp.id === id ? { ...fp, visible: !fp.visible } : fp
    )
  })),
  addFloorPlan: (floorPlan) => set((state) => ({
    floorPlans: [...state.floorPlans, floorPlan]
  })),
  placementState: null,
  startPlacingFloorPlan: (imageUrl: string, propertyId: string) => set({
    placementState: { imageUrl, propertyId }
  }),
  cancelPlacingFloorPlan: () => set({ placementState: null }),
  confirmFloorPlanPlacement: (bounds) => {
    const { placementState } = get();
    if (!placementState) return;
    
    console.log('Saving floor plan with bounds:', bounds);
    set({ placementState: null });
  }
}));
