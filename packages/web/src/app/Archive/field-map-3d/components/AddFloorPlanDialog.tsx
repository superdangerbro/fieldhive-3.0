'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  ButtonGroup
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useFieldMap3DStore } from '../../../stores/fieldMap3dStore';

interface AddFloorPlanDialogProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
}

const MIN_FLOOR = -5;
const MAX_FLOOR = 20;

export function AddFloorPlanDialog({
  open,
  onClose,
  propertyId
}: AddFloorPlanDialogProps) {
  const [floor, setFloor] = useState(0); // 0 represents ground floor
  const { startPlacingFloorPlan } = useFieldMap3DStore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      startPlacingFloorPlan({
        name: `Floor ${floor === 0 ? 'G' : floor}`,
        image: file,
        propertyId,
        floor
      });
      onClose();
    }
  };

  const incrementFloor = () => {
    if (floor < MAX_FLOOR) {
      setFloor(prev => prev + 1);
    }
  };

  const decrementFloor = () => {
    if (floor > MIN_FLOOR) {
      setFloor(prev => prev - 1);
    }
  };

  const getFloorLabel = (floor: number) => {
    if (floor === 0) return 'G';
    return floor > 0 ? floor : floor;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Floor Level</DialogTitle>
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          py: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2
          }}>
            <Typography>Floor:</Typography>
            <ButtonGroup variant="outlined" size="small">
              <Button
                onClick={decrementFloor}
                disabled={floor === MIN_FLOOR}
              >
                <RemoveIcon />
              </Button>
              <Button sx={{ minWidth: '60px' }}>
                {getFloorLabel(floor)}
              </Button>
              <Button
                onClick={incrementFloor}
                disabled={floor === MAX_FLOOR}
              >
                <AddIcon />
              </Button>
            </ButtonGroup>
          </Box>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="floor-plan-upload"
          />
          <label htmlFor="floor-plan-upload">
            <Button
              component="span"
              variant="contained"
            >
              Upload Floor Plan
            </Button>
          </label>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
