'use client';

import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '../config/environment';
import type { PropertyWithLocation } from '../globalTypes/property';

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

export function usePropertyQueries({ bounds, filters, enabled = true }: PropertyQueryOptions) {
  // Query for property boundaries - only fetches minimal data needed for display
  const {
    data: propertiesWithinBounds = [] as PropertyWithLocation[],
    isLoading: isLoadingProperties,
  } = useQuery<PropertyWithLocation[]>({
    queryKey: ['properties', bounds, filters],
    queryFn: async () => {
      if (!bounds) return [];
      try {
        // Build query params
        const params = new URLSearchParams();
        params.append('bounds', bounds.join(','));
        if (filters?.statuses?.length) {
          params.append('statuses', filters.statuses.join(','));
        }
        if (filters?.types?.length) {
          params.append('types', filters.types.join(','));
        }

        const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties?${params.toString()}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to fetch properties');
        }
        const data = await response.json();
        return data.properties || [];
      } catch (error) {
        console.error('Error fetching properties:', error);
        return [];
      }
    },
    enabled: enabled && !!bounds && !bounds.some(isNaN),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep data in cache for 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Query for property options - used for filters
  const {
    data: propertyOptions = { statuses: ['active'], types: [] } as PropertyOptions,
    isLoading: isLoadingOptions,
  } = useQuery<PropertyOptions>({
    queryKey: ['propertyOptions'],
    queryFn: async () => {
      try {
        const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/options`);
        if (!response.ok) {
          throw new Error('Failed to fetch property options');
        }
        const data: PropertyOptionsResponse = await response.json();
        
        // Ensure we're working with arrays
        const statuses = Array.isArray(data?.statuses) ? data.statuses : [];
        const types = Array.isArray(data?.types) ? data.types : [];
        
        // Type assertion to ensure string arrays
        const normalizedStatuses = Array.from(new Set([
          'active',
          ...statuses.map((status) => (status || '').toLowerCase())
        ])).filter((s): s is string => typeof s === 'string' && s.length > 0).sort();
        
        const normalizedTypes = Array.from(new Set(
          types.map((type) => (type || '').toLowerCase())
        )).filter((t): t is string => typeof t === 'string' && t.length > 0).sort();

        return {
          statuses: normalizedStatuses,
          types: normalizedTypes
        };
      } catch (error) {
        console.error('Failed to fetch property options:', error);
        return { statuses: ['active'], types: [] };
      }
    },
    staleTime: 5 * 60 * 1000, // Consider options fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep options in cache for 30 minutes
  });

  return {
    propertiesWithinBounds,
    propertyOptions,
    isLoading: isLoadingProperties || isLoadingOptions,
  };
}
