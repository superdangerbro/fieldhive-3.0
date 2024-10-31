'use client';

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import dynamic from 'next/dynamic';
import { Point } from 'geojson';
import { PropertyFormData } from '../types';

const MapDialog = dynamic(() => import('../../common/MapDialog'), { ssr: false });

interface LocationStepProps {
  propertyData: PropertyFormData;
  setPropertyData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  formErrors: Record<string, string>;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  propertyData,
  setPropertyData,
  formErrors,
}) => {
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  const handleLocationSelect = (coordinates: [number, number]) => {
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

  const getInitialLocation = (): [number, number] | undefined => {
    if (propertyData.location?.coordinates) {
      // Convert GeoJSON [lng, lat] to [lat, lng] for the map
      return [propertyData.location.coordinates[1], propertyData.location.coordinates[0]];
    }
    return undefined;
  };

  const formatLocation = (location: Point | null) => {
    if (!location?.coordinates) return 'Not set';
    return `${location.coordinates[1].toFixed(6)}, ${location.coordinates[0].toFixed(6)}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Property Location
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Please select the exact location of the property on the map. Click the button below to open the map and place a marker.
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
          {propertyData.location ? 'Change Location' : 'Select Location'}
        </Button>
        
        <Typography variant="body2" color="text.secondary">
          Current location: {formatLocation(propertyData.location)}
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
        initialLocation={getInitialLocation()}
        onLocationSelect={handleLocationSelect}
        mode="marker"
        title="Select Property Location"
      />
    </Box>
  );
};
