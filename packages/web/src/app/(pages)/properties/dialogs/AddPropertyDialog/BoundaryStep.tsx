'use client';

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Polygon } from 'geojson';
import { PropertyFormData } from '../../types';
import MapDialog from '../MapDialog';

interface BoundaryStepProps {
  propertyData: PropertyFormData;
  setPropertyData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  formErrors: Record<string, string>;
}

const DEFAULT_LOCATION: [number, number] = [49.2827, -123.1207]; // Vancouver

export const BoundaryStep: React.FC<BoundaryStepProps> = ({
  propertyData,
  setPropertyData,
  formErrors,
}) => {
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  const handleBoundarySelect = (polygon: Polygon) => {
    setPropertyData(prev => ({
      ...prev,
      boundary: polygon
    }));
    setMapDialogOpen(false);
  };

  const getInitialLocation = (): [number, number] => {
    // Use the property location as the initial center point for the boundary drawing
    if (propertyData.location?.coordinates) {
      // Convert GeoJSON [lng, lat] to [lat, lng] for the map
      return [propertyData.location.coordinates[1], propertyData.location.coordinates[0]];
    }
    return DEFAULT_LOCATION;
  };

  const formatBoundaryStatus = (boundary: Polygon | null) => {
    if (!boundary) return 'Not drawn';
    const points = boundary.coordinates[0].length - 1; // Subtract 1 because the first and last points are the same
    return `${points} points drawn`;
  };

  const getBoundaryForMap = () => {
    if (!propertyData.boundary) return undefined;
    return {
      type: propertyData.boundary.type,
      coordinates: propertyData.boundary.coordinates as [number, number][][]
    };
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Property Boundary
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Please draw the property boundary on the map. Click the button below to open the map and use the drawing tools to create a polygon around the property boundaries.
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
          {propertyData.boundary ? 'Edit Boundary' : 'Draw Boundary'}
        </Button>
        
        <Typography variant="body2" color="text.secondary">
          Boundary status: {formatBoundaryStatus(propertyData.boundary)}
        </Typography>
      </Box>

      {formErrors.boundary && (
        <Typography color="error" variant="caption">
          {formErrors.boundary}
        </Typography>
      )}

      <MapDialog
        open={mapDialogOpen}
        onClose={() => setMapDialogOpen(false)}
        initialLocation={getInitialLocation()}
        onBoundarySelect={handleBoundarySelect}
        mode="polygon"
        title="Draw Property Boundary"
        initialBoundary={getBoundaryForMap()}
      />
    </Box>
  );
};
