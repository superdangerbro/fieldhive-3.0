'use client';

import { useCallback, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAccount } from './useAccounts';
import { useActionNotifications } from '@/app/globalHooks/useActionNotifications';
import { useCrudDialogs } from '@/app/globalHooks/useCrudDialogs';

export function useSelectedAccount() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const accountId = searchParams.get('accountId');
    const { notifyError } = useActionNotifications();
    const { openDeleteDialog } = useCrudDialogs();

    const { data: account, isLoading, error } = useAccount(accountId);

    // Ensure URL params persist on page load and browser navigation
    useEffect(() => {
        if (accountId) {
            const currentParams = new URLSearchParams(window.location.search);
            const currentAccountId = currentParams.get('accountId');

            // Only update if the accountId has changed
            if (currentAccountId !== accountId) {
                const params = new URLSearchParams(searchParams.toString());
                const url = `${pathname}?${params.toString()}`;
                router.replace(url, { scroll: false });
            }
        }
    }, [accountId, pathname, router, searchParams]);

    const setSelectedAccount = useCallback((newAccountId: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (newAccountId) {
            params.set('accountId', newAccountId);
        } else {
            params.delete('accountId');
        }
        const url = `${pathname}?${params.toString()}`;
        router.replace(url, { scroll: false });
    }, [pathname, router, searchParams]);

    if (error) {
        notifyError(error instanceof Error ? error.message : 'Failed to load account');
    }

    return {
        selectedAccount: account,
        setSelectedAccount,
        isLoading,
        error
    };
}
