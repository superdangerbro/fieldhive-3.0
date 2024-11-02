'use client';

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { AccountDetails, AccountSearch, AccountsTable } from './components';
import { AddAccountDialog } from './dialogs';
import type { Account } from '@fieldhive/shared';

export default function AccountsPage() {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Load selected account from localStorage on mount
  useEffect(() => {
    const savedAccount = localStorage.getItem('selectedAccount');
    if (savedAccount) {
      setSelectedAccount(JSON.parse(savedAccount));
    }
  }, []);

  // Save selected account to localStorage
  const handleAccountSelect = (account: Account | null) => {
    setSelectedAccount(account);
    if (account) {
      localStorage.setItem('selectedAccount', JSON.stringify(account));
    } else {
      localStorage.removeItem('selectedAccount');
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAccountsLoad = (loadedAccounts: Account[]) => {
    setAccounts(loadedAccounts);
    // Update selected account with fresh data if it exists
    if (selectedAccount) {
      const updatedAccount = loadedAccounts.find(a => a.account_id === selectedAccount.account_id);
      if (updatedAccount) {
        handleAccountSelect(updatedAccount);
      }
    }
  };

  return (
    <Box p={3}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <AccountSearch
            accounts={accounts}
            selectedAccount={selectedAccount}
            onAccountSelect={handleAccountSelect}
            onAddClick={() => setIsAddDialogOpen(true)}
          />

          <AccountsTable
            refreshTrigger={refreshTrigger}
            onAccountSelect={handleAccountSelect}
            selectedAccount={selectedAccount}
            onAccountsLoad={handleAccountsLoad}
          />
        </Box>

        <Box sx={{ width: '35%', minWidth: 400 }}>
          <AccountDetails
            account={selectedAccount}
            onUpdate={handleRefresh}
            onAccountSelect={handleAccountSelect}
          />
        </Box>
      </Box>

      <AddAccountDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleRefresh}
      />
    </Box>
  );
}
