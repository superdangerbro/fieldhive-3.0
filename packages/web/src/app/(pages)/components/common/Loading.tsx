'use client';

import React from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * Loading spinner component with centered layout
 * Features:
 * - Centered in container
 * - Customizable size
 * - Full height by default
 * 
 * @component
 * @example
 * ```tsx
 * // Full page loading
 * <Loading />
 * 
 * // Container loading
 * <Loading fullHeight={false} />
 * ```
 */
export function Loading({ fullHeight = true }: { fullHeight?: boolean }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: fullHeight ? '100vh' : '100%',
        width: '100%',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
