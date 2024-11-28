'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SnackbarProvider } from 'notistack';
import { theme } from '../theme';
import { QueryErrorBoundary } from './globalComponents/QueryErrorBoundary';
import { ENV_CONFIG } from '../config/environment';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: ENV_CONFIG.queryClient.maxRetries,
      staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
      gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
      throwOnError: true,
    },
    mutations: {
      retry: ENV_CONFIG.queryClient.maxRetries,
    },
  },
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