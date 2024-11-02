import { Router } from 'express';
import { getJob, createJob, updateJob, archiveJob } from './handlers';

const router = Router();

// Get job by ID
router.get('/:id', getJob);

// Create new job
router.post('/', createJob);

// Update job
router.put('/:id', updateJob);

// Archive job
router.post('/:id/archive', archiveJob);

export default router;
