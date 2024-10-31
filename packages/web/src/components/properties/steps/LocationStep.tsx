'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { Point } from 'geojson';
import { PropertyFormData } from '../types';
import MapDialog from '../../common/MapDialog';

interface LocationStepProps {
  propertyData: PropertyFormData;
  setPropertyData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  formErrors: Record<string, string>;
}

const DEFAULT_LOCATION: [number, number] = [49.2827, -123.1207]; // Vancouver

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
        // If we already have coordinates, use them
        if (propertyData.location?.coordinates) {
          const [lng, lat] = propertyData.location.coordinates;
          console.log('Using existing coordinates:', [lat, lng]);
          setLocation([lat, lng]);
          setLoading(false);
          return;
        }

        const { serviceAddress } = propertyData;
        const addressString = [
          serviceAddress.address1,
          serviceAddress.address2,
          serviceAddress.city,
          serviceAddress.province,
          serviceAddress.postalCode,
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
          console.log('Geocoded coordinates:', [lat, lng]);
          setLocation([lat, lng]);
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
  }, [propertyData.serviceAddress, propertyData.location]);

  const handleLocationSelect = (coordinates: [number, number]) => {
    console.log('Selected coordinates:', coordinates);
    const point: Point = {
      type: 'Point',
      coordinates: [coordinates[1], coordinates[0]], // Convert [lat, lng] to GeoJSON [lng, lat]
    };
    
    setPropertyData(prev => ({
      ...prev,
      location: point
    }));
    setMapDialogOpen(false);
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
          onClick={() => {
            console.log('Opening map dialog with location:', location);
            setMapDialogOpen(true);
          }}
          sx={{
            backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
            textTransform: 'none'
          }}
        >
          Set Location
        </Button>
        
        <Typography variant="body2" color="text.secondary">
          {propertyData.location ? (
            `${propertyData.location.coordinates[1].toFixed(6)}, ${propertyData.location.coordinates[0].toFixed(6)}`
          ) : (
            'Not set'
          )}
        </Typography>
      </Box>

      {formErrors.location && (
        <Typography color="error" variant="caption">
          {formErrors.location}
        </Typography>
      )}

      <MapDialog
        open={mapDialogOpen}
        onClose={() => {
          console.log('Closing map dialog');
          setMapDialogOpen(false);
        }}
        initialLocation={location}
        onLocationSelect={handleLocationSelect}
        mode="marker"
        title="Set Property Location"
      />
    </Box>
  );
};
