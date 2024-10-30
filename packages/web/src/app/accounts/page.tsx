'use client';

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import AccountSearch from '../../components/accounts/AccountSearch';
import AccountDetails from '../../components/accounts/AccountDetails';
import AccountsTable from '../../components/accounts/AccountsTable';
import AddAccountDialog from '../../components/accounts/AddAccountDialog';
import EditAccountDialog from '../../components/accounts/EditAccountDialog';
import type { Account } from '@fieldhive/shared';
import { useAccounts } from '../../stores/accountStore';

export default function AccountsPage() {
  const { selectedAccount, setSelectedAccount } = useAccounts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const handleAddAccount = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsAddDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setEditAccount(null);
  };

  const handleAccountSelect = (account: Account | null) => {
    setSelectedAccount(account);
  };

  const handleEdit = (account: Account) => {
    setEditAccount(account);
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
        onEdit={handleEdit}
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
      <EditAccountDialog
        open={!!editAccount}
        account={editAccount}
        onClose={() => setEditAccount(null)}
        onSuccess={handleEditSuccess}
      />
    </Box>
  );
}
