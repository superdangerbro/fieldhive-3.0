import { AppDataSource } from '../../../core/config/database';
import { Job } from '../entities/Job';
import { CreateJobDto, UpdateJobDto, JobFilters, JobStatus } from '../types';
import { AccountService } from '../../accounts/services/accountService';
import { logger } from '../../../core/utils/logger';

export class JobService {
    private jobRepository = AppDataSource.getRepository(Job);
    private accountService = new AccountService();

    async findById(id: string): Promise<Job | null> {
        try {
            return await this.jobRepository.findOne({
                where: { job_id: id },
                relations: ['accounts']
            });
        } catch (error) {
            logger.error('Error finding job by ID:', error);
            throw error;
        }
    }

    async create(jobData: CreateJobDto): Promise<Job> {
        try {
            this.validateJob(jobData);
            
            const job = this.jobRepository.create({
                ...jobData,
                status: jobData.status || 'pending'
            });

            if (jobData.account_ids?.length) {
                job.accounts = [];
                for (const accountId of jobData.account_ids) {
                    const account = await this.accountService.findById(accountId);
                    if (!account) {
                        throw new Error(`Account not found with ID: ${accountId}`);
                    }
                    job.accounts.push(account);
                }
            }

            return await this.jobRepository.save(job);
        } catch (error) {
            logger.error('Error creating job:', error);
            throw error;
        }
    }

    async update(id: string, jobData: UpdateJobDto): Promise<Job | null> {
        try {
            const job = await this.findById(id);
            if (!job) {
                return null;
            }

            this.validateJob(jobData, true);
            this.jobRepository.merge(job, jobData);
            return await this.jobRepository.save(job);
        } catch (error) {
            logger.error('Error updating job:', error);
            throw error;
        }
    }

    async archive(id: string): Promise<Job | null> {
        try {
            const job = await this.findById(id);
            if (!job) {
                return null;
            }

            job.status = 'cancelled'; // or any other logic for archiving
            return await this.jobRepository.save(job);
        } catch (error) {
            logger.error('Error archiving job:', error);
            throw error;
        }
    }

    private validateJob(job: Partial<CreateJobDto>, isUpdate = false): void {
        const errors: string[] = [];

        if (!isUpdate || job.title !== undefined) {
            if (!job.title?.trim()) {
                errors.push('Job title is required');
            }
        }

        if (!isUpdate || job.type !== undefined) {
            if (!job.type) {
                errors.push('Job type is required');
            }
        }

        if (errors.length > 0) {
            throw new Error(`Job validation failed: ${errors.join(', ')}`);
        }
    }
}
