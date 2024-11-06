'use client';

import React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface ActionNotificationsProps {
    successMessage: string | null;
    errorMessage: string | null;
    onClose: () => void;
}

export function ActionNotifications({ successMessage, errorMessage, onClose }: ActionNotificationsProps) {
    return (
        <>
            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={onClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={onClose} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!errorMessage}
                autoHideDuration={5000}
                onClose={onClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={onClose} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
