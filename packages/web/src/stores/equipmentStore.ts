import { create } from 'zustand';
import { API_ENDPOINTS } from '../services/api';

interface Equipment {
  equipment_id: string;
  equipment_type_id: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: string;
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

interface EquipmentStore {
  equipment: Equipment[];
  equipmentTypes: EquipmentType[];
  equipmentStatuses: string[];
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
    status: string;
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
      const response = await fetch(API_ENDPOINTS.EQUIPMENT_TYPES);
      if (!response.ok) throw new Error('Failed to fetch equipment types');
      const types = await response.json();
      set({ equipmentTypes: types });
    } catch (error) {
      console.error('Error fetching equipment types:', error);
    }
  },

  fetchEquipmentStatuses: async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.EQUIPMENT_TYPES}/status`);
      if (!response.ok) throw new Error('Failed to fetch equipment statuses');
      const statuses = await response.json();
      set({ equipmentStatuses: statuses });
    } catch (error) {
      console.error('Error fetching equipment statuses:', error);
    }
  },

  setSelectedEquipment: (equipment) => set({ selectedEquipment: equipment }),
  
  setCurrentBounds: (bounds) => set({ currentBounds: bounds }),

  fetchEquipmentInBounds: async (bounds) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.FIELD_EQUIPMENT}?bounds=${bounds.join(',')}`
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
      const response = await fetch(`${API_ENDPOINTS.FIELD_EQUIPMENT}/${equipmentId}`, {
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
      const response = await fetch(`${API_ENDPOINTS.FIELD_EQUIPMENT}/${equipmentId}`, {
        method: 'PUT',
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
      const response = await fetch(API_ENDPOINTS.FIELD_EQUIPMENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipment_type_id: data.equipment_type_id,
          status: data.status,
          location: {
            type: 'Point',
            coordinates: placementLocation
          },
          ...data.data
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to add equipment: ${error}`);
      }

      const result = await response.json();

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
