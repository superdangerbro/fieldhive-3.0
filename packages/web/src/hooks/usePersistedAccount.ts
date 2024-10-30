'use client';

import { useState, useEffect } from 'react';
import type { Account } from '@fieldhive/shared';
import { getAccounts } from '../services/api';

export function usePersistedAccount() {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted account on mount
  useEffect(() => {
    const loadPersistedAccount = async () => {
      const savedAccountId = localStorage.getItem('selectedAccountId');
      if (savedAccountId) {
        try {
          const response = await getAccounts({
            search: savedAccountId,
            limit: 1
          });
          if (response.accounts.length > 0) {
            setSelectedAccount(response.accounts[0]);
          }
        } catch (error) {
          console.error('Failed to load persisted account:', error);
        }
      }
      setIsLoading(false);
    };

    loadPersistedAccount();
  }, []);

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
