'use client';

import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import type { Account } from '@fieldhive/shared';

interface AddressesTabProps {
  account: Account;
}

export function AddressesTab({ account }: AddressesTabProps) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Billing Address
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              {account.billingAddress ? (
                <>
                  {account.billingAddress.address1}<br />
                  {account.billingAddress.city}, {account.billingAddress.province}<br />
                  {account.billingAddress.postal_code}
                </>
              ) : (
                'No billing address set'
              )}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
