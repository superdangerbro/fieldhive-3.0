'use client';

import React from 'react';
import {
  Box,
  Typography,
  Alert,
  TextField,
} from '@mui/material';
import type { Account } from '@/app/globalTypes';
import AccountSelector from '../../components/AccountSelector';

interface AccountStepProps {
  selectedAccounts: Account[];
  setSelectedAccounts: (accounts: Account[]) => void;
  accounts: Account[];
  showAddAccount: boolean;
  setShowAddAccount: (show: boolean) => void;
}

export const AccountStep: React.FC<AccountStepProps> = ({
  selectedAccounts,
  setSelectedAccounts,
  showAddAccount,
  setShowAddAccount,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
        Select Account
      </Typography>
      
      <AccountSelector
        selectedAccounts={selectedAccounts}
        onChange={(accounts: Account[]) => {
          setSelectedAccounts(accounts);
          setShowAddAccount(accounts.length === 0);
        }}
      />

      {showAddAccount && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Please select an existing account or create a new one
          </Alert>

          <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
            New Account Details
          </Typography>
          <TextField
            label="Account Name"
            value={selectedAccounts.length === 1 ? selectedAccounts[0].name : ''}
            onChange={(e) => setSelectedAccounts([{ 
              account_id: 'new', 
              name: e.target.value,
              type: 'customer',
              status: 'active'
            }])}
            fullWidth
            size="small"
            required
            sx={{ mb: 3 }}
          />
        </Box>
      )}
    </Box>
  );
};
