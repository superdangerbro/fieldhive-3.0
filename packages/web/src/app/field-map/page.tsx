'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css';

// Dynamically import the map component to avoid SSR issues
const FieldMap = dynamic(
  () => import('./components/FieldMap'),
  {
    loading: () => (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    ),
    ssr: false,
  }
);

export default function FieldMapPage() {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <FieldMap />
    </Box>
  );
}
