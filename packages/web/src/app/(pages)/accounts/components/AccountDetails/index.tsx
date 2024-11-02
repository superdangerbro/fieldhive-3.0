'use client';

import React, { useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { Account, Address } from '@fieldhive/shared';
import { updateAccount } from '@/services/api';
import { AccountHeader } from './AccountHeader';
import { AccountSummary } from './AccountSummary';
import { AccountTabs } from './AccountTabs';
import { DeleteAccountDialog, EditAddressDialog } from '../../dialogs';

interface AccountDetailsProps {
  account: Account | null;
  onUpdate?: () => void;
  onAccountSelect: (account: Account | null) => void;
}

export function AccountDetails({ account, onUpdate, onAccountSelect }: AccountDetailsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  if (!account) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            Select an account to view details
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleAddressSave = async (address: Address) => {
    if (!account) return;

    try {
      await updateAccount(account.account_id, { 
        billing_address_id: address.address_id 
      });
      if (onUpdate) {
        onUpdate();
      }
      setIsEditingAddress(false);
    } catch (error) {
      console.error('Failed to update billing address:', error);
    }
  };

  const handleDeleteSuccess = () => {
    onAccountSelect(null);
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <AccountHeader
            account={account}
            onUpdate={onUpdate || (() => {})}
            onDeleteClick={() => setDeleteDialogOpen(true)}
          />
          <AccountSummary
            account={account}
            onEditAddress={() => setIsEditingAddress(true)}
          />
          <AccountTabs account={account} />
        </CardContent>
      </Card>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        accountId={account.account_id}
        onClose={() => setDeleteDialogOpen(false)}
        onDeleted={handleDeleteSuccess}
      />

      <EditAddressDialog
        open={isEditingAddress}
        title="Edit Billing Address"
        initialAddress={account.billingAddress}
        onClose={() => setIsEditingAddress(false)}
        onSave={handleAddressSave}
      />
    </>
  );
}
