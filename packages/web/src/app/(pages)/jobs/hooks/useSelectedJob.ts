'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { ENV_CONFIG } from '../../../config/environment';
import type { Job } from '../../../globalTypes/job';

export function useSelectedJob() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const jobId = searchParams.get('jobId');

    const { data: job, isLoading, error } = useQuery<Job, Error>({
        queryKey: ['selectedJob', jobId],
        queryFn: async () => {
            if (!jobId) return null;
            
            try {
                const url = `${ENV_CONFIG.api.baseUrl}/jobs/${jobId}`;
                const response = await fetch(url, {
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch job');
                }

                return await response.json();
            } catch (err) {
                throw new Error(err instanceof Error ? err.message : 'Failed to fetch job');
            }
        },
        enabled: !!jobId,
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        retry: ENV_CONFIG.queryClient.maxRetries,
    });

    const setSelectedJob = useCallback((newJobId: string | null) => {
        if (newJobId === jobId) return;
        
        const params = new URLSearchParams(searchParams.toString());
        if (newJobId) {
            params.set('jobId', newJobId);
        } else {
            params.delete('jobId');
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [pathname, router, searchParams, jobId]);

    return {
        selectedJob: job,
        setSelectedJob,
        isLoading,
        error
    };
}
