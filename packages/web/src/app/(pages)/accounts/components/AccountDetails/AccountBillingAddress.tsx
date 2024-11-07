'use client';

import React, { useState } from 'react';
import { Box, Typography, IconButton, Card, CardContent } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateAccount } from '../../hooks/useAccounts';
import { useUpdateAddress, useCreateAddress } from '../../hooks/useAddresses';
import { useActionNotifications } from '@/app/globalHooks/useActionNotifications';
import { AddressForm } from '@/app/globalComponents/AddressForm';
import type { Account } from '@/app/globalTypes/account';
import type { CreateAddressDto } from '@/app/globalTypes/address';

interface AccountBillingAddressProps {
    account: Account;
    onUpdate: () => void;
}

export function AccountBillingAddress({ account, onUpdate }: AccountBillingAddressProps) {
    const queryClient = useQueryClient();
    const updateAccountMutation = useUpdateAccount();
    const updateAddressMutation = useUpdateAddress();
    const createAddressMutation = useCreateAddress();
    const { notifySuccess, notifyError } = useActionNotifications();
    const [isEditing, setIsEditing] = useState(false);
    const [editedAddress, setEditedAddress] = useState<CreateAddressDto>(
        account.billingAddress || {
            address1: '',
            address2: '',
            city: '',
            province: '',
            postal_code: '',
            country: 'Canada'
        }
    );

    const handleSave = async () => {
        try {
            // Validate required fields
            if (!editedAddress.address1.trim() || !editedAddress.city.trim() || 
                !editedAddress.province.trim() || !editedAddress.postal_code.trim()) {
                notifyError('Please fill in all required fields');
                return;
            }

            let addressResult;
            
            // Update or create address
            if (account.billingAddress?.address_id) {
                // Update existing address
                addressResult = await updateAddressMutation.mutateAsync({
                    id: account.billingAddress.address_id,
                    data: editedAddress
                });
            } else {
                // Create new address
                addressResult = await createAddressMutation.mutateAsync(editedAddress);

                // Update account with new address ID
                const result = await updateAccountMutation.mutateAsync({
                    id: account.account_id,
                    data: { billing_address_id: addressResult.address_id }
                });

                // Update cache with actual result
                queryClient.setQueryData(['account', account.account_id], result);
                queryClient.setQueriesData({ queryKey: ['accounts'] }, (oldData: any) => {
                    if (!oldData) return oldData;
                    return oldData.map((acc: Account) => 
                        acc.account_id === account.account_id ? result : acc
                    );
                });
            }

            setIsEditing(false);
            notifySuccess('Billing address updated successfully');
            onUpdate();
        } catch (error) {
            console.error('Failed to update billing address:', error);
            notifyError('Failed to update billing address');
            
            setEditedAddress(account.billingAddress || {
                address1: '',
                address2: '',
                city: '',
                province: '',
                postal_code: '',
                country: 'Canada'
            });
        }
    };

    const isLoading = updateAccountMutation.isPending || 
                     updateAddressMutation.isPending || 
                     createAddressMutation.isPending;

    return (
        <Card sx={{ flex: 1 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                        Billing Address
                    </Typography>
                    <IconButton 
                        size="small" 
                        onClick={() => {
                            setIsEditing(true);
                            // Test notification
                            notifySuccess('Edit mode enabled');
                        }}
                        sx={{ ml: 1 }}
                        disabled={isLoading}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Box>
                {isEditing ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <AddressForm
                            initialAddress={editedAddress}
                            onChange={setEditedAddress}
                            disabled={isLoading}
                        />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                            <IconButton 
                                size="small" 
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditedAddress(account.billingAddress || {
                                        address1: '',
                                        address2: '',
                                        city: '',
                                        province: '',
                                        postal_code: '',
                                        country: 'Canada'
                                    });
                                }}
                                disabled={isLoading}
                            >
                                <CloseIcon />
                            </IconButton>
                            <IconButton 
                                size="small" 
                                onClick={handleSave} 
                                color="primary"
                                disabled={isLoading}
                            >
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
    );
}
