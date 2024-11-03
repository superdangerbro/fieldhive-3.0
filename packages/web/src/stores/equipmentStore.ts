import { create } from 'zustand';
import { getSetting, updateSetting } from '../services/api';

interface Equipment {
  equipment_id: string;
  equipment_type_id: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: string;  // This remains a string (just the status name)
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  equipment_type: {
    name: string;
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      options?: string[];
      numberConfig?: {
        min?: number;
        max?: number;
        step?: number;
      };
      showWhen?: Array<{
        field: string;
        value: any;
        makeRequired?: boolean;
      }>;
    }>;
  };
}

interface EquipmentType {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    options?: string[];
    numberConfig?: {
      min?: number;
      max?: number;
      step?: number;
    };
    showWhen?: Array<{
      field: string;
      value: any;
      makeRequired?: boolean;
    }>;
  }>;
}

interface EquipmentStatus {
  name: string;
  color: string;
}

interface EquipmentStore {
  equipment: Equipment[];
  equipmentTypes: EquipmentType[];
  equipmentStatuses: EquipmentStatus[];  // Updated to store status objects
  selectedEquipment: Equipment | null;
  isPlacingEquipment: boolean;
  placementLocation: [number, number] | null;
  isAddEquipmentDialogOpen: boolean;
  isMarkerDialogOpen: boolean;
  currentBounds: [number, number, number, number] | null;
  
  // Equipment management
  fetchEquipmentTypes: () => Promise<void>;
  fetchEquipmentStatuses: () => Promise<void>;
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
  submitNewEquipment: (data: { 
    equipment_type_id: string;
    status: string;  // This remains a string (just the status name)
    data: Record<string, any>;
  }) => Promise<void>;

  // Marker dialog actions
  openMarkerDialog: (equipment: Equipment) => void;
  closeMarkerDialog: () => void;
}

export const useEquipmentStore = create<EquipmentStore>((set, get) => ({
  equipment: [],
  equipmentTypes: [],
  equipmentStatuses: [],
  selectedEquipment: null,
  isPlacingEquipment: false,
  placementLocation: null,
  isAddEquipmentDialogOpen: false,
  isMarkerDialogOpen: false,
  currentBounds: null,
  
  fetchEquipmentTypes: async () => {
    try {
      const types = await getSetting('equipment_types');
      set({ equipmentTypes: types || [] });
    } catch (error) {
      console.error('Error fetching equipment types:', error);
    }
  },

  fetchEquipmentStatuses: async () => {
    try {
      const statuses = await getSetting('equipment_statuses');
      // Convert any string statuses to objects with default color
      const statusObjects = (statuses || []).map((status: string | EquipmentStatus) => {
        if (typeof status === 'string') {
          return { name: status, color: '#94a3b8' };  // Default gray color
        }
        return status;
      });
      set({ equipmentStatuses: statusObjects });
    } catch (error) {
      console.error('Error fetching equipment statuses:', error);
    }
  },

  setSelectedEquipment: (equipment) => set({ selectedEquipment: equipment }),
  
  setCurrentBounds: (bounds) => set({ currentBounds: bounds }),

  fetchEquipmentInBounds: async (bounds) => {
    try {
      const equipment = await getSetting('equipment');
      if (!equipment) {
        set({ equipment: [] });
        return;
      }

      const [west, south, east, north] = bounds;
      const filteredEquipment = equipment.filter((e: Equipment) => {
        const [lng, lat] = e.location.coordinates;
        return lng >= west && lng <= east && lat >= south && lat <= north;
      });

      set({ equipment: filteredEquipment });
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  },

  deleteEquipment: async (equipmentId) => {
    try {
      await updateSetting('delete_equipment', { id: equipmentId });

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
      await updateSetting('update_equipment', {
        id: equipmentId,
        equipment_type_id: equipmentTypeId
      });

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

  submitNewEquipment: async (data) => {
    const { placementLocation, currentBounds } = get();
    if (!placementLocation) {
      throw new Error('No placement location set');
    }

    try {
      await updateSetting('add_equipment', {
        equipment_type_id: data.equipment_type_id,
        status: data.status,  // Just send the status name
        location: {
          type: 'Point',
          coordinates: placementLocation
        },
        ...data.data
      });

      // Refresh equipment in current bounds
      if (currentBounds) {
        await get().fetchEquipmentInBounds(currentBounds);
      }

      set({
        isAddEquipmentDialogOpen: false,
        placementLocation: null
      });
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
