import { create } from 'zustand';

interface Equipment {
  id: number;
  type: string;
  location: [number, number];
  status: string;
  lastInspection?: {
    timestamp: string;
    status: string;
    notes: string;
    actionTaken: string;
  };
}

interface Inspection {
  id: number;
  equipmentId: number;
  timestamp: string;
  status: string;
  notes: string;
  actionTaken: string;
}

interface EquipmentStore {
  equipment: Equipment[];
  inspections: Inspection[];
  selectedEquipment: Equipment | null;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  addInspection: (inspection: Omit<Inspection, 'id'>) => void;
  fetchEquipment: () => Promise<void>;
}

export const useEquipmentStore = create<EquipmentStore>((set, get) => ({
  equipment: [],
  inspections: [],
  selectedEquipment: null,
  
  setSelectedEquipment: (equipment) => set({ selectedEquipment: equipment }),
  
  addInspection: (inspection) => {
    const newInspection = {
      ...inspection,
      id: Date.now(), // temporary ID generation
    };
    
    set((state) => ({
      inspections: [...state.inspections, newInspection],
      equipment: state.equipment.map((eq) =>
        eq.id === inspection.equipmentId
          ? {
              ...eq,
              lastInspection: {
                timestamp: inspection.timestamp,
                status: inspection.status,
                notes: inspection.notes,
                actionTaken: inspection.actionTaken,
              },
            }
          : eq
      ),
    }));
  },
  
  fetchEquipment: async () => {
    try {
      // TODO: Replace with actual API call
      const mockData: Equipment[] = [
        {
          id: 1,
          type: 'trap',
          location: [-123.1207, 49.2827],
          status: 'active',
        },
        {
          id: 2,
          type: 'trap',
          location: [-123.1307, 49.2927],
          status: 'active',
        },
      ];
      
      set({ equipment: mockData });
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  },
}));
