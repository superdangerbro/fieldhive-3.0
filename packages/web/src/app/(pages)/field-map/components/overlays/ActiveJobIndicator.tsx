'use client';

import React from 'react';
import { Box, Chip, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import { useActiveJobContext } from '../../../../../app/globalHooks/useActiveJobContext';

export function ActiveJobIndicator() {
  const { activeJob, activeProperty, clearContext } = useActiveJobContext();

  if (!activeJob || !activeProperty) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1001, // Ensure it's above other overlays
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 2,
        padding: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        transition: 'top 0.2s ease-in-out', // Smooth transition
      }}
    >
      <WorkIcon color="primary" />
      <Typography variant="body2">
        Working on job: <strong>{activeJob.title}</strong>
      </Typography>
      <Chip 
        label={activeProperty.name} 
        size="small" 
        color="primary" 
        variant="outlined"
      />
      <IconButton 
        size="small" 
        onClick={clearContext}
        sx={{ ml: 1 }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
