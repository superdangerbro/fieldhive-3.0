'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Layer, Source, useMap } from 'react-map-gl';
import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../../app/config/environment';

interface JobFilters {
  statuses: string[];
  types: string[];
}

interface JobsLayerProps {
  bounds: [number, number, number, number];
  filters: JobFilters;
  selectedJobId?: string;
  onJobSelect?: (jobId: string) => void;
}

interface PropertyWithJob {
  property_id: string;
  job_id: string;
  boundary: {
    type: 'Feature';
    geometry: GeoJSON.Geometry;
    properties: {
      property_id: string;
      job_id: string;
    };
  } | null;
  location: {
    type: 'Point';
    coordinates: [number, number];
  } | null;
}

export function JobsLayer({ bounds, filters, selectedJobId, onJobSelect }: JobsLayerProps) {
  const { current: map } = useMap();
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

  // Handle click events
  useEffect(() => {
    if (!map || !onJobSelect) return;

    const handleClick = (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['jobs-fill', 'jobs-marker']
      });

      if (features.length > 0) {
        const jobId = features[0].properties?.job_id;
        if (jobId) {
          onJobSelect(jobId);
        }
      }
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onJobSelect]);

  // Update GeoJSON when properties data changes
  useEffect(() => {
    if (!propertiesWithJobs) return;

    // Create polygon features
    const polygonFeatures = propertiesWithJobs
      .filter(property => property.boundary)
      .map(property => ({
        ...property.boundary!,
        properties: {
          ...property.boundary!.properties,
          job_id: property.job_id,
          isSelected: property.job_id === selectedJobId
        }
      }));

    // Create point features
    const pointFeatures: GeoJSON.Feature[] = propertiesWithJobs
      .filter(property => property.location)
      .map(property => ({
        type: 'Feature',
        geometry: property.location!,
        properties: {
          property_id: property.property_id,
          job_id: property.job_id,
          isSelected: property.job_id === selectedJobId
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
  }, [propertiesWithJobs, selectedJobId]);

  // Set cursor style on hover
  useEffect(() => {
    if (!map) return;

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('mouseenter', 'jobs-fill', handleMouseEnter);
    map.on('mouseenter', 'jobs-marker', handleMouseEnter);
    map.on('mouseleave', 'jobs-fill', handleMouseLeave);
    map.on('mouseleave', 'jobs-marker', handleMouseLeave);

    return () => {
      map.off('mouseenter', 'jobs-fill', handleMouseEnter);
      map.off('mouseenter', 'jobs-marker', handleMouseEnter);
      map.off('mouseleave', 'jobs-fill', handleMouseLeave);
      map.off('mouseleave', 'jobs-marker', handleMouseLeave);
    };
  }, [map]);

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
            'fill-color': [
              'case',
              ['get', 'isSelected'],
              '#f59e0b', // Selected color
              '#ff9800'  // Default color
            ],
            'fill-opacity': [
              'case',
              ['get', 'isSelected'],
              0.3,  // Selected opacity
              0.2   // Default opacity
            ]
          }}
        />
        {/* Polygon outline layer */}
        <Layer
          id="jobs-outline"
          type="line"
          paint={{
            'line-color': [
              'case',
              ['get', 'isSelected'],
              '#f59e0b', // Selected color
              '#ff9800'  // Default color
            ],
            'line-width': [
              'case',
              ['get', 'isSelected'],
              3,    // Selected width
              2     // Default width
            ]
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
            'circle-radius': [
              'case',
              ['get', 'isSelected'],
              8,    // Selected radius
              6     // Default radius
            ],
            'circle-color': [
              'case',
              ['get', 'isSelected'],
              '#f59e0b', // Selected color
              '#ff9800'  // Default color
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }}
        />
      </Source>
    </>
  );
}
