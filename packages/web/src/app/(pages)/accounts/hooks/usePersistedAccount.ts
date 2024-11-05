'use client';

import { create } from 'zustand';
import type { Account } from '@/app/globalTypes/account';
import { useAccounts } from './useAccounts';

interface PersistedAccountStore {
    // State
    selectedAccount: Account | null;

    // Actions
    setSelectedAccount: (account: Account | null) => void;
}

export const usePersistedAccount = create<PersistedAccountStore>()(
    (set) => ({
        selectedAccount: null,
        setSelectedAccount: (account) => set({ selectedAccount: account }),
    })
);

// Hook to sync selected account with URL
export function useSyncSelectedAccount() {
    const { selectedAccount, setSelectedAccount } = usePersistedAccount();
    const { data: accounts = [] } = useAccounts();

    // Function to sync account from URL param
    const syncFromParam = (accountId: string | null) => {
        if (!accountId) {
            setSelectedAccount(null);
            return;
        }

        // Find account in store
        const account = accounts.find((a: Account) => a.account_id === accountId);
        if (account && (!selectedAccount || selectedAccount.account_id !== accountId)) {
            setSelectedAccount(account);
        }
    };

    return { syncFromParam };
}
