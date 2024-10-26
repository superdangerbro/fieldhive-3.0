'use client';

import React from 'react';
import { Stack, Paper, IconButton, Fab } from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface MapControlsProps {
  onStyleChange: () => void;
  onTrackingToggle: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAdd?: () => void;
  isTracking: boolean;
}

const ControlButton = ({ children, ...props }: React.ComponentProps<typeof IconButton>) => (
  <IconButton
    size="small"
    {...props}
    sx={{ 
      color: 'white',
      padding: 1,
      borderRadius: 0,
      minWidth: 40,
      minHeight: 40,
      '&:hover': { 
        backgroundColor: 'rgba(255, 255, 255, 0.1)' 
      },
      ...props.sx
    }}
  >
    {children}
  </IconButton>
);

const MapControl = ({ children }: { children: React.ReactNode }) => (
  <Paper
    elevation={3}
    sx={{
      backgroundColor: 'rgb(35, 35, 35)',
      borderRadius: '4px',
      width: 40,
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
    }}
  >
    {children}
  </Paper>
);

export function MapControls({ 
  onStyleChange, 
  onTrackingToggle, 
  onZoomIn,
  onZoomOut,
  onAdd,
  isTracking 
}: MapControlsProps) {
  return (
    <>
      <Stack
        spacing={1}
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
        }}
      >
        <MapControl>
          <ControlButton onClick={onStyleChange}>
            <LayersIcon sx={{ fontSize: 20 }} />
          </ControlButton>
        </MapControl>

        <MapControl>
          <ControlButton 
            onClick={onTrackingToggle}
            sx={{ 
              color: isTracking ? '#3b82f6' : 'white',
              '&:hover': {
                backgroundColor: isTracking ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <MyLocationIcon 
              sx={{ 
                fontSize: 20,
                transform: isTracking ? 'none' : 'rotate(45deg)',
                transition: 'transform 0.2s ease-in-out'
              }} 
            />
          </ControlButton>
        </MapControl>

        <MapControl>
          <Stack>
            <ControlButton onClick={onZoomIn} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <AddIcon sx={{ fontSize: 20 }} />
            </ControlButton>
            <ControlButton onClick={onZoomOut}>
              <RemoveIcon sx={{ fontSize: 20 }} />
            </ControlButton>
          </Stack>
        </MapControl>
      </Stack>

      {onAdd && (
        <Fab
          color="primary"
          onClick={onAdd}
          sx={{
            position: 'absolute',
            bottom: 32,
            right: 32,
            zIndex: 1000,
            width: 72,
            height: 72,
            backgroundColor: '#3b82f6',
            '&:hover': {
              backgroundColor: '#2563eb'
            }
          }}
        >
          <AddIcon sx={{ fontSize: 36 }} />
        </Fab>
      )}
    </>
  );
}
