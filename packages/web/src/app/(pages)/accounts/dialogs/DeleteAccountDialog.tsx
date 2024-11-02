'use client';

import React from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogContentText, 
    DialogActions, 
    Button 
} from '@mui/material';
import { deleteAccount, archiveAccount } from '@/services/api';

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
            setCanArchive(error.canArchive);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Delete Account</DialogTitle>
            <DialogContent>
                {error ? (
                    <>
                        <DialogContentText color="error">
                            {error}
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
                <Button onClick={onClose}>
                    Cancel
                </Button>
                {error ? (
                    canArchive && (
                        <Button onClick={handleArchive} color="warning">
                            Archive Account
                        </Button>
                    )
                ) : (
                    <Button onClick={handleDelete} color="error">
                        Delete Account
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
