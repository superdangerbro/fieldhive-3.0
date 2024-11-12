import { Router } from 'express';
import { getJobs, getJob, createJob, updateJob, archiveJob, getJobAddresses } from './handler';

const router = Router();

// Get all jobs with optional filters
router.get('/', getJobs);

// Get job by ID
router.get('/:id', getJob);

// Get job addresses
router.get('/:id/addresses', getJobAddresses);

// Create new job
router.post('/', createJob);

// Update job
router.put('/:id', updateJob);

// Archive job
router.post('/:id/archive', archiveJob);

export default router;
