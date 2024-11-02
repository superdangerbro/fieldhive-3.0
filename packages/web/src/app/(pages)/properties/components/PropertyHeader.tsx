'use client';

import React from 'react';
import { Box, Typography, IconButton, Paper, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Property } from '@fieldhive/shared';

interface PropertyHeaderProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: () => void;
  linkedAccounts: Array<{ account_id: string; name: string }>;
}

export default function PropertyHeader({ property, onEdit, onDelete, linkedAccounts }: PropertyHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
      <Box>
        <Typography variant="h5" component="div" sx={{ mb: 1 }}>
          {property.name}
        </Typography>
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
        <IconButton onClick={() => onEdit(property)} color="primary">
          <EditIcon />
        </IconButton>
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
