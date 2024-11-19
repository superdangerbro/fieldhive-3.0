'use client';

import React, { useEffect, useState } from 'react';
import { Layer, Source } from 'react-map-gl';
import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../../app/config/environment';

interface JobsLayerProps {
  bounds: [number, number, number, number];
}

interface PropertyWithJob {
  property_id: string;
  boundary: GeoJSON.Feature;
}

export function JobsLayer({ bounds }: JobsLayerProps) {
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });

  // Query properties with active jobs within bounds
  const { data: propertiesWithJobs } = useQuery({
    queryKey: ['propertiesWithActiveJobs', bounds],
    queryFn: async () => {
      const [minLng, minLat, maxLng, maxLat] = bounds;
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/with-active-jobs?bounds=${minLng},${minLat},${maxLng},${maxLat}`);
      if (!response.ok) throw new Error('Failed to fetch properties with active jobs');
      return response.json() as Promise<PropertyWithJob[]>;
    }
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
    <Source id="active-jobs-source" type="geojson" data={geojson}>
      {/* Polygon fill layer */}
      <Layer
        id="active-jobs-fill"
        type="fill"
        paint={{
          'fill-color': '#ff9800',
          'fill-opacity': 0.2
        }}
      />
      {/* Polygon outline layer */}
      <Layer
        id="active-jobs-outline"
        type="line"
        paint={{
          'line-color': '#ff9800',
          'line-width': 2
        }}
      />
    </Source>
  );
}
