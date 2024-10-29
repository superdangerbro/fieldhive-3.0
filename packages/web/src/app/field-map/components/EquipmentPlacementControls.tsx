'use client';

import React from 'react';
import { Box, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface EquipmentPlacementControlsProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function EquipmentPlacementControls({
  onConfirm,
  onCancel
}: EquipmentPlacementControlsProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 2,
        zIndex: 1000,
        padding: '8px 16px',
        borderRadius: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Button
        variant="contained"
        color="error"
        onClick={onCancel}
        startIcon={<CloseIcon />}
        sx={{
          minWidth: 120,
          bgcolor: '#ef4444',
          '&:hover': {
            bgcolor: '#dc2626'
          },
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={onConfirm}
        startIcon={<CheckIcon />}
        sx={{
          minWidth: 160,
          bgcolor: '#3b82f6',
          '&:hover': {
            bgcolor: '#2563eb'
          },
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        Place Equipment
      </Button>
    </Box>
  );
}
