'use client';

import React from 'react';
import { Box, List, ListItem, ListItemText, IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import { useFieldMapStore } from '../../../../stores/fieldMapStore';

interface FloorControlsProps {
  /** Whether the floor plans panel is open */
  isFloorPlansOpen: boolean;
  /** Handler for adding a new floor plan */
  onAddFloorPlan: () => void;
}

interface FloorPlan {
  /** Unique identifier for the floor plan */
  id: string;
  /** Display name of the floor plan */
  name: string;
  /** Whether the floor plan is currently visible */
  visible: boolean;
}

/**
 * Controls for managing floor plans
 * Features:
 * - List of available floor plans
 * - Visibility toggle for each plan
 * - Active plan selection
 * - Add new plan button
 * 
 * @component
 * @example
 * ```tsx
 * <FloorControls
 *   isFloorPlansOpen={true}
 *   onAddFloorPlan={() => setShowAddDialog(true)}
 * />
 * ```
 */
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
