import { create } from 'zustand';
import type { MapRef } from 'react-map-gl';

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

interface UserLocation {
  longitude: number;
  latitude: number;
  heading?: number | null;
}

interface MapStore {
  viewState: ViewState;
  mapStyle: string;
  isTracking: boolean;
  userLocation: UserLocation | null;
  watchId: number | null;
  mapRef: MapRef | null;
  
  setViewState: (viewState: ViewState) => void;
  setMapStyle: (style: string) => void;
  setIsTracking: (isTracking: boolean) => void;
  setUserLocation: (location: UserLocation | null) => void;
  setWatchId: (id: number | null) => void;
  setMapRef: (ref: MapRef | null) => void;
  
  cycleMapStyle: () => void;
  toggleTracking: () => void;
  cleanup: () => void;
}

const INITIAL_VIEW_STATE = {
  longitude: -123.1207,
  latitude: 49.2827,
  zoom: 12
};

const MAP_STYLES = [
  'mapbox://styles/mapbox/navigation-night-v1',
  'mapbox://styles/mapbox/streets-v11',
  'mapbox://styles/mapbox/satellite-v9'
];

export const useMapStore = create<MapStore>((set, get) => ({
  viewState: INITIAL_VIEW_STATE,
  mapStyle: MAP_STYLES[0], // Start with night style
  isTracking: true,
  userLocation: null,
  watchId: null,
  mapRef: null,

  setViewState: (viewState) => set({ viewState }),
  setMapStyle: (style) => set({ mapStyle: style }),
  setIsTracking: (isTracking) => set({ isTracking }),
  setUserLocation: (location) => set({ userLocation: location }),
  setWatchId: (id) => set({ watchId: id }),
  setMapRef: (ref) => set({ mapRef: ref }),

  cycleMapStyle: () => {
    const currentIndex = MAP_STYLES.indexOf(get().mapStyle);
    const nextIndex = (currentIndex + 1) % MAP_STYLES.length;
    set({ mapStyle: MAP_STYLES[nextIndex] });
  },

  toggleTracking: () => {
    set(state => ({ isTracking: !state.isTracking }));
  },

  cleanup: () => {
    set({
      watchId: null,
      isTracking: false,
      mapRef: null
    });
  },
}));
