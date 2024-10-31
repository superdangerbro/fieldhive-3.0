import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Switch,
  Button,
  Box,
  IconButton,
  Autocomplete,
  TextField,
  Typography,
  Divider,
  useTheme,
  Tooltip
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WorkIcon from '@mui/icons-material/Work';
import { useFieldMap3DStore } from '../../../stores/fieldMap3dStore';
import { getProperties } from '../../../services/api';
import type { SearchResult } from '../../../stores/fieldMap3dStore';

interface PropertySearchProps {
  onManageFloorPlans: () => void;
  isFloorPlansOpen: boolean;
  onFloorPlansOpenChange: (open: boolean) => void;
}

export function PropertySearch({ 
  onManageFloorPlans, 
  isFloorPlansOpen, 
  onFloorPlansOpenChange 
}: PropertySearchProps) {
  const theme = useTheme();
  const { 
    selectedProperty,
    searchResults,
    setSelectedProperty,
    floorPlans,
    toggleFloorPlanVisibility,
    setActiveFloorPlan,
    removeFloorPlan,
    setSearchResults
  } = useFieldMap3DStore();

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const propertyFloorPlans = floorPlans.filter(fp => fp.propertyId === selectedProperty?.id);

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

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProperties();
      if (response && response.properties) {
        const validResults = response.properties
          .filter(property => property.location?.coordinates?.length === 2)
          .map(property => ({
            id: property.id,
            name: property.name,
            address: property.address || '',
            location: {
              type: 'Point',
              coordinates: [
                property.location.coordinates[0],
                property.location.coordinates[1]
              ] as [number, number]
            },
            accounts: property.accounts?.map(account => ({
              accountId: account.accountId,
              name: account.name,
              role: account.role || 'viewer'
            })) || []
          }));
        setSearchResults(validResults);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [setSearchResults]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const filterOptions = (options: SearchResult[], { inputValue }: { inputValue: string }) => {
    const searchTerm = inputValue.toLowerCase();
    return options.filter(option => 
      option.name.toLowerCase().includes(searchTerm) ||
      option.address.toLowerCase().includes(searchTerm)
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 24,
        left: 24,
        width: 400,
        zIndex: 1000,
        p: 1,
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Autocomplete
        options={searchResults}
        getOptionLabel={(option) => option.name || option.address.split(' ')[0]}
        onChange={(_, value) => {
          if (value) {
            setSelectedProperty({
              id: value.id,
              name: value.name,
              location: {
                latitude: value.location.coordinates[1],
                longitude: value.location.coordinates[0]
              }
            });
          }
        }}
        onInputChange={(_, value) => setInputValue(value)}
        inputValue={inputValue}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search properties by name, address, or ID"
            variant="outlined"
            size="small"
          />
        )}
        renderOption={(props, option, state) => (
          <React.Fragment key={option.id}>
            <Box 
              component="li" 
              {...props} 
              sx={{ 
                flexDirection: 'column', 
                alignItems: 'flex-start', 
                py: 1.5,
                px: 2,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
            >
              {option.accounts.length > 0 && (
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: theme.palette.primary.main,
                    mb: 0.5
                  }}
                >
                  {option.accounts.map(a => a.name).join(', ')}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body1"
                  sx={{ 
                    fontWeight: 500,
                  }}
                >
                  {option.name || option.address.split(' ')[0]}
                </Typography>
                <Tooltip title="Active Jobs">
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 0.5,
                    color: theme.palette.text.secondary,
                    fontSize: '0.75rem'
                  }}>
                    <WorkIcon sx={{ fontSize: '1rem' }} />
                    <span>0</span>
                  </Box>
                </Tooltip>
              </Box>
            </Box>
            {state.index < searchResults.length - 1 && (
              <Divider 
                sx={{ 
                  my: 0,
                  opacity: 0.5
                }} 
              />
            )}
          </React.Fragment>
        )}
        noOptionsText="No properties found"
        loadingText="Searching..."
        filterOptions={filterOptions}
        blurOnSelect
        ListboxProps={{
          sx: {
            '& .MuiAutocomplete-listbox': {
              padding: 0,
            }
          }
        }}
      />

      {selectedProperty && (
        <>
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
        </>
      )}
    </Paper>
  );
}
