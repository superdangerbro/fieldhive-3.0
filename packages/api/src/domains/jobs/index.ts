/**
 * Job Domain Exports
 */

// Entity
export { Job } from './entities/Job';

// Types
export {
    JobType,
    JobStatus,
    CreateJobDto,
    UpdateJobDto,
    JobResponse,
    JobFilters,
    JobWithRelations
} from './types';

// Service
export { JobService } from './services/jobService';

// Routes
export { default as jobRoutes } from './routes';

/**
 * Example Usage:
 * ```typescript
 * import { 
 *   Job,
 *   JobService,
 *   CreateJobDto,
 *   jobRoutes 
 * } from './domains/jobs';
 * 
 * // Use in Express app
 * app.use('/api/jobs', jobRoutes);
 * 
 * // Use service in other domains
 * const jobService = new JobService();
 * const job = await jobService.findById(id);
 * ```
 */
