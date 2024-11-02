import { Request, Response } from 'express';
import { JobService } from '../../services/jobService';
import { UpdateJobDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const jobService = new JobService();

export async function updateJob(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const jobData: UpdateJobDto = req.body;
        logger.info(`Updating job ${id}:`, jobData);

        const job = await jobService.update(id, jobData);

        if (!job) {
            logger.warn(`Job not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Job not found'
            });
        }

        logger.info('Job updated successfully:', job);
        res.json(job);
    } catch (error) {
        logger.error('Error updating job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update job',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
