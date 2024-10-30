'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../../theme';
import DashboardLayout from './DashboardLayout';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <DashboardLayout>{children}</DashboardLayout>
    </ThemeProvider>
  );
}
