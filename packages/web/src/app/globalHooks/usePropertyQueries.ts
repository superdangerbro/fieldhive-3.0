'use client';

import { useQuery, useQueryClient, useQueryClientProvider } from '@tanstack/react-query';
import { ENV_CONFIG } from '../config/environment';
import type { PropertyWithLocation } from '../globalTypes/property';
import { useMemo } from 'react';
import { useRef } from 'react';

interface PropertyQueryOptions {
  bounds: [number, number, number, number] | null;
  filters?: {
    statuses: string[];
    types: string[];
  };
  enabled?: boolean;
}

interface PropertyOptions {
  statuses: string[];
  types: string[];
}

interface PropertyOptionsResponse {
  statuses: string[];
  types: string[];
}

interface PropertyBoundary {
  property_id: string;
  name: string;
  property_type: string;
  status: string;
  boundary: {
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: {
      property_id: string;
      property_type: string;
      status: string;
    };
  };
}

// Tile cache configuration
const TILE_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const TILE_STALE_TIME = 30 * 1000; // 30 seconds
const BOUNDS_PRECISION = 6;

// Utility function to generate tile key
const getTileKey = (bounds: [number, number, number, number], zoom: number): string => {
  return `tile:${bounds.map(b => Number(b.toFixed(BOUNDS_PRECISION))).join(',')}:${zoom}`;
};

export function usePropertyQueries({ bounds, filters, enabled = true }: PropertyQueryOptions) {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController>();

  // Memoize bounds to prevent unnecessary query key changes
  const boundKey = useMemo(() => {
    if (!bounds) return null;
    return bounds.map(b => b.toFixed(BOUNDS_PRECISION)).join(',');
  }, [bounds]);

  // Memoize filters to prevent unnecessary query key changes
  const filterKey = useMemo(() => {
    if (!filters?.statuses?.length) return null;
    return filters.statuses.join(',');
  }, [filters?.statuses]);

  const {
    data: propertyBoundaries = [] as PropertyBoundary[],
    isLoading: isLoadingBoundaries,
  } = useQuery<PropertyBoundary[]>({
    queryKey: ['propertyBoundaries', boundKey, filterKey],
    queryFn: async ({ signal }) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (!boundKey) return [];
      
      try {
        const params = new URLSearchParams();
        params.append('bounds', boundKey);
        if (filterKey) {
          params.append('statuses', filterKey);
        }

        const response = await fetch(
          `${ENV_CONFIG.api.baseUrl}/properties/boundaries?${params.toString()}`,
          { signal: abortControllerRef.current.signal }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch property boundaries');
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        if (error.name === 'AbortError') return [];
        console.error('Error fetching property boundaries:', error);
        return [];
      }
    },
    staleTime: TILE_STALE_TIME, // Cache for 30 seconds to prevent rapid refetches
    cacheTime: TILE_CACHE_TIME, // Keep in cache for 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
    enabled: enabled && !!boundKey
  });

  return {
    propertyBoundaries,
    isLoadingBoundaries
  };
}
