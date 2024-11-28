'use client';

import React, { useCallback, useEffect } from 'react';
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
  const { data: properties } = useQuery({
    queryKey: ['property-boundaries', bounds, filters],
    queryFn: async () => {
      try {
        const [minLng, minLat, maxLng, maxLat] = bounds;
        const params = new URLSearchParams();
        
        // Add bounds
        params.append('bounds', `${minLng},${minLat},${maxLng},${maxLat}`);
        
        // Add filters
        if (filters.statuses.length > 0) {
          params.append('statuses', filters.statuses.join(','));
        }
        if (filters.types.length > 0) {
          params.append('types', filters.types.join(','));
        }

        console.log('Fetching boundaries with params:', params.toString());

        const response = await fetch(
          `${ENV_CONFIG.api.baseUrl}/properties/boundaries?${params}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch property boundaries');
        }

        const data: PropertyResponse[] = await response.json();
        console.log('Received properties:', data);

        // Convert to GeoJSON FeatureCollection
        const features = data
          .filter(property => property.boundary)
          .map(property => property.boundary);

        return {
          type: 'FeatureCollection',
          features: features
        };
      } catch (error) {
        console.error('Error fetching boundaries:', error);
        return {
          type: 'FeatureCollection',
          features: []
        };
      }
    },
    // Ensure we have valid bounds before fetching
    enabled: bounds.every(coord => typeof coord === 'number' && !isNaN(coord))
  });

  const handleClick = useCallback((event: mapboxgl.MapMouseEvent) => {
    if (!mapRef) return;

    const features = mapRef.queryRenderedFeatures(event.point, {
      layers: ['property-boundaries-interaction']
    });

    const feature = features[0];
    if (!feature) return;

    const propertyId = feature.properties?.property_id;
    const [lng, lat] = (feature.properties?.centroid as string).split(',').map(Number);
    
    onPropertyClick(propertyId, [lng, lat]);
  }, [mapRef, onPropertyClick]);

  useEffect(() => {
    if (!mapRef) return;

    mapRef.on('click', handleClick);

    return () => {
      mapRef.off('click', handleClick);
    };
  }, [mapRef, handleClick]);

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

  if (!properties) {
    console.warn('No property data available');
    return null;
  }

  return (
    <Source
      id="property-boundaries"
      type="geojson"
      data={properties}
      generateId={true}
    >
      <Layer {...layerStyle} />
      <Layer {...outlineStyle} />
      <Layer {...interactionStyle} />
    </Source>
  );
}
