'use client';

import { useQuery } from '@tanstack/react-query';
import { buildUrl, handleApiError, ENDPOINTS } from './utils/api';
import { transformAccount } from './utils/transformAccount';
import { ENV_CONFIG } from '@/config/environment';

export const useAccounts = (params?: { limit?: number; offset?: number; search?: string }) => {
    return useQuery({
        queryKey: ['accounts', params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params?.limit) searchParams.append('limit', params.limit.toString());
            if (params?.offset) searchParams.append('offset', params.offset.toString());
            if (params?.search) searchParams.append('search', params.search);

            const url = `${buildUrl(ENDPOINTS.accounts)}?${searchParams.toString()}`;
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            return data.accounts.map(transformAccount);
        },
        staleTime: 30000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false
    });
};
