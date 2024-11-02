'use client';

import React from 'react';
import { Box } from '@mui/material';

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box>
      {children}
    </Box>
  );
}
