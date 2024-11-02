import { Job, JobStatus, CreateJobDto, UpdateJobDto, JobsResponse } from '@fieldhive/shared';

// Re-export shared types
export { JobStatus, CreateJobDto, UpdateJobDto, JobsResponse };

// Extend shared types for internal use
export interface JobResponse extends Omit<Job, 'property' | 'account' | 'accounts'> {
    property: {
        property_id: string;
        name: string;
        address: string;
        service_address: any;
        billing_address: any;
    };
    accounts: Array<{
        account_id: string;
        name: string;
        addresses: Array<any>;
    }>;
}

// Validation types
export const VALID_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'] as const;

/**
 * Internal request types that extend the shared DTOs
 * These can include additional properties needed by the API
 * but not exposed in the shared types
 */
export interface InternalCreateJobRequest extends CreateJobDto {
    // Add any additional internal properties here
}

export interface InternalUpdateJobRequest extends UpdateJobDto {
    // Add any additional internal properties here
}

/**
 * Example Usage:
 * ```typescript
 * // Using shared types
 * const job: Job = { ... };
 * 
 * // Using internal types
 * const response: JobResponse = { ... };
 * 
 * // Using DTOs
 * const createRequest: CreateJobDto = { ... };
 * const updateRequest: UpdateJobDto = { ... };
 * ```
 */
