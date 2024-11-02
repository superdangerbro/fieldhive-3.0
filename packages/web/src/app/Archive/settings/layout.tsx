'use client';

import { Box } from '@mui/material';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ p: 3 }}>
      {children}
    </Box>
  );
}
