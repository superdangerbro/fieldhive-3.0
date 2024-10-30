import { BaseModel } from './index';
import { Property } from './property';

export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Job extends BaseModel {
    title: string;
    description?: string;
    propertyId: string;
    property: Property;
    jobTypeId: string;
    status: JobStatus;
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
