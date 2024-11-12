import type { Property } from './property';
import type { Account } from './account';
import type { Address } from './address';

export interface JobStatus {
    value: string;    // Used as identifier
    label: string;    // Display name
    color: string;    // Status color
}

export interface JobType {
    value: string;    // Used as identifier
    label: string;    // Display name
    fields: any[];    // Type-specific fields
}

export interface Job {
    // API response fields (snake_case)
    job_id: string;
    title: string;
    description: string | null;
    property_id: string;
    job_type_id: string;
    status: string;
    use_custom_addresses: boolean;
    service_address_id: string;
    billing_address_id: string;
    created_at: string;
    updated_at: string;
    
    // Transformed fields (camelCase)
    jobId?: string;
    name?: string;
    type?: string;
    jobType?: JobType;
    property?: Property;
    account?: Account;
    createdAt?: Date;
    updatedAt?: Date;
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
    property_id?: string; // Changed to match API field
    accountId?: string;
    useCustomAddresses?: boolean;
    serviceAddress?: Address;
    billingAddress?: Address;
    job_type_id?: string;
}

export interface JobResponse {
    jobs: Job[];
    total?: number;
}
