'use client';

import React from 'react';
import { Box, Tooltip } from '@mui/material';

interface EquipmentMarkerProps {
  status: 'active' | 'needs_attention' | 'critical' | 'inactive';
  onClick: () => void;
}

const statusColors = {
  active: '#10b981', // green
  needs_attention: '#f59e0b', // yellow
  critical: '#ef4444', // red
  inactive: '#94a3b8', // gray
};

const pulseAnimation = {
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 0.8,
    },
    '50%': {
      transform: 'scale(1.2)',
      opacity: 0.4,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 0.8,
    },
  },
};

export function EquipmentMarker({ status, onClick }: EquipmentMarkerProps) {
  return (
    <Tooltip title={status.replace('_', ' ').toUpperCase()} arrow>
      <Box
        onClick={onClick}
        sx={{
          position: 'relative',
          width: 20,
          height: 20,
          cursor: 'pointer',
          '&:hover': {
            '& .marker': {
              transform: 'scale(1.1)',
            },
            '& .pulse': {
              animation: 'none',
            },
          },
          ...pulseAnimation,
        }}
      >
        {/* Pulse effect for critical status */}
        {status === 'critical' && (
          <Box
            className="pulse"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              backgroundColor: statusColors[status],
              opacity: 0.4,
              animation: 'pulse 2s infinite',
            }}
          />
        )}
        
        {/* Main marker */}
        <Box
          className="marker"
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: statusColors[status],
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s ease-in-out',
            zIndex: 1,
          }}
        />
      </Box>
    </Tooltip>
  );
}
