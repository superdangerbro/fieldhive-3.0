'use client';

import React from 'react';
import { Box, List, ListItem, ListItemText, IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import { useFieldMapStore } from '../../../stores/fieldMapStore';

interface FloorControlsProps {
  isFloorPlansOpen: boolean;
  onAddFloorPlan: () => void;
}

interface FloorPlan {
  id: string;
  name: string;
  visible: boolean;
}

export const FloorControls: React.FC<FloorControlsProps> = ({
  isFloorPlansOpen,
  onAddFloorPlan,
}) => {
  const {
    floorPlans,
    activeFloorPlan,
    setActiveFloorPlan,
    toggleFloorPlanVisibility,
  } = useFieldMapStore();

  if (!isFloorPlansOpen) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 80,
        left: 16,
        width: 300,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: 3,
        zIndex: 1000,
      }}
    >
      <List>
        {floorPlans.map((floorPlan: FloorPlan) => (
          <ListItem
            key={floorPlan.id}
            secondaryAction={
              <Tooltip title={floorPlan.visible ? 'Hide' : 'Show'}>
                <IconButton
                  edge="end"
                  aria-label="visibility"
                  onClick={() => toggleFloorPlanVisibility(floorPlan.id)}
                >
                  {floorPlan.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </Tooltip>
            }
          >
            <ListItemText
              primary={floorPlan.name}
              secondary={floorPlan.id === activeFloorPlan ? 'Active' : ''}
              onClick={() => setActiveFloorPlan(floorPlan.id)}
              sx={{ cursor: 'pointer' }}
            />
          </ListItem>
        ))}
        <ListItem>
          <Tooltip title="Add Floor Plan">
            <IconButton edge="end" aria-label="add" onClick={onAddFloorPlan}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </ListItem>
      </List>
    </Box>
  );
};
