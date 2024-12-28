'use client';

import React from 'react';
import { Box, Chip, Typography, IconButton, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useMapContext } from '../../../../../app/globalHooks/useMapContext';

export function ActiveJobIndicator() {
  const { activeJob, activeProperty, clearContext } = useMapContext();
  const theme = useTheme();

  const getStatusContent = () => {
    if (activeJob && activeProperty) {
      return (
        <>
          <WorkIcon color="primary" />
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            minWidth: 0,
            flex: 1
          }}>
            <Typography 
              variant="body2" 
              noWrap
              sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 500
              }}
            >
              {activeJob.title}
            </Typography>
            <Typography 
              variant="caption" 
              noWrap
              sx={{ color: theme.palette.text.secondary }}
            >
              {activeJob.description || 'No description'}
            </Typography>
          </Box>
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
        </>
      );
    }

    if (activeProperty) {
      return (
        <>
          <LocationOnIcon color="primary" />
          <Typography 
            variant="body2" 
            noWrap
            sx={{ 
              color: theme.palette.text.primary,
              fontWeight: 500
            }}
          >
            Selected Property: <strong>{activeProperty.name}</strong>
          </Typography>
        </>
      );
    }

    return (
      <>
        <LocationOnIcon color="disabled" />
        <Typography 
          variant="body2" 
          noWrap
          sx={{ 
            color: theme.palette.text.secondary,
            fontWeight: 500
          }}
        >
          No property selected
        </Typography>
      </>
    );
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 80, // Position below the header
        left: 320, // Position to the right of the sidebar
        right: 80, // Leave space for map controls
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
        '&:hover': {
          boxShadow: theme.shadows[8]
        },
        // Ensure text truncation and responsive layout
        minWidth: 0,
        overflow: 'hidden',
        // Responsive adjustments
        '@media (max-width: 600px)': {
          left: 16, // Full width on mobile when sidebar is hidden
        }
      }}
    >
      {getStatusContent()}
      
      {/* Only show clear button if something is selected */}
      {(activeJob || activeProperty) && (
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
          title="Clear selection"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
