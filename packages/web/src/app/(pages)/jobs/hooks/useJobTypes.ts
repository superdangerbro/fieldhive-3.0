'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';
import type { JobType } from '@/app/globalTypes';

const JOB_TYPES_ENDPOINT = '/job-types';

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

export function useJobTypes() {
  return useQuery({
    queryKey: ['jobTypes'],
    queryFn: async () => {
      const response = await fetch(buildUrl(JOB_TYPES_ENDPOINT), {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job types');
      }

      const data = await response.json();
      return data.jobTypes as JobType[];
    },
    staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
    gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
  });
}

export function useCreateJobType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobType: Omit<JobType, 'job_type_id'>) => {
      const response = await fetch(buildUrl(JOB_TYPES_ENDPOINT), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobType),
        signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
      });

      if (!response.ok) {
        throw new Error('Failed to create job type');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTypes'] });
    },
  });
}

export function useUpdateJobType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<JobType> }) => {
      const response = await fetch(buildUrl(`${JOB_TYPES_ENDPOINT}/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
      });

      if (!response.ok) {
        throw new Error('Failed to update job type');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTypes'] });
    },
  });
}

export function useDeleteJobType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(buildUrl(`${JOB_TYPES_ENDPOINT}/${id}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
      });

      if (!response.ok) {
        throw new Error('Failed to delete job type');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTypes'] });
    },
  });
}
