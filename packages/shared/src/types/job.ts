import { BaseModel } from './index';
import { Property } from './property';
import { Account } from './account';
import { Address } from './address';

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
    accounts: Account[];
    use_custom_addresses: boolean;
    service_address_id: string | null;
    service_address?: Address | null;
    billing_address_id: string | null;
    billing_address?: Address | null;
}

export interface CreateJobDto {
    title: string;
    description?: string;
    propertyId: string;
    jobTypeId: string;
    status?: JobStatus;
    use_custom_addresses?: boolean;
    service_address_id?: string | null;
    billing_address_id?: string | null;
    custom_service_address?: Partial<Address>;
    custom_billing_address?: Partial<Address>;
}

export interface UpdateJobDto {
    title?: string;
    description?: string;
    status?: JobStatus;
    job_type_id?: string;
    property_id?: string;
    use_custom_addresses?: boolean;
    service_address_id?: string | null;
    billing_address_id?: string | null;
    custom_service_address?: Partial<Address>;
    custom_billing_address?: Partial<Address>;
}

export interface JobsResponse {
    jobs: Job[];
    total: number;
    limit: number;
    offset: number;
}
