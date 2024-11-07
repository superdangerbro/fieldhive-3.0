'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, CssBaseline, Snackbar, Alert } from '@mui/material';
import { useState } from 'react';
import { theme } from '../theme';
import { useActionNotifications } from './globalHooks/useActionNotifications';

function Notifications() {
    const { notificationState } = useActionNotifications();
    const { successMessage, errorMessage } = notificationState;

    return (
        <>
            {successMessage && (
                <Snackbar
                    open={true}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert severity="success" sx={{ width: '100%' }}>
                        {successMessage}
                    </Alert>
                </Snackbar>
            )}
            {errorMessage && (
                <Snackbar
                    open={true}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert severity="error" sx={{ width: '100%' }}>
                        {errorMessage}
                    </Alert>
                </Snackbar>
            )}
        </>
    );
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Data is fresh for 30 seconds
                staleTime: 30 * 1000,
                
                // Keep unused data in cache for 5 minutes
                gcTime: 5 * 60 * 1000,
                
                // Only retry failed requests once
                retry: 1,
                
                // Refetch when window regains focus
                refetchOnWindowFocus: true,
                
                // Refetch on reconnect
                refetchOnReconnect: true,
                
                // Prefetch data
                refetchOnMount: 'always'
            },
        },
    }));

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
                {children}
                <Notifications />
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </ThemeProvider>
    );
}
