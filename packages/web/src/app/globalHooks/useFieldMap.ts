'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ViewState } from 'react-map-gl';
import { ENV_CONFIG } from '../config/environment';
import type { Property } from '../globalTypes/property';
import mapboxgl from 'mapbox-gl';
import debounce from 'lodash/debounce';

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

const DEFAULT_VIEW_STATE: ViewState = {
  longitude: -123.1207, // Vancouver
  latitude: 49.2827,
  zoom: 10,
  pitch: 0,
  bearing: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 }
};

export function useFieldMap() {
  const queryClient = useQueryClient();
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW_STATE);
  const [selectedProperty, setSelectedProperty] = useState<SelectedProperty | null>(null);
  const [currentBounds, setCurrentBounds] = useState<[number, number, number, number] | null>(null);
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [activeFloorPlan, setActiveFloorPlan] = useState<string | null>(null);
  const [placementState, setPlacementState] = useState<PlacementState | null>(null);
  const [filters, setFilters] = useState<Filters>({ statuses: ['active'], types: [] });
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const locationInitializedRef = useRef(false);

  // Initialize location on mount
  useEffect(() => {
    if (locationInitializedRef.current) return;
    locationInitializedRef.current = true;

    const initializeLocation = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permission.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setViewState(prev => ({
                ...prev,
                longitude: position.coords.longitude,
                latitude: position.coords.latitude,
                zoom: 14
              }));
            },
            () => {
              // On error, keep default view state
              console.warn('Failed to get location, using default view');
            },
            { 
              enableHighAccuracy: true,
              timeout: 5000
            }
          );
        } else if (permission.state === 'prompt') {
          // Wait for user to respond to permission prompt
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setViewState(prev => ({
                ...prev,
                longitude: position.coords.longitude,
                latitude: position.coords.latitude,
                zoom: 14
              }));
            },
            () => {
              // User denied or error occurred, keep default view state
              console.warn('Location permission denied, using default view');
            },
            { 
              enableHighAccuracy: true,
              timeout: 5000
            }
          );
        }
        // If denied, keep default view state
      } catch (error) {
        console.warn('Error checking location permission:', error);
      }
    };

    initializeLocation();
  }, []);

  // Padded bounds for smoother loading
  const paddedBounds = useMemo(() => {
    if (!currentBounds) return null;
    const padding = 0.005; // ~500m at equator
    const [west, south, east, north] = currentBounds;
    return [
      Number((west - padding).toFixed(6)),
      Number((south - padding).toFixed(6)),
      Number((east + padding).toFixed(6)),
      Number((north + padding).toFixed(6))
    ];
  }, [currentBounds]);

  // Debounced bounds setter with proper memoization
  const debouncedSetBounds = useCallback(
    debounce((bounds: [number, number, number, number]) => {
      if (!bounds || bounds.some(isNaN)) {
        console.warn('Invalid bounds detected:', bounds);
        return;
      }
      setCurrentBounds(bounds.map(coord => Number(Number(coord).toFixed(6))) as [number, number, number, number]);
    }, 500),
    []
  );

  // Query key factory for better cache management
  const queryKey = useMemo(() => {
    if (!paddedBounds) return ['properties', null];
    return [
      'properties',
      paddedBounds.join(','),
      filters.statuses.join(','),
      filters.types.join(',')
    ];
  }, [paddedBounds, filters]);

  // Fetch properties within bounds
  const {
    data: properties = [],
    isLoading,
    error
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!paddedBounds || paddedBounds.some(isNaN)) return [];
      
      // If no filters are active, return empty array
      if (filters.statuses.length === 0 && filters.types.length === 0) {
        return [];
      }

      const params = new URLSearchParams();
      params.append('bounds', paddedBounds.join(','));
      
      if (filters.statuses.length > 0) {
        params.append('statuses', filters.statuses.join(','));
      }
      if (filters.types.length > 0) {
        params.append('types', filters.types.join(','));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const response = await fetch(
          `${ENV_CONFIG.api.baseUrl}/properties?${params.toString()}`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }

        const data = await response.json();
        return data;
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Property fetch aborted');
          return [];
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    staleTime: 30000,
    cacheTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    gcTime: 1000 // Cleanup queries quickly after unmount
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
    setCurrentBounds: debouncedSetBounds,

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
