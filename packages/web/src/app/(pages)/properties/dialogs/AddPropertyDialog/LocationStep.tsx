'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import type { PropertyFormData, FormErrors } from './types';
import type { GeoJSONPolygonOrNull } from '../../types/location';
import MapDialog from '../../components/map/MapDialog';
import { displayToGeoJson, safeGeoJsonToDisplay } from '../../types/location';

interface LocationStepProps {
  propertyData: PropertyFormData;
  setPropertyData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  formErrors: FormErrors;
}

const DEFAULT_LOCATION: [number, number] = [49.2827, -123.1207]; // [lat, lng] for MapDialog

export const LocationStep: React.FC<LocationStepProps> = ({
  propertyData,
  setPropertyData,
  formErrors,
}) => {
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [location, setLocation] = useState<[number, number]>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const geocodeAddress = async () => {
      try {
        const { serviceAddress } = propertyData;
        const addressString = [
          serviceAddress.address1,
          serviceAddress.address2,
          serviceAddress.city,
          serviceAddress.province,
          serviceAddress.postal_code,
          serviceAddress.country
        ].filter(Boolean).join(', ');

        console.log('Geocoding address:', addressString);

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressString)}.json?access_token=${token}&limit=1`
        );

        if (!response.ok) {
          throw new Error('Geocoding failed');
        }

        const data = await response.json();
        if (data.features?.[0]?.center) {
          const [lng, lat] = data.features[0].center;
          setLocation([lat, lng]); // Store as [lat, lng] for MapDialog
        } else {
          throw new Error('No results found');
        }
      } catch (error) {
        console.warn('Geocoding error:', error);
        console.log('Using default Vancouver coordinates');
        setLocation(DEFAULT_LOCATION);
      } finally {
        setLoading(false);
      }
    };

    geocodeAddress();
  }, [propertyData.serviceAddress]);

  const handleLocationSelect = (coordinates: [number, number]) => {
    // Convert from MapDialog [lat, lng] to GeoJSON [lng, lat]
    const geoJsonCoords = displayToGeoJson(coordinates);
    setPropertyData(prev => ({
      ...prev,
      location: {
        type: 'Point',
        coordinates: geoJsonCoords
      }
    }));
    setMapDialogOpen(false);
  };

  const getDisplayCoordinates = () => {
    if (!propertyData.location?.coordinates) return 'Not set';
    const displayCoords = safeGeoJsonToDisplay(propertyData.location.coordinates);
    if (!displayCoords) return 'Invalid coordinates';
    return `${displayCoords[0].toFixed(6)}, ${displayCoords[1].toFixed(6)}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Property Location
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Please verify the property location on the map. The initial location is based on the service address, but you can adjust it by clicking on the map or dragging the marker.
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => setMapDialogOpen(true)}
          sx={{
            backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
            textTransform: 'none'
          }}
        >
          Set Location
        </Button>
        
        <Typography variant="body2" color="text.secondary">
          {getDisplayCoordinates()}
        </Typography>
      </Box>

      {formErrors.location && (
        <Typography color="error" variant="caption">
          {formErrors.location}
        </Typography>
      )}

      <MapDialog
        open={mapDialogOpen}
        onClose={() => setMapDialogOpen(false)}
        initialLocation={location}
        onLocationSelect={handleLocationSelect}
        mode="marker"
        title="Set Property Location"
      />
    </Box>
  );
};
