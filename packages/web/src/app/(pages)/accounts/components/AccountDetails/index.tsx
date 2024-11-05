'use client';

import React from 'react';
import { Box, Card, CardContent, Grid, Typography, Divider, Chip, Avatar } from '@mui/material';
import { AccountHeader } from './AccountHeader';
import { AccountSummary } from './AccountSummary';
import ContactsIcon from '@mui/icons-material/Contacts';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import type { Account } from '@/app/globalTypes/account';
import { useAccountStore } from '../../store';

interface AccountDetailsProps {
  account: Account;
  onUpdate: () => void;
}

export function AccountDetails({ account, onUpdate }: AccountDetailsProps) {
  const { deleteAccount } = useAccountStore();

  const handleDelete = async () => {
    try {
      await deleteAccount(account.account_id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Card>
        <CardContent>
          <AccountHeader
            account={account}
            onUpdate={onUpdate}
            onDeleteClick={handleDelete}
          />
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={3}>
            {/* Contact Information */}
            <Grid item xs={12} md={4}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ContactsIcon sx={{ mr: 1, color: '#6B46C1' }} />
                  <Typography variant="h6">
                    Contact Information
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contact Name
                  </Typography>
                  <Typography>
                    {account.contact_name || 'No contact name provided'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contact Email
                  </Typography>
                  <Typography>
                    {account.contact_email || 'No email provided'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contact Phone
                  </Typography>
                  <Typography>
                    {account.contact_phone || 'No phone number provided'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Billing Address */}
            <Grid item xs={12} md={4}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOnIcon sx={{ mr: 1, color: '#6B46C1' }} />
                  <Typography variant="h6">
                    Billing Address
                  </Typography>
                </Box>
                {account.billingAddress ? (
                  <>
                    <Typography>
                      {account.billingAddress.address1}
                    </Typography>
                    {account.billingAddress.address2 && (
                      <Typography>
                        {account.billingAddress.address2}
                      </Typography>
                    )}
                    <Typography>
                      {account.billingAddress.city}, {account.billingAddress.province} {account.billingAddress.postal_code}
                    </Typography>
                  </>
                ) : (
                  <Typography color="text.secondary">
                    No billing address provided
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Associated Users */}
            <Grid item xs={12} md={4}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GroupIcon sx={{ mr: 1, color: '#6B46C1' }} />
                  <Typography variant="h6">
                    Associated Users
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {account.users && account.users.length > 0 ? (
                    account.users.map((user) => (
                      <Chip
                        key={user.user_id}
                        avatar={<Avatar>{user.email[0]}</Avatar>}
                        label={user.email}
                        title={user.email}
                        sx={{ mb: 1 }}
                      />
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      No users associated with this account
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />
          
          {/* Account Summary */}
          <AccountSummary account={account} />
        </CardContent>
      </Card>
    </Box>
  );
}
