import { BaseModel } from './index';
import { Property } from './property';
import { Account } from './account';
import { Address } from './address';
import { StatusConfig } from './status';

// Support both string (legacy) and object (new) formats
export type JobStatusType = string | StatusConfig;

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
    status: JobStatusType;
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
    status?: JobStatusType;
    use_custom_addresses?: boolean;
    service_address_id?: string | null;
    billing_address_id?: string | null;
    custom_service_address?: Partial<Address>;
    custom_billing_address?: Partial<Address>;
}

export interface UpdateJobDto {
    title?: string;
    description?: string;
    status?: JobStatusType;
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

// Helper function to get status color
export const getStatusColor = (status: JobStatusType) => {
    if (typeof status === 'object') {
        return status.color;
    }

    // Legacy status mapping
    switch (status.toLowerCase()) {
        case 'pending':
            return 'warning';
        case 'in_progress':
            return 'info';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'error';
        default:
            return 'default';
    }
};

// Helper function to get status display name
export const getStatusDisplayName = (status: JobStatusType): string => {
    if (typeof status === 'object') {
        return status.label.toUpperCase();
    }
    return status.replace(/_/g, ' ').toUpperCase();
};
