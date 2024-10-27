'use client';

import React from 'react';
import { Stack, Paper, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PentagonIcon from '@mui/icons-material/Pentagon';

interface PropertyMapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDrawToggle: () => void;
  onClear: () => void;
  onRecenter: () => void;
  isDrawing: boolean;
}

const ControlButton = ({ children, title, ...props }: React.ComponentProps<typeof IconButton> & { title?: string }) => (
  <Tooltip title={title} placement="left">
    <IconButton
      size="small"
      {...props}
      sx={{ 
        color: 'white',
        padding: 1,
        borderRadius: 0,
        minWidth: 40,
        minHeight: 40,
        transition: 'all 0.2s ease',
        '&:hover': { 
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          transform: 'scale(1.05)'
        },
        ...props.sx
      }}
    >
      {children}
    </IconButton>
  </Tooltip>
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
      transition: 'transform 0.2s ease',
      '&:hover': {
        transform: 'scale(1.02)'
      }
    }}
  >
    {children}
  </Paper>
);

export default function PropertyMapControls({
  onZoomIn,
  onZoomOut,
  onDrawToggle,
  onClear,
  onRecenter,
  isDrawing,
}: PropertyMapControlsProps) {
  return (
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
        <ControlButton 
          onClick={onDrawToggle}
          title={isDrawing ? "Finish Drawing" : "Draw Boundary"}
          sx={{ 
            color: isDrawing ? '#3b82f6' : 'white',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: isDrawing ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.1)'
            },
            animation: isDrawing ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)'
              },
              '70%': {
                boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)'
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)'
              }
            }
          }}
        >
          {isDrawing ? <EditIcon sx={{ fontSize: 20 }} /> : <PentagonIcon sx={{ fontSize: 20 }} />}
        </ControlButton>
        <ControlButton 
          onClick={onClear}
          title="Clear Drawing"
        >
          <DeleteIcon sx={{ fontSize: 20 }} />
        </ControlButton>
      </MapControl>

      <MapControl>
        <Stack>
          <ControlButton 
            onClick={onZoomIn} 
            title="Zoom In"
            sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <AddIcon sx={{ fontSize: 20 }} />
          </ControlButton>
          <ControlButton 
            onClick={onZoomOut}
            title="Zoom Out"
          >
            <RemoveIcon sx={{ fontSize: 20 }} />
          </ControlButton>
        </Stack>
      </MapControl>

      <MapControl>
        <ControlButton 
          onClick={onRecenter}
          title="Center on Property"
        >
          <MyLocationIcon sx={{ fontSize: 20 }} />
        </ControlButton>
      </MapControl>
    </Stack>
  );
}
