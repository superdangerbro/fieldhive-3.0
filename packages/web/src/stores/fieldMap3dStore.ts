import { create } from 'zustand';

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
  coordinates?: [number, number][];
}

interface FloorPlan {
  id: string;
  name: string;
  visible: boolean;
  imageUrl: string;
  propertyId: string;
  floor: number;
  bounds: Bounds | null;
  transform?: string; // Store the CSS transform
  width?: number;    // Store the width
  height?: number;   // Store the height
}

interface Property {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  accounts: { name: string; accountId: string }[];
}

interface PlacementState {
  image: File | null;
  imageUrl: string | null;
  name: string;
  propertyId: string | null;
  floor: number;
  bounds: Bounds | null;
  transform?: string;
  width?: number;
  height?: number;
}

interface FieldMap3DStore {
  viewState: ViewState;
  floorPlans: FloorPlan[];
  activeFloorPlan: string | null;
  is3DMode: boolean;
  isPlacingFloorPlan: boolean;
  selectedPropertyId: string | null;
  selectedProperty: Property | null;
  placementState: PlacementState | null;
  searchResults: SearchResult[];
  
  setViewState: (state: ViewState) => void;
  addFloorPlan: (floorPlan: Omit<FloorPlan, 'id' | 'bounds' | 'visible'>) => void;
  removeFloorPlan: (id: string) => void;
  toggleFloorPlanVisibility: (id: string) => void;
  setActiveFloorPlan: (id: string | null) => void;
  toggle3DMode: () => void;
  startPlacingFloorPlan: (data: { name: string; image: File; propertyId: string; floor: number }) => void;
  cancelPlacingFloorPlan: () => void;
  confirmFloorPlanPlacement: (bounds: Bounds, transform: string, width: number, height: number) => void;
  setSelectedProperty: (property: Property | null) => void;
  flyToProperty: (property: Property) => void;
  setSearchResults: (results: SearchResult[]) => void;
}

const INITIAL_VIEW_STATE = {
  longitude: -123.1207,
  latitude: 49.2827,
  zoom: 11,
  pitch: 0,
  bearing: 0
};

export const useFieldMap3DStore = create<FieldMap3DStore>((set, get) => ({
  viewState: INITIAL_VIEW_STATE,
  floorPlans: [],
  activeFloorPlan: null,
  is3DMode: false,
  isPlacingFloorPlan: false,
  selectedPropertyId: null,
  selectedProperty: null,
  placementState: null,
  searchResults: [],

  setViewState: (state) => set({ viewState: state }),
  
  addFloorPlan: (floorPlan) => set((state) => ({
    floorPlans: [...state.floorPlans, {
      ...floorPlan,
      id: `floor-${Date.now()}`,
      visible: true,
      bounds: null
    }]
  })),
  
  removeFloorPlan: (id) => set((state) => ({
    floorPlans: state.floorPlans.filter(f => f.id !== id),
    activeFloorPlan: state.activeFloorPlan === id ? null : state.activeFloorPlan
  })),
  
  toggleFloorPlanVisibility: (id) => set((state) => ({
    floorPlans: state.floorPlans.map(f => 
      f.id === id ? { ...f, visible: !f.visible } : f
    )
  })),
  
  setActiveFloorPlan: (id) => set({ activeFloorPlan: id }),
  
  toggle3DMode: () => set((state) => ({ 
    is3DMode: !state.is3DMode,
    viewState: {
      ...state.viewState,
      pitch: !state.is3DMode ? 45 : 0
    }
  })),

  startPlacingFloorPlan: ({ name, image, propertyId, floor }) => {
    const imageUrl = URL.createObjectURL(image);
    set({
      isPlacingFloorPlan: true,
      placementState: {
        image,
        imageUrl,
        name,
        propertyId,
        floor,
        bounds: null
      }
    });
  },
  
  cancelPlacingFloorPlan: () => {
    const { placementState } = get();
    if (placementState?.imageUrl) {
      URL.revokeObjectURL(placementState.imageUrl);
    }
    set({
      isPlacingFloorPlan: false,
      placementState: null
    });
  },

  confirmFloorPlanPlacement: (bounds, transform, width, height) => {
    const { placementState } = get();
    if (!placementState) return;

    const { name, imageUrl, propertyId, floor } = placementState;
    
    const newFloorPlan = {
      id: `floor-${Date.now()}`,
      name,
      imageUrl: imageUrl!,
      propertyId: propertyId!,
      floor,
      visible: true,
      bounds,
      transform,
      width,
      height
    };

    set((state) => ({
      floorPlans: [...state.floorPlans, newFloorPlan],
      isPlacingFloorPlan: false,
      placementState: null,
      activeFloorPlan: newFloorPlan.id
    }));
  },

  setSelectedProperty: (property) => {
    set({
      selectedProperty: property,
      selectedPropertyId: property?.id || null,
      searchResults: [] // Clear search results when a property is selected
    });

    if (property) {
      get().flyToProperty(property);
    }
  },

  flyToProperty: (property) => {
    set({
      viewState: {
        ...get().viewState,
        latitude: property.location.latitude,
        longitude: property.location.longitude,
        zoom: 18,
        pitch: get().is3DMode ? 45 : 0,
        bearing: 0
      }
    });
  },

  setSearchResults: (results) => set({ searchResults: results })
}));
