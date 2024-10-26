'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';

// Dynamically import the map component to avoid SSR issues
const TechnicianMap = dynamic(
  () => import('@/components/technician/TechnicianMap'),
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

export default function TechnicianPage() {
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
      <TechnicianMap />
    </Box>
  );
}
