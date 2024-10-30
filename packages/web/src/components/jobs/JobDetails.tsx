'use client';

import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Job } from '@fieldhive/shared';
import { updateJob, deleteJob } from '../../services/api';

interface JobDetailsProps {
  job: Job | null;
  onEdit: (job: Job) => void;
  onUpdate?: () => void;
  onJobSelect: (job: Job | null) => void;
}

const JobDetails = ({ job, onEdit, onUpdate, onJobSelect }: JobDetailsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(job?.status || 'pending');

  useEffect(() => {
    if (job) {
      setCurrentStatus(job.status);
    }
  }, [job]);

  const handleConfirmDelete = async () => {
    if (!job) return;

    try {
      await deleteJob(job.job_id);
      setDeleteDialogOpen(false);
      onJobSelect(null);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      setDeleteError(error.message);
    }
  };

  const handleStatusChange = async (event: any) => {
    if (!job) return;
    
    setStatusLoading(true);
    try {
      await updateJob(job.job_id, {
        status: event.target.value
      });
      setCurrentStatus(event.target.value);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return undefined;
    }
  };

  if (!job) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            Select a job to view details
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" component="div" sx={{ mb: 3 }}>
                {job.title}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Property
                  </Typography>
                  <Typography variant="body2">
                    {job.property?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Account
                  </Typography>
                  <Typography variant="body2">
                    {job.account?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Type
                  </Typography>
                  <Typography variant="body2">
                    {job.job_type?.name || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ml: 4 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => onEdit(job)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton 
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
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
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentStatus}
                  onChange={handleStatusChange}
                  label="Status"
                  disabled={statusLoading}
                >
                  <MenuItem value="pending">
                    <Chip label="PENDING" size="small" color="warning" sx={{ color: 'white' }} />
                  </MenuItem>
                  <MenuItem value="in_progress">
                    <Chip label="IN PROGRESS" size="small" color="info" sx={{ color: 'white' }} />
                  </MenuItem>
                  <MenuItem value="completed">
                    <Chip label="COMPLETED" size="small" color="success" sx={{ color: 'white' }} />
                  </MenuItem>
                  <MenuItem value="cancelled">
                    <Chip label="CANCELLED" size="small" color="error" sx={{ color: 'white' }} />
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body2">
              {job.description || 'No description provided'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Job</DialogTitle>
        <DialogContent>
          {deleteError ? (
            <DialogContentText color="error">
              {deleteError}
            </DialogContentText>
          ) : (
            <DialogContentText>
              Are you sure you want to delete this job? This action cannot be undone.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          {!deleteError && (
            <Button onClick={handleConfirmDelete} color="error">
              Delete Job
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default JobDetails;
