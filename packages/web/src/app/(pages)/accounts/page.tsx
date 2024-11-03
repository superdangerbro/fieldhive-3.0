'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import { AccountDetails, AccountSearch, AccountsTable } from './components';
import { AddAccountDialog } from './dialogs';
import type { Account } from '@/app/globaltypes';
import { useAccountStore } from './store';

export default function AccountsPage() {
    const { 
        selectedAccount, 
        setSelectedAccount,
        accounts,
        refreshAccounts
    } = useAccountStore();
    
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const handleAccountSelect = (account: Account | null) => {
        // If we already have the account in our accounts list, use that data
        if (account) {
            const existingAccount = accounts.find(a => a.account_id === account.account_id);
            if (existingAccount) {
                setSelectedAccount(existingAccount);
            } else {
                setSelectedAccount(account);
            }
        } else {
            setSelectedAccount(null);
        }
    };

    const handleRefresh = async () => {
        // Increment refresh trigger to cause table to reload
        setRefreshTrigger(prev => prev + 1);

        // If we have a selected account, refresh its data
        if (selectedAccount) {
            await refreshAccounts();
        }
    };

    const handleAccountsLoad = (loadedAccounts: Account[]) => {
        // If we have a selected account, update it with fresh data
        if (selectedAccount) {
            const updatedAccount = loadedAccounts.find(a => a.account_id === selectedAccount.account_id);
            if (updatedAccount) {
                setSelectedAccount(updatedAccount);
            }
        }
    };

    return (
        <Box p={3}>
            <AccountDetails
                account={selectedAccount}
                onUpdate={handleRefresh}
                onAccountSelect={handleAccountSelect}
            />
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
            </Box>

            <AddAccountDialog
                open={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onAccountAdded={handleRefresh}
            />
        </Box>
    );
}
