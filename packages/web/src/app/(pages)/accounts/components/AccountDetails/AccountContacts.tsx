'use client';

import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    IconButton, 
    Card, 
    CardContent, 
    Autocomplete,
    TextField,
    Chip
} from '@mui/material';
import ContactsIcon from '@mui/icons-material/Contacts';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateAccount } from '../../hooks/useAccounts';
import { useActionNotifications } from '@/app/globalHooks/useActionNotifications';
import type { Account } from '@/app/globalTypes/account';
import type { User } from '@/app/globalTypes/user';

interface AccountContactsProps {
    account: Account;
    onUpdate: () => void;
}

export function AccountContacts({ account, onUpdate }: AccountContactsProps) {
    const queryClient = useQueryClient();
    const updateAccountMutation = useUpdateAccount();
    const { notifySuccess, notifyError } = useActionNotifications();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContacts, setEditedContacts] = useState<User[]>(
        account.users?.filter((user: User) => user.is_contact) || []
    );

    const handleSave = async () => {
        try {
            console.log('Updating contacts:', editedContacts);
            const updatedUsers = account.users?.map((user: User) => ({
                ...user,
                is_contact: editedContacts.some(contact => contact.user_id === user.user_id)
            })) || [];

            // Optimistic update
            const optimisticAccount = {
                ...account,
                users: updatedUsers
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
                data: { users: updatedUsers }
            });

            queryClient.setQueryData(['account', account.account_id], result);
            queryClient.setQueriesData({ queryKey: ['accounts'] }, (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.map((acc: Account) => 
                    acc.account_id === account.account_id ? result : acc
                );
            });

            setIsEditing(false);
            notifySuccess('Contacts updated successfully');
            onUpdate();
        } catch (error) {
            console.error('Failed to update contacts:', error);
            notifyError('Failed to update contacts');
            
            // Revert optimistic update
            queryClient.setQueryData(['account', account.account_id], account);
            queryClient.setQueriesData({ queryKey: ['accounts'] }, (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.map((acc: Account) => 
                    acc.account_id === account.account_id ? account : acc
                );
            });
            
            setEditedContacts(account.users?.filter((user: User) => user.is_contact) || []);
        }
    };

    const isLoading = updateAccountMutation.isPending;

    return (
        <Card sx={{ flex: 1 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ContactsIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                        Contacts
                    </Typography>
                    <IconButton 
                        size="small" 
                        onClick={() => setIsEditing(true)}
                        sx={{ ml: 1 }}
                        disabled={isLoading}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Box>
                {isEditing ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Autocomplete
                            multiple
                            options={account.users || []}
                            value={editedContacts}
                            onChange={(_, newValue) => setEditedContacts(newValue)}
                            getOptionLabel={(option: User) => `${option.first_name} ${option.last_name}`}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    size="small"
                                    label="Select Contacts"
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option: User, index) => (
                                    <Chip
                                        label={`${option.first_name} ${option.last_name}`}
                                        size="small"
                                        {...getTagProps({ index })}
                                    />
                                ))
                            }
                            disabled={isLoading}
                        />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                            <IconButton 
                                size="small" 
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditedContacts(account.users?.filter((user: User) => user.is_contact) || []);
                                }}
                                disabled={isLoading}
                            >
                                <CloseIcon />
                            </IconButton>
                            <IconButton 
                                size="small" 
                                onClick={handleSave} 
                                color="primary"
                                disabled={isLoading}
                            >
                                <CheckIcon />
                            </IconButton>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {account.users?.filter((user: User) => user.is_contact).map((user: User) => (
                            <Chip
                                key={user.user_id}
                                size="small"
                                label={`${user.first_name} ${user.last_name}`}
                                title={user.email}
                            />
                        ))}
                        {(!account.users || account.users.filter((user: User) => user.is_contact).length === 0) && (
                            <Typography color="text.secondary">
                                No contacts assigned
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
