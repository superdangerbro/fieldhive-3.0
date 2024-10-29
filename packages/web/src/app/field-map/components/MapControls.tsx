'use client';

import React from 'react';
import { Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MapIcon from '@mui/icons-material/Map';

interface MapControlsProps {
  onStyleChange: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isTracking: boolean;
}

export function MapControls({
  onStyleChange,
  onZoomIn,
  onZoomOut
}: MapControlsProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 90,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        zIndex: 1000,
        '& .MuiIconButton-root': {
          width: 40,
          height: 40,
          color: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }
      }}
    >
      <IconButton
        onClick={onStyleChange}
        sx={{
          borderRadius: '50%',
          bgcolor: '#0369a1', // Darker blue
          '&:hover': {
            bgcolor: '#075985',
          },
        }}
      >
        <MapIcon />
      </IconButton>

      <IconButton
        onClick={onZoomIn}
        sx={{
          borderRadius: '50%',
          bgcolor: '#0284c7', // Medium blue
          '&:hover': {
            bgcolor: '#0369a1',
          },
        }}
      >
        <AddIcon />
      </IconButton>

      <IconButton
        onClick={onZoomOut}
        sx={{
          borderRadius: '50%',
          bgcolor: '#0ea5e9', // Light blue
          '&:hover': {
            bgcolor: '#0284c7',
          },
        }}
      >
        <RemoveIcon />
      </IconButton>
    </Box>
  );
}
