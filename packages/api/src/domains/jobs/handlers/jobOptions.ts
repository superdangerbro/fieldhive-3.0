import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';

interface JobType {
    id: string;
    name: string;
}

export async function getJobOptions(req: Request, res: Response) {
    try {
        // Get unique job statuses from active jobs
        const statusResult = await AppDataSource.query(`
            SELECT DISTINCT status
            FROM jobs
            WHERE status IS NOT NULL
            ORDER BY status
        `);
        const statuses = statusResult.map((row: { status: string }) => row.status);

        // Get unique job types from active jobs
        const typesResult = await AppDataSource.query(`
            SELECT DISTINCT 
                job_type_id as id,
                job_type_id as name
            FROM jobs
            WHERE job_type_id IS NOT NULL
            ORDER BY job_type_id
        `);

        res.json({
            statuses,
            types: typesResult
        });
    } catch (error) {
        logger.error('Error fetching job options:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch job options',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
