'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../config/environment';
import type { JobType, JobStatus } from '../../../globalTypes/job';

type SettingKey = 'job_types' | 'job_statuses';

const SETTINGS_ENDPOINT = '/settings/jobs';

// Helper function to build full API URL
const buildUrl = (key: SettingKey) => 
    `${ENV_CONFIG.api.baseUrl}${SETTINGS_ENDPOINT}/${key.replace('job_', '')}`;

export const useSetting = <T>(key: SettingKey): UseQueryResult<T, Error> => {
    return useQuery({
        queryKey: ['settings', key],
        queryFn: async () => {
            const response = await fetch(buildUrl(key), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Failed to fetch setting: ${key}`);
            }

            const data = await response.json();
            return data;
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};
