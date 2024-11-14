'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button, 
  Divider,
  CircularProgress
} from '@mui/material';
import type { Job } from '../../../globalTypes/job';
import { useDeleteJob } from '../hooks/useJobs';
import { JobHeader } from './JobHeader';
import { JobMetadata } from './JobMetadata';
import { JobTabs } from './JobTabs';

interface JobDetailsProps {
  job: Job | null;
  onUpdate?: () => void;
  onJobSelect: (job: Job | null) => void;
}

export function JobDetails({ job, onUpdate, onJobSelect }: JobDetailsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Use React Query mutation for delete
  const { 
    mutate: deleteJob, 
    isPending: isDeleting,
    error: deleteError,
    reset: resetDeleteError
  } = useDeleteJob();

  const handleConfirmDelete = () => {
    if (!job) return;

    deleteJob(job.job_id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        onJobSelect(null);
        if (onUpdate) {
          onUpdate();
        }
      }
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
          <JobHeader 
            job={job}
            onDelete={() => setDeleteDialogOpen(true)}
          />

          <Divider sx={{ my: 2 }} />

          <JobMetadata
            job={job}
            onUpdate={onUpdate}
          />

          <Divider sx={{ my: 2 }} />

          <JobTabs
            job={job}
            tabValue={tabValue}
            onTabChange={handleTabChange}
          />
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          resetDeleteError();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Job</DialogTitle>
        <DialogContent>
          {deleteError ? (
            <DialogContentText color="error">
              {deleteError instanceof Error ? deleteError.message : 'Failed to delete job'}
            </DialogContentText>
          ) : (
            <DialogContentText>
              Are you sure you want to delete this job? This action cannot be undone.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              resetDeleteError();
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          {!deleteError && (
            <Button 
              onClick={handleConfirmDelete} 
              color="error"
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={20} /> : null}
            >
              {isDeleting ? 'Deleting...' : 'Delete Job'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
