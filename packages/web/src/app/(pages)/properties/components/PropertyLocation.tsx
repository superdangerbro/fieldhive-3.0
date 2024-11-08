'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Paper, Typography, Stack, Button, CircularProgress, Alert } from '@mui/material';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import type { Property } from '@/app/globalTypes/property';
import MapDialog from '../dialogs/MapDialog';
import EditIcon from '@mui/icons-material/Edit';
import { usePropertyLocation, useUpdatePropertyLocation, useUpdatePropertyBoundary } from '../hooks/usePropertyLocation';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface PropertyLocationProps {
  property: Property;
}

interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

interface LocationData {
  location?: {
    geometry: GeoJSONPoint;
  } | null;
  boundary?: {
    geometry: GeoJSONPolygon;
  } | null;
}

const APP_THEME_COLOR = '#6366f1';

// Default location from environment variables
const DEFAULT_LOCATION: [number, number] = [
  Number(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE) || 49.2827,
  Number(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE) || -123.1207
];

const DEFAULT_ZOOM = Number(process.env.NEXT_PUBLIC_DEFAULT_ZOOM) || 12;

// Helper functions
function asTuple<T extends any[]>(arr: T): [number, number] {
  if (!arr || !Array.isArray(arr) || arr.length < 2) {
    console.warn('Invalid coordinates array:', arr);
    return DEFAULT_LOCATION;
  }
  const [first, second] = arr;
  if (typeof first !== 'number' || typeof second !== 'number') {
    console.warn('Invalid coordinate values:', { first, second });
    return DEFAULT_LOCATION;
  }
  return [first, second];
}

function formatCoordinates(coords: [number, number] | undefined | null): string {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) {
    console.warn('Invalid coordinates:', coords);
    return 'Not set';
  }

  try {
    const [longitude, latitude] = coords;
    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      console.warn('Invalid coordinate values:', { longitude, latitude });
      return 'Invalid format';
    }
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    console.error('Error formatting coordinates:', error);
    return 'Invalid format';
  }
}

export default function PropertyLocation({ property }: PropertyLocationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [cssLoaded, setCssLoaded] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [boundaryDialogOpen, setBoundaryDialogOpen] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showBoundaryPrompt, setShowBoundaryPrompt] = useState(false);

  // Update URL when property changes
  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    // Only update if the property_id in URL doesn't match current property
    if (current.get('property_id') !== property.property_id) {
      current.set('property_id', property.property_id);
      const search = current.toString();
      const query = search ? `?${search}` : '';
      
      // Replace instead of push to avoid creating new history entries
      router.replace(`${pathname}${query}`);
    }
  }, [property.property_id, pathname, router, searchParams]);

  // React Query hooks
  const { 
    data: locationData, 
    isLoading,
    error: queryError,
    isError
  } = usePropertyLocation(property.property_id);

  const { 
    mutate: updateLocation,
    isPending: isUpdatingLocation,
    error: updateLocationError,
    reset: resetLocationError
  } = useUpdatePropertyLocation();

  const { 
    mutate: updateBoundary,
    isPending: isUpdatingBoundary,
    error: updateBoundaryError,
    reset: resetBoundaryError
  } = useUpdatePropertyBoundary();

  // Show prompts for missing data after initial load
  useEffect(() => {
    if (!isLoading && !isError && locationData) {
      setShowLocationPrompt(!locationData.location);
      setShowBoundaryPrompt(!locationData.boundary);
    }
  }, [isLoading, isError, locationData]);

  // Log boundary data safely
  useEffect(() => {
    if (locationData?.boundary) {
      try {
        console.log('Received boundary data:', {
          type: locationData.boundary.geometry.type,
          coordinates: locationData.boundary.geometry.coordinates
        });
      } catch (error) {
        console.error('Error logging boundary data:', error);
      }
    }
  }, [locationData]);
  
  useEffect(() => {
    // Add Mapbox CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
    document.head.appendChild(link);

    link.onload = () => {
      console.log('Mapbox CSS loaded');
      setCssLoaded(true);
    };

    return () => {
      document.head.removeChild(link);
      setCssLoaded(false);
    };
  }, []);

  const handleLocationSelect = (coordinates: [number, number]) => {
    console.log('Location selected:', coordinates);
    resetLocationError();
    
    // Convert [lat, lng] to [lng, lat] for GeoJSON
    const geoJsonCoords: [number, number] = asTuple([coordinates[1], coordinates[0]]);
    console.log('Converted to GeoJSON:', geoJsonCoords);
    
    updateLocation(
      { propertyId: property.property_id, coordinates: geoJsonCoords },
      {
        onSuccess: () => {
          setLocationDialogOpen(false);
          setShowLocationPrompt(false);
        },
        onError: (error) => {
          console.error('Failed to update location:', error);
        }
      }
    );
  };

  const handleBoundarySelect = (polygon: GeoJSONPolygon) => {
    console.log('Boundary selected:', polygon);
    resetBoundaryError();
    
    if (!polygon?.coordinates?.[0]) {
      console.warn('Invalid polygon data received');
      return;
    }

    // The coordinates are already in GeoJSON format [lng, lat] from MapDialog
    const geoJsonCoords = polygon.coordinates[0];
    console.log('Boundary coordinates for update:', geoJsonCoords);

    updateBoundary(
      { propertyId: property.property_id, coordinates: geoJsonCoords },
      {
        onSuccess: () => {
          setBoundaryDialogOpen(false);
          setShowBoundaryPrompt(false);
        },
        onError: (error) => {
          console.error('Failed to update boundary:', error);
        }
      }
    );
  };

  const getErrorMessage = (error: Error | null) => {
    if (!error) return null;
    return error instanceof Error ? error.message : 'An unexpected error occurred';
  };

  // Get coordinates safely
  const coordinates: [number, number] = useMemo(() => {
    try {
      if (locationData?.location?.geometry?.coordinates) {
        const [lng, lat] = locationData.location.geometry.coordinates;
        if (typeof lng === 'number' && typeof lat === 'number') {
          return [lat, lng];
        }
      }
      return DEFAULT_LOCATION;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return DEFAULT_LOCATION;
    }
  }, [locationData]);

  // Get boundary data safely
  const boundaryData = useMemo(() => {
    try {
      if (locationData?.boundary?.geometry) {
        return locationData.boundary;
      }
      return null;
    } catch (error) {
      console.error('Error getting boundary data:', error);
      return null;
    }
  }, [locationData]);

  if (isLoading) {
    return (
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (isError) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load property location data. Please try again later.
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
      {/* Left side - Location and boundary information */}
      <Box sx={{ flex: 1 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>Location</Typography>
            {showLocationPrompt && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No location set for this property. Click Add Location to set the property location.
              </Alert>
            )}
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 140, fontFamily: 'monospace' }}>
                {locationData?.location?.geometry?.coordinates 
                  ? formatCoordinates(locationData.location.geometry.coordinates) 
                  : 'Not set'}
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
              <Alert severity="error" sx={{ mt: 1 }}>
                {getErrorMessage(updateLocationError)}
              </Alert>
            )}
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>Boundary</Typography>
            {showBoundaryPrompt && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No boundary set for this property. Click Add Boundary to define the property boundary.
              </Alert>
            )}
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 140, fontFamily: 'monospace' }}>
                {boundaryData?.geometry?.coordinates?.[0] 
                  ? `${boundaryData.geometry.coordinates[0].length - 1} points` 
                  : 'Not set'}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setBoundaryDialogOpen(true)}
                disabled={isUpdatingBoundary}
              >
                {boundaryData ? 'Edit Boundary' : 'Add Boundary'}
              </Button>
            </Stack>
            {updateBoundaryError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {getErrorMessage(updateBoundaryError)}
              </Alert>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Right side - Map */}
      <Box sx={{ flex: 1, height: 300, borderRadius: 1, overflow: 'hidden' }}>
        {cssLoaded && (
          <Map
            key={`${property.property_id}-${coordinates.join(',')}-${boundaryData?.geometry?.coordinates?.[0]?.length}`}
            initialViewState={{
              longitude: coordinates[1],
              latitude: coordinates[0],
              zoom: locationData?.location ? 17 : DEFAULT_ZOOM
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            interactive={true}
          >
            {locationData?.location?.geometry?.coordinates && (
              <Marker
                longitude={locationData.location.geometry.coordinates[0]}
                latitude={locationData.location.geometry.coordinates[1]}
                color={APP_THEME_COLOR}
              />
            )}
            {boundaryData && (
              <Source
                type="geojson"
                data={boundaryData}
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
        onClose={() => {
          setLocationDialogOpen(false);
          resetLocationError();
        }}
        initialLocation={coordinates}
        mode="marker"
        onLocationSelect={handleLocationSelect}
        title={locationData?.location ? 'Edit Property Location' : 'Add Property Location'}
      />

      {/* Boundary Dialog */}
      <MapDialog
        open={boundaryDialogOpen}
        onClose={() => {
          setBoundaryDialogOpen(false);
          resetBoundaryError();
        }}
        initialLocation={coordinates}
        mode="polygon"
        onBoundarySelect={handleBoundarySelect}
        initialBoundary={boundaryData?.geometry}
        title={boundaryData ? 'Edit Property Boundary' : 'Add Property Boundary'}
      />
    </Paper>
  );
}
