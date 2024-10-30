'use client';

import React from 'react';
import { Autocomplete, TextField, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { Account } from '@fieldhive/shared';

interface AccountSearchProps {
  accounts: Account[];
  selectedAccount: Account | null;
  onAccountSelect: (account: Account | null) => void;
  onAddClick: () => void;
}

export default function AccountSearch({ 
  accounts, 
  selectedAccount,
  onAccountSelect,
  onAddClick 
}: AccountSearchProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <Autocomplete
        sx={{ flexGrow: 1 }}
        options={accounts}
        value={selectedAccount}
        onChange={(event, newValue) => onAccountSelect(newValue)}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.account_id === value.account_id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Accounts"
            placeholder="Type to search..."
          />
        )}
      />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddClick}
      >
        Add Account
      </Button>
    </Box>
  );
}
