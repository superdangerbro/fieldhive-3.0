'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Job, CreateJobDto, UpdateJobDto } from '../../../globalTypes/job';
import { ENV_CONFIG } from '../../../config/environment';

const ENDPOINTS = {
    jobs: '/jobs',
    jobDetails: (id: string) => `/jobs/${id}`,
    bulkDelete: '/jobs/bulk-delete'
} as const;

// Helper function to build full API URL with query params
const buildUrl = (endpoint: string, params?: Record<string, string | undefined>) => {
    const url = `${ENV_CONFIG.api.baseUrl}${endpoint}`;
    if (!params) return url;
    
    const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
        .join('&');
    
    return queryString ? `${url}?${queryString}` : url;
};

// Helper function to handle API errors consistently
const handleApiError = async (response: Response) => {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
};

interface JobsResponse {
    jobs: Job[];
    total: number;
}

// Define JobsQueryParams as a Record type to match buildUrl parameter type
type JobsQueryParams = Partial<Record<'property_id' | 'type' | 'status' | 'title', string>>;

// Helper function to transform API response to match our TypeScript interfaces
const transformJob = (job: any): Job => {
    console.log('Transforming job:', job);
    const transformed = {
        job_id: job.job_id || job.job_job_id,
        title: job.title || job.job_title,
        description: job.description || job.job_description,
        property_id: job.property_id || job.job_property_id,
        job_type_id: job.job_type_id || job.job_job_type_id,
        status: job.status || job.job_status,
        use_custom_addresses: job.use_custom_addresses || job.job_use_custom_addresses,
        service_address_id: job.service_address_id || job.job_service_address_id,
        billing_address_id: job.billing_address_id || job.job_billing_address_id,
        created_at: job.created_at || job.job_created_at,
        updated_at: job.updated_at || job.job_updated_at,
        property: job.property ? {
            property_id: job.property.property_id || job.property_property_id,
            name: job.property.name || job.property_name,
            type: job.property.type || job.property_property_type,
            status: job.property.status || job.property_status,
            service_address_id: job.property.service_address_id || job.property_service_address_id,
            billing_address_id: job.property.billing_address_id || job.property_billing_address_id,
            location: job.property.location || job.property_location,
            boundary: job.property.boundary || job.property_boundary,
            accounts: job.property.accounts || [],
            created_at: job.property.created_at || job.property_created_at,
            updated_at: job.property.updated_at || job.property_updated_at,
            serviceAddress: job.property.serviceAddress || null,
            billingAddress: job.property.billingAddress || null
        } : undefined,
        // Use the full address objects, not just IDs
        serviceAddress: job.serviceAddress || null,
        billingAddress: job.billingAddress || null
    };
    console.log('Transformed job:', transformed);
    return transformed;
};

// Jobs List Hook
export const useJobs = (params?: JobsQueryParams) => {
    return useQuery<JobsResponse>({
        queryKey: ['jobs', params],
        queryFn: async () => {
            const response = await fetch(buildUrl(ENDPOINTS.jobs, params), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('API Response:', JSON.stringify(data, null, 2));

            const transformedJobs = data.jobs.map(transformJob);
            console.log('Transformed Jobs:', JSON.stringify(transformedJobs, null, 2));

            return {
                jobs: transformedJobs,
                total: data.total || transformedJobs.length
            };
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

// Create Job Hook
export const useCreateJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateJobDto) => {
            const response = await fetch(buildUrl(ENDPOINTS.jobs), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
};

// Update Job Hook
export const useUpdateJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateJobDto }) => {
            console.log('Updating job:', { id, data });
            const response = await fetch(buildUrl(ENDPOINTS.jobDetails(id)), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const updatedJob = await response.json();
            console.log('Update response:', updatedJob);
            return updatedJob;
        },
        onSuccess: async (updatedJob, { id }) => {
            console.log('Update successful, invalidating queries');
            // First invalidate the queries to trigger a refetch
            await queryClient.invalidateQueries({ queryKey: ['jobs'] });
            await queryClient.invalidateQueries({ queryKey: ['job', id] });
            
            // Then update the cache with the latest data
            queryClient.setQueryData(['job', id], updatedJob);
            
            // Update the job in the jobs list cache
            const jobsData = queryClient.getQueryData<JobsResponse>(['jobs']);
            if (jobsData) {
                const updatedJobs = jobsData.jobs.map(job => 
                    job.job_id === id ? updatedJob : job
                );
                queryClient.setQueryData(['jobs'], {
                    ...jobsData,
                    jobs: updatedJobs
                });
            }
        },
    });
};

// Delete Job Hook
export const useDeleteJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(buildUrl(ENDPOINTS.jobDetails(id)), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
};

// Bulk Delete Jobs Hook
export const useBulkDeleteJobs = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (jobIds: string[]) => {
            const response = await fetch(buildUrl(ENDPOINTS.bulkDelete), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobIds }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
};
