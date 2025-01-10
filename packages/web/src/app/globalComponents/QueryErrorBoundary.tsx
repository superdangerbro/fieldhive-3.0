'use client';

import React from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Box, Button, Typography } from '@mui/material';

interface Props {
    children: React.ReactNode;
}

export const QueryErrorBoundary: React.FC<Props> = ({ children }) => {
    const handleError = React.useCallback((error: Error) => {
        console.error('Query Error:', error.message, 'Error Component Stack', error.stack);
    }, []);

    const ErrorFallback = React.useCallback(({ error, resetErrorBoundary }: { 
        error: Error; 
        resetErrorBoundary: () => void;
    }) => {
        return (
            <Box 
                sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 2 
                }}
            >
                <Typography variant="h6" color="error">
                    Something went wrong
                </Typography>
                <Typography color="text.secondary">
                    {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </Typography>
                <Button 
                    variant="contained" 
                    onClick={resetErrorBoundary}
                    sx={{ mt: 2 }}
                >
                    Try again
                </Button>
            </Box>
        );
    }, []);

    return (
        <QueryErrorResetBoundary>
            {({ reset }) => (
                <ErrorBoundary
                    onError={handleError}
                    FallbackComponent={ErrorFallback}
                    onReset={reset}
                >
                    {children}
                </ErrorBoundary>
            )}
        </QueryErrorResetBoundary>
    );
};
