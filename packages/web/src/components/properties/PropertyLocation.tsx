'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Stack, Button } from '@mui/material';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import type { Property } from '@fieldhive/shared';
import MapDialog from '../common/MapDialog';
import EditIcon from '@mui/icons-material/Edit';
import { getPropertyLocation } from '../../services/api';
import { PropertyLocationUpdater } from './PropertyLocationUpdater';

interface PropertyLocationProps {
  property: Property;
  onUpdate?: () => void;
}

const APP_THEME_COLOR = '#6366f1';
const DEFAULT_LOCATION: [number, number] = [-123.1207, 49.2827]; // Vancouver [lng, lat]

export default function PropertyLocation({ property, onUpdate }: PropertyLocationProps) {
  const [cssLoaded, setCssLoaded] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [boundaryDialogOpen, setBoundaryDialogOpen] = useState(false);
  const [locationData, setLocationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locationUpdater = new PropertyLocationUpdater(property.property_id);
  
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

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await getPropertyLocation(property.property_id);
        console.log('Location data:', response);
        setLocationData(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching location data:', error);
        setError('Failed to load location data');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [property.property_id]);

  if (loading || !locationData) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography>Loading location data...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  const coordinates = locationData.location.geometry.coordinates;
  const initialLocation: [number, number] = [coordinates[1], coordinates[0]]; // Convert to [lat, lng]

  const handleLocationSelect = async (coordinates: [number, number]) => {
    try {
      const updatedData = await locationUpdater.updateLocation(coordinates);
      setLocationData(updatedData);
      setError(null);
      if (onUpdate) onUpdate();
      setLocationDialogOpen(false);
    } catch (error) {
      console.error('Failed to update location:', error);
      setError('Failed to update location');
    }
  };

  const handleBoundarySelect = async (polygon: any) => {
    try {
      if (!polygon?.coordinates?.[0]) {
        setError('Invalid polygon data');
        return;
      }

      const updatedData = await locationUpdater.updateBoundary(polygon.coordinates[0]);
      setLocationData(updatedData);
      setError(null);
      if (onUpdate) onUpdate();
      setBoundaryDialogOpen(false);
    } catch (error) {
      console.error('Failed to update boundary:', error);
      setError('Failed to update boundary');
    }
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
      {/* Left side - Location and boundary information */}
      <Box sx={{ flex: 1 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>Location</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 140, fontFamily: 'monospace' }}>
                {`${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setLocationDialogOpen(true)}
              >
                Edit Location
              </Button>
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>Boundary</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 140, fontFamily: 'monospace' }}>
                {locationData.boundary 
                  ? `${locationData.boundary.geometry.coordinates[0].length - 1} points` 
                  : 'Not set'}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setBoundaryDialogOpen(true)}
              >
                {locationData.boundary ? 'Edit Boundary' : 'Add Boundary'}
              </Button>
            </Stack>
          </Box>

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Right side - Map */}
      <Box sx={{ flex: 1, height: 300, borderRadius: 1, overflow: 'hidden' }}>
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
            interactive={true}
          >
            <Marker
              longitude={coordinates[0]}
              latitude={coordinates[1]}
              color={APP_THEME_COLOR}
            />
            {locationData.boundary && (
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
        initialLocation={initialLocation}
        mode="marker"
        onLocationSelect={handleLocationSelect}
        title="Edit Property Location"
      />

      {/* Boundary Dialog */}
      <MapDialog
        open={boundaryDialogOpen}
        onClose={() => setBoundaryDialogOpen(false)}
        initialLocation={initialLocation}
        mode="polygon"
        onBoundarySelect={handleBoundarySelect}
        initialBoundary={locationData.boundary?.geometry}
        title="Edit Property Boundary"
      />
    </Paper>
  );
}
