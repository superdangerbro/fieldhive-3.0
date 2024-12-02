'use client';

import React, { useCallback } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Button, Typography, Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSnackbar } from 'notistack';

export function QueryErrorBoundary({ children }: { children: React.ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();

  const handleError = useCallback((error: unknown) => {
    // Guard against undefined error
    if (!error) {
      console.error('Received undefined error');
      return;
    }

    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Query Error:', error.message);
    } else if (typeof error === 'string') {
      errorMessage = error;
      console.error('Query Error:', error);
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
      console.error('Query Error:', error.message);
    } else {
      console.error('Query Error: Unknown error type', typeof error);
    }

    try {
      // Only show snackbar for non-network errors
      if (!(error instanceof Error) || !error.message.includes('Failed to fetch')) {
        enqueueSnackbar(errorMessage, { 
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true
        });
      }
    } catch (snackbarError) {
      console.error('Failed to show error notification:', snackbarError);
    }
  }, [enqueueSnackbar]);

  const ErrorFallback = useCallback(({ error, resetErrorBoundary }: FallbackProps) => {
    React.useEffect(() => {
      if (error) {
        handleError(error);
      }
    }, [error]);

    if (!error) return null;

    let errorMessage = 'An unexpected error occurred';
    let isNetworkError = false;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      isNetworkError = error.message.includes('Failed to fetch');
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // For network errors, show a more user-friendly message
    if (isNetworkError) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            p: 4, 
            bgcolor: 'warning.light', 
            color: 'warning.contrastText',
            borderRadius: 2,
            maxWidth: '600px',
            mx: 'auto',
            my: 2
          }}
        >
          <Typography variant="h6" gutterBottom>
            Connection Error
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
            Unable to connect to the server. Please check your internet connection and try again.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                try {
                  resetErrorBoundary();
                } catch (resetError) {
                  console.error('Failed to reset error boundary:', resetError);
                }
              }}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          </Box>
        </Box>
      );
    }

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
          {errorMessage}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              try {
                resetErrorBoundary();
              } catch (resetError) {
                console.error('Failed to reset error boundary:', resetError);
              }
            }}
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
  }, [handleError]);

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
