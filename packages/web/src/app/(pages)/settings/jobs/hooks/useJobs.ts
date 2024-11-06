'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JobType, JobStatus } from '@/app/globalTypes/job';
import { ENV_CONFIG } from '@/config/environment';

const ENDPOINTS = {
    types: '/settings/jobs/types',
    statuses: '/settings/jobs/statuses'
} as const;

// Helper function to build full API URL
const buildUrl = (endpoint: string) => {
    const url = `${ENV_CONFIG.api.baseUrl}${endpoint}`;
    console.log('API URL:', url);
    return url;
};

// Helper function to handle API errors consistently
const handleApiError = async (response: Response) => {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
};

// Job Types Hooks
export const useJobTypes = () => {
    return useQuery<JobType[]>({
        queryKey: ['jobTypes'],
        queryFn: async () => {
            console.log('Fetching job types...');
            const response = await fetch(buildUrl(ENDPOINTS.types), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Job types response:', data);
            return Array.isArray(data) ? data : [];
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

export const useUpdateJobTypes = () => {
    const queryClient = useQueryClient();

    return useMutation<JobType[], Error, JobType[]>({
        mutationFn: async (types) => {
            console.log('Updating job types:', types);
            const response = await fetch(buildUrl(ENDPOINTS.types), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(types),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Update response:', data);
            return Array.isArray(data) ? data : [];
        },
        onSuccess: (data) => {
            console.log('Update successful:', data);
            queryClient.setQueryData(['jobTypes'], data);
        },
    });
};

// Job Statuses Hooks
export const useJobStatuses = () => {
    return useQuery<JobStatus[]>({
        queryKey: ['jobStatuses'],
        queryFn: async () => {
            console.log('Fetching job statuses...');
            const response = await fetch(buildUrl(ENDPOINTS.statuses), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Job statuses response:', data);
            return data?.statuses || [];
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

export const useUpdateJobStatuses = () => {
    const queryClient = useQueryClient();

    return useMutation<JobStatus[], Error, JobStatus[]>({
        mutationFn: async (statuses) => {
            console.log('Updating job statuses:', statuses);
            const response = await fetch(buildUrl(ENDPOINTS.statuses), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: { statuses } }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Update response:', data);
            return data?.statuses || [];
        },
        onSuccess: (data) => {
            console.log('Update successful:', data);
            queryClient.setQueryData(['jobStatuses'], data);
        },
    });
};
