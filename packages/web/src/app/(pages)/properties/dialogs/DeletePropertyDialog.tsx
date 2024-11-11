'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material';

interface DeletePropertyDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    error?: Error | null;
}

export function DeletePropertyDialog({
    open,
    onClose,
    onConfirm,
    isDeleting,
    error
}: DeletePropertyDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Delete Property</DialogTitle>
            <DialogContent>
                {error ? (
                    <DialogContentText color="error">
                        {error.message || 'Failed to delete property'}
                    </DialogContentText>
                ) : (
                    <DialogContentText>
                        Are you sure you want to delete this property? This action cannot be undone.
                    </DialogContentText>
                )}
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={onClose}
                    disabled={isDeleting}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={onConfirm} 
                    color="error"
                    disabled={isDeleting}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
