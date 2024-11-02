import { Request, Response } from 'express';
import { JobService } from '../../services/jobService';
import { CreateJobDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const jobService = new JobService();

export async function createJob(req: Request, res: Response) {
    try {
        const jobData: CreateJobDto = req.body;
        logger.info('Creating new job:', jobData);

        const job = await jobService.create(jobData);
        
        logger.info('Job created successfully:', job);
        res.status(201).json(job);
    } catch (error) {
        logger.error('Error creating job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create job',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
