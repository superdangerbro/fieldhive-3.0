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
  onPropertyClick?: (propertyId: string) => void;
}

interface PropertyWithBoundary {
  property_id: string;
  boundary: GeoJSON.Feature;
  location: {
    type: 'Point';
    coordinates: [number, number];
  } | null;
}

export function PropertyBoundaryLayer({ bounds, filters, onPropertyClick }: PropertyBoundaryLayerProps) {
  const { current: map } = useMap();
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

      // Only add non-empty filters
      if (filters.statuses.length > 0) {
        params.append('statuses', filters.statuses.join(','));
      }
      if (filters.types.length > 0) {
        params.append('types', filters.types.join(','));
      }

      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/boundaries?${params}`);
      if (!response.ok) throw new Error('Failed to fetch property boundaries');
      return response.json() as Promise<PropertyWithBoundary[]>;
    },
    // Only run query if we have filters selected
    enabled: (filters.statuses.length > 0 || filters.types.length > 0) && bounds.length === 4
  });

  // Update GeoJSON when properties data changes
  useEffect(() => {
    if (!propertiesWithBoundaries) return;

    // Create polygon features
    const polygonFeatures = propertiesWithBoundaries
      .filter(property => property.boundary)
      .map(property => ({
        ...property.boundary,
        properties: {
          ...property.boundary.properties,
          property_id: property.property_id
        }
      }));

    // Create point features
    const pointFeatures: GeoJSON.Feature[] = propertiesWithBoundaries
      .filter(property => property.location)
      .map(property => ({
        type: 'Feature',
        geometry: property.location!,
        properties: {
          property_id: property.property_id
        }
      }));

    setPolygonGeojson({
      type: 'FeatureCollection',
      features: polygonFeatures
    });

    setPointGeojson({
      type: 'FeatureCollection',
      features: pointFeatures
    });
  }, [propertiesWithBoundaries]);

  // Set up click handler
  useEffect(() => {
    if (!map || !onPropertyClick) return;

    const handleClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['property-boundary-fill', 'property-boundary-marker']
      });

      if (features.length > 0) {
        const propertyId = features[0].properties?.property_id;
        if (propertyId) {
          onPropertyClick(propertyId);
        }
      }
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onPropertyClick]);

  if (!propertiesWithBoundaries?.length) return null;

  return (
    <>
      {/* Polygon Source */}
      <Source id="property-boundary-source" type="geojson" data={polygonGeojson}>
        {/* Polygon fill layer */}
        <Layer
          id="property-boundary-fill"
          type="fill"
          paint={{
            'fill-color': '#4caf50',
            'fill-opacity': 0.2
          }}
        />
        {/* Polygon outline layer */}
        <Layer
          id="property-boundary-outline"
          type="line"
          paint={{
            'line-color': '#4caf50',
            'line-width': 2
          }}
        />
      </Source>

      {/* Point Source */}
      <Source id="property-boundary-point-source" type="geojson" data={pointGeojson}>
        {/* Marker layer */}
        <Layer
          id="property-boundary-marker"
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
