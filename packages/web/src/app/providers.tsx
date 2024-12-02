'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SnackbarProvider } from 'notistack';
import { QueryErrorBoundary } from './globalComponents/QueryErrorBoundary';
import { theme } from '../theme';
import { ENV_CONFIG } from './config/environment';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
      gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
      retry: ENV_CONFIG.queryClient.maxRetries,
      refetchOnWindowFocus: false
    }
  }
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SnackbarProvider maxSnack={3}>
            <QueryErrorBoundary>
              {children}
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryErrorBoundary>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}