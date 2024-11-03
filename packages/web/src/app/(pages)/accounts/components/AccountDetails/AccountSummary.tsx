'use client';

import React from 'react';
import { Box, Typography, IconButton, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Address } from '@/app/globaltypes';

interface AccountSummaryProps {
  account: {
    account_id: string;
    name: string;
    type: string;
    billingAddress: Address | null;
  };
  onEditAddress: () => void;
}

export function AccountSummary({ account, onEditAddress }: AccountSummaryProps) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Billing Address
            </Typography>
            <Typography variant="body2" component="div">
              {account.billingAddress ? (
                <>
                  {account.billingAddress.address1}<br />
                  {account.billingAddress.address2 && (
                    <>{account.billingAddress.address2}<br /></>
                  )}
                  {account.billingAddress.city}, {account.billingAddress.province}<br />
                  {account.billingAddress.postal_code}
                </>
              ) : (
                'No billing address set'
              )}
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={onEditAddress}
            sx={{ ml: 1 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Key Contacts
        </Typography>
        <Typography variant="body2">Coming soon</Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Admin Users
        </Typography>
        <Typography variant="body2">Coming soon</Typography>
      </Grid>
    </Grid>
  );
}
