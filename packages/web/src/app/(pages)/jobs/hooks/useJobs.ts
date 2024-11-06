'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Job, CreateJobDto, UpdateJobDto } from '@/app/globalTypes';
import { ENV_CONFIG } from '@/config/environment';

const ENDPOINTS = {
    jobs: '/jobs',
    jobDetails: (id: string) => `/jobs/${id}`,
    bulkDelete: '/jobs/bulk-delete'
} as const;

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

// Helper function to handle API errors consistently
const handleApiError = async (response: Response) => {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
};

interface JobsResponse {
    jobs: Job[];
    total: number;
}

// Jobs List Hook
export const useJobs = () => {
    return useQuery<JobsResponse>({
        queryKey: ['jobs'],
        queryFn: async () => {
            const response = await fetch(buildUrl(ENDPOINTS.jobs), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            return {
                jobs: data.jobs,
                total: data.total || data.jobs.length
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
            const response = await fetch(buildUrl(ENDPOINTS.jobDetails(id)), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: (data, { id }) => {
            queryClient.setQueryData(['job', id], data);
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
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
