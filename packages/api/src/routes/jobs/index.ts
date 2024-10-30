import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';
import { Setting } from '../../entities/Setting';

const router = Router();
const JOB_TYPES_SETTING_KEY = 'job_types';

const GET_JOBS_QUERY = `
SELECT 
    j.job_id,
    j.title,
    j.job_type_id,
    j.property_id,
    j.status,
    j.description,
    j.created_at,
    j.updated_at,
    jsonb_build_object(
        'job_type_id', j.job_type_id,
        'name', j.job_type_id
    ) as job_type,
    jsonb_build_object(
        'property_id', p.property_id,
        'name', p.name,
        'address', CONCAT_WS(', ', NULLIF(p.address1, ''), NULLIF(p.city, ''), NULLIF(p.province, ''))
    ) as property,
    jsonb_build_object(
        'account_id', a.account_id,
        'name', a.name
    ) as account
FROM jobs j
LEFT JOIN properties p ON p.property_id = j.property_id
LEFT JOIN properties_accounts pa ON pa.property_id = p.property_id
LEFT JOIN accounts a ON a.account_id = pa.account_id`;

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

        // Log each job for debugging
        jobs.forEach((job: any, index: number) => {
            logger.info(`Job ${index + 1}:`, JSON.stringify(job, null, 2));
        });

        logger.info('Jobs query result:', {
            jobsCount: jobs.length,
            totalCount: parseInt(total[0].count),
            firstJob: jobs[0] ? JSON.stringify(jobs[0], null, 2) : null
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

        logger.info('Sending response:', JSON.stringify(response, null, 2));

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
        const { title, property_id, job_type_id, description } = req.body;

        logger.info('Creating job with data:', { title, property_id, job_type_id, description });

        if (!property_id || !job_type_id || !title) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Property ID, Job Type ID, and Title are required'
            });
        }

        // Verify property exists
        const [propertyExists] = await AppDataSource.query(
            'SELECT property_id FROM properties WHERE property_id = $1',
            [property_id]
        );

        if (!propertyExists) {
            logger.error('Property not found:', property_id);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        // Create job with default status
        const [job] = await AppDataSource.query(
            'INSERT INTO jobs (title, property_id, job_type_id, description, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING job_id',
            [title, property_id, job_type_id, description, 'pending']
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
        const { title, status, description } = req.body;

        logger.info('Updating job:', { id, title, status, description });

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
            'UPDATE jobs SET title = COALESCE($1, title), status = COALESCE($2, status), description = COALESCE($3, description), updated_at = NOW() WHERE job_id = $4',
            [title, status, description, id]
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
