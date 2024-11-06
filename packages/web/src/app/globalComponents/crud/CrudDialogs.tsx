'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    SxProps,
    Theme
} from '@mui/material';

interface BaseDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    contentSx?: SxProps<Theme>;
}

export function CrudFormDialog({ 
    open, 
    onClose, 
    title, 
    children, 
    actions, 
    maxWidth = 'sm',
    contentSx
}: BaseDialogProps) {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent sx={{ ...contentSx }}>
                <Box sx={{ mt: 2 }}>
                    {children}
                </Box>
            </DialogContent>
            <DialogActions>
                {actions || (
                    <>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            Save
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}

interface DeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export function CrudDeleteDialog({ 
    open, 
    onClose, 
    onConfirm, 
    title, 
    message 
}: DeleteDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
