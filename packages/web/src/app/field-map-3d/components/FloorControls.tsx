import React from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useFieldMap3DStore } from '../../../stores/fieldMap3dStore';

interface FloorControlsProps {
  isFloorPlansOpen: boolean;
}

export const FloorControls = ({ isFloorPlansOpen }: FloorControlsProps) => {
  const { 
    selectedProperty,
    floorPlans,
    activeFloorPlan,
    setActiveFloorPlan
  } = useFieldMap3DStore();

  const propertyFloorPlans = floorPlans.filter(fp => fp.propertyId === selectedProperty?.id);
  
  if (!selectedProperty || propertyFloorPlans.length === 0 || !isFloorPlansOpen) return null;

  const activeFloorPlanIndex = propertyFloorPlans.findIndex(fp => fp.id === activeFloorPlan);
  const activePlan = activeFloorPlan ? propertyFloorPlans.find(fp => fp.id === activeFloorPlan) : null;

  const handleUpClick = () => {
    if (activeFloorPlanIndex > 0) {
      setActiveFloorPlan(propertyFloorPlans[activeFloorPlanIndex - 1].id);
    }
  };

  const handleDownClick = () => {
    if (activeFloorPlanIndex < propertyFloorPlans.length - 1) {
      setActiveFloorPlan(propertyFloorPlans[activeFloorPlanIndex + 1].id);
    }
  };

  const getFloorLabel = (floor: number) => {
    if (floor === 0) return 'G';
    return floor > 0 ? floor : floor;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        left: 24,
        bottom: 32,
        p: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        zIndex: 1000,
        minWidth: 200
      }}
    >
      <IconButton 
        onClick={handleDownClick}
        disabled={activeFloorPlanIndex === -1 || activeFloorPlanIndex >= propertyFloorPlans.length - 1}
      >
        <ArrowDownwardIcon />
      </IconButton>

      <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Current Floor
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          {activePlan ? getFloorLabel(activePlan.floor) : 'None'}
        </Typography>
      </Box>

      <IconButton 
        onClick={handleUpClick}
        disabled={activeFloorPlanIndex <= 0}
      >
        <ArrowUpwardIcon />
      </IconButton>
    </Paper>
  );
};
