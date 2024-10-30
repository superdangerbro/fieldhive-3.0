'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Account } from '@fieldhive/shared';
import { getAccounts } from '../services/api';

interface AccountContextType {
  selectedAccount: Account | null;
  setSelectedAccount: (account: Account | null) => void;
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
  refreshAccounts: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const loadSelectedAccount = async () => {
      const savedAccountId = localStorage.getItem('selectedAccountId');
      if (savedAccountId) {
        try {
          const response = await getAccounts({
            search: savedAccountId
          });
          if (response.accounts.length > 0) {
            setSelectedAccount(response.accounts[0] as Account);
          }
        } catch (error) {
          console.error('Failed to load selected account:', error);
        }
      }
    };

    loadSelectedAccount();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      localStorage.setItem('selectedAccountId', selectedAccount.account_id);
    } else {
      localStorage.removeItem('selectedAccountId');
    }
  }, [selectedAccount?.account_id]);

  const refreshAccounts = async () => {
    if (selectedAccount) {
      try {
        const response = await getAccounts({
          search: selectedAccount.account_id
        });
        
        if (response.accounts.length > 0) {
          const updatedAccount = response.accounts[0] as Account;
          setSelectedAccount(updatedAccount);
          setAccounts(prevAccounts => 
            prevAccounts.map(account => 
              account.account_id === updatedAccount.account_id ? updatedAccount : account
            ) as Account[]
          );
        }
      } catch (error) {
        console.error('Failed to refresh accounts:', error);
      }
    }
  };

  return (
    <AccountContext.Provider 
      value={{ 
        selectedAccount, 
        setSelectedAccount: (account) => setSelectedAccount(account as Account | null),
        accounts,
        setAccounts: (newAccounts) => setAccounts(newAccounts as Account[]),
        refreshAccounts
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
}
