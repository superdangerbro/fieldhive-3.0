'use client';

import React from 'react';
import { Box, Chip, Typography, IconButton, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import { useMapContext } from '../../../../../app/globalHooks/useMapContext';

export function ActiveJobIndicator() {
  const { activeJob, activeProperty, clearContext } = useMapContext();
  const theme = useTheme();

  if (!activeJob || !activeProperty) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 80, // Position below the header
        left: 320, // Position to the right of the sidebar
        right: 80, // Leave space for map controls (16px margin + ~48px width + safety margin)
        zIndex: 1400, // Below map controls (1500)
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: theme.shadows[4],
        padding: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        transition: 'all 0.2s ease-in-out',
        border: `1px solid ${theme.palette.divider}`,
        maxWidth: 'calc(100% - 400px)', // Ensure it doesn't get too wide
        '&:hover': {
          boxShadow: theme.shadows[8]
        },
        // Ensure text truncation and responsive layout
        minWidth: 0,
        overflow: 'hidden',
        // Responsive adjustments
        '@media (max-width: 600px)': {
          left: 16, // Full width on mobile when sidebar is hidden
          maxWidth: 'calc(100% - 96px)', // Account for controls on mobile
        }
      }}
    >
      <WorkIcon 
        color="primary"
        sx={{ flexShrink: 0 }}
      />
      <Typography 
        variant="body2" 
        noWrap
        sx={{ 
          color: theme.palette.text.primary,
          fontWeight: 500,
          flexShrink: 1,
          minWidth: 0
        }}
      >
        Working on: <strong>{activeJob.title}</strong>
      </Typography>
      <Chip 
        label={activeProperty.name} 
        size="small" 
        color="primary" 
        variant="outlined"
        sx={{
          borderColor: theme.palette.primary.main,
          '& .MuiChip-label': {
            color: theme.palette.primary.main
          },
          flexShrink: 0
        }}
      />
      <IconButton 
        size="small" 
        onClick={clearContext}
        sx={{ 
          ml: 'auto', // Push to right
          color: theme.palette.text.secondary,
          flexShrink: 0,
          '&:hover': {
            color: theme.palette.error.main,
            backgroundColor: theme.palette.error.main + '1A' // 10% opacity
          }
        }}
        title="Cancel job"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
