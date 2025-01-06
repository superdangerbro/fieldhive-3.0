'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Equipment } from '@/app/globalTypes/equipment';
import { ENV_CONFIG } from '@/config/environment';

interface UseEquipmentOptions {
  bounds?: [number, number, number, number];
}

export function useEquipment(options: UseEquipmentOptions = {}) {
  const { bounds } = options;
  const queryClient = useQueryClient();

  // Equipment placement state
  const [isPlacingEquipment, setIsPlacingEquipment] = useState(false);
  const [placementLocation, setPlacementLocation] = useState<[number, number] | null>(null);
  const [isAddEquipmentDialogOpen, setIsAddEquipmentDialogOpen] = useState(false);
  const [isMarkerDialogOpen, setIsMarkerDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Fetch equipment within bounds
  const {
    data: equipmentList = [],
    isLoading: isLoadingEquipment,
    error: equipmentError,
    refetch: refetchEquipment
  } = useQuery({
    queryKey: ['equipment', bounds],
    queryFn: async () => {
      const url = new URL(`${ENV_CONFIG.api.baseUrl}/equipment`);
      url.searchParams.set('status', 'active'); // Only show active equipment
      if (bounds) {
        url.searchParams.set('bounds', bounds.join(','));
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch equipment');
      }
      const data = await response.json();
      return data.equipment || []; // Ensure we return an array
    },
    enabled: true, // Always fetch equipment
    initialData: [],
    staleTime: 0, // Always refetch
    retry: 1
  });

  // Fetch equipment types
  const {
    data: equipmentTypes = [],
    isLoading: isLoadingTypes,
    error: typesError
  } = useQuery({
    queryKey: ['equipment-types'],
    queryFn: async () => {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/settings/equipment/types`);
      if (!response.ok) {
        throw new Error('Failed to fetch equipment types');
      }
      const data = await response.json();
      return data.types || []; // Ensure we return an array
    },
    initialData: []
  });

  // Fetch equipment statuses
  const {
    data: equipmentStatuses = [],
    isLoading: isLoadingStatuses,
    error: statusesError
  } = useQuery({
    queryKey: ['equipment-statuses'],
    queryFn: async () => {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/settings/equipment/statuses`);
      if (!response.ok) {
        throw new Error('Failed to fetch equipment statuses');
      }
      const data = await response.json();
      return data.statuses || []; // Ensure we return an array
    },
    initialData: []
  });

  // Equipment placement actions
  const startPlacingEquipment = useCallback(() => {
    setIsPlacingEquipment(true);
    setPlacementLocation(null);
  }, []);

  const cancelPlacingEquipment = useCallback(() => {
    setIsPlacingEquipment(false);
    setPlacementLocation(null);
    setIsAddEquipmentDialogOpen(false);
  }, []);

  const confirmPlacementLocation = useCallback(() => {
    if (placementLocation) {
      setIsPlacingEquipment(false);
      setIsAddEquipmentDialogOpen(true);
    }
  }, [placementLocation]);

  // Dialog actions
  const openMarkerDialog = useCallback((equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsMarkerDialogOpen(true);
  }, []);

  const closeMarkerDialog = useCallback(() => {
    setSelectedEquipment(null);
    setIsMarkerDialogOpen(false);
  }, []);

  // Equipment mutations
  const addEquipmentMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await fetch(`${ENV_CONFIG.api.baseUrl}/equipment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const dataResponse = await response.json();
        
        if (!response.ok) {
          throw new Error(dataResponse.message || `Failed to add equipment: ${response.status}`);
        }

        return dataResponse;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      refetchEquipment(); // Force immediate refetch
      setIsAddEquipmentDialogOpen(false);
      setPlacementLocation(null);
      setIsPlacingEquipment(false);
    }
  });

  // Update equipment mutation
  const updateEquipmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/equipment/${data.equipment_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update equipment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  const updateEquipmentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/equipment/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update equipment status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  const deleteEquipmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/equipment/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to delete equipment' }));
        throw new Error(error.message || 'Failed to delete equipment');
      }
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      refetchEquipment(); // Force immediate refetch
      closeMarkerDialog();
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
    }
  });

  const moveEquipmentMutation = useMutation({
    mutationFn: async ({ id, location }: { id: string; location: [number, number] }) => {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/equipment/${id}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: {
            latitude: location[1],
            longitude: location[0]
          }
        }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to move equipment' }));
        throw new Error(error.message || 'Failed to move equipment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      refetchEquipment(); // Force immediate refetch
    },
    onError: (error) => {
      console.error('Move mutation error:', error);
    }
  });

  return {
    data: equipmentList,
    isLoading: isLoadingEquipment || isLoadingTypes || isLoadingStatuses,
    error: equipmentError || typesError || statusesError,
    addEquipment: addEquipmentMutation.mutateAsync,
    updateEquipment: updateEquipmentMutation.mutateAsync,
    updateEquipmentStatus: updateEquipmentStatusMutation.mutateAsync,
    deleteEquipment: deleteEquipmentMutation.mutateAsync,
    moveEquipment: moveEquipmentMutation.mutateAsync,
    isPlacingEquipment,
    startPlacingEquipment,
    cancelPlacingEquipment,
    equipmentTypes,
    equipmentStatuses,
    isAddEquipmentDialogOpen,
    setIsAddEquipmentDialogOpen,
    isMarkerDialogOpen,
    selectedEquipment,
    openMarkerDialog,
    closeMarkerDialog,
  };
}
