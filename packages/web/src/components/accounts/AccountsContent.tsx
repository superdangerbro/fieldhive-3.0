'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import AccountsTable from './AccountsTable';
import type { Account } from '@fieldhive/shared';

export default function AccountsContent() {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  return (
    <Box>
      <AccountsTable 
        refreshTrigger={0}
        onAccountSelect={setSelectedAccount}
        selectedAccount={selectedAccount}
        onAccountsLoad={setAccounts}
      />
    </Box>
  );
}
