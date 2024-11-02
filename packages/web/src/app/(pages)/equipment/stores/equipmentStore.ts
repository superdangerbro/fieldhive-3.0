import { create } from 'zustand';
import { getSetting, updateSetting } from '@/services/api';
import type { Equipment, EquipmentType } from '../types';

interface EquipmentStore {
  equipment: Equipment[];
  equipmentTypes: EquipmentType[];
  equipmentStatuses: string[];
  selectedEquipment: Equipment | null;
  
  // Equipment management
  fetchEquipmentTypes: () => Promise<void>;
  fetchEquipmentStatuses: () => Promise<void>;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  deleteEquipment: (equipmentId: string) => Promise<void>;
  updateEquipmentType: (equipmentId: string, equipmentTypeId: string) => Promise<void>;
  addEquipment: (data: { 
    equipment_type_id: string;
    status: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
    data: Record<string, any>;
  }) => Promise<void>;
}

export const useEquipmentStore = create<EquipmentStore>((set, get) => ({
  equipment: [],
  equipmentTypes: [],
  equipmentStatuses: [],
  selectedEquipment: null,
  
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
      set({ equipmentStatuses: statuses || [] });
    } catch (error) {
      console.error('Error fetching equipment statuses:', error);
    }
  },

  setSelectedEquipment: (equipment) => set({ selectedEquipment: equipment }),

  deleteEquipment: async (equipmentId) => {
    try {
      await updateSetting('delete_equipment', { id: equipmentId });
      set(state => ({
        equipment: state.equipment.filter(e => e.equipment_id !== equipmentId),
        selectedEquipment: null
      }));
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

      // Update equipment in state
      const updatedEquipment = get().equipment.find(e => e.equipment_id === equipmentId);
      if (updatedEquipment) {
        set({ selectedEquipment: updatedEquipment });
      }
    } catch (error) {
      console.error('Error updating equipment type:', error);
      throw error;
    }
  },

  addEquipment: async (data) => {
    try {
      await updateSetting('add_equipment', data);
      
      // Refresh equipment list
      const equipment = await getSetting('equipment');
      if (equipment) {
        set({ equipment });
      }
    } catch (error) {
      console.error('Failed to add equipment:', error);
      throw error;
    }
  }
}));
