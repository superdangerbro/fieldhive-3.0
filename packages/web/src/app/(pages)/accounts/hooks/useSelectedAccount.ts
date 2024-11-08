'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useActionNotifications } from '@/app/globalHooks/useActionNotifications';
import { ENV_CONFIG } from '@/config/environment';
import { useCallback, useEffect } from 'react';

interface Account {
  id: string;
  // Add other account properties here
}

export function useSelectedAccount() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const accountId = searchParams.get('accountId');
    const { notifyError } = useActionNotifications();

    const { data: account, isLoading, error } = useQuery<Account, Error>({
        queryKey: ['selectedAccount', accountId],
        queryFn: async () => {
            if (!accountId) return null;
            
            try {
                const url = `${ENV_CONFIG.api.baseUrl}/accounts/${accountId}`;
                const response = await fetch(url, {
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch account');
                }

                return await response.json();
            } catch (err) {
                throw new Error(err instanceof Error ? err.message : 'Failed to fetch account');
            }
        },
        enabled: !!accountId,
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        retry: ENV_CONFIG.queryClient.maxRetries,
    });

    const setSelectedAccount = useCallback((newAccountId: string | null) => {
        if (newAccountId === accountId) return;
        
        const params = new URLSearchParams(searchParams.toString());
        if (newAccountId) {
            params.set('accountId', newAccountId);
        } else {
            params.delete('accountId');
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [pathname, router, searchParams, accountId]);

    // Handle error notifications
    useEffect(() => {
        if (error) {
            notifyError(error.message || 'Failed to load account');
        }
    }, [error, notifyError]);

    return {
        selectedAccount: account,
        setSelectedAccount,
        isLoading,
        error
    };
}