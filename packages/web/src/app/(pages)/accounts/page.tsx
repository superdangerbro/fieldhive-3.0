'use client';

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { AccountDetails, AccountSearch, AccountsTable } from './components';
import { AddAccountDialog } from './dialogs';
import type { Account } from '@/app/globaltypes';
import { useAccountStore } from './store';

export default function AccountsPage() {
    const { 
        selectedAccount, 
        setSelectedAccount,
        accounts,
        refreshAccounts,
        fetchAccountSettings,
        fetchAccounts,
        settingsLoaded,
        isLoading
    } = useAccountStore();
    
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load settings first
                if (!settingsLoaded) {
                    await fetchAccountSettings();
                }
                // Then load accounts
                await fetchAccounts();
            } catch (error) {
                console.error('Failed to load initial data:', error);
            }
        };

        loadData();
    }, []); // Only run once on mount

    const handleAccountSelect = (account: Account | null) => {
        // If we already have the account in our accounts list, use that data
        if (account) {
            const existingAccount = accounts.find(a => a.account_id === account.account_id);
            setSelectedAccount(existingAccount || account);
        } else {
            setSelectedAccount(null);
        }
    };

    const handleRefresh = async () => {
        setRefreshTrigger(prev => prev + 1);
        if (selectedAccount) {
            await refreshAccounts();
        }
    };

    const handleAccountsLoad = (loadedAccounts: Account[]) => {
        if (selectedAccount) {
            const updatedAccount = loadedAccounts.find(a => a.account_id === selectedAccount.account_id);
            if (updatedAccount && JSON.stringify(updatedAccount) !== JSON.stringify(selectedAccount)) {
                setSelectedAccount(updatedAccount);
            }
        }
    };

    if (!settingsLoaded) {
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
                    onUpdate={handleRefresh}
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
