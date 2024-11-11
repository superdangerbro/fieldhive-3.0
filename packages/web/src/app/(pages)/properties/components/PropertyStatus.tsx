'use client';

import React from 'react';
import { Chip } from '@mui/material';
import type { PropertyStatus as PropertyStatusType } from '../../../globalTypes/property';

interface StatusChipProps {
  status: string;
}

export function StatusChip({ status }: StatusChipProps) {
  const normalizedStatus = status.toLowerCase();
  return (
    <Chip 
      label={status}
      size="small"
      color={normalizedStatus === 'active' ? 'success' : 
            normalizedStatus === 'inactive' ? 'warning' : 
            normalizedStatus === 'archived' ? 'error' : 
            normalizedStatus === 'pending' ? 'default' : 'default'}
      sx={{ 
        color: 'white', 
        fontWeight: 'bold',
        bgcolor: normalizedStatus === 'pending' ? 'grey.500' : undefined
      }}
    />
  );
}

export function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
