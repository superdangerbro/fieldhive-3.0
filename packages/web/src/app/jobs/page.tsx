'use client';

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import JobSearch from '../../components/jobs/JobSearch';
import JobDetails from '../../components/jobs/JobDetails';
import JobsTable from '../../components/jobs/JobsTable';
import AddJobDialog from '../../components/jobs/AddJobDialog';
import EditJobDialog from '../../components/jobs/EditJobDialog';
import type { Job } from '@fieldhive/shared';
import { useJobs } from '../../stores/jobStore';

export default function JobsPage() {
  const { selectedJob, setSelectedJob } = useJobs();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);

  const handleAddJob = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsAddDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setEditJob(null);
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
  };

  return (
    <Box p={3}>
      <JobDetails
        job={selectedJob}
        onEdit={handleEdit}
        onUpdate={handleUpdate}
        onJobSelect={handleJobSelect}
      />
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
