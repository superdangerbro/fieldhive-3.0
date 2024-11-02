import { Job } from './entities/Job';
import { Account } from '../accounts/entities/Account';
import { Address } from '../addresses/entities/Address';

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface CreateJobDto {
    title: string;
    description?: string;
    property_id: string;
    job_type_id: string;
    status?: JobStatus;
    account_ids?: string[];
}

export interface UpdateJobDto {
    title?: string;
    description?: string;
    property_id?: string;
    job_type_id?: string;
    status?: JobStatus;
}

export interface JobResponse extends Omit<Job, 'accounts'> {
    job_id: string;
    accounts: Account[];
    service_address: Address;
    billing_address: Address;
    created_at: Date;
    updated_at: Date;
}

export interface JobFilters {
    type?: JobType;
    status?: JobStatus;
    title?: string;
    account_id?: string;
}

// For eager loading relationships
export interface JobWithRelations extends Job {
    accounts: Account[];
    service_address: Address; // Now required
    billing_address: Address;  // Now required
}
