'use client';

import React from 'react';
import { Box } from '@mui/material';

export default function FieldMapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ height: '100%' }}>
      {children}
    </Box>
  );
}
