'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useState } from 'react';
import { theme } from '../theme';

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
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
