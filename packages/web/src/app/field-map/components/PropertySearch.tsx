'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Box, TextField, List, ListItem, ListItemText, IconButton, Tooltip, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LayersIcon from '@mui/icons-material/Layers';
import MapIcon from '@mui/icons-material/Map';
import { useFieldMapStore } from '../../../stores/fieldMapStore';

interface PropertySearchProps {
  onManageFloorPlans: () => void;
  isFloorPlansOpen: boolean;
  onFloorPlansOpenChange: (isOpen: boolean) => void;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({
  onManageFloorPlans,
  isFloorPlansOpen,
  onFloorPlansOpenChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { properties, setSelectedProperty, fetchPropertiesInBounds, viewState } = useFieldMapStore();

  const handleSearch = useCallback(async (useMapBounds: boolean = false) => {
    setIsSearching(true);
    try {
      let bounds: [number, number, number, number];
      if (useMapBounds) {
        // Use the current map bounds
        const { longitude, latitude, zoom } = viewState;
        const latDelta = 180 / Math.pow(2, zoom);
        const lonDelta = 360 / Math.pow(2, zoom);
        bounds = [
          longitude - lonDelta / 2,
          latitude - latDelta / 2,
          longitude + lonDelta / 2,
          latitude + latDelta / 2
        ];
      } else {
        // Use a fixed area around the center for text-based search
        const { longitude, latitude } = viewState;
        const zoom = 0.1;
        bounds = [
          longitude - zoom,
          latitude - zoom,
          longitude + zoom,
          latitude + zoom
        ];
      }
      await fetchPropertiesInBounds(bounds, searchTerm);
    } catch (error) {
      console.error('Error searching properties:', error);
    } finally {
      setIsSearching(false);
    }
  }, [fetchPropertiesInBounds, viewState, searchTerm]);

  useEffect(() => {
    if (searchTerm.length > 2) {
      const debounce = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [searchTerm, handleSearch]);

  const handleResultClick = useCallback((property: any) => {
    setSelectedProperty(property);
  }, [setSelectedProperty]);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        width: 300,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: 3,
        zIndex: 1000,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <IconButton onClick={() => handleSearch()} size="small" sx={{ ml: 1 }}>
          {isSearching ? <CircularProgress size={24} /> : <SearchIcon />}
        </IconButton>
        <Tooltip title="Search in Map View">
          <IconButton onClick={() => handleSearch(true)} size="small" sx={{ ml: 1 }}>
            <MapIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Manage Floor Plans">
          <IconButton
            onClick={() => {
              onManageFloorPlans();
              onFloorPlansOpenChange(!isFloorPlansOpen);
            }}
            size="small"
            sx={{ ml: 1 }}
          >
            <LayersIcon color={isFloorPlansOpen ? 'primary' : 'inherit'} />
          </IconButton>
        </Tooltip>
      </Box>
      {properties.length > 0 && (
        <List sx={{ maxHeight: 200, overflowY: 'auto' }}>
          {properties.map((property) => (
            <ListItem
              key={property.id}
              button
              onClick={() => handleResultClick(property)}
            >
              <ListItemText
                primary={property.name}
                secondary={`Lat: ${property.location.latitude.toFixed(4)}, Lon: ${property.location.longitude.toFixed(4)}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};
