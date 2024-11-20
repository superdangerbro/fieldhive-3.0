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
  boundary: GeoJSON.Feature;
}

export function JobsLayer({ bounds, filters }: JobsLayerProps) {
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection>({
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

    const features = propertiesWithJobs.map(property => ({
      ...property.boundary,
      properties: {
        ...property.boundary.properties,
        property_id: property.property_id
      }
    }));

    setGeojson({
      type: 'FeatureCollection',
      features
    });
  }, [propertiesWithJobs]);

  if (!propertiesWithJobs?.length) return null;

  return (
    <Source id="jobs-source" type="geojson" data={geojson}>
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
  );
}
