'use client';

import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { Source, Layer, useMap } from 'react-map-gl';
import type { FillLayer, LineLayer } from 'react-map-gl';
import { useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../../app/config/environment';
import { usePropertyQueries } from '../../../../../app/globalHooks/usePropertyQueries';
import { debounce } from '../../../../../app/utils/debounce';

const defaultColor = '#4CAF50';
const defaultOpacity = 0.2;
const activeOpacity = 0.4;

const BOUNDS_UPDATE_DELAY = 300; // ms

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

export function PropertyBoundaryLayer({
  bounds,
  filters,
  onPropertyClick,
  activePropertyId,
  highlightColor = '#4CAF50'
}: PropertyBoundaryLayerProps) {
  const { current: mapRef } = useMap();
  const debouncedBoundsRef = useRef(bounds);
  const previousDataRef = useRef<any>(null);

  // Debounce bounds updates
  const debouncedSetBounds = useMemo(
    () =>
      debounce((newBounds: [number, number, number, number]) => {
        debouncedBoundsRef.current = newBounds;
      }, BOUNDS_UPDATE_DELAY),
    []
  );

  // Update debounced bounds when bounds change
  useEffect(() => {
    if (bounds) {
      debouncedSetBounds(bounds);
    }
  }, [bounds, debouncedSetBounds]);

  const queryClient = useQueryClient();

  const {
    propertyBoundaries,
    isLoadingBoundaries
  } = usePropertyQueries({
    bounds: debouncedBoundsRef.current,
    filters,
    enabled: !!debouncedBoundsRef.current && !debouncedBoundsRef.current.some(b => !isFinite(b))
  });

  // Convert boundaries to GeoJSON, using previous data while loading
  const geojsonData = useMemo<FeatureCollection>(() => {
    const currentData = propertyBoundaries?.length ? propertyBoundaries : previousDataRef.current;
    
    if (!currentData?.length) return { type: 'FeatureCollection', features: [] };

    // Store successful data for future use
    if (propertyBoundaries?.length && !isLoadingBoundaries) {
      previousDataRef.current = propertyBoundaries;
    }

    return {
      type: 'FeatureCollection',
      features: currentData
        .filter(p => p?.boundary?.geometry?.coordinates?.length > 0)
        .map(p => ({
          type: 'Feature',
          geometry: p.boundary.geometry,
          properties: {
            property_id: p.property_id,
            property_type: p.property_type,
            status: p.status
          }
        }))
    };
  }, [propertyBoundaries, isLoadingBoundaries]);

  // Layer styles
  const fillLayer = useMemo<FillLayer>(() => ({
    id: 'property-fill',
    type: 'fill',
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
  }), [activePropertyId, highlightColor]);

  const lineLayer = useMemo<LineLayer>(() => ({
    id: 'property-line',
    type: 'line',
    paint: {
      'line-color': [
        'case',
        ['==', ['get', 'property_id'], activePropertyId || ''],
        highlightColor,
        defaultColor
      ],
      'line-width': 1.5
    }
  }), [activePropertyId, highlightColor]);

  // Click handler
  const handleClick = useCallback((event: mapboxgl.MapLayerMouseEvent) => {
    const feature = event.features?.[0] as GeoJSONFeature;
    if (feature?.properties?.property_id) {
      onPropertyClick(feature.properties.property_id, event.lngLat.toArray() as [number, number]);
    }
  }, [onPropertyClick]);

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    map.on('click', 'property-fill', handleClick);
    return () => {
      map.off('click', 'property-fill', handleClick);
    };
  }, [mapRef, handleClick]);

  if (!debouncedBoundsRef.current || (!geojsonData.features.length && !previousDataRef.current)) return null;

  return (
    <Source type="geojson" data={geojsonData}>
      <Layer {...fillLayer} beforeId="building" />
      <Layer {...lineLayer} beforeId="building" />
    </Source>
  );
}
