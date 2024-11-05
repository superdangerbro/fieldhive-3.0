'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Stack, Button, CircularProgress } from '@mui/material';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import type { Property } from '../../../globalTypes/property';
import MapDialog from '../dialogs/MapDialog';
import EditIcon from '@mui/icons-material/Edit';
import { usePropertyLocation, useUpdatePropertyLocation, useUpdatePropertyBoundary } from '../hooks/usePropertyLocation';

interface PropertyLocationProps {
  property: Property;
}

const APP_THEME_COLOR = '#6366f1';

// Default location from environment variables
const DEFAULT_LOCATION: [number, number] = [
  Number(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE) || -123.1207,
  Number(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE) || 49.2827
];

const DEFAULT_ZOOM = Number(process.env.NEXT_PUBLIC_DEFAULT_ZOOM) || 12;

// Helper function to format coordinates
const formatCoordinates = (coords: [number, number]) => {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) {
    return 'Not set';
  }
  try {
    // GeoJSON format is [longitude, latitude]
    const [longitude, latitude] = coords;
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    console.error('Error formatting coordinates:', error);
    return 'Invalid format';
  }
};

export default function PropertyLocation({ property }: PropertyLocationProps) {
  const [cssLoaded, setCssLoaded] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [boundaryDialogOpen, setBoundaryDialogOpen] = useState(false);

  // React Query hooks
  const { 
    data: locationData, 
    isLoading,
    error: queryError 
  } = usePropertyLocation(property.property_id);

  const { 
    mutate: updateLocation,
    isPending: isUpdatingLocation,
    error: updateLocationError
  } = useUpdatePropertyLocation();

  const { 
    mutate: updateBoundary,
    isPending: isUpdatingBoundary,
    error: updateBoundaryError
  } = useUpdatePropertyBoundary();
  
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

  const handleLocationSelect = (coordinates: [number, number]) => {
    // Convert [lat, lng] to [lng, lat] for GeoJSON
    const geoJsonCoords: [number, number] = [coordinates[1], coordinates[0]];
    updateLocation(
      { propertyId: property.property_id, coordinates: geoJsonCoords },
      {
        onSuccess: () => {
          setLocationDialogOpen(false);
        }
      }
    );
  };

  const handleBoundarySelect = (polygon: any) => {
    if (!polygon?.coordinates?.[0]) {
      return;
    }

    // Convert coordinates from [lat, lng] to [lng, lat] for GeoJSON
    const geoJsonCoords = polygon.coordinates[0].map((coord: [number, number]) => [coord[1], coord[0]]);

    updateBoundary(
      { propertyId: property.property_id, coordinates: geoJsonCoords },
      {
        onSuccess: () => {
          setBoundaryDialogOpen(false);
        }
      }
    );
  };

  const getErrorMessage = (error: Error | null) => {
    if (!error) return null;
    return error instanceof Error ? error.message : 'An unexpected error occurred';
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  // Get coordinates from locationData or use default
  // Convert from GeoJSON [lng, lat] to [lat, lng] for display
  const coordinates = locationData?.location?.geometry?.coordinates 
    ? [locationData.location.geometry.coordinates[1], locationData.location.geometry.coordinates[0]]
    : DEFAULT_LOCATION;

  return (
    <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
      {/* Left side - Location and boundary information */}
      <Box sx={{ flex: 1 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>Location</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 140, fontFamily: 'monospace' }}>
                {locationData?.location ? formatCoordinates(locationData.location.geometry.coordinates) : 'Not set'}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setLocationDialogOpen(true)}
                disabled={isUpdatingLocation}
              >
                {locationData?.location ? 'Edit Location' : 'Add Location'}
              </Button>
            </Stack>
            {updateLocationError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {getErrorMessage(updateLocationError as Error)}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>Boundary</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 140, fontFamily: 'monospace' }}>
                {locationData?.boundary 
                  ? `${locationData.boundary.geometry.coordinates[0].length - 1} points` 
                  : 'Not set'}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setBoundaryDialogOpen(true)}
                disabled={isUpdatingBoundary}
              >
                {locationData?.boundary ? 'Edit Boundary' : 'Add Boundary'}
              </Button>
            </Stack>
            {updateBoundaryError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {getErrorMessage(updateBoundaryError as Error)}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Right side - Map */}
      <Box sx={{ flex: 1, height: 300, borderRadius: 1, overflow: 'hidden' }}>
        {cssLoaded && (
          <Map
            initialViewState={{
              longitude: coordinates[1],  // Use longitude for x-coordinate
              latitude: coordinates[0],   // Use latitude for y-coordinate
              zoom: locationData?.location ? 17 : DEFAULT_ZOOM
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            interactive={true}
          >
            {locationData?.location && (
              <Marker
                longitude={locationData.location.geometry.coordinates[0]}  // Use longitude from GeoJSON
                latitude={locationData.location.geometry.coordinates[1]}   // Use latitude from GeoJSON
                color={APP_THEME_COLOR}
              />
            )}
            {locationData?.boundary && (
              <Source
                type="geojson"
                data={locationData.boundary}
              >
                <Layer
                  id="boundary-fill"
                  type="fill"
                  paint={{
                    'fill-color': APP_THEME_COLOR,
                    'fill-opacity': 0.3
                  }}
                />
                <Layer
                  id="boundary-line"
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

      {/* Location Dialog */}
      <MapDialog
        open={locationDialogOpen}
        onClose={() => setLocationDialogOpen(false)}
        initialLocation={coordinates}
        mode="marker"
        onLocationSelect={handleLocationSelect}
        title={locationData?.location ? 'Edit Property Location' : 'Add Property Location'}
      />

      {/* Boundary Dialog */}
      <MapDialog
        open={boundaryDialogOpen}
        onClose={() => setBoundaryDialogOpen(false)}
        initialLocation={coordinates}
        mode="polygon"
        onBoundarySelect={handleBoundarySelect}
        initialBoundary={locationData?.boundary?.geometry}
        title={locationData?.boundary ? 'Edit Property Boundary' : 'Add Property Boundary'}
      />
    </Paper>
  );
}
