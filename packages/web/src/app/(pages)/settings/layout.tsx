'use client';

import { Box } from '@mui/material';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box component="main" sx={{ height: '100%', width: '100%' }}>
      {children}
    </Box>
  );
}
