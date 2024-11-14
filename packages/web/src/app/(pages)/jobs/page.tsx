'use client';

import { useState } from 'react';
import { Box, Alert, Snackbar, CircularProgress } from '@mui/material';
import { JobSearch, JobDetails, JobsTable } from './components';
import { AddJobDialog } from './dialogs';
import type { Job } from '../../globalTypes/job';
import { useJobs, useCreateJob, useUpdateJob } from './hooks/useJobs';
import { useSelectedJob } from './hooks/useSelectedJob';

export default function JobsPage() {
  const { selectedJob, setSelectedJob, isLoading: isLoadingSelected } = useSelectedJob();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use React Query hooks
  const { data = { jobs: [], total: 0 }, refetch } = useJobs();
  const { mutate: createJob, error: createError } = useCreateJob();
  const { error: updateError } = useUpdateJob();

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
        refetch();
      }
    });
  };

  const handleJobSelect = (job: Job | null) => {
    setSelectedJob(job?.job_id || null);
  };

  const handleUpdate = () => {
    refetch();
    showSuccess('Job updated successfully');
  };

  const handleCloseError = () => {
    // Error state is managed by React Query
  };

  if (isLoadingSelected) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Find the full job object for the selected job
  const selectedJobObject = selectedJob ? data.jobs.find(job => job.job_id === selectedJob.job_id) || null : null;

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

      {selectedJobObject && (
        <JobDetails
          job={selectedJobObject}
          onUpdate={handleUpdate}
          onJobSelect={handleJobSelect}
        />
      )}
      <JobSearch
        jobs={data.jobs}
        selectedJob={selectedJobObject}
        onJobSelect={handleJobSelect}
        onAddClick={() => setIsAddDialogOpen(true)}
      />
      <JobsTable 
        onJobSelect={handleJobSelect}
        selectedJob={selectedJobObject}
        onJobsLoad={() => {
          // If we have a selected job, ensure it's up to date
          if (selectedJob) {
            const updatedJob = data.jobs.find(job => job.job_id === selectedJob.job_id);
            if (updatedJob && JSON.stringify(updatedJob) !== JSON.stringify(selectedJob)) {
              setSelectedJob(updatedJob.job_id);
            }
          }
        }}
      />
      <AddJobDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddJob}
      />
    </Box>
  );
}
