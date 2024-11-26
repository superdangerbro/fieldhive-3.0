'use client';

import React, { useEffect, useState } from 'react';
import { Layer, Source, useMap } from 'react-map-gl';
import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../../app/config/environment';

interface PropertyFilters {
  statuses: string[];
  types: string[];
}

interface PropertyBoundaryLayerProps {
  bounds: [number, number, number, number];
  filters: PropertyFilters;
  onPropertyClick?: (propertyId: string, location: [number, number]) => void;
}

interface PropertyWithBoundary {
  property_id: string;
  boundary: GeoJSON.Feature | null;
  location: GeoJSON.Feature | null;
}

const LAYER_IDS = {
  fill: 'property-boundary-fill',
  outline: 'property-boundary-outline',
  marker: 'property-boundary-marker'
};

export function PropertyBoundaryLayer({ bounds, filters, onPropertyClick }: PropertyBoundaryLayerProps) {
  const { current: map } = useMap();
  const [layersLoaded, setLayersLoaded] = useState(false);
  const [polygonGeojson, setPolygonGeojson] = useState<GeoJSON.FeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });

  const [pointGeojson, setPointGeojson] = useState<GeoJSON.FeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });

  // Query properties with filters within bounds
  const { data: propertiesWithBoundaries } = useQuery({
    queryKey: ['propertiesWithBoundaries', bounds, filters],
    queryFn: async () => {
      const [minLng, minLat, maxLng, maxLat] = bounds;
      const params = new URLSearchParams({
        bounds: `${minLng},${minLat},${maxLng},${maxLat}`
      });

      // Add filters if they exist
      if (filters.statuses.length > 0) {
        params.append('statuses', filters.statuses.join(','));
      }
      if (filters.types.length > 0) {
        params.append('types', filters.types.join(','));
      }

      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/boundaries?${params}`);
      if (!response.ok) {
        console.error('Failed to fetch property boundaries:', response.statusText);
        throw new Error('Failed to fetch property boundaries');
      }
      return response.json() as Promise<PropertyWithBoundary[]>;
    },
    enabled: bounds.length === 4
  });

  // Update GeoJSON when properties data changes
  useEffect(() => {
    if (!propertiesWithBoundaries) return;

    // Create polygon features from boundaries
    const polygonFeatures = propertiesWithBoundaries
      .filter(property => property.boundary)
      .map(property => property.boundary!);

    // Create point features from locations
    const pointFeatures = propertiesWithBoundaries
      .filter(property => property.location)
      .map(property => property.location!);

    setPolygonGeojson({
      type: 'FeatureCollection',
      features: polygonFeatures
    });

    setPointGeojson({
      type: 'FeatureCollection',
      features: pointFeatures
    });
  }, [propertiesWithBoundaries]);

  // Monitor layer loading
  useEffect(() => {
    if (!map) return;

    const checkLayers = () => {
      const hasLayers = [LAYER_IDS.fill, LAYER_IDS.marker].every(id => {
        try {
          return map.getLayer(id);
        } catch {
          return false;
        }
      });
      console.log('Checking layers:', hasLayers);
      setLayersLoaded(hasLayers);
    };

    map.on('styledata', checkLayers);
    checkLayers();

    return () => {
      map.off('styledata', checkLayers);
    };
  }, [map]);

  // Set up click handler
  useEffect(() => {
    if (!map || !onPropertyClick || !layersLoaded) return;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [LAYER_IDS.fill, LAYER_IDS.marker]
      });

      if (features.length > 0) {
        const feature = features[0];
        const propertyId = feature.properties?.property_id;
        const geometry = feature.geometry;

        if (propertyId && geometry) {
          console.log('Property boundary clicked:', propertyId, 'with geometry:', geometry);
          // For points, use the point coordinates
          // For polygons, use the centroid or first coordinate
          let coordinates: [number, number];
          if (geometry.type === 'Point') {
            coordinates = (geometry as GeoJSON.Point).coordinates as [number, number];
          } else {
            // For polygons, use the first coordinate of the first ring
            coordinates = ((geometry as GeoJSON.Polygon).coordinates[0][0]) as [number, number];
          }
          onPropertyClick(propertyId, coordinates);
        }
      }
    };

    // Add cursor style changes
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    // Add event listeners
    map.on('click', LAYER_IDS.fill, handleClick);
    map.on('click', LAYER_IDS.marker, handleClick);
    map.on('mouseenter', LAYER_IDS.fill, handleMouseEnter);
    map.on('mouseleave', LAYER_IDS.fill, handleMouseLeave);
    map.on('mouseenter', LAYER_IDS.marker, handleMouseEnter);
    map.on('mouseleave', LAYER_IDS.marker, handleMouseLeave);

    return () => {
      map.off('click', LAYER_IDS.fill, handleClick);
      map.off('click', LAYER_IDS.marker, handleClick);
      map.off('mouseenter', LAYER_IDS.fill, handleMouseEnter);
      map.off('mouseleave', LAYER_IDS.fill, handleMouseLeave);
      map.off('mouseenter', LAYER_IDS.marker, handleMouseEnter);
      map.off('mouseleave', LAYER_IDS.marker, handleMouseLeave);
    };
  }, [map, onPropertyClick, layersLoaded]);

  return (
    <>
      {/* Polygon Source */}
      <Source 
        id="property-boundary-source" 
        type="geojson" 
        data={polygonGeojson}
      >
        {/* Polygon fill layer */}
        <Layer
          id={LAYER_IDS.fill}
          type="fill"
          paint={{
            'fill-color': '#4caf50',
            'fill-opacity': 0.2
          }}
        />
        {/* Polygon outline layer */}
        <Layer
          id={LAYER_IDS.outline}
          type="line"
          paint={{
            'line-color': '#4caf50',
            'line-width': 2
          }}
        />
      </Source>

      {/* Point Source */}
      <Source 
        id="property-boundary-point-source" 
        type="geojson" 
        data={pointGeojson}
      >
        {/* Marker layer */}
        <Layer
          id={LAYER_IDS.marker}
          type="circle"
          paint={{
            'circle-radius': 6,
            'circle-color': '#4caf50',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }}
        />
      </Source>
    </>
  );
}
