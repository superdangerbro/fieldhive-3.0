import { Router } from 'express';
import { getJobs, getJob, createJob, updateJob, archiveJob } from './handler';

const router = Router();

// Get all jobs with optional filters
router.get('/', getJobs);

// Get job by ID
router.get('/:id', getJob);

// Create new job
router.post('/', createJob);

// Update job
router.put('/:id', updateJob);

// Archive job
router.post('/:id/archive', archiveJob);

export default router;
