'use client';

import React from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Button, Typography, Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSnackbar } from 'notistack';

export function QueryErrorBoundary({ children }: { children: React.ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();

  const handleError = (error: Error) => {
    console.error('Query Error:', error);
    enqueueSnackbar(error.message, { 
      variant: 'error',
      autoHideDuration: 5000
    });
  };

  const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    React.useEffect(() => {
      handleError(error);
    }, [error]);

    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          p: 4, 
          bgcolor: 'error.light', 
          color: 'error.contrastText',
          borderRadius: 2,
          maxWidth: '600px',
          mx: 'auto',
          my: 2
        }}
      >
        <Typography variant="h6" gutterBottom>
          Something went wrong
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
          {error.message || 'An unexpected error occurred'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={resetErrorBoundary}
            startIcon={<RefreshIcon />}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          FallbackComponent={ErrorFallback}
          onError={handleError}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
