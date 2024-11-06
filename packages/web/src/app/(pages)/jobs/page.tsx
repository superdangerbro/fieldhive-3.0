'use client';

import { useState } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import { JobSearch, JobDetails, JobsTable, JobsHeader } from './components';
import { AddJobDialog, EditJobDialog } from './dialogs';
import type { Job } from '@/app/globalTypes';
import { useJobs, useCreateJob, useUpdateJob } from './hooks/useJobs';

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use React Query hooks
  const { data = { jobs: [], total: 0 }, refetch } = useJobs();
  const { mutate: createJob, error: createError } = useCreateJob();
  const { mutate: updateJob, error: updateError } = useUpdateJob();

  const error = createError || updateError;

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddJob = (data: any) => {
    createJob(data, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        showSuccess('Job created successfully');
      }
    });
  };

  const handleEditSuccess = () => {
    refetch();
    
    // If we were editing the currently selected job, refresh it
    if (selectedJob && editJob && selectedJob.jobId === editJob.jobId) {
      const updatedJob = data.jobs.find(job => job.jobId === selectedJob.jobId);
      if (updatedJob) {
        setSelectedJob(updatedJob);
      }
    }
    
    setEditJob(null);
    showSuccess('Job updated successfully');
  };

  const handleJobSelect = (job: Job | null) => {
    setSelectedJob(job);
  };

  const handleEdit = (job: Job) => {
    setEditJob(job);
  };

  const handleUpdate = () => {
    refetch();
    showSuccess('Job updated successfully');
  };

  const handleCloseError = () => {
    // Error state is managed by React Query
  };

  return (
    <Box p={3}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseError}>
          {error instanceof Error ? error.message : 'An error occurred'}
        </Alert>
      )}

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <JobDetails
        job={selectedJob}
        onEdit={handleEdit}
        onUpdate={handleUpdate}
        onJobSelect={handleJobSelect}
      />
      <JobsHeader />
      <JobSearch
        jobs={data.jobs}
        selectedJob={selectedJob}
        onJobSelect={handleJobSelect}
        onAddClick={() => setIsAddDialogOpen(true)}
      />
      <JobsTable 
        onJobSelect={handleJobSelect}
        selectedJob={selectedJob}
        onJobsLoad={() => {}} // No longer needed with React Query
      />
      <AddJobDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddJob}
      />
      {editJob && (
        <EditJobDialog
          open={!!editJob}
          job={editJob}
          onClose={() => setEditJob(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </Box>
  );
}
