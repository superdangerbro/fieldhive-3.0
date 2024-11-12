'use client';

import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../config/environment';
import type { Account } from '../../../globalTypes/account';

export function useAccounts() {
    return useQuery<Account[]>({
        queryKey: ['accounts'],
        queryFn: async () => {
            const response = await fetch(`${ENV_CONFIG.api.baseUrl}/accounts`, {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch accounts');
            }

            return response.json();
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
}
