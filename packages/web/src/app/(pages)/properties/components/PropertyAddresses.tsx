'use client';

import React from 'react';
import { Grid, Paper, Typography, Stack } from '@mui/material';
import type { Address } from '@fieldhive/shared';

interface PropertyAddressesProps {
  serviceAddress: Address | null;
  billingAddress: Address | null;
}

function AddressDisplay({ address }: { address: Address | null }) {
  if (!address) return <Typography color="text.secondary">Not set</Typography>;

  return (
    <Stack spacing={0.5}>
      <Typography variant="body1" fontWeight="medium">
        {address.address1}
      </Typography>
      {address.address2 && (
        <Typography variant="body2" color="text.secondary">
          {address.address2}
        </Typography>
      )}
      {(address.city || address.province) && (
        <Typography variant="body2" color="text.secondary">
          {[address.city, address.province].filter(Boolean).join(', ')}
        </Typography>
      )}
      {address.postal_code && (
        <Typography variant="body2" color="text.secondary">
          {address.postal_code}
        </Typography>
      )}
      {address.country && (
        <Typography variant="body2" color="text.secondary">
          {address.country}
        </Typography>
      )}
    </Stack>
  );
}

export default function PropertyAddresses({ serviceAddress, billingAddress }: PropertyAddressesProps) {
  return (
    <Grid container spacing={3}>
      {/* Left side: Service Address */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Service Address</Typography>
          <AddressDisplay address={serviceAddress} />
        </Paper>
      </Grid>

      {/* Right side: Billing Address */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Billing Address</Typography>
          <AddressDisplay address={billingAddress} />
        </Paper>
      </Grid>
    </Grid>
  );
}
