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
import { useAccountStore } from '../store';

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
    const { deleteAccount, archiveAccount, isLoading, error: storeError } = useAccountStore();
    const [error, setError] = React.useState<string | null>(null);
    const [canArchive, setCanArchive] = React.useState(false);

    const handleArchive = async () => {
        try {
            await archiveAccount(accountId);
            onDeleted();
            onClose();
        } catch (error) {
            setError('Failed to archive account');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteAccount(accountId);
            onDeleted();
            onClose();
        } catch (error: any) {
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

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Delete Account</DialogTitle>
            <DialogContent>
                {(error || storeError) ? (
                    <>
                        <DialogContentText color="error">
                            {error || storeError}
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
                {(error || storeError) ? (
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
