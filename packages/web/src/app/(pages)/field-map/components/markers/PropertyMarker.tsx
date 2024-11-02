'use client';

import React from 'react';
import { Marker } from 'react-map-gl';
import { Box, Tooltip, useTheme } from '@mui/material';
import type { MapProperty } from '../../types';

interface PropertyMarkerProps {
  property: MapProperty;
  onClick?: (property: MapProperty) => void;
}

export function PropertyMarker({ property, onClick }: PropertyMarkerProps) {
  const theme = useTheme();
  const [longitude, latitude] = property.location.coordinates;

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      onClick={() => onClick?.(property)}
    >
      <Tooltip title={property.name} arrow placement="top">
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            border: '2px solid white',
            boxShadow: theme.shadows[2],
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.2)',
              boxShadow: theme.shadows[4],
            },
          }}
        />
      </Tooltip>
    </Marker>
  );
}
