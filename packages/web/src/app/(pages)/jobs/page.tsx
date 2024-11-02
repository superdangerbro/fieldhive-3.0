'use client';

import { useState } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import { JobSearch, JobDetails, JobsTable, JobsHeader, AddJobDialog, EditJobDialog } from './components';
import type { Job } from '@fieldhive/shared';
import { useJobs } from '@/stores/jobStore';
import { createJob, getJobs } from '@/services/api';

export default function JobsPage() {
  const { selectedJob, setSelectedJob } = useJobs();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddJob = async (data: any) => {
    try {
      setError(null);
      await createJob(data);
      setRefreshTrigger(prev => prev + 1);
      setIsAddDialogOpen(false);
      showSuccess('Job created successfully');
    } catch (error) {
      console.error('Failed to create job:', error);
      setError(error instanceof Error ? error.message : 'Failed to create job');
    }
  };

  const handleEditSuccess = async () => {
    try {
      // Refresh the jobs list
      setRefreshTrigger(prev => prev + 1);
      
      // If we were editing the currently selected job, refresh it
      if (selectedJob && editJob && selectedJob.job_id === editJob.job_id) {
        const response = await getJobs(1, 10); // Get first page to find the updated job
        const updatedJob = response.jobs.find(job => job.job_id === selectedJob.job_id);
        if (updatedJob) {
          setSelectedJob(updatedJob);
        }
      }
      
      setEditJob(null);
      showSuccess('Job updated successfully');
    } catch (error) {
      console.error('Failed to refresh job:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh job');
    }
  };

  const handleJobSelect = (job: Job | null) => {
    setSelectedJob(job);
  };

  const handleEdit = (job: Job) => {
    setEditJob(job);
  };

  const handleJobsLoad = (loadedJobs: Job[]) => {
    setJobs(loadedJobs);
  };

  const handleUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
    showSuccess('Job updated successfully');
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box p={3}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseError}>
          {error}
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
        jobs={jobs}
        selectedJob={selectedJob}
        onJobSelect={handleJobSelect}
        onAddClick={() => setIsAddDialogOpen(true)}
      />
      <JobsTable 
        refreshTrigger={refreshTrigger}
        onJobSelect={handleJobSelect}
        selectedJob={selectedJob}
        onJobsLoad={handleJobsLoad}
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
