'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Alert
} from '@mui/material';

interface DeletePropertiesDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    selectedCount: number;
    isDeleting: boolean;
}

export function DeletePropertiesDialog({
    open,
    onClose,
    onConfirm,
    selectedCount,
    isDeleting
}: DeletePropertiesDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Confirm Bulk Delete</DialogTitle>
            <DialogContent>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    Are you sure you want to delete {selectedCount} selected properties? This action cannot be undone.
                </Alert>
                <Typography variant="body2" sx={{ mt: 2 }}>
                    All associated data, including addresses, will be permanently deleted.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    Cancel
                </Button>
                <Button 
                    onClick={onConfirm}
                    variant="contained" 
                    color="error"
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
