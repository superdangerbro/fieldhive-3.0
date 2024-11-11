'use client';

import { useQuery } from '@tanstack/react-query';
import { buildUrl, handleApiError, ENDPOINTS } from './utils/api';
import { ENV_CONFIG } from '@/config/environment';

export const useAccountSettings = () => {
    return useQuery({
        queryKey: ['accountSettings'],
        queryFn: async () => {
            console.log('Fetching account settings');
            const [typesResponse, statusesResponse] = await Promise.all([
                fetch(buildUrl(ENDPOINTS.accountSettings.types), {
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                }),
                fetch(buildUrl(ENDPOINTS.accountSettings.statuses), {
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                })
            ]);

            if (!typesResponse.ok) await handleApiError(typesResponse);
            if (!statusesResponse.ok) await handleApiError(statusesResponse);

            const [types, statusesData] = await Promise.all([
                typesResponse.json(),
                statusesResponse.json()
            ]);

            console.log('API Response:', { types, statusesData });

            const statuses = statusesData?.statuses || [];

            return { types, statuses };
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};
