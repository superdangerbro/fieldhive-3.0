'use client';

import { useState, useEffect } from 'react';
import type { Account } from '@/app/globaltypes';
import { useAccountStore } from '../store';

export function usePersistedAccount() {
  const { fetchAccounts, accounts } = useAccountStore();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted account on mount
  useEffect(() => {
    const loadPersistedAccount = async () => {
      const savedAccountId = localStorage.getItem('selectedAccountId');
      if (savedAccountId) {
        try {
          await fetchAccounts();
          const account = accounts.find((a: Account) => a.account_id === savedAccountId);
          if (account) {
            setSelectedAccount(account);
          }
        } catch (error) {
          console.error('Failed to load persisted account:', error);
        }
      }
      setIsLoading(false);
    };

    loadPersistedAccount();
  }, [fetchAccounts, accounts]);

  // Persist account selection
  const persistAccount = (account: Account | null) => {
    if (account) {
      localStorage.setItem('selectedAccountId', account.account_id);
    } else {
      localStorage.removeItem('selectedAccountId');
    }
    setSelectedAccount(account);
  };

  return {
    selectedAccount,
    setSelectedAccount: persistAccount,
    isLoading
  };
}
