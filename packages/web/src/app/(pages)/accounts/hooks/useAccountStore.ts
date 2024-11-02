'use client';

import { getAccounts } from '@/services/api';
import type { Account, Property } from '@fieldhive/shared';
import { create } from 'zustand';

interface AccountStore {
  selectedAccount: Account | null;
  accounts: Account[];
  setSelectedAccount: (account: Account | null) => void;
  setAccounts: (accounts: Account[]) => void;
  refreshAccounts: () => Promise<void>;
}

export const useAccountStore = create<AccountStore>((set, get) => ({
  selectedAccount: null,
  accounts: [],
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  setAccounts: (accounts) => set({ accounts }),
  refreshAccounts: async () => {
    const { selectedAccount } = get();
    if (selectedAccount) {
      try {
        const response = await getAccounts({
          search: selectedAccount.account_id
        });

        if (response.accounts.length > 0) {
          const updatedAccount = response.accounts[0] as Account;
          set((state) => ({
            selectedAccount: updatedAccount,
            accounts: state.accounts.map(account =>
              account.account_id === updatedAccount.account_id ? updatedAccount : account
            )
          }));
        }
      } catch (error) {
        console.error('Failed to refresh accounts:', error);
      }
    }
  }
}));
