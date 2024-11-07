'use client';

import React, { useState } from 'react';
import { Box, Typography, IconButton, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateAccount } from '../../hooks/useAccounts';
import { useActionNotifications } from '@/app/globalHooks/useActionNotifications';
import type { Account } from '@/app/globalTypes/account';

interface AccountNameSectionProps {
    account: Account;
    onUpdate: () => void;
    onDeleteClick: () => void;
}

export function AccountNameSection({ account, onUpdate, onDeleteClick }: AccountNameSectionProps) {
    const queryClient = useQueryClient();
    const updateAccountMutation = useUpdateAccount();
    const { notifySuccess, notifyError } = useActionNotifications();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(account.name);

    const handleSave = async () => {
        if (editedName === account.name) {
            setIsEditing(false);
            return;
        }

        try {
            console.log('Updating account name:', { id: account.account_id, name: editedName });
            const result = await updateAccountMutation.mutateAsync({ 
                id: account.account_id, 
                data: { name: editedName }
            });

            queryClient.setQueryData(['account', account.account_id], result);
            queryClient.setQueriesData({ queryKey: ['accounts'] }, (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.map((acc: Account) => 
                    acc.account_id === account.account_id ? result : acc
                );
            });

            setIsEditing(false);
            notifySuccess('Account name updated successfully');
            onUpdate();
        } catch (error) {
            console.error('Failed to update name:', error);
            notifyError('Failed to update account name');
            setEditedName(account.name);
        }
    };

    const isLoading = updateAccountMutation.isPending;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            {isEditing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        size="small"
                        autoFocus
                        error={!editedName.trim()}
                        helperText={!editedName.trim() ? 'Name is required' : ''}
                    />
                    <IconButton 
                        size="small" 
                        onClick={handleSave} 
                        color="primary"
                        disabled={!editedName.trim() || isLoading}
                    >
                        <CheckIcon />
                    </IconButton>
                    <IconButton 
                        size="small" 
                        onClick={() => {
                            setIsEditing(false);
                            setEditedName(account.name);
                        }}
                        disabled={isLoading}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            ) : (
                <>
                    <Typography variant="h5" component="div">
                        {account.name}
                    </Typography>
                    <IconButton 
                        size="small" 
                        onClick={() => setIsEditing(true)}
                        sx={{ ml: 1 }}
                        disabled={isLoading}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </>
            )}
            <Box sx={{ ml: 'auto' }}>
                <IconButton 
                    color="error"
                    onClick={onDeleteClick}
                    disabled={isLoading}
                    sx={{ 
                        '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.contrastText'
                        }
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </Box>
        </Box>
    );
}
