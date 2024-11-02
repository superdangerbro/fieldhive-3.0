'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { AccountDetails, AccountSearch, AccountsTable } from './components';
import { AddAccountDialog } from './dialogs';
import type { Account } from '@fieldhive/shared';
import { useAccountStore } from './hooks/useAccountStore';

export default function AccountsPage() {
  const { selectedAccount, setSelectedAccount } = useAccountStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const handleAddAccount = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsAddDialogOpen(false);
  };

  const handleAccountSelect = (account: Account | null) => {
    setSelectedAccount(account);
  };

  const handleAccountsLoad = (loadedAccounts: Account[]) => {
    setAccounts(loadedAccounts);
  };

  const handleUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box p={3}>
      <AccountDetails
        account={selectedAccount}
        onUpdate={handleUpdate}
        onAccountSelect={handleAccountSelect}
      />
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
      <AddAccountDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAccountAdded={handleAddAccount}
      />
    </Box>
  );
}
