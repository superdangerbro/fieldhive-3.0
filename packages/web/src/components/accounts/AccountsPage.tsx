'use client';

import { Box, Typography } from '@mui/material';
import AccountsTable from './AccountsTable';

export default function AccountsPage() {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Accounts
      </Typography>
      <AccountsTable refreshTrigger={0} />
    </Box>
  );
}
