'use client';

import React, { useState } from 'react';
import { Box, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { AccountHeader } from './AccountDetails/AccountHeader';
import { AccountSummary } from './AccountDetails/AccountSummary';
import type { Account } from 'app/globaltypes';
import { useAccountStore } from '../store';

interface AccountDetailsProps {
  account: Account;
  onUpdate: () => void;
}

export function AccountDetails({ account, onUpdate }: AccountDetailsProps) {
  const { deleteAccount } = useAccountStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount(account.account_id);
      setIsDeleteDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <AccountHeader
          account={account}
          onUpdate={onUpdate}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        />
        <AccountSummary account={account} />
      </CardContent>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {account.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            disabled={isDeleting}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
