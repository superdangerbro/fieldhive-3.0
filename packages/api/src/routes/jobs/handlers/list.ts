import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { JobResponse } from '../types';
import { GET_JOBS_QUERY, COUNT_JOBS_QUERY } from '../queries';
import { isValidStatus } from '../validation';

interface JobsListResponse {
    jobs: JobResponse[];
    total: number;
    limit: number;
    offset: number;
}

/**
 * Get all jobs with pagination
 * Handles:
 * - Pagination
 * - Status validation
 * - Response formatting
 */
export const listJobs = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const offset = (page - 1) * pageSize;

        logger.info('Fetching jobs with params:', { page, pageSize, offset });

        // Get the jobs with pagination
        const jobsQuery = `${GET_JOBS_QUERY} ORDER BY j.created_at DESC LIMIT $1 OFFSET $2`;
        
        const [jobs, total] = await Promise.all([
            AppDataSource.query(jobsQuery, [pageSize, offset]),
            AppDataSource.query(COUNT_JOBS_QUERY)
        ]);

        // Format the response
        const response: JobsListResponse = {
            jobs: jobs.map((job: any) => ({
                ...job,
                // Ensure status is valid
                status: isValidStatus(job.status) ? job.status : 'pending',
                job_type: {
                    job_type_id: job.job_type_id,
                    name: job.job_type_name || job.job_type_id
                }
            })),
            total: parseInt(total[0].count),
            limit: pageSize,
            offset: offset
        };

        logger.info('Successfully fetched jobs:', {
            total: response.total,
            pageSize,
            page
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
};

/**
 * Get a single job by ID
 */
export const getJobById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        logger.info('Fetching job by ID:', id);

        const [job] = await AppDataSource.query(
            `${GET_JOBS_QUERY} AND j.job_id = $1`,
            [id]
        );

        if (!job) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Job not found'
            });
        }

        const response: JobResponse = {
            ...job,
            status: isValidStatus(job.status) ? job.status : 'pending',
            job_type: {
                job_type_id: job.job_type_id,
                name: job.job_type_name || job.job_type_id
            }
        };

        res.json(response);
    } catch (error) {
        logger.error('Error fetching job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch job',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
