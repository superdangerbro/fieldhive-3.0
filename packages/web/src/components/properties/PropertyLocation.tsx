'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Stack } from '@mui/material';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import type { Property } from '@fieldhive/shared';

interface PropertyLocationProps {
  property: Property;
  onMapClick: () => void;
}

const APP_THEME_COLOR = '#6366f1';
const DEFAULT_LOCATION: [number, number] = [-123.1207, 49.2827]; // Vancouver [lng, lat]

function formatLocation(location: any) {
  if (!location?.coordinates || !Array.isArray(location.coordinates)) {
    return 'Not set';
  }
  // Display as "lat, lng" for readability
  return `${location.coordinates[1].toFixed(6)}, ${location.coordinates[0].toFixed(6)}`;
}

function isValidGeoJSON(geojson: any) {
  return geojson && 
         typeof geojson === 'object' &&
         geojson.type === 'Feature' &&
         geojson.geometry &&
         typeof geojson.geometry === 'object' &&
         (geojson.geometry.type === 'Point' || geojson.geometry.type === 'Polygon') &&
         Array.isArray(geojson.geometry.coordinates);
}

export default function PropertyLocation({ property, onMapClick }: PropertyLocationProps) {
  const [cssLoaded, setCssLoaded] = useState(false);
  
  useEffect(() => {
    // Add Mapbox CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
    document.head.appendChild(link);

    // Wait for CSS to load
    link.onload = () => {
      console.log('Mapbox CSS loaded');
      setCssLoaded(true);
    };

    return () => {
      // Remove CSS when component unmounts
      document.head.removeChild(link);
      setCssLoaded(false);
    };
  }, []);

  // Use property location if available, otherwise use default Vancouver location
  const coordinates = property.location?.coordinates || DEFAULT_LOCATION;

  // Create valid GeoJSON for the boundary
  const boundaryGeoJSON = property.boundary ? {
    type: 'Feature',
    geometry: property.boundary,
    properties: {}
  } : null;

  return (
    <Paper sx={{ p: 2 }}>
      <Box 
        sx={{ height: 300, mb: 2, cursor: 'pointer', borderRadius: 1, overflow: 'hidden' }} 
        onClick={onMapClick}
      >
        {cssLoaded && (
          <Map
            initialViewState={{
              longitude: coordinates[0],
              latitude: coordinates[1],
              zoom: 17
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            interactive={false}
          >
            <Marker
              longitude={coordinates[0]}
              latitude={coordinates[1]}
              color={APP_THEME_COLOR}
            />
            {boundaryGeoJSON && isValidGeoJSON(boundaryGeoJSON) && (
              <Source
                type="geojson"
                data={boundaryGeoJSON}
              >
                <Layer
                  id="polygon"
                  type="fill"
                  paint={{
                    'fill-color': APP_THEME_COLOR,
                    'fill-opacity': 0.3
                  }}
                />
                <Layer
                  id="polygon-outline"
                  type="line"
                  paint={{
                    'line-color': APP_THEME_COLOR,
                    'line-width': 2
                  }}
                />
              </Source>
            )}
          </Map>
        )}
      </Box>

      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">Location</Typography>
          <Typography variant="body2">
            {formatLocation(property.location)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary">Boundary</Typography>
          <Typography variant="body2">
            {property.boundary ? 'Set' : 'Not set'}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
