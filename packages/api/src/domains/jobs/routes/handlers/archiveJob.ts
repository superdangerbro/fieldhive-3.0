import { Request, Response } from 'express';
import { JobService } from '../../services/jobService';
import { logger } from '../../../../core/utils/logger';

const jobService = new JobService();

export async function archiveJob(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Archiving job with ID: ${id}`);

        const job = await jobService.archive(id);

        if (!job) {
            logger.warn(`Job not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Job not found'
            });
        }

        logger.info('Job archived successfully:', job);
        res.json(job);
    } catch (error) {
        logger.error('Error archiving job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to archive job',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
