import React from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
  Switch,
  Button,
  Box,
  IconButton
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFieldMap3DStore } from '../../../stores/fieldMap3dStore';

interface PropertyActionsProps {
  onManageFloorPlans: () => void;
  isFloorPlansOpen: boolean;
  onFloorPlansOpenChange: (open: boolean) => void;
}

export const PropertyActions = ({ 
  onManageFloorPlans, 
  isFloorPlansOpen, 
  onFloorPlansOpenChange 
}: PropertyActionsProps) => {
  const { 
    selectedProperty,
    floorPlans,
    toggleFloorPlanVisibility,
    setActiveFloorPlan,
    removeFloorPlan
  } = useFieldMap3DStore();

  if (!selectedProperty) return null;

  const propertyFloorPlans = floorPlans.filter(fp => fp.propertyId === selectedProperty.id);

  const getFloorLabel = (floor: number) => {
    if (floor === 0) return 'G';
    return floor > 0 ? floor : floor;
  };

  const handleEdit = (floorPlanId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit floor plan:', floorPlanId);
  };

  const handleDelete = (floorPlanId: string) => {
    if (window.confirm('Are you sure you want to delete this floor plan?')) {
      removeFloorPlan(floorPlanId);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 160,
        left: 24,
        width: 400,
        zIndex: 1000,
        p: 1
      }}
    >
      <Typography variant="subtitle1" sx={{ px: 2, py: 1 }}>
        {selectedProperty.name}
      </Typography>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => onFloorPlansOpenChange(!isFloorPlansOpen)}>
            <ListItemIcon>
              <MapIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Floor Plans"
              secondary={`${propertyFloorPlans.length} floor plans`}
            />
            {isFloorPlansOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={isFloorPlansOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {propertyFloorPlans.map((floorPlan) => (
              <ListItem
                key={floorPlan.id}
                sx={{ pl: 4 }}
                secondaryAction={
                  <Box>
                    <Switch
                      edge="end"
                      onChange={() => toggleFloorPlanVisibility(floorPlan.id)}
                      checked={floorPlan.visible}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(floorPlan.id)}
                      sx={{ ml: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(floorPlan.id)}
                      sx={{ ml: 1 }}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={`Floor ${getFloorLabel(floorPlan.floor)}`}
                  onClick={() => setActiveFloorPlan(floorPlan.id)}
                  sx={{ cursor: 'pointer' }}
                />
              </ListItem>
            ))}
            <ListItem sx={{ pl: 4 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={onManageFloorPlans}
                fullWidth
              >
                Add Floor Plan
              </Button>
            </ListItem>
          </List>
        </Collapse>
      </List>
    </Paper>
  );
};
