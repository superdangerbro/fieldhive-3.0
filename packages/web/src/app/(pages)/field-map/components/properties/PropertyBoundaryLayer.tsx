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

interface PropertyFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[][][] | [number, number];
  };
  properties: {
    property_id: string;
    property_type: string;
    status: string;
  };
}

interface PropertyResponse {
  property_id: string;
  boundary: PropertyFeature | null;
  location: PropertyFeature | null;
}

interface FeatureCollection {
  type: 'FeatureCollection';
  features: PropertyFeature[];
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
  const { data: boundaries, isLoading, isPending } = useQuery<FeatureCollection>({
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

        // Only return empty if NO filters are active at all
        if (filters.statuses.length === 0 && filters.types.length === 0) {
          console.log('No filters active, returning empty collection');
          return {
            type: 'FeatureCollection',
            features: []
          };
        }

        try {
          const params = new URLSearchParams();
          params.append('bounds', bounds.map(coord => Number(coord.toFixed(6))).join(','));

          // Add filters
          if (filters.statuses.length > 0) {
            params.append('statuses', filters.statuses.join(','));
          }
          if (filters.types.length > 0) {
            params.append('types', filters.types.join(','));
          }

          // Log the query we're about to make
          const url = `${ENV_CONFIG.api.baseUrl}/properties/boundaries?${params}`;
          console.log('Fetching boundaries:', {
            url,
            filters,
            params: params.toString()
          });

          const response = await fetch(url, { signal });
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch property boundaries:', {
              status: response.status,
              statusText: response.statusText,
              errorText,
              url
            });
            throw new Error(`Failed to fetch property boundaries: ${errorText}`);
          }

          const data: PropertyResponse[] = await response.json();
          
          // Extract and return features
          const features = data
            .filter(property => property.boundary)
            .map(property => property.boundary)
            .filter((feature): feature is PropertyFeature => feature !== null);

          console.log('Property boundaries response:', {
            totalProperties: data.length,
            totalFeatures: features.length,
            filters
          });

          return {
            type: 'FeatureCollection',
            features
          };
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.warn('Boundary fetch aborted');
            return {
              type: 'FeatureCollection',
              features: []
            };
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
    gcTime: 5 * 60 * 1000,
    enabled: bounds && Array.isArray(bounds) && bounds.length === 4 && bounds.every(coord => typeof coord === 'number' && !isNaN(coord)),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData => keepPreviousData,
    retryDelay: 1000
  });

  const filteredProperties = useMemo(() => {
    if (!boundaries?.features) return [];

    return boundaries.features.filter(feature => {
      const properties = feature.properties;
      if (!properties) return false;

      // Status filter - convert both to lowercase for comparison
      const propertyStatus = properties.status?.toLowerCase() || '';
      const statusMatch = filters.statuses.length === 0 || 
        filters.statuses.some(status => propertyStatus.includes(status.toLowerCase()));

      // Type filter - convert both to lowercase for comparison
      const propertyType = properties.property_type?.toLowerCase() || '';
      const typeMatch = filters.types.length === 0 || 
        filters.types.some(type => propertyType.includes(type.toLowerCase()));

      // Use OR condition between status and type filters
      return statusMatch || typeMatch;
    });
  }, [boundaries, filters]);

  // Only update source data when we have new boundaries and they're not loading
  const sourceData = useMemo((): FeatureCollection => {
    if (!boundaries?.features) {
      return {
        type: 'FeatureCollection',
        features: []
      };
    }
    return {
      type: 'FeatureCollection',
      features: filteredProperties
    };
  }, [boundaries, filteredProperties]);

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
    },
    layout: {
      visibility: 'visible'
    }
  };

  // Wait for layer to be loaded before adding click handler
  useEffect(() => {
    if (!mapRef) return;
    
    const map = mapRef.getMap();
    let isLayerLoaded = false;

    const handleClick = (event: mapboxgl.MapMouseEvent) => {
      try {
        const features = map.queryRenderedFeatures(event.point, {
          layers: ['property-boundaries-interaction']
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
      
      if (map.getLayer('property-boundaries-interaction')) {
        isLayerLoaded = true;
        map.on('click', 'property-boundaries-interaction', handleClick);
        
        // Change cursor on hover
        map.on('mouseenter', 'property-boundaries-interaction', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'property-boundaries-interaction', () => {
          map.getCanvas().style.cursor = '';
        });
      }
    };

    // Check if layer exists immediately
    setupClickHandler();

    // Also listen for layer addition
    map.on('sourcedata', setupClickHandler);

    return () => {
      map.off('click', 'property-boundaries-interaction', handleClick);
      map.off('mouseenter', 'property-boundaries-interaction', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.off('mouseleave', 'property-boundaries-interaction', () => {
        map.getCanvas().style.cursor = '';
      });
      map.off('sourcedata', setupClickHandler);
    };
  }, [mapRef, onPropertyClick]);

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
  if (!sourceData || (filters.statuses.length === 0 && filters.types.length === 0)) {
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
