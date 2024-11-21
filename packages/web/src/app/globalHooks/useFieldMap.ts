'use client';

import { useState, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ViewState } from 'react-map-gl';
import { ENV_CONFIG } from '../config/environment';
import type { Property } from '../globalTypes/property';

interface SelectedProperty {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface FloorPlan {
  id: string;
  name: string;
  visible: boolean;
  imageUrl: string;
  floor: number;
  propertyId: string;
}

interface PlacementState {
  imageUrl: string;
  propertyId: string | null;
}

const INITIAL_VIEW_STATE: ViewState = {
  longitude: -123.1207,
  latitude: 49.2827,
  zoom: 11,
  pitch: 0,
  bearing: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 }
};

export function useFieldMap() {
  const queryClient = useQueryClient();
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
  const [selectedProperty, setSelectedProperty] = useState<SelectedProperty | null>(null);
  const [currentBounds, setCurrentBounds] = useState<[number, number, number, number] | null>(null);
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [activeFloorPlan, setActiveFloorPlan] = useState<string | null>(null);
  const [placementState, setPlacementState] = useState<PlacementState | null>(null);

  // Fetch properties within bounds
  const {
    data: properties = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['properties', currentBounds],
    queryFn: async () => {
      if (!currentBounds) return [];
      
      const url = new URL(`${ENV_CONFIG.api.baseUrl}/properties`);
      url.searchParams.set('bounds', currentBounds.join(','));
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json();
    },
    enabled: !!currentBounds
  });

  // Floor plan mutations
  const toggleFloorPlanVisibility = useCallback((id: string) => {
    setFloorPlans(current => 
      current.map(fp => fp.id === id ? { ...fp, visible: !fp.visible } : fp)
    );
  }, []);

  const addFloorPlan = useCallback((floorPlan: FloorPlan) => {
    setFloorPlans(current => [...current, floorPlan]);
  }, []);

  // Floor plan placement
  const startPlacingFloorPlan = useCallback((imageUrl: string, propertyId: string) => {
    setPlacementState({ imageUrl, propertyId });
  }, []);

  const cancelPlacingFloorPlan = useCallback(() => {
    setPlacementState(null);
  }, []);

  const confirmFloorPlanPlacement = useCallback((bounds: {
    west: number;
    east: number;
    north: number;
    south: number;
    coordinates: [number, number][];
  }) => {
    if (!placementState) return;
    
    console.log('Saving floor plan with bounds:', bounds);
    setPlacementState(null);
  }, [placementState]);

  return {
    // Properties data
    properties,
    isLoading,
    error,

    // View state
    viewState,
    setViewState,

    // Selected property state
    selectedProperty,
    setSelectedProperty,

    // Bounds state
    currentBounds,
    setCurrentBounds,

    // Floor plan state
    floorPlans,
    activeFloorPlan,
    setActiveFloorPlan,
    toggleFloorPlanVisibility,
    addFloorPlan,

    // Floor plan placement
    placementState,
    startPlacingFloorPlan,
    cancelPlacingFloorPlan,
    confirmFloorPlanPlacement
  };
}
