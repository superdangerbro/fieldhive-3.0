'use client';

import React, { useState } from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Typography,
    CircularProgress
} from '@mui/material';
import { AccountHeader } from './AccountHeader';
import { AccountSummary } from './AccountSummary';
import { useDeleteAccount } from '../../hooks';
import { useActionNotifications } from '@/app/globalHooks/useActionNotifications';
import { useCrudDialogs } from '@/app/globalHooks/useCrudDialogs';
import type { Account } from '@/app/globalTypes/account';

interface AccountDetailsProps {
    account: Account;
    onUpdate: () => void;
}

export function AccountDetails({ account, onUpdate }: AccountDetailsProps) {
    const deleteMutation = useDeleteAccount();
    const { notifySuccess, notifyError } = useActionNotifications();
    const { dialogState, openDeleteDialog, closeDialog } = useCrudDialogs();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleDeleteConfirm = async () => {
        try {
            await deleteMutation.mutateAsync(account.account_id);
            setIsDeleteDialogOpen(false);
            notifySuccess('Account deleted successfully');
            onUpdate();
        } catch (error) {
            console.error('Failed to delete account:', error);
            notifyError('Failed to delete account');
        }
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <AccountHeader
                    account={account}
                    onUpdate={onUpdate}
                    onDeleteClick={() => setIsDeleteDialogOpen(true)}
                />
                <AccountSummary account={account} />
            </CardContent>

            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => !deleteMutation.isPending && setIsDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Account</DialogTitle>
                <DialogContent>
                    {deleteMutation.error ? (
                        <Typography color="error">
                            {deleteMutation.error instanceof Error 
                                ? deleteMutation.error.message 
                                : 'Failed to delete account. Please try again.'}
                        </Typography>
                    ) : (
                        <Typography>
                            Are you sure you want to delete {account.name}? This action cannot be undone.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setIsDeleteDialogOpen(false)}
                        disabled={deleteMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm}
                        color="error"
                        disabled={deleteMutation.isPending}
                        startIcon={deleteMutation.isPending ? <CircularProgress size={20} /> : null}
                        autoFocus
                    >
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
