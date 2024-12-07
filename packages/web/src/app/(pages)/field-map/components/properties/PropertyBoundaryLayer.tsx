'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Source, Layer, useMap } from 'react-map-gl';
import type { FillLayer, LineLayer } from 'react-map-gl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../../app/config/environment';
import debounce from 'lodash/debounce';

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

interface GeoJSONFeature extends mapboxgl.MapboxGeoJSONFeature {
  properties: {
    property_id: string;
    property_type: string;
    status: string;
  };
}

const defaultColor = '#4CAF50';
const defaultOpacity = 0.2;
const activeOpacity = 0.4;

// Cache configuration
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const STALE_TIME = 30 * 1000; // 30 seconds
const BOUNDS_PRECISION = 6; // Decimal places for bounds coordinates

export function PropertyBoundaryLayer({
  bounds,
  filters,
  onPropertyClick,
  activePropertyId,
  highlightColor = '#4CAF50'
}: PropertyBoundaryLayerProps) {
  const { current: mapRef } = useMap();
  const queryClient = useQueryClient();
  const previousBounds = useRef<string>();

  // Round bounds to reduce unnecessary fetches
  const roundedBounds = useMemo(() => {
    if (!bounds) return null;
    return bounds.map(coord => Number(coord.toFixed(BOUNDS_PRECISION))) as [number, number, number, number];
  }, [bounds]);

  // Format coordinates for API request
  const formatBounds = useCallback((bounds: [number, number, number, number]) => {
    return bounds
      .map(coord => coord.toFixed(BOUNDS_PRECISION))
      .join(',');
  }, []);

  // Prefetch adjacent bounds
  const prefetchAdjacentBounds = useCallback(
    debounce((currentBounds: [number, number, number, number]) => {
      const [minLng, minLat, maxLng, maxLat] = currentBounds;
      const width = maxLng - minLng;
      const height = maxLat - minLat;

      // Define adjacent bounds areas
      const adjacentBounds = [
        [minLng - width, minLat, minLng, maxLat], // Left
        [maxLng, minLat, maxLng + width, maxLat], // Right
        [minLng, maxLat, maxLng, maxLat + height], // Top
        [minLng, minLat - height, maxLng, minLat], // Bottom
      ];

      // Prefetch each adjacent bound
      adjacentBounds.forEach(bound => {
        const roundedBound = bound.map(coord => Number(coord.toFixed(BOUNDS_PRECISION)));
        queryClient.prefetchQuery({
          queryKey: ['property-boundaries', roundedBound, filters],
          queryFn: () => fetchProperties(roundedBound as [number, number, number, number], filters),
          staleTime: STALE_TIME,
        });
      });
    }, 1000),
    [filters, queryClient]
  );

  // Fetch properties function
  const fetchProperties = async (
    queryBounds: [number, number, number, number],
    queryFilters: typeof filters
  ): Promise<FeatureCollection> => {
    if (!queryBounds || queryBounds.some(coord => typeof coord !== 'number' || isNaN(coord))) {
      return { type: 'FeatureCollection', features: [] };
    }

    const params = new URLSearchParams();
    params.append('bounds', formatBounds(queryBounds));
    params.append('zoom', Math.floor(mapRef?.getMap().getZoom() || 10).toString());
    
    // Only append filters if they have values
    if (queryFilters.statuses.length > 0) {
      params.append('statuses', queryFilters.statuses.join(','));
    }
    if (queryFilters.types.length > 0) {
      params.append('types', queryFilters.types.join(','));
    }

    try {
      const url = `${ENV_CONFIG.api.baseUrl}/properties/boundaries?${params}`;
      console.log('Fetching properties:', { 
        url, 
        params: params.toString(),
        bounds: queryBounds,
        zoom: mapRef?.getMap().getZoom()
      });

      const response = await fetch(url);
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        const errorText = contentType?.includes('application/json') 
          ? JSON.stringify(await response.json(), null, 2)
          : await response.text();
          
        console.error('Failed to fetch properties:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url
        });
        throw new Error(`Failed to fetch properties: ${errorText}`);
      }

      const data = await response.json();
      
      // Handle both array and object responses
      const properties = Array.isArray(data) ? data : data.properties || [];
      
      // Extract and format features
      const features = properties
        .filter((property: PropertyResponse) => Boolean(property?.boundary))
        .map((property: PropertyResponse) => property.boundary)
        .filter((feature: PropertyFeature | null): feature is PropertyFeature => 
          Boolean(
            feature !== null && 
            feature.geometry && 
            feature.properties && 
            feature.properties.property_id
          )
        );

      console.log('Fetched properties:', {
        totalProperties: properties.length,
        totalFeatures: features.length,
        sampleFeature: features[0]
      });

      return {
        type: 'FeatureCollection',
        features
      };
    } catch (error) {
      console.error('Error fetching properties:', error);
      return {
        type: 'FeatureCollection',
        features: []
      };
    }
  };

  // Query for properties
  const { data: boundaries } = useQuery<FeatureCollection>({
    queryKey: ['property-boundaries', roundedBounds, filters],
    queryFn: () => fetchProperties(roundedBounds!, filters),
    enabled: !!roundedBounds && (filters.statuses.length > 0 || filters.types.length > 0),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false
  });

  // Trigger prefetch when bounds change
  useEffect(() => {
    if (roundedBounds && previousBounds.current !== JSON.stringify(roundedBounds)) {
      previousBounds.current = JSON.stringify(roundedBounds);
      prefetchAdjacentBounds(roundedBounds);
    }
  }, [roundedBounds, prefetchAdjacentBounds]);

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

  // Click handler
  const handleClick = useCallback((event: mapboxgl.MapMouseEvent) => {
    if (!mapRef) return;
    
    const features = mapRef.getMap().queryRenderedFeatures(event.point, {
      layers: ['property-boundaries-interaction']
    }) as GeoJSONFeature[];

    const feature = features[0];
    if (!feature?.properties?.property_id) return;

    onPropertyClick(feature.properties.property_id, [event.lngLat.lng, event.lngLat.lat]);
  }, [mapRef, onPropertyClick]);

  // Set up click handler
  useEffect(() => {
    if (!mapRef) return;
    
    const map = mapRef.getMap();
    
    map.on('click', 'property-boundaries-interaction', handleClick);
    
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };
    
    map.on('mouseenter', 'property-boundaries-interaction', handleMouseEnter);
    map.on('mouseleave', 'property-boundaries-interaction', handleMouseLeave);

    return () => {
      map.off('click', 'property-boundaries-interaction', handleClick);
      map.off('mouseenter', 'property-boundaries-interaction', handleMouseEnter);
      map.off('mouseleave', 'property-boundaries-interaction', handleMouseLeave);
    };
  }, [mapRef, handleClick]);

  // Don't render if no boundaries or no filters active
  if (!boundaries?.features || !boundaries.features.length) {
    console.log('Not rendering PropertyBoundaryLayer:', {
      hasFeatures: !!boundaries?.features,
      featureCount: boundaries?.features?.length,
      filters,
      bounds: roundedBounds
    });
    return null;
  }

  return (
    <Source
      id="property-boundaries"
      type="geojson"
      data={boundaries}
      generateId={true}
    >
      <Layer {...layerStyle} />
      <Layer {...outlineStyle} />
      <Layer {...interactionStyle} />
    </Source>
  );
}
