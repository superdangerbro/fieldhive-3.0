'use client';

import React from 'react';
import { Autocomplete, TextField, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { Property } from '@fieldhive/shared';

interface PropertySearchProps {
  properties: Property[];
  selectedProperty: Property | null;
  onPropertySelect: (property: Property | null) => void;
  onAddClick: () => void;
}

export default function PropertySearch({ 
  properties, 
  selectedProperty,
  onPropertySelect,
  onAddClick 
}: PropertySearchProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <Autocomplete
        sx={{ flexGrow: 1 }}
        options={properties}
        value={selectedProperty}
        onChange={(event, newValue) => onPropertySelect(newValue)}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.property_id === value.property_id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Properties"
            placeholder="Type to search..."
          />
        )}
      />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddClick}
        sx={{
          backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
          textTransform: 'none'
        }}
      >
        Add Property
      </Button>
    </Box>
  );
}
