'use client';

import React from 'react';
import { Marker } from 'react-map-gl';
import { Box } from '@mui/material';

interface UserLocationMarkerProps {
  longitude: number;
  latitude: number;
  heading?: number | null;
}

export function UserLocationMarker({ longitude, latitude, heading }: UserLocationMarkerProps) {
  return (
    <Marker longitude={longitude} latitude={latitude}>
      <Box sx={{ position: 'relative' }}>
        {/* Direction indicator */}
        {heading !== null && heading !== undefined && (
          <Box
            sx={{
              position: 'absolute',
              top: -16,
              left: -8,
              width: 16,
              height: 16,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              backgroundColor: '#3b82f6',
              transform: `rotate(${heading}deg)`,
              transformOrigin: 'center bottom',
              transition: 'transform 0.3s ease-out',
              zIndex: 2,
            }}
          />
        )}

        {/* Location dot */}
        <Box
          sx={{
            width: 12,
            height: 12,
            backgroundColor: '#3b82f6',
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 0 0 2px #3b82f6',
          }}
        />
      </Box>
    </Marker>
  );
}
