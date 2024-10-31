'use client';

import React, { useState, useCallback } from 'react';
import { Box, TextField, List, ListItem, ListItemText, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LayersIcon from '@mui/icons-material/Layers';
import { useFieldMap3DStore } from '../../../stores/fieldMap3dStore';

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
  const { searchResults, setSelectedProperty, searchProperties } = useFieldMap3DStore();

  const handleSearch = useCallback(() => {
    searchProperties(searchTerm);
  }, [searchTerm, searchProperties]);

  const handleResultClick = useCallback((result: any) => {
    setSelectedProperty({
      id: result.id,
      name: result.name,
      location: {
        latitude: result.location.coordinates[1],
        longitude: result.location.coordinates[0]
      }
    });
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
        <IconButton onClick={handleSearch} size="small" sx={{ ml: 1 }}>
          <SearchIcon />
        </IconButton>
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
      {searchResults.length > 0 && (
        <List sx={{ maxHeight: 200, overflowY: 'auto' }}>
          {searchResults.map((result) => (
            <ListItem
              key={result.id}
              button
              onClick={() => handleResultClick(result)}
            >
              <ListItemText
                primary={result.name}
                secondary={result.address}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};
