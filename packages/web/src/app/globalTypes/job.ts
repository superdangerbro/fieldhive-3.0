import type { Property } from './property';
import type { Account } from './account';
import type { Address } from './address';

export interface JobStatus {
    name: string;
    color: string;
}

export interface JobType {
    jobTypeId: string;
    name: string;
    color?: string;
    fields?: any[]; // TODO: Define field types when needed
}

export interface Job {
    jobId: string;
    name: string;
    type: string;
    status: string | JobStatus;
    property?: Property;
    account?: Account;
    createdAt?: Date;
    updatedAt?: Date;
    jobType?: JobType;
    useCustomAddresses?: boolean;
    serviceAddress?: Address;
    billingAddress?: Address;
}

export interface CreateJobDto {
    name: string;
    type: string;
    status?: string;
    propertyId?: string;
    accountId?: string;
    useCustomAddresses?: boolean;
    serviceAddress?: Address;
    billingAddress?: Address;
}

export interface UpdateJobDto {
    name?: string;
    type?: string;
    status?: string;
    propertyId?: string;
    accountId?: string;
    useCustomAddresses?: boolean;
    serviceAddress?: Address;
    billingAddress?: Address;
}

export interface JobResponse {
    jobs: Job[];
    total?: number;
}
