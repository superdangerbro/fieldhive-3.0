'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { Source, Layer, useMap } from 'react-map-gl';
import type { FillLayer, LineLayer } from 'react-map-gl';
import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../../app/config/environment';

interface PropertyBoundaryLayerProps {
  bounds: [number, number, number, number];
  filters: {
    statuses: string[];
    types: string[];
  };
  onPropertyClick: (propertyId: string, coordinates: [number, number]) => void;
  activePropertyId?: string;
  highlightColor?: string;
}

interface PropertyResponse {
  property_id: string;
  boundary: {
    type: 'Feature';
    geometry: any;
    properties: {
      property_id: string;
    };
  } | null;
  location: {
    type: 'Feature';
    geometry: any;
    properties: {
      property_id: string;
    };
  } | null;
}

const defaultColor = '#4CAF50'; // Green color for properties
const defaultOpacity = 0.2;
const activeOpacity = 0.4;

export function PropertyBoundaryLayer({
  bounds,
  filters,
  onPropertyClick,
  activePropertyId,
  highlightColor = '#4CAF50'
}: PropertyBoundaryLayerProps) {
  const { current: mapRef } = useMap();

  // Query property boundaries within the current map bounds
  const { data: boundaries, isLoading, isPending } = useQuery({
    queryKey: ['property-boundaries', bounds, filters],
    queryFn: async ({ signal }) => {
      try {
        // If no filters are active or bounds are invalid, return empty collection
        if (!bounds || !Array.isArray(bounds) || bounds.length !== 4 || bounds.some(coord => typeof coord !== 'number' || isNaN(coord))) {
          return {
            type: 'FeatureCollection',
            features: []
          };
        }

        if (filters.statuses.length === 0 && filters.types.length === 0) {
          return {
            type: 'FeatureCollection',
            features: []
          };
        }

        try {
          const params = new URLSearchParams();
          params.append('bounds', bounds.map(coord => Number(coord.toFixed(6))).join(','));
          
          if (filters.statuses.length > 0) {
            params.append('statuses', filters.statuses.join(','));
          }
          if (filters.types.length > 0) {
            params.append('types', filters.types.join(','));
          }

          const response = await fetch(
            `${ENV_CONFIG.api.baseUrl}/properties/boundaries?${params}`,
            { signal }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch property boundaries');
          }

          const data: PropertyResponse[] = await response.json();
          
          const features = data
            .filter(property => property.boundary)
            .map(property => property.boundary);

          return {
            type: 'FeatureCollection',
            features: features
          };
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.warn('Boundary fetch aborted');
            return null; // Return null to keep previous data
          }
          throw error;
        }
      } catch (error) {
        console.error('Error fetching boundaries:', error);
        return {
          type: 'FeatureCollection',
          features: []
        };
      }
    },
    staleTime: 30000,
    cacheTime: 5 * 60 * 1000,
    enabled: bounds && Array.isArray(bounds) && bounds.length === 4 && bounds.every(coord => typeof coord === 'number' && !isNaN(coord)),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    gcTime: 1000,
    placeholderData: keepPreviousData => keepPreviousData,
    retryDelay: 1000
  });

  // Only update source data when we have new boundaries and they're not loading
  const sourceData = useMemo(() => {
    if (!boundaries || (filters.statuses.length === 0 && filters.types.length === 0)) {
      return {
        type: 'FeatureCollection',
        features: []
      };
    }
    return boundaries;
  }, [boundaries, filters]);

  // Wait for layer to be loaded before adding click handler
  useEffect(() => {
    if (!mapRef) return;
    
    const map = mapRef.getMap();
    let isLayerLoaded = false;

    const handleClick = (event: mapboxgl.MapMouseEvent) => {
      try {
        const features = map.queryRenderedFeatures(event.point, {
          layers: ['property-boundaries-fill']
        });

        const feature = features[0];
        if (!feature) return;

        const propertyId = feature.properties?.property_id;
        if (!propertyId) return;

        // Use the click coordinates instead of trying to get centroid
        const coordinates: [number, number] = [event.lngLat.lng, event.lngLat.lat];
        onPropertyClick(propertyId, coordinates);
      } catch (error) {
        console.error('Error handling property click:', error);
      }
    };

    const setupClickHandler = () => {
      if (isLayerLoaded) return;
      
      if (map.getLayer('property-boundaries-fill')) {
        isLayerLoaded = true;
        map.on('click', 'property-boundaries-fill', handleClick);
      }
    };

    // Check if layer exists immediately
    setupClickHandler();

    // Also listen for layer addition
    map.on('sourcedata', setupClickHandler);

    return () => {
      map.off('click', 'property-boundaries-fill', handleClick);
      map.off('sourcedata', setupClickHandler);
    };
  }, [mapRef, onPropertyClick]);

  // Basic styles for all properties
  const layerStyle: FillLayer = {
    id: 'property-boundaries-fill',
    type: 'fill',
    source: 'property-boundaries',
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'property_id'], activePropertyId || ''],
        highlightColor,
        defaultColor
      ],
      'fill-opacity': [
        'case',
        ['==', ['get', 'property_id'], activePropertyId || ''],
        activeOpacity,
        defaultOpacity
      ]
    }
  };

  const outlineStyle: LineLayer = {
    id: 'property-boundaries-outline',
    type: 'line',
    source: 'property-boundaries',
    paint: {
      'line-color': [
        'case',
        ['==', ['get', 'property_id'], activePropertyId || ''],
        highlightColor,
        defaultColor
      ],
      'line-width': [
        'case',
        ['==', ['get', 'property_id'], activePropertyId || ''],
        3,
        1
      ]
    }
  };

  const interactionStyle: FillLayer = {
    id: 'property-boundaries-interaction',
    type: 'fill',
    source: 'property-boundaries',
    paint: {
      'fill-opacity': 0
    }
  };

  // Add pulsing animation only for active property
  useEffect(() => {
    if (!mapRef || !activePropertyId) return;

    const map = mapRef.getMap();
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = () => {
      const currentTime = performance.now();
      const elapsed = (currentTime - startTime) / 1000;
      const pulse = (Math.sin(elapsed * 2) + 1) / 2; // Faster pulse

      try {
        // Update opacity for active property
        map.setPaintProperty(
          'property-boundaries-fill',
          'fill-opacity',
          [
            'case',
            ['==', ['get', 'property_id'], activePropertyId],
            defaultOpacity + (pulse * 0.3), // Pulse between default and higher opacity
            defaultOpacity // Default opacity for other properties
          ]
        );

        // Update line width for active property
        map.setPaintProperty(
          'property-boundaries-outline',
          'line-width',
          [
            'case',
            ['==', ['get', 'property_id'], activePropertyId],
            2 + (pulse * 2), // Pulse between 2 and 4
            1
          ]
        );

        animationFrameId = requestAnimationFrame(animate);
      } catch (error) {
        console.error('Error updating property styles:', error);
      }
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      try {
        // Reset to default styles
        map.setPaintProperty('property-boundaries-fill', 'fill-opacity', defaultOpacity);
        map.setPaintProperty('property-boundaries-outline', 'line-width', 1);
      } catch (error) {
        console.error('Error resetting property styles:', error);
      }
    };
  }, [mapRef, activePropertyId]);

  // Don't render anything if no filters are active
  if (!boundaries || (filters.statuses.length === 0 && filters.types.length === 0)) {
    return null;
  }

  return (
    <Source
      id="property-boundaries"
      type="geojson"
      data={sourceData}
      generateId={true}
    >
      <Layer {...layerStyle} />
      <Layer {...outlineStyle} />
      <Layer {...interactionStyle} />
    </Source>
  );
}
