'use client';

import React from 'react';
import { Grid } from '@mui/material';
import type { Address } from '@fieldhive/shared';
import InlineAddressEdit from './InlineAddressEdit';

interface PropertyAddressesProps {
  propertyId: string;
  serviceAddress: Address | null;
  billingAddress: Address | null;
  onUpdate?: () => void;
}

export default function PropertyAddresses({ 
  propertyId,
  serviceAddress, 
  billingAddress,
  onUpdate
}: PropertyAddressesProps) {
  return (
    <Grid container spacing={3}>
      {/* Left side: Service Address */}
      <Grid item xs={12} md={6}>
        <InlineAddressEdit
          propertyId={propertyId}
          address={serviceAddress}
          type="service"
          onUpdate={onUpdate}
        />
      </Grid>

      {/* Right side: Billing Address */}
      <Grid item xs={12} md={6}>
        <InlineAddressEdit
          propertyId={propertyId}
          address={billingAddress}
          type="billing"
          onUpdate={onUpdate}
        />
      </Grid>
    </Grid>
  );
}
