'use client';

import React from 'react';
import { Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MapIcon from '@mui/icons-material/Map';

interface MapControlsProps {
  /** Handler for changing map style (light/dark) */
  onStyleChange: () => void;
  /** Handler for zooming in */
  onZoomIn: () => void;
  /** Handler for zooming out */
  onZoomOut: () => void;
  /** Whether location tracking is active */
  isTracking: boolean;
}

/**
 * Core map controls component
 * Features:
 * - Style toggle (light/dark)
 * - Zoom controls
 * - Consistent styling
 * - Hover effects
 * - Shadow effects
 * 
 * @component
 * @example
 * ```tsx
 * <MapControls
 *   onStyleChange={handleStyleChange}
 *   onZoomIn={() => map.zoomIn()}
 *   onZoomOut={() => map.zoomOut()}
 *   isTracking={isLocationTracking}
 * />
 * ```
 */
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
      {/* Style toggle button */}
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

      {/* Zoom in button */}
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

      {/* Zoom out button */}
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
