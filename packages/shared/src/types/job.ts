import { BaseModel } from './index';
import { Property } from './property';
import { Account } from './account';

export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Job {
    job_id: string;
    title: string;
    description?: string;
    property_id: string;
    property: Property;
    job_type_id: string;
    job_type: {
        job_type_id: string;
        name: string;
    };
    status: JobStatus;
    created_at: string;
    updated_at: string;
    account: Account;
}

export interface CreateJobDto {
    title: string;
    description?: string;
    propertyId: string;
    jobTypeId: string;
    status?: JobStatus;
}

export interface UpdateJobDto {
    title?: string;
    description?: string;
    status?: JobStatus;
}

export interface JobsResponse {
    jobs: Job[];
    total: number;
    limit: number;
    offset: number;
}
