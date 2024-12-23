'use client';

import React from 'react';
import { Box, Card, CardContent, Grid, Typography, Divider, Chip, Avatar, Paper } from '@mui/material';
import { AccountHeader } from './AccountHeader';
import { AccountSummary } from './AccountSummary';
import GroupIcon from '@mui/icons-material/Group';
import ContactsIcon from '@mui/icons-material/Contacts';
import { useDeleteAccount } from '../../hooks';
import type { Account } from '../../../../globalTypes/account';

interface AccountDetailsProps {
    account: Account;
    onUpdate: () => void;
}

export function AccountDetails({ account, onUpdate }: AccountDetailsProps) {
    const deleteMutation = useDeleteAccount();

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(account.account_id);
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
                        <Grid item xs={12} md={6}>
                            <Paper 
                                elevation={1} 
                                sx={{ 
                                    p: 2, 
                                    height: '100%',
                                    minHeight: '200px',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <ContactsIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6">
                                        Contact Information
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: 1 }}>
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
                            </Paper>
                        </Grid>

                        {/* Associated Users */}
                        <Grid item xs={12} md={6}>
                            <Paper 
                                elevation={1} 
                                sx={{ 
                                    p: 2,
                                    height: '100%',
                                    minHeight: '200px',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6">
                                        Associated Users
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 1, alignContent: 'flex-start' }}>
                                    {account.users && account.users.length > 0 ? (
                                        account.users.map((user) => (
                                            <Chip
                                                key={user.user_id}
                                                avatar={<Avatar>{user.email[0].toUpperCase()}</Avatar>}
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
                            </Paper>
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
