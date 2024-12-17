'use client';

import { create } from 'zustand';
import type { Job } from '../globalTypes/job';
import type { Property } from '../globalTypes/property';
import type { Mode } from '../(pages)/field-map/components/overlays/ModeSelector';

interface MapState {
  // Active states
  activeJob: Job | null;
  activeProperty: Property | null;
  activeMode: Mode;
  isAddingEquipment: boolean;
  isAddingFloorplan: boolean;
  showFieldEquipment: boolean;

  // Actions
  setActiveJob: (job: Job | null) => void;
  setActiveProperty: (property: Property | null) => void;
  setActiveMode: (mode: Mode) => void;
  setIsAddingEquipment: (isAdding: boolean) => void;
  setIsAddingFloorplan: (isAdding: boolean) => void;
  setShowFieldEquipment: (show: boolean) => void;
  clearContext: () => void;
}

// Load initial state from localStorage if available
const loadPersistedState = () => {
  if (typeof window === 'undefined') {
    return {
      activeJob: null,
      activeProperty: null,
      activeMode: null,
      isAddingEquipment: false,
      isAddingFloorplan: false,
      showFieldEquipment: true
    };
  }
  
  try {
    const savedState = localStorage.getItem('mapState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      return {
        ...parsedState,
        // Reset action states on reload
        isAddingEquipment: false,
        isAddingFloorplan: false
      };
    }
  } catch (error) {
    console.error('Error loading persisted map state:', error);
  }
  
  return {
    activeJob: null,
    activeProperty: null,
    activeMode: null,
    isAddingEquipment: false,
    isAddingFloorplan: false,
    showFieldEquipment: true
  };
};

// Helper to persist state
const persistState = (state: Partial<MapState>) => {
  try {
    localStorage.setItem('mapState', JSON.stringify({
      activeJob: state.activeJob,
      activeProperty: state.activeProperty,
      activeMode: state.activeMode,
      showFieldEquipment: state.showFieldEquipment
    }));
  } catch (error) {
    console.error('Error persisting map state:', error);
  }
};

export const useMapContext = create<MapState>((set) => ({
  ...loadPersistedState(),

  setActiveJob: (job) => set((state) => {
    const newState = { ...state, activeJob: job };
    persistState(newState);
    return newState;
  }),

  setActiveProperty: (property) => set((state) => {
    const newState = { ...state, activeProperty: property };
    persistState(newState);
    return newState;
  }),

  setActiveMode: (mode) => set((state) => {
    const newState = { ...state, activeMode: mode };
    persistState(newState);
    return newState;
  }),

  setIsAddingEquipment: (isAdding) => set((state) => ({
    ...state,
    isAddingEquipment: isAdding,
    // Reset other action states
    isAddingFloorplan: false
  })),

  setIsAddingFloorplan: (isAdding) => set((state) => ({
    ...state,
    isAddingFloorplan: isAdding,
    // Reset other action states
    isAddingEquipment: false
  })),

  setShowFieldEquipment: (show) => set((state) => {
    const newState = { ...state, showFieldEquipment: show };
    persistState(newState);
    return newState;
  }),

  clearContext: () => {
    localStorage.removeItem('mapState');
    set({
      activeJob: null,
      activeProperty: null,
      activeMode: null,
      isAddingEquipment: false,
      isAddingFloorplan: false,
      showFieldEquipment: true
    });
  }
}));
