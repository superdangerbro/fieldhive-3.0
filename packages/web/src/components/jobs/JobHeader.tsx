'use client';

import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Job } from '@fieldhive/shared';

interface JobHeaderProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: () => void;
}

const JobHeader: React.FC<JobHeaderProps> = ({ job, onEdit, onDelete }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" component="div" gutterBottom>
          {job.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Created {new Date(job.created_at).toLocaleDateString()}
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
};

export default JobHeader;
