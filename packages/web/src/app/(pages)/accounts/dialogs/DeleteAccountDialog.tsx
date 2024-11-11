'use client';

import React from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogContentText, 
    DialogActions, 
    Button,
    CircularProgress
} from '@mui/material';
import { useDeleteAccount, useArchiveAccount } from '../hooks';

interface DeleteAccountDialogProps {
    open: boolean;
    accountId: string;
    onClose: () => void;
    onDeleted: () => void;
}

export function DeleteAccountDialog({ 
    open, 
    accountId, 
    onClose, 
    onDeleted 
}: DeleteAccountDialogProps) {
    const deleteMutation = useDeleteAccount();
    const archiveMutation = useArchiveAccount();
    const [error, setError] = React.useState<string | null>(null);
    const [canArchive, setCanArchive] = React.useState(false);

    const handleArchive = async () => {
        try {
            await archiveMutation.mutateAsync(accountId);
            onDeleted();
            onClose();
        } catch (error) {
            console.error('Failed to archive account:', error);
            setError('Failed to archive account');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(accountId);
            onDeleted();
            onClose();
        } catch (error: any) {
            console.error('Failed to delete account:', error);
            setError(error.message);
            // Check if the error response indicates we can archive
            if (error.cause?.canArchive) {
                setCanArchive(true);
            }
        }
    };

    // Reset state when dialog opens/closes
    React.useEffect(() => {
        if (!open) {
            setError(null);
            setCanArchive(false);
        }
    }, [open]);

    const isLoading = deleteMutation.isPending || archiveMutation.isPending;
    const mutationError = deleteMutation.error || archiveMutation.error;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Delete Account</DialogTitle>
            <DialogContent>
                {(error || mutationError) ? (
                    <>
                        <DialogContentText color="error">
                            {error || (mutationError instanceof Error ? mutationError.message : 'An error occurred')}
                        </DialogContentText>
                        {canArchive && (
                            <DialogContentText sx={{ mt: 2 }}>
                                Would you like to archive this account instead?
                            </DialogContentText>
                        )}
                    </>
                ) : (
                    <DialogContentText>
                        Are you sure you want to delete this account? This action cannot be undone.
                        All associated properties and jobs will also be deleted.
                    </DialogContentText>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>
                {(error || mutationError) ? (
                    canArchive && (
                        <Button 
                            onClick={handleArchive} 
                            color="warning"
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} /> : null}
                        >
                            {isLoading ? 'Archiving...' : 'Archive Account'}
                        </Button>
                    )
                ) : (
                    <Button 
                        onClick={handleDelete} 
                        color="error"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} /> : null}
                    >
                        {isLoading ? 'Deleting...' : 'Delete Account'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
