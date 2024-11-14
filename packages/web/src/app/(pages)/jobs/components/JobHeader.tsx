'use client';

import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Job } from '../../../globalTypes/job';

interface JobHeaderProps {
  job: Job;
  onDelete: () => void;
}

export function JobHeader({ job, onDelete }: JobHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" component="div" gutterBottom>
          {job.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Created {new Date(job.created_at || Date.now()).toLocaleDateString()}
        </Typography>
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
