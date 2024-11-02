import { create } from 'zustand';
import type { Equipment } from '../../equipment/types';
import { useEquipmentStore } from '../../equipment/stores/equipmentStore';

interface MapEquipmentStore {
  isPlacingEquipment: boolean;
  placementLocation: [number, number] | null;
  isAddEquipmentDialogOpen: boolean;
  isMarkerDialogOpen: boolean;
  currentBounds: [number, number, number, number] | null;
  
  // Map-specific equipment actions
  startPlacingEquipment: () => void;
  cancelPlacingEquipment: () => void;
  setPlacementLocation: (location: [number, number] | null) => void;
  confirmPlacementLocation: () => void;
  closeAddEquipmentDialog: () => void;
  
  // Marker dialog actions
  openMarkerDialog: (equipment: Equipment) => void;
  closeMarkerDialog: () => void;
  
  // Bounds management
  setCurrentBounds: (bounds: [number, number, number, number]) => void;
  getEquipmentInBounds: () => Equipment[];
}

export const useMapEquipmentStore = create<MapEquipmentStore>((set, get) => ({
  isPlacingEquipment: false,
  placementLocation: null,
  isAddEquipmentDialogOpen: false,
  isMarkerDialogOpen: false,
  currentBounds: null,
  
  startPlacingEquipment: () => {
    set({ 
      isPlacingEquipment: true,
      placementLocation: null 
    });
  },

  cancelPlacingEquipment: () => {
    set({ 
      isPlacingEquipment: false,
      placementLocation: null,
      isAddEquipmentDialogOpen: false
    });
  },

  setPlacementLocation: (location) => {
    set({ placementLocation: location });
  },

  confirmPlacementLocation: () => {
    const { placementLocation } = get();
    if (placementLocation) {
      set({
        isPlacingEquipment: false,
        isAddEquipmentDialogOpen: true
      });
    }
  },

  closeAddEquipmentDialog: () => {
    set({
      isAddEquipmentDialogOpen: false,
      placementLocation: null
    });
  },

  openMarkerDialog: (equipment) => {
    useEquipmentStore.getState().setSelectedEquipment(equipment);
    set({ isMarkerDialogOpen: true });
  },

  closeMarkerDialog: () => {
    useEquipmentStore.getState().setSelectedEquipment(null);
    set({ isMarkerDialogOpen: false });
  },

  setCurrentBounds: (bounds) => set({ currentBounds: bounds }),

  getEquipmentInBounds: () => {
    const { currentBounds } = get();
    const { equipment } = useEquipmentStore.getState();

    if (!currentBounds || !equipment.length) return [];

    const [west, south, east, north] = currentBounds;
    return equipment.filter(e => {
      const [lng, lat] = e.location.coordinates;
      return lng >= west && lng <= east && lat >= south && lat <= north;
    });
  }
}));
