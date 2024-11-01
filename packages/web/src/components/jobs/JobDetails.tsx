'use client';

import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Divider } from '@mui/material';
import type { Job } from '@fieldhive/shared';
import { deleteJob } from '../../services/api';
import { JobHeader, JobMetadata, JobTabs } from '.';

interface JobDetailsProps {
  job: Job | null;
  onEdit: (job: Job) => void;
  onUpdate?: () => void;
  onJobSelect: (job: Job | null) => void;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job, onEdit, onUpdate, onJobSelect }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

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
            onEdit={onEdit}
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
