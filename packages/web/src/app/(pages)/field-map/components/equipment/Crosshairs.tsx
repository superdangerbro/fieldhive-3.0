'use client';

import React from 'react';
import { Box } from '@mui/material';

interface CrosshairsProps {
  onLocationConfirmed: (location: [number, number]) => void;
}

/**
 * Crosshairs component for equipment placement
 * Features:
 * - Centered crosshair indicator
 * - Drop shadow for visibility
 * - Outer circle with glow effect
 * - Non-interactive (pointer-events: none)
 */
export function Crosshairs({ onLocationConfirmed }: CrosshairsProps) {
  // Get the current map center when clicked
  const handleMapClick = () => {
    // This would need to be implemented to get the actual map center coordinates
    // For now, using placeholder coordinates
    onLocationConfirmed([0, 0]);
  };

  return (
    <Box
      onClick={handleMapClick}
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        filter: 'drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.5))',
        cursor: 'pointer',
      }}
    >
      <svg width="48" height="48" viewBox="0 0 48 48">
        {/* Outer circle with glow */}
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          opacity="0.9"
        />
        
        {/* Inner circle with glow */}
        <circle
          cx="24"
          cy="24"
          r="3"
          fill="white"
          opacity="0.9"
        />
        
        {/* Crosshair lines */}
        <line
          x1="24"
          y1="8"
          x2="24"
          y2="18"
          stroke="white"
          strokeWidth="2.5"
          opacity="0.9"
        />
        <line
          x1="24"
          y1="30"
          x2="24"
          y2="40"
          stroke="white"
          strokeWidth="2.5"
          opacity="0.9"
        />
        <line
          x1="8"
          y1="24"
          x2="18"
          y2="24"
          stroke="white"
          strokeWidth="2.5"
          opacity="0.9"
        />
        <line
          x1="30"
          y1="24"
          x2="40"
          y2="24"
          stroke="white"
          strokeWidth="2.5"
          opacity="0.9"
        />
        
        {/* Outer glow effect */}
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="4"
        />
      </svg>
    </Box>
  );
}
