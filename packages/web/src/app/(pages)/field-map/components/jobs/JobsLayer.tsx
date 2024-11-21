'use client';

import React, { useEffect, useState } from 'react';
import { Layer, Source } from 'react-map-gl';
import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../../app/config/environment';

interface JobFilters {
  statuses: string[];
  types: string[];
}

interface JobsLayerProps {
  bounds: [number, number, number, number];
  filters: JobFilters;
}

interface PropertyWithJob {
  property_id: string;
  boundary: {
    type: 'Feature';
    geometry: GeoJSON.Geometry;
    properties: {
      property_id: string;
    };
  } | null;
  location: {
    type: 'Point';
    coordinates: [number, number];
  } | null;
}

export function JobsLayer({ bounds, filters }: JobsLayerProps) {
  const [polygonGeojson, setPolygonGeojson] = useState<GeoJSON.FeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });

  const [pointGeojson, setPointGeojson] = useState<GeoJSON.FeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });

  // Query properties with filtered jobs within bounds
  const { data: propertiesWithJobs } = useQuery({
    queryKey: ['propertiesWithJobs', bounds, filters],
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

      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/with-active-jobs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch properties with jobs');
      return response.json() as Promise<PropertyWithJob[]>;
    },
    // Only run query if we have filters selected
    enabled: (filters.statuses.length > 0 || filters.types.length > 0) && bounds.length === 4
  });

  // Update GeoJSON when properties data changes
  useEffect(() => {
    if (!propertiesWithJobs) return;

    // Create polygon features
    const polygonFeatures = propertiesWithJobs
      .filter(property => property.boundary)
      .map(property => property.boundary!);

    // Create point features
    const pointFeatures: GeoJSON.Feature[] = propertiesWithJobs
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
  }, [propertiesWithJobs]);

  if (!propertiesWithJobs?.length) return null;

  return (
    <>
      {/* Polygon Source */}
      <Source id="jobs-polygon-source" type="geojson" data={polygonGeojson}>
        {/* Polygon fill layer */}
        <Layer
          id="jobs-fill"
          type="fill"
          paint={{
            'fill-color': '#ff9800',
            'fill-opacity': 0.2
          }}
        />
        {/* Polygon outline layer */}
        <Layer
          id="jobs-outline"
          type="line"
          paint={{
            'line-color': '#ff9800',
            'line-width': 2
          }}
        />
      </Source>

      {/* Point Source */}
      <Source id="jobs-point-source" type="geojson" data={pointGeojson}>
        {/* Marker layer */}
        <Layer
          id="jobs-marker"
          type="circle"
          paint={{
            'circle-radius': 6,
            'circle-color': '#ff9800',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }}
        />
      </Source>
    </>
  );
}
