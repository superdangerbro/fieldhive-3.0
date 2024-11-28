'use client';

import { useState, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ViewState } from 'react-map-gl';
import { ENV_CONFIG } from '../config/environment';
import type { Property } from '../globalTypes/property';
import mapboxgl from 'mapbox-gl';

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

interface Filters {
  statuses: string[];
  types: string[];
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
  const [filters, setFilters] = useState<Filters>({ statuses: ['active'], types: [] });
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Fetch properties within bounds
  const {
    data: properties = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['properties', currentBounds, filters],
    queryFn: async () => {
      if (!currentBounds) return [];
      
      const url = new URL(`${ENV_CONFIG.api.baseUrl}/properties/boundaries`);
      
      // Add bounds
      url.searchParams.set('bounds', currentBounds.join(','));
      
      // Add filters
      if (filters.statuses.length > 0) {
        url.searchParams.append('statuses', filters.statuses.join(','));
      }
      if (filters.types.length > 0) {
        url.searchParams.append('types', filters.types.join(','));
      }

      console.log('Fetching properties with URL:', url.toString());
      console.log('Current filters:', filters);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      const data = await response.json();
      console.log('API Response:', {
        totalProperties: data.length,
        propertiesWithLocation: data.filter((p: any) => p.location).length,
        firstProperty: data[0]
      });
      return data;
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

    // Map ref
    mapRef,

    // Selected property state
    selectedProperty,
    setSelectedProperty,

    // Bounds state
    currentBounds,
    setCurrentBounds,

    // Filter state
    filters,
    setFilters,

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
