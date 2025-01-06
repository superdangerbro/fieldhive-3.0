import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Point } from 'geojson';
import { API_URL } from '../config/environment';

interface CreateInspectionParams {
  equipment_id: string;
  inspector_id: string;
  property_id?: string;
  job_id?: string;
  barcode?: string;
  notes?: string;
  image_url?: string;
  data?: Record<string, any>;
  location?: Point;
}

export function useInspections() {
  const queryClient = useQueryClient();

  const createInspection = useMutation({
    mutationFn: async (params: CreateInspectionParams) => {
      const response = await fetch(`${API_URL}/inspections/equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create inspection');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['equipmentInspections'] });
    },
  });

  const getEquipmentInspections = useQuery({
    queryKey: ['equipmentInspections'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/inspections/equipment`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch inspections');
      }
      return response.json();
    },
  });

  return {
    createInspection,
    getEquipmentInspections,
  };
}
