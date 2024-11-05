'use client';

import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { AccountDetails, AccountSearch, AccountsTable } from './components';
import { AddAccountDialog } from './dialogs';
import type { Account } from '@/app/globalTypes/account';
import { useAccounts, useAccountSettings } from './hooks/useAccounts';

export default function AccountsPage() {
    const { data: accounts = [], isLoading: isLoadingAccounts } = useAccounts();
    const { data: settings, isLoading: isLoadingSettings } = useAccountSettings();
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const handleAccountSelect = (account: Account | null) => {
        // If we already have the account in our accounts list, use that data
        if (account) {
            const existingAccount = accounts.find((a: Account) => a.account_id === account.account_id);
            setSelectedAccount(existingAccount || account);
        } else {
            setSelectedAccount(null);
        }
    };

    const handleAccountsLoad = (loadedAccounts: Account[]) => {
        if (selectedAccount) {
            const updatedAccount = loadedAccounts.find((a: Account) => a.account_id === selectedAccount.account_id);
            if (updatedAccount && JSON.stringify(updatedAccount) !== JSON.stringify(selectedAccount)) {
                setSelectedAccount(updatedAccount);
            }
        }
    };

    if (isLoadingSettings) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            {selectedAccount && (
                <AccountDetails
                    account={selectedAccount}
                    onUpdate={() => {
                        // The table will automatically refresh due to React Query's cache invalidation
                    }}
                />
            )}
            <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                    <AccountSearch
                        accounts={accounts}
                        selectedAccount={selectedAccount}
                        onAccountSelect={handleAccountSelect}
                        onAddClick={() => setIsAddDialogOpen(true)}
                    />

                    <AccountsTable
                        onAccountSelect={handleAccountSelect}
                        selectedAccount={selectedAccount}
                        onAccountsLoad={handleAccountsLoad}
                    />
                </Box>
            </Box>

            <AddAccountDialog
                open={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onAccountAdded={() => {
                    // The table will automatically refresh due to React Query's cache invalidation
                    setIsAddDialogOpen(false);
                }}
            />
        </Box>
    );
}
