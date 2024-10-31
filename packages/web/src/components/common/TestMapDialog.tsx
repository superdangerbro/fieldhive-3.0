'use client';

import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import MapDialog from './MapDialog';

export default function TestMapDialog() {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState<[number, number]>([49.2827, -123.1207]);

  const handleLocationSelect = (coordinates: [number, number]) => {
    console.log('Selected coordinates:', coordinates);
    setLocation(coordinates);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Button 
        variant="contained" 
        onClick={() => {
          console.log('Opening map dialog with location:', location);
          setOpen(true);
        }}
      >
        Open Map Dialog
      </Button>

      <Box sx={{ mt: 2 }}>
        Current Location: {location[0].toFixed(6)}, {location[1].toFixed(6)}
      </Box>

      <MapDialog
        open={open}
        onClose={() => {
          console.log('Closing map dialog');
          setOpen(false);
        }}
        initialLocation={location}
        onLocationSelect={handleLocationSelect}
        mode="marker"
        title="Test Map Dialog"
      />
    </Box>
  );
}
