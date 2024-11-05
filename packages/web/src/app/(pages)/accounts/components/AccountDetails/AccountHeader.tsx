'use client';

import React, { useState } from 'react';
import { Box, Typography, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, Chip, SelectChangeEvent, CircularProgress, Card, CardContent, Autocomplete } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContactsIcon from '@mui/icons-material/Contacts';
import type { Account } from '@/app/globalTypes/account';
import type { Address, User } from '@/app/globalTypes';
import { useAccountStore } from '../../store';
import { useUpdateAccount, useAccountSettings } from '../../hooks/useAccounts';

interface AccountHeaderProps {
  account: Account;
  onUpdate: () => void;
  onDeleteClick: () => void;
}

export function AccountHeader({ account, onUpdate, onDeleteClick }: AccountHeaderProps) {
  const { 
    accountTypes,
    accountStatuses,
    settingsLoaded
  } = useAccountStore();

  const updateAccountMutation = useUpdateAccount();
  const { isLoading: isSettingsLoading } = useAccountSettings();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(account.name);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState<Partial<Address>>(account.billingAddress || {});
  const [isEditingContacts, setIsEditingContacts] = useState(false);
  const [editedContacts, setEditedContacts] = useState<User[]>(
    account.users?.filter(user => user.is_contact) || []
  );

  const handleNameSave = async () => {
    if (editedName === account.name) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateAccountMutation.mutateAsync({ 
        id: account.account_id, 
        data: { name: editedName }
      }, {
        onSuccess: () => {
          setIsEditingName(false);
          onUpdate();
        },
        onError: () => {
          setEditedName(account.name);
        }
      });
    } catch (error) {
      console.error('Failed to update name:', error);
      setEditedName(account.name);
    }
  };

  const handleAddressSave = async () => {
    try {
      await updateAccountMutation.mutateAsync({ 
        id: account.account_id, 
        data: { billingAddress: editedAddress as Address }
      }, {
        onSuccess: () => {
          setIsEditingAddress(false);
          onUpdate();
        },
        onError: () => {
          setEditedAddress(account.billingAddress || {});
        }
      });
    } catch (error) {
      console.error('Failed to update address:', error);
      setEditedAddress(account.billingAddress || {});
    }
  };

  const handleContactsSave = async () => {
    try {
      const updatedUsers = account.users?.map(user => ({
        ...user,
        is_contact: editedContacts.some(contact => contact.user_id === user.user_id)
      })) || [];

      await updateAccountMutation.mutateAsync({ 
        id: account.account_id, 
        data: { users: updatedUsers }
      }, {
        onSuccess: () => {
          setIsEditingContacts(false);
          onUpdate();
        },
        onError: () => {
          setEditedContacts(account.users?.filter(user => user.is_contact) || []);
        }
      });
    } catch (error) {
      console.error('Failed to update contacts:', error);
      setEditedContacts(account.users?.filter(user => user.is_contact) || []);
    }
  };

  const handleStatusChange = async (event: SelectChangeEvent<string>) => {
    try {
      await updateAccountMutation.mutateAsync({ 
        id: account.account_id, 
        data: { status: event.target.value }
      }, {
        onSuccess: onUpdate
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleTypeChange = async (event: SelectChangeEvent<string>) => {
    try {
      await updateAccountMutation.mutateAsync({ 
        id: account.account_id, 
        data: { type: event.target.value }
      }, {
        onSuccess: onUpdate
      });
    } catch (error) {
      console.error('Failed to update type:', error);
    }
  };

  const isLoading = !settingsLoaded || isSettingsLoading || updateAccountMutation.isPending;
  const hasStatuses = Array.isArray(accountStatuses) && accountStatuses.length > 0;
  const hasTypes = Array.isArray(accountTypes) && accountTypes.length > 0;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Account Name Row */}
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
        <Box sx={{ ml: 'auto' }}>
          <IconButton 
            color="error"
            onClick={onDeleteClick}
            sx={{ 
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.contrastText'
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Info Cards Row */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Billing Address Card */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Billing Address
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setIsEditingAddress(true)}
                sx={{ ml: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            {isEditingAddress ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Address Line 1"
                  size="small"
                  value={editedAddress.address1 || ''}
                  onChange={(e) => setEditedAddress(prev => ({ ...prev, address1: e.target.value }))}
                />
                <TextField
                  label="Address Line 2"
                  size="small"
                  value={editedAddress.address2 || ''}
                  onChange={(e) => setEditedAddress(prev => ({ ...prev, address2: e.target.value }))}
                />
                <TextField
                  label="City"
                  size="small"
                  value={editedAddress.city || ''}
                  onChange={(e) => setEditedAddress(prev => ({ ...prev, city: e.target.value }))}
                />
                <TextField
                  label="Province"
                  size="small"
                  value={editedAddress.province || ''}
                  onChange={(e) => setEditedAddress(prev => ({ ...prev, province: e.target.value }))}
                />
                <TextField
                  label="Postal Code"
                  size="small"
                  value={editedAddress.postal_code || ''}
                  onChange={(e) => setEditedAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setIsEditingAddress(false);
                      setEditedAddress(account.billingAddress || {});
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <IconButton size="small" onClick={handleAddressSave} color="primary">
                    <CheckIcon />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              account.billingAddress ? (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography>
                    {account.billingAddress.address1}
                  </Typography>
                  {account.billingAddress.address2 && (
                    <Typography>
                      {account.billingAddress.address2}
                    </Typography>
                  )}
                  <Typography>
                    {account.billingAddress.city}, {account.billingAddress.province}, {account.billingAddress.postal_code}
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No billing address provided
                </Typography>
              )
            )}
          </CardContent>
        </Card>

        {/* Contacts Card */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ContactsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Contacts
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setIsEditingContacts(true)}
                sx={{ ml: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            {isEditingContacts ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Autocomplete
                  multiple
                  options={account.users || []}
                  value={editedContacts}
                  onChange={(_, newValue) => setEditedContacts(newValue)}
                  getOptionLabel={(option: User) => `${option.first_name} ${option.last_name}`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      label="Select Contacts"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option: User, index) => (
                      <Chip
                        label={`${option.first_name} ${option.last_name}`}
                        size="small"
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setIsEditingContacts(false);
                      setEditedContacts(account.users?.filter(user => user.is_contact) || []);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <IconButton size="small" onClick={handleContactsSave} color="primary">
                    <CheckIcon />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {account.users?.filter(user => user.is_contact).map((user: User) => (
                  <Chip
                    key={user.user_id}
                    size="small"
                    label={`${user.first_name} ${user.last_name}`}
                    title={user.email}
                  />
                ))}
                {(!account.users || account.users.filter(user => user.is_contact).length === 0) && (
                  <Typography color="text.secondary">
                    No contacts assigned
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Status & Type Card */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={account.status || ''}
                  onChange={handleStatusChange}
                  label="Status"
                  disabled={isLoading}
                >
                  {isLoading || !hasStatuses ? (
                    <MenuItem value={account.status || ''}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        <span>Loading...</span>
                      </Box>
                    </MenuItem>
                  ) : (
                    accountStatuses.map((status: any) => (
                      <MenuItem key={status.value} value={status.value}>
                        <Chip 
                          label={status.label || status.value}
                          size="small"
                          sx={{ 
                            backgroundColor: status.color || '#666666',
                            color: 'white'
                          }}
                        />
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={account.type || ''}
                  onChange={handleTypeChange}
                  label="Type"
                  disabled={isLoading}
                >
                  {isLoading || !hasTypes ? (
                    <MenuItem value={account.type || ''}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        <span>Loading...</span>
                      </Box>
                    </MenuItem>
                  ) : (
                    accountTypes.map((type: any) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Chip 
                          label={type.label || type.value}
                          size="small"
                          sx={{ 
                            backgroundColor: type.color || '#666666',
                            color: 'white'
                          }}
                        />
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
