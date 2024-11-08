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
    data: equipment = [],
    isLoading: isLoadingEquipment,
    error: equipmentError
  } = useQuery({
    queryKey: ['equipment', bounds],
    queryFn: async () => {
      const url = new URL(`${ENV_CONFIG.api.baseUrl}/equipment`);
      if (bounds) {
        url.searchParams.set('bounds', bounds.join(','));
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch equipment');
      }
      return response.json();
    },
    enabled: !!bounds
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
      return response.json();
    }
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
      return response.json();
    }
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
  const addEquipment = useMutation({
    mutationFn: async (newEquipment: Partial<Equipment>) => {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEquipment)
      });
      if (!response.ok) {
        throw new Error('Failed to add equipment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setIsAddEquipmentDialogOpen(false);
      setPlacementLocation(null);
    }
  });

  const updateEquipment = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Equipment> }) => {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/equipment/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update equipment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    }
  });

  const deleteEquipment = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/equipment/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete equipment');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      closeMarkerDialog();
    }
  });

  return {
    // Equipment data
    equipment,
    equipmentTypes,
    equipmentStatuses,

    // Loading states
    isLoading: isLoadingEquipment || isLoadingTypes || isLoadingStatuses,
    isLoadingEquipment,
    isLoadingTypes,
    isLoadingStatuses,

    // Errors
    error: equipmentError || typesError || statusesError,
    equipmentError,
    typesError,
    statusesError,

    // Equipment placement state
    isPlacingEquipment,
    placementLocation,
    isAddEquipmentDialogOpen,
    isMarkerDialogOpen,
    selectedEquipment,

    // Equipment placement actions
    startPlacingEquipment,
    cancelPlacingEquipment,
    setPlacementLocation,
    confirmPlacementLocation,
    openMarkerDialog,
    closeMarkerDialog,

    // Equipment mutations
    addEquipment,
    updateEquipment,
    deleteEquipment
  };
}
