import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Job } from './entities/Job';
import { logger } from '../../utils/logger';

const jobRepository = AppDataSource.getRepository(Job);

// Get all jobs with optional filters
export async function getJobs(req: Request, res: Response) {
    try {
        const { type, status, title, property_id } = req.query;
        const queryBuilder = jobRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.property', 'property')
            .leftJoinAndSelect('job.service_address', 'service_address')
            .leftJoinAndSelect('job.billing_address', 'billing_address');

        if (type) {
            queryBuilder.andWhere('job.job_type_id = :type', { type });
        }
        if (status) {
            queryBuilder.andWhere('job.status = :status', { status });
        }
        if (title) {
            queryBuilder.andWhere('job.title ILIKE :title', { title: `%${title}%` });
        }
        if (property_id) {
            queryBuilder.andWhere('job.property_id = :propertyId', { propertyId: property_id });
        }

        const [jobs, total] = await queryBuilder.getManyAndCount();
        return res.json({ jobs, total });
    } catch (error) {
        logger.error('Error getting jobs:', error);
        return res.status(500).json({ 
            message: 'Failed to get jobs',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Get single job by ID
export async function getJob(req: Request, res: Response) {
    try {
        const job = await jobRepository.findOne({ 
            where: { job_id: req.params.id },
            relations: ['property', 'service_address', 'billing_address']
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        return res.json(job);
    } catch (error) {
        logger.error('Error getting job:', error);
        return res.status(500).json({ 
            message: 'Failed to get job',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Create new job
export async function createJob(req: Request, res: Response) {
    try {
        // Validate required fields
        const { title, type } = req.body;
        if (!title?.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Job title is required'
            });
        }
        if (!type) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Job type is required'
            });
        }

        // Create job with default status
        const job = jobRepository.create({
            ...req.body,
            status: req.body.status || 'pending'
        });

        const savedJob = await jobRepository.save(job);
        logger.info('Job created:', savedJob);

        // Return job with all relations
        const fullJob = await jobRepository.findOne({
            where: { job_id: savedJob.job_id },
            relations: ['property', 'service_address', 'billing_address']
        });

        return res.status(201).json(fullJob);
    } catch (error) {
        logger.error('Error creating job:', error);
        return res.status(500).json({ 
            message: 'Failed to create job',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Update job
export async function updateJob(req: Request, res: Response) {
    try {
        const job = await jobRepository.findOne({ 
            where: { job_id: req.params.id }
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Validate fields if they're being updated
        const { title, type } = req.body;
        if (title !== undefined && !title.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Job title cannot be empty'
            });
        }
        if (type !== undefined && !type) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Job type cannot be empty'
            });
        }

        jobRepository.merge(job, req.body);
        const updatedJob = await jobRepository.save(job);
        logger.info('Job updated:', updatedJob);

        // Return job with all relations
        const fullJob = await jobRepository.findOne({
            where: { job_id: updatedJob.job_id },
            relations: ['property', 'service_address', 'billing_address']
        });

        return res.json(fullJob);
    } catch (error) {
        logger.error('Error updating job:', error);
        return res.status(500).json({ 
            message: 'Failed to update job',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Archive job
export async function archiveJob(req: Request, res: Response) {
    try {
        const job = await jobRepository.findOne({ 
            where: { job_id: req.params.id } 
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        job.status = 'cancelled';
        const archivedJob = await jobRepository.save(job);
        logger.info('Job archived:', archivedJob);

        return res.json({ success: true });
    } catch (error) {
        logger.error('Error archiving job:', error);
        return res.status(500).json({ 
            message: 'Failed to archive job',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
