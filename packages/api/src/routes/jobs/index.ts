import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

const GET_JOBS_QUERY = `
SELECT 
    j.job_id,
    j.job_type_id,
    j.property_id,
    j.status,
    j.notes,
    j.created_at,
    j.updated_at,
    jsonb_build_object(
        'job_type_id', jt.job_type_id, 
        'name', jt.name
    ) as job_type,
    jsonb_build_object(
        'property_id', p.property_id, 
        'name', p.name, 
        'address', CONCAT_WS(', ', p.address1, p.city, p.province)
    ) as property
FROM jobs j
LEFT JOIN job_types jt ON jt.job_type_id = j.job_type_id
LEFT JOIN properties p ON p.property_id = j.property_id`;

// Get all jobs with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const offset = (page - 1) * pageSize;

        logger.info('Fetching jobs with params:', { page, pageSize, offset });

        // First, check if the jobs table has any records
        const countResult = await AppDataSource.query('SELECT COUNT(*) as count FROM jobs');
        logger.info('Total jobs in database:', countResult[0].count);

        // Get the jobs with pagination
        const jobsQuery = `${GET_JOBS_QUERY} ORDER BY j.created_at DESC LIMIT $1 OFFSET $2`;
        logger.info('Executing jobs query:', jobsQuery);
        logger.info('Query parameters:', [pageSize, offset]);

        const [jobs, total] = await Promise.all([
            AppDataSource.query(jobsQuery, [pageSize, offset]),
            AppDataSource.query('SELECT COUNT(*) as count FROM jobs j')
        ]);

        logger.info('Jobs query result:', {
            jobsCount: jobs.length,
            totalCount: parseInt(total[0].count),
            firstJob: jobs[0] ? {
                job_id: jobs[0].job_id,
                status: jobs[0].status
            } : null
        });

        // Check if we have any jobs
        if (jobs.length === 0) {
            logger.info('No jobs found for the current page');
        }

        const response = {
            jobs: jobs || [],
            total: parseInt(total[0].count),
            page,
            pageSize
        };

        logger.info('Sending response:', {
            totalJobs: response.jobs.length,
            totalCount: response.total,
            page: response.page,
            pageSize: response.pageSize
        });

        res.json(response);
    } catch (error) {
        logger.error('Error fetching jobs:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch jobs',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Create new job
router.post('/', async (req, res) => {
    try {
        const { property_id, job_type_id, notes } = req.body;

        logger.info('Creating job with data:', { property_id, job_type_id, notes });

        if (!property_id || !job_type_id) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Property ID and Job Type ID are required'
            });
        }

        // Verify property and job type exist
        const [propertyExists, jobTypeExists] = await Promise.all([
            AppDataSource.query(
                'SELECT property_id FROM properties WHERE property_id = $1',
                [property_id]
            ),
            AppDataSource.query(
                'SELECT job_type_id FROM job_types WHERE job_type_id = $1',
                [job_type_id]
            )
        ]);

        if (!propertyExists.length) {
            logger.error('Property not found:', property_id);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        if (!jobTypeExists.length) {
            logger.error('Job type not found:', job_type_id);
            return res.status(404).json({
                error: 'Not found',
                message: 'Job type not found'
            });
        }

        // Create job with default status
        const [job] = await AppDataSource.query(
            'INSERT INTO jobs (property_id, job_type_id, notes, status, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING job_id',
            [property_id, job_type_id, notes, 'pending']
        );

        logger.info('Job created:', job);

        // Fetch complete job with relations
        const [completeJob] = await AppDataSource.query(
            `${GET_JOBS_QUERY} WHERE j.job_id = $1`,
            [job.job_id]
        );

        logger.info('Complete job details:', completeJob);

        res.status(201).json(completeJob);
    } catch (error) {
        logger.error('Error creating job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Failed to create job',
            details: error
        });
    }
});

// Update job
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        logger.info('Updating job:', { id, status, notes });

        // Verify job exists
        const [existingJob] = await AppDataSource.query(
            'SELECT job_id FROM jobs WHERE job_id = $1',
            [id]
        );

        if (!existingJob) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Job not found'
            });
        }

        await AppDataSource.query(
            'UPDATE jobs SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = NOW() WHERE job_id = $3',
            [status, notes, id]
        );

        // Fetch updated job with relations
        const [updatedJob] = await AppDataSource.query(
            `${GET_JOBS_QUERY} WHERE j.job_id = $1`,
            [id]
        );

        logger.info('Job updated:', updatedJob);

        res.json(updatedJob);
    } catch (error) {
        logger.error('Error updating job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update job',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Delete job
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        logger.info('Deleting job:', id);

        const result = await AppDataSource.query(
            'DELETE FROM jobs WHERE job_id = $1 RETURNING job_id',
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Job not found'
            });
        }

        logger.info('Job deleted:', id);

        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete job',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

export default router;
