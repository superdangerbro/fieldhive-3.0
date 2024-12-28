'use client';

import React from 'react';
import { Box, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import styled from '@emotion/styled';

interface EquipmentPlacementControlsProps {
  /** Handler for confirming equipment placement */
  onConfirm: () => void;
  /** Handler for canceling equipment placement */
  onCancel: () => void;
}

const ControlsContainer = styled.div`
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  gap: 8px;
  background-color: white;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

/**
 * Controls for equipment placement workflow
 * Features:
 * - Confirm placement button
 * - Cancel placement button
 * - Floating controls with blur effect
 * 
 * @component
 * @example
 * ```tsx
 * <EquipmentPlacementControls
 *   onConfirm={handleConfirmPlacement}
 *   onCancel={handleCancelPlacement}
 * />
 * ```
 */
export function EquipmentPlacementControls({
  onConfirm,
  onCancel
}: EquipmentPlacementControlsProps) {
  return (
    <ControlsContainer>
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
    </ControlsContainer>
  );
}
