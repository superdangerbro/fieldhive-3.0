'use client';

import React from 'react';
import { Box } from '@mui/material';

interface ClientLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for client-facing pages
 * Features:
 * - Clean, minimal design
 * - Full viewport height
 * - Responsive layout
 * 
 * @component
 * @example
 * ```tsx
 * <ClientLayout>
 *   <YourClientContent />
 * </ClientLayout>
 * ```
 */
export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {children}
    </Box>
  );
}
