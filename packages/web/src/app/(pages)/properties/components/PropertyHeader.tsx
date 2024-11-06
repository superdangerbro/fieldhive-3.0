'use client';

import React from 'react';
import { Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Property } from '../../../globalTypes/property';
import InlinePropertyName from './InlinePropertyName';

interface PropertyHeaderProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: () => void;
  onUpdate?: () => void;
}

export default function PropertyHeader({ 
  property, 
  onEdit, 
  onDelete, 
  onUpdate 
}: PropertyHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Box>
        <InlinePropertyName
          propertyId={property.property_id}
          initialName={property.name}
          onUpdate={onUpdate}
        />
      </Box>
      <Box>
        <IconButton 
          color="error"
          onClick={onDelete}
          sx={{ 
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.contrastText'
            }
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
