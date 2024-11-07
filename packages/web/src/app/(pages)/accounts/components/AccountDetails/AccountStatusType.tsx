'use client';

import React from 'react';
import { 
    Box, 
    Typography, 
    Card, 
    CardContent, 
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    CircularProgress,
    Chip,
    Alert
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateAccount, useAccountSettings } from '../../hooks/useAccounts';
import { useActionNotifications } from '@/app/globalHooks/useActionNotifications';
import type { Account, AccountType, AccountStatus } from '@/app/globalTypes/account';

interface AccountStatusTypeProps {
    account: Account;
    onUpdate: () => void;
}

export function AccountStatusType({ account, onUpdate }: AccountStatusTypeProps) {
    const queryClient = useQueryClient();
    const updateAccountMutation = useUpdateAccount();
    const { data: settings, isLoading: isSettingsLoading, error: settingsError } = useAccountSettings();
    const { notifySuccess, notifyError } = useActionNotifications();

    const handleStatusChange = async (event: SelectChangeEvent<string>) => {
        try {
            console.log('Updating account status:', { id: account.account_id, status: event.target.value });
            
            // Optimistic update
            const optimisticAccount = {
                ...account,
                status: event.target.value
            };

            queryClient.setQueryData(['account', account.account_id], optimisticAccount);
            queryClient.setQueriesData({ queryKey: ['accounts'] }, (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.map((acc: Account) => 
                    acc.account_id === account.account_id ? optimisticAccount : acc
                );
            });

            const result = await updateAccountMutation.mutateAsync({ 
                id: account.account_id, 
                data: { status: event.target.value }
            });

            queryClient.setQueryData(['account', account.account_id], result);
            queryClient.setQueriesData({ queryKey: ['accounts'] }, (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.map((acc: Account) => 
                    acc.account_id === account.account_id ? result : acc
                );
            });

            notifySuccess('Account status updated successfully');
            onUpdate();
        } catch (error) {
            console.error('Failed to update status:', error);
            notifyError('Failed to update account status');
            
            // Revert optimistic update
            queryClient.setQueryData(['account', account.account_id], account);
            queryClient.setQueriesData({ queryKey: ['accounts'] }, (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.map((acc: Account) => 
                    acc.account_id === account.account_id ? account : acc
                );
            });
        }
    };

    const handleTypeChange = async (event: SelectChangeEvent<string>) => {
        try {
            console.log('Updating account type:', { id: account.account_id, type: event.target.value });
            
            // Optimistic update
            const optimisticAccount = {
                ...account,
                type: event.target.value
            };

            queryClient.setQueryData(['account', account.account_id], optimisticAccount);
            queryClient.setQueriesData({ queryKey: ['accounts'] }, (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.map((acc: Account) => 
                    acc.account_id === account.account_id ? optimisticAccount : acc
                );
            });

            const result = await updateAccountMutation.mutateAsync({ 
                id: account.account_id, 
                data: { type: event.target.value }
            });

            queryClient.setQueryData(['account', account.account_id], result);
            queryClient.setQueriesData({ queryKey: ['accounts'] }, (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.map((acc: Account) => 
                    acc.account_id === account.account_id ? result : acc
                );
            });

            notifySuccess('Account type updated successfully');
            onUpdate();
        } catch (error) {
            console.error('Failed to update type:', error);
            notifyError('Failed to update account type');
            
            // Revert optimistic update
            queryClient.setQueryData(['account', account.account_id], account);
            queryClient.setQueriesData({ queryKey: ['accounts'] }, (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.map((acc: Account) => 
                    acc.account_id === account.account_id ? account : acc
                );
            });
        }
    };

    const isLoading = updateAccountMutation.isPending;
    const isLoadingSettings = isSettingsLoading || !settings;
    const hasStatuses = settings?.statuses && settings.statuses.length > 0;
    const hasTypes = settings?.types && settings.types.length > 0;

    return (
        <Card sx={{ flex: 1 }}>
            <CardContent>
                {settingsError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Failed to load settings. Please try again.
                    </Alert>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl size="small" fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={account.status || ''}
                            onChange={handleStatusChange}
                            label="Status"
                            disabled={isLoading || isLoadingSettings}
                        >
                            {isLoadingSettings ? (
                                <MenuItem value={account.status || ''}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={16} />
                                        <span>Loading...</span>
                                    </Box>
                                </MenuItem>
                            ) : !hasStatuses ? (
                                <MenuItem value="">
                                    <Typography color="text.secondary">
                                        No statuses available
                                    </Typography>
                                </MenuItem>
                            ) : (
                                settings.statuses.map((status: AccountStatus) => (
                                    <MenuItem key={status.value} value={status.value}>
                                        <Chip 
                                            label={status.label || status.value}
                                            size="small"
                                            sx={{ 
                                                backgroundColor: status.color || '#666666',
                                                color: 'white'
                                            }}
                                        />
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={account.type || ''}
                            onChange={handleTypeChange}
                            label="Type"
                            disabled={isLoading || isLoadingSettings}
                        >
                            {isLoadingSettings ? (
                                <MenuItem value={account.type || ''}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={16} />
                                        <span>Loading...</span>
                                    </Box>
                                </MenuItem>
                            ) : !hasTypes ? (
                                <MenuItem value="">
                                    <Typography color="text.secondary">
                                        No types available
                                    </Typography>
                                </MenuItem>
                            ) : (
                                settings.types.map((type: AccountType) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        <Chip 
                                            label={type.label || type.value}
                                            size="small"
                                            sx={{ 
                                                backgroundColor: type.color || '#666666',
                                                color: 'white'
                                            }}
                                        />
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </Box>
            </CardContent>
        </Card>
    );
}
