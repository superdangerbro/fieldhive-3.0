'use client';

import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Job } from '@/app/globalTypes';

interface JobHeaderProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: () => void;
}

export function JobHeader({ job, onEdit, onDelete }: JobHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" component="div" gutterBottom>
          {job.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Created {new Date(job.created_at || Date.now()).toLocaleDateString()}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton onClick={() => onEdit(job)} color="primary">
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
