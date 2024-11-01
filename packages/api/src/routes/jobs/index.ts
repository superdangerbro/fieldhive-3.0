import { Router } from 'express';
import { createJob } from './handlers/create';
import { listJobs, getJobById } from './handlers/list';
import { updateJob } from './handlers/update';
import { deleteJob } from './handlers/delete';
import { validateCreateJobRequest, validateUpdateJobRequest } from './validation';

// Re-export types for backwards compatibility
export * from './types';

const router = Router();

/**
 * Job Routes
 * Organized with validation middleware and handlers
 */

// Create new job
router.post('/', validateCreateJobRequest, createJob);

// Get all jobs with pagination
router.get('/', listJobs);

// Get single job
router.get('/:id', getJobById);

// Update job
router.put('/:id', validateUpdateJobRequest, updateJob);

// Delete job
router.delete('/:id', deleteJob);

export default router;

/**
 * For backwards compatibility, export individual handlers
 * This allows existing code to continue working while
 * we transition to the new modular structure
 */
export {
    createJob,
    listJobs,
    getJobById,
    updateJob,
    deleteJob
};

/**
 * Export validation utilities for external use
 */
export {
    validateCreateJobRequest,
    validateUpdateJobRequest,
    isValidStatus
} from './validation';

/**
 * Export queries for external use
 * This allows other modules to use our SQL queries
 * while maintaining consistency
 */
export {
    GET_JOBS_QUERY,
    CREATE_JOB_QUERY,
    UPDATE_JOB_QUERY,
    DELETE_JOB_QUERY,
    COUNT_JOBS_QUERY
} from './queries';

/**
 * Example Usage:
 * 
 * Using the router (recommended):
 * ```typescript
 * import jobsRouter from './routes/jobs';
 * app.use('/jobs', jobsRouter);
 * ```
 * 
 * Using individual handlers (backwards compatibility):
 * ```typescript
 * import { createJob, updateJob } from './routes/jobs';
 * router.post('/custom-jobs', validateCreateJobRequest, createJob);
 * ```
 * 
 * Using types:
 * ```typescript
 * import { JobResponse, CreateJobRequest } from './routes/jobs';
 * ```
 * 
 * Using validation:
 * ```typescript
 * import { validateCreateJobRequest } from './routes/jobs';
 * router.post('/jobs', validateCreateJobRequest, customHandler);
 * ```
 */
