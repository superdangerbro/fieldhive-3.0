'use client';

import React from 'react';
import { Box, IconButton, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MapIcon from '@mui/icons-material/Map';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LocationOnIcon from '@mui/icons-material/LocationOn';

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
  onZoomOut,
  isTracking
}: MapControlsProps) {
  return (
    <Box sx={{ position: 'absolute', top: 80, right: 16, zIndex: 1500 }}>
      {/* Main controls */}
      <Stack
        direction="column"
        spacing={1}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 1,
          p: 0.5,
          boxShadow: 2,
          mb: isTracking ? 1 : 0
        }}
      >
        <IconButton onClick={onStyleChange} size="small">
          <DarkModeIcon />
        </IconButton>
        <IconButton onClick={onZoomIn} size="small">
          <AddIcon />
        </IconButton>
        <IconButton onClick={onZoomOut} size="small">
          <RemoveIcon />
        </IconButton>
      </Stack>

      {/* Tracking control in separate container */}
      {isTracking && (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 1,
            p: 0.5,
            boxShadow: 2,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <IconButton size="small" sx={{ color: 'primary.main' }}>
            <LocationOnIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
