import { create } from 'zustand';
import { MapRef } from 'react-map-gl';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Equipment {
  equipment_id: string;
  equipment_type_id: string;
  equipment_type_name: string;
  job_id: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  is_georeferenced: boolean;
  created_at: string;
  updated_at: string;
  equipment_type: {
    id: string;
    name: string;
  };
  job: {
    id: string;
    status: string;
    job_type: string;
  };
  property: {
    id: string;
    name: string;
    address: string;
  };
  account: {
    id: string;
    name: string;
  };
}

interface EquipmentStore {
  equipment: Equipment[];
  selectedEquipment: Equipment | null;
  isPlacingEquipment: boolean;
  placementLocation: [number, number] | null;
  isAddEquipmentDialogOpen: boolean;
  isMarkerDialogOpen: boolean;
  currentBounds: [number, number, number, number] | null;
  
  setSelectedEquipment: (equipment: Equipment | null) => void;
  setCurrentBounds: (bounds: [number, number, number, number]) => void;
  fetchEquipmentInBounds: (bounds: [number, number, number, number]) => Promise<void>;
  deleteEquipment: (equipmentId: string) => Promise<void>;
  updateEquipmentType: (equipmentId: string, equipmentTypeId: string) => Promise<void>;
  
  // Equipment placement actions
  startPlacingEquipment: () => void;
  cancelPlacingEquipment: () => void;
  setPlacementLocation: (location: [number, number] | null) => void;
  confirmPlacementLocation: () => void;
  closeAddEquipmentDialog: () => void;
  submitNewEquipment: (data: { jobId: string; equipmentTypeId: string }) => Promise<void>;

  // Marker dialog actions
  openMarkerDialog: (equipment: Equipment) => void;
  closeMarkerDialog: () => void;
}

export const useEquipmentStore = create<EquipmentStore>((set, get) => ({
  equipment: [],
  selectedEquipment: null,
  isPlacingEquipment: false,
  placementLocation: null,
  isAddEquipmentDialogOpen: false,
  isMarkerDialogOpen: false,
  currentBounds: null,
  
  setSelectedEquipment: (equipment) => set({ selectedEquipment: equipment }),
  
  setCurrentBounds: (bounds) => set({ currentBounds: bounds }),

  fetchEquipmentInBounds: async (bounds) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/field-equipment?bounds=${bounds.join(',')}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch equipment');
      }

      const equipment = await response.json();
      set({ equipment });
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  },

  deleteEquipment: async (equipmentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/field-equipment/${equipmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete equipment');
      }

      // Refresh equipment in current bounds
      const { currentBounds } = get();
      if (currentBounds) {
        await get().fetchEquipmentInBounds(currentBounds);
      }

      // Close marker dialog
      set({ 
        selectedEquipment: null,
        isMarkerDialogOpen: false 
      });
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  },

  updateEquipmentType: async (equipmentId, equipmentTypeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/field-equipment/${equipmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipment_type_id: equipmentTypeId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update equipment type');
      }

      // Refresh equipment in current bounds
      const { currentBounds } = get();
      if (currentBounds) {
        await get().fetchEquipmentInBounds(currentBounds);
      }

      // Update selected equipment with new type
      const updatedEquipment = get().equipment.find(e => e.equipment_id === equipmentId);
      if (updatedEquipment) {
        set({ selectedEquipment: updatedEquipment });
      }
    } catch (error) {
      console.error('Error updating equipment type:', error);
      throw error;
    }
  },
  
  startPlacingEquipment: () => {
    console.log('Starting equipment placement mode');
    set({ 
      isPlacingEquipment: true,
      placementLocation: null 
    });
  },

  cancelPlacingEquipment: () => {
    console.log('Canceling equipment placement');
    set({ 
      isPlacingEquipment: false,
      placementLocation: null,
      isAddEquipmentDialogOpen: false
    });
  },

  setPlacementLocation: (location) => {
    if (location) {
      console.log('Setting placement location:', {
        longitude: location[0].toFixed(6),
        latitude: location[1].toFixed(6)
      });
    }
    set({ placementLocation: location });
  },

  confirmPlacementLocation: () => {
    const { placementLocation } = get();
    if (placementLocation) {
      console.log('Equipment location confirmed:', {
        longitude: placementLocation[0].toFixed(6),
        latitude: placementLocation[1].toFixed(6)
      });
      
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

  submitNewEquipment: async (data) => {
    const { placementLocation, currentBounds } = get();
    if (!placementLocation) {
      throw new Error('No placement location set');
    }

    console.log('Submitting new equipment:', {
      ...data,
      location: {
        type: 'Point',
        coordinates: placementLocation
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/field-equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: data.jobId,
          equipment_type_id: data.equipmentTypeId,
          location: {
            type: 'Point',
            coordinates: placementLocation
          },
          is_georeferenced: true
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to add equipment:', error);
        throw new Error(`Failed to add equipment: ${error}`);
      }

      const result = await response.json();
      console.log('Equipment added successfully:', result);

      // Refresh equipment in current bounds
      if (currentBounds) {
        await get().fetchEquipmentInBounds(currentBounds);
      }

      set({
        isAddEquipmentDialogOpen: false,
        placementLocation: null
      });

      return result;
    } catch (error) {
      console.error('Failed to add equipment:', error);
      throw error;
    }
  },

  openMarkerDialog: (equipment) => {
    set({ 
      selectedEquipment: equipment,
      isMarkerDialogOpen: true 
    });
  },

  closeMarkerDialog: () => {
    set({ 
      selectedEquipment: null,
      isMarkerDialogOpen: false 
    });
  }
}));
