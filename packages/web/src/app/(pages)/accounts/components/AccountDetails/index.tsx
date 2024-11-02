'use client';

import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, TextField, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type { Account, Address, CreateAddressDto } from '@fieldhive/shared';
import { updateAccount, deleteAccount, archiveAccount, createAddress } from '@/services/api';
import { AddressForm } from '@/app/(pages)/components/common';
import { AccountSummary } from './AccountSummary';
import { AccountTabs } from './AccountTabs';

interface AccountDetailsProps {
  account: Account | null;
  onUpdate?: () => void;
  onAccountSelect: (account: Account | null) => void;
}

export function AccountDetails({ account, onUpdate, onAccountSelect }: AccountDetailsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [canArchive, setCanArchive] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(account?.status || 'Active');
  const [currentType, setCurrentType] = useState(account?.type || 'Individual');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(account?.name || '');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    if (account) {
      setCurrentStatus(account.status || 'Active');
      setCurrentType(account.type || 'Individual');
      setEditedName(account.name);
    }
  }, [account]);

  const handleArchive = async () => {
    if (!account) return;

    try {
      await archiveAccount(account.account_id);
      setDeleteDialogOpen(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      setDeleteError('Failed to archive account');
    }
  };

  const handleConfirmDelete = async () => {
    if (!account) return;

    try {
      await deleteAccount(account.account_id);
      setDeleteDialogOpen(false);
      onAccountSelect(null);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      setDeleteError(error.message);
      setCanArchive(error.canArchive);
    }
  };

  const handleStatusChange = async (event: any) => {
    if (!account) return;
    
    setStatusLoading(true);
    try {
      await updateAccount(account.account_id, {
        status: event.target.value
      });
      setCurrentStatus(event.target.value);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleTypeChange = async (event: any) => {
    if (!account) return;
    
    try {
      await updateAccount(account.account_id, {
        type: event.target.value
      });
      setCurrentType(event.target.value);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update type:', error);
    }
  };

  const handleNameSave = async () => {
    if (!account || editedName === account.name) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateAccount(account.account_id, { name: editedName });
      if (onUpdate) {
        onUpdate();
      }
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update name:', error);
      setEditedName(account.name); // Reset on error
    }
  };

  const handleAddressSave = async (addressData: CreateAddressDto | Address) => {
    if (!account) return;

    try {
      let address: Address;
      if ('address_id' in addressData) {
        // If it's an existing address being edited
        address = addressData as Address;
      } else {
        // If it's a new address being created
        address = await createAddress(addressData as CreateAddressDto);
      }

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

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                {isEditingName ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      size="small"
                      autoFocus
                    />
                    <IconButton size="small" onClick={handleNameSave} color="primary">
                      <CheckIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setIsEditingName(false);
                        setEditedName(account.name);
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h5" component="div">
                      {account.name}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setIsEditingName(true)}
                      sx={{ ml: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
              <AccountSummary 
                account={account}
                onEditAddress={() => setIsEditingAddress(true)}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ml: 4 }}>
              <DeleteIcon 
                sx={{ color: 'error.main', cursor: 'pointer' }}
                onClick={() => setDeleteDialogOpen(true)}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentStatus}
                  onChange={handleStatusChange}
                  label="Status"
                  disabled={statusLoading}
                >
                  <MenuItem value="Active">
                    <Chip label="Active" size="small" color="success" sx={{ color: 'white' }} />
                  </MenuItem>
                  <MenuItem value="Inactive">
                    <Chip label="Inactive" size="small" color="warning" sx={{ color: 'white' }} />
                  </MenuItem>
                  <MenuItem value="Archived">
                    <Chip label="Archived" size="small" color="error" sx={{ color: 'white' }} />
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={currentType}
                  onChange={handleTypeChange}
                  label="Type"
                >
                  <MenuItem value="Individual">
                    <Chip label="Individual" size="small" color="info" sx={{ color: 'white' }} />
                  </MenuItem>
                  <MenuItem value="Company">
                    <Chip label="Company" size="small" color="secondary" sx={{ color: 'white' }} />
                  </MenuItem>
                  <MenuItem value="Property Manager">
                    <Chip label="Property Manager" size="small" color="primary" sx={{ color: 'white' }} />
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <AccountTabs account={account} />
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          {deleteError ? (
            <>
              <DialogContentText color="error">
                {deleteError}
              </DialogContentText>
              {canArchive && (
                <DialogContentText sx={{ mt: 2 }}>
                  Would you like to archive this account instead?
                </DialogContentText>
              )}
            </>
          ) : (
            <DialogContentText>
              Are you sure you want to delete this account? This action cannot be undone.
              All associated properties and jobs will also be deleted.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          {deleteError ? (
            canArchive && (
              <Button onClick={handleArchive} color="warning">
                Archive Account
              </Button>
            )
          ) : (
            <Button onClick={handleConfirmDelete} color="error">
              Delete Account
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={isEditingAddress}
        onClose={() => setIsEditingAddress(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Billing Address</DialogTitle>
        <DialogContent>
          <AddressForm
            initialAddress={account.billingAddress}
            onSubmit={handleAddressSave}
            onCancel={() => setIsEditingAddress(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
