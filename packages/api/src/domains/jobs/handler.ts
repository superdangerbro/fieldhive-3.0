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
            .leftJoinAndSelect('property.accounts', 'accounts', 'accounts.status != :status', { status: 'deleted' })
            .leftJoinAndSelect('property.serviceAddress', 'propertyServiceAddress')
            .leftJoinAndSelect('property.billingAddress', 'propertyBillingAddress')
            .leftJoinAndSelect('job.serviceAddress', 'jobServiceAddress')
            .leftJoinAndSelect('job.billingAddress', 'jobBillingAddress');

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

        // Log the first job's data for debugging
        if (jobs.length > 0) {
            logger.info('First job data:', {
                jobId: jobs[0].job_id,
                useCustomAddresses: jobs[0].use_custom_addresses,
                serviceAddress: jobs[0].serviceAddress ? 'present' : 'null',
                billingAddress: jobs[0].billingAddress ? 'present' : 'null',
                propertyServiceAddress: jobs[0].property?.serviceAddress ? 'present' : 'null',
                propertyBillingAddress: jobs[0].property?.billingAddress ? 'present' : 'null'
            });
        }

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
            relations: [
                'property',
                'property.accounts',
                'property.serviceAddress',
                'property.billingAddress',
                'serviceAddress',
                'billingAddress'
            ]
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

// Get job addresses
export async function getJobAddresses(req: Request, res: Response) {
    try {
        // Use query builder for more control over the joins
        const job = await jobRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.property', 'property')
            .leftJoinAndSelect('job.serviceAddress', 'jobServiceAddress')
            .leftJoinAndSelect('job.billingAddress', 'jobBillingAddress')
            .leftJoinAndSelect('property.serviceAddress', 'propertyServiceAddress')
            .leftJoinAndSelect('property.billingAddress', 'propertyBillingAddress')
            .where('job.job_id = :jobId', { jobId: req.params.id })
            .getOne();

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Log the raw data
        logger.info('Raw job data:', {
            jobId: job.job_id,
            useCustomAddresses: job.use_custom_addresses,
            jobServiceAddressId: job.service_address_id,
            jobBillingAddressId: job.billing_address_id,
            property: {
                id: job.property?.property_id,
                name: job.property?.name,
                serviceAddressId: job.property?.service_address_id,
                billingAddressId: job.property?.billing_address_id
            }
        });

        // Log the address objects
        logger.info('Address objects:', {
            jobServiceAddress: job.serviceAddress ? {
                id: job.serviceAddress.address_id,
                address1: job.serviceAddress.address1
            } : null,
            jobBillingAddress: job.billingAddress ? {
                id: job.billingAddress.address_id,
                address1: job.billingAddress.address1
            } : null,
            propertyServiceAddress: job.property?.serviceAddress ? {
                id: job.property.serviceAddress.address_id,
                address1: job.property.serviceAddress.address1
            } : null,
            propertyBillingAddress: job.property?.billingAddress ? {
                id: job.property.billingAddress.address_id,
                address1: job.property.billingAddress.address1
            } : null
        });

        // Determine which addresses to use
        const serviceAddress = job.use_custom_addresses 
            ? job.serviceAddress 
            : (job.property?.serviceAddress || null);
        
        const billingAddress = job.use_custom_addresses 
            ? job.billingAddress 
            : (job.property?.billingAddress || null);

        // Log the final selection
        logger.info('Selected addresses:', {
            useCustomAddresses: job.use_custom_addresses,
            selectedServiceAddress: serviceAddress ? {
                id: serviceAddress.address_id,
                address1: serviceAddress.address1
            } : null,
            selectedBillingAddress: billingAddress ? {
                id: billingAddress.address_id,
                address1: billingAddress.address1
            } : null
        });

        return res.json({
            serviceAddress,
            billingAddress,
            use_custom_addresses: job.use_custom_addresses
        });
    } catch (error) {
        logger.error('Error getting job addresses:', error);
        return res.status(500).json({
            message: 'Failed to get job addresses',
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

        const newJob = new Job();
        Object.assign(newJob, {
            ...req.body,
            status: req.body.status || 'pending'
        });

        const savedJob = await jobRepository.save(newJob);
        logger.info('Job created:', { jobId: savedJob.job_id });

        const fullJob = await jobRepository.findOne({
            where: { job_id: savedJob.job_id },
            relations: [
                'property',
                'property.accounts',
                'property.serviceAddress',
                'property.billingAddress',
                'serviceAddress',
                'billingAddress'
            ]
        });

        if (!fullJob) {
            throw new Error('Failed to fetch created job');
        }

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
        // Log the update request
        logger.info('Updating job:', {
            jobId: req.params.id,
            updateData: req.body
        });

        // Get the current job to ensure it exists
        const job = await jobRepository.findOne({
            where: { job_id: req.params.id }
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Update the job with all provided fields
        Object.assign(job, req.body);
        
        // Save the updated job
        await jobRepository.save(job);

        // Fetch the updated job with all relations
        const updatedJob = await jobRepository.findOne({
            where: { job_id: req.params.id },
            relations: [
                'property',
                'property.accounts',
                'property.serviceAddress',
                'property.billingAddress',
                'serviceAddress',
                'billingAddress'
            ]
        });

        if (!updatedJob) {
            throw new Error('Failed to fetch updated job');
        }

        logger.info('Job updated successfully:', {
            jobId: updatedJob.job_id,
            status: updatedJob.status,
            job_type_id: updatedJob.job_type_id,
            property_id: updatedJob.property_id
        });

        return res.json(updatedJob);
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
            where: { job_id: req.params.id },
            relations: [
                'property',
                'property.accounts',
                'property.serviceAddress',
                'property.billingAddress',
                'serviceAddress',
                'billingAddress'
            ]
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        job.status = 'cancelled';
        await jobRepository.save(job);

        // Fetch the archived job with all relations
        const archivedJob = await jobRepository.findOne({
            where: { job_id: job.job_id },
            relations: [
                'property',
                'property.accounts',
                'property.serviceAddress',
                'property.billingAddress',
                'serviceAddress',
                'billingAddress'
            ]
        });

        if (!archivedJob) {
            throw new Error('Failed to fetch archived job');
        }

        logger.info('Job archived:', archivedJob);
        return res.json(archivedJob);
    } catch (error) {
        logger.error('Error archiving job:', error);
        return res.status(500).json({ 
            message: 'Failed to archive job',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
