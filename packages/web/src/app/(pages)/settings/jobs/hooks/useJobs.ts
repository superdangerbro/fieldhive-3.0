'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JobType, JobStatus } from '@/app/globalTypes/job';
import { ENV_CONFIG } from '@/config/environment';

const ENDPOINTS = {
    types: '/settings/jobs/types',
    statuses: '/settings/jobs/statuses'
} as const;

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

// Helper function to handle API errors consistently
const handleApiError = async (response: Response) => {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
};

// Job Types Hooks
export const useJobTypes = () => {
    return useQuery({
        queryKey: ['jobTypes'],
        queryFn: async () => {
            const response = await fetch(buildUrl(ENDPOINTS.types), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

export const useUpdateJobTypes = () => {
    const queryClient = useQueryClient();

    return useMutation<JobType[], Error, JobType[]>({
        mutationFn: async (types) => {
            const response = await fetch(buildUrl(ENDPOINTS.types), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(types),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['jobTypes'], data);
        },
    });
};

// Job Statuses Hooks
export const useJobStatuses = () => {
    return useQuery({
        queryKey: ['jobStatuses'],
        queryFn: async () => {
            const response = await fetch(buildUrl(ENDPOINTS.statuses), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

export const useUpdateJobStatuses = () => {
    const queryClient = useQueryClient();

    return useMutation<JobStatus[], Error, JobStatus[]>({
        mutationFn: async (statuses) => {
            const response = await fetch(buildUrl(ENDPOINTS.statuses), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(statuses),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['jobStatuses'], data);
        },
    });
};
