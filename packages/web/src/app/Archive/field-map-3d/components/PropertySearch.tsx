import React, { useState, useCallback, useEffect } from 'react';
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
import type { SearchResult, Property } from '../../../stores/fieldMap3dStore';

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
        const validResults: SearchResult[] = response.properties
          .filter((property: Property) => property.location && typeof property.location === 'object')
          .map((property: Property) => ({
            id: property.id,
            name: property.name,
            address: property.billing_address?.address1 || property.service_address?.address1 || '',
            location: {
              type: 'Point',
              coordinates: [property.location.longitude, property.location.latitude]
            },
            accounts: [] // If account information is available, map it here
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
      {/* Rest of the component JSX */}
    </Paper>
  );
}
