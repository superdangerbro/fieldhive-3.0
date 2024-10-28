'use client';

import React, { useEffect } from 'react';
import { Stack, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useMapStore } from '../../stores/mapStore';

interface EquipmentPlacementControlsProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function EquipmentPlacementControls({ onConfirm, onCancel }: EquipmentPlacementControlsProps) {
  const { viewState } = useMapStore();

  // Log crosshair position whenever the map moves
  useEffect(() => {
    console.log('Crosshair position:', {
      longitude: viewState.longitude.toFixed(6),
      latitude: viewState.latitude.toFixed(6)
    });
  }, [viewState.longitude, viewState.latitude]);

  const handleConfirm = () => {
    console.log('Location confirmed:', {
      longitude: viewState.longitude.toFixed(6),
      latitude: viewState.latitude.toFixed(6)
    });
    onConfirm();
  };

  return (
    <>
      {/* Crosshair */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 1000,
          width: 40,
          height: 40,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: '#3b82f6',
              transform: 'translateY(-50%)',
              boxShadow: '0 0 4px rgba(0,0,0,0.2)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: '#3b82f6',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 4px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
        sx={{
          position: 'absolute',
          bottom: 32,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          onClick={onCancel}
          sx={{
            minWidth: 50,
            height: 50,
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            '&:hover': {
              backgroundColor: '#dc2626',
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 24 }} />
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          sx={{
            minWidth: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            '&:hover': {
              backgroundColor: '#16a34a',
            },
          }}
        >
          <CheckIcon sx={{ fontSize: 36 }} />
        </Button>
      </Stack>
    </>
  );
}
