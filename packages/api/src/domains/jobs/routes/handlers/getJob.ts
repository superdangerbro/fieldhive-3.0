import { Request, Response } from 'express';
import { JobService } from '../../services/jobService';
import { logger } from '../../../../core/utils/logger';

const jobService = new JobService();

export async function getJob(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Getting job with ID: ${id}`);

        const job = await jobService.findById(id);

        if (!job) {
            logger.warn(`Job not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Job not found'
            });
        }

        logger.info(`Found job:`, job);
        res.json(job);
    } catch (error) {
        logger.error('Error fetching job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch job',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
