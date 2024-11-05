'use client';

import React from 'react';
import { Box, Typography, IconButton, Paper, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Property } from '@fieldhive/shared';
import InlinePropertyName from './InlinePropertyName';

interface PropertyHeaderProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: () => void;
  linkedAccounts: Array<{ account_id: string; name: string }>;
  onUpdate?: () => void;
}

export default function PropertyHeader({ 
  property, 
  onEdit, 
  onDelete, 
  linkedAccounts,
  onUpdate 
}: PropertyHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
      <Box>
        <Box sx={{ mb: 1 }}>
          <InlinePropertyName
            propertyId={property.property_id}
            initialName={property.name}
            onUpdate={onUpdate}
          />
        </Box>
        <Typography variant="subtitle1" gutterBottom>Parent Accounts</Typography>
        {linkedAccounts.length > 0 ? (
          <Stack spacing={1}>
            {linkedAccounts.map(account => (
              <Paper key={account.account_id} sx={{ p: 1 }}>
                <Typography variant="body1">
                  {account.name}
                </Typography>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No parent accounts
          </Typography>
        )}
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
