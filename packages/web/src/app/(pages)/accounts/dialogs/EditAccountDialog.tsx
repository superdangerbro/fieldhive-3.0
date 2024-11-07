'use client';

import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    Select, 
    MenuItem, 
    InputLabel, 
    FormControl, 
    SelectChangeEvent,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import { useUpdateAccount, useAccountSettings } from '../hooks/useAccounts';
import { AddressForm } from '@/app/globalComponents/AddressForm';
import type { Account } from '@/app/globalTypes/account';
import type { CreateAddressDto } from '@/app/globalTypes/address';

interface EditAccountDialogProps {
    open: boolean;
    account: Account | null;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormData {
    name: string;
    type: string;
    address: CreateAddressDto;
}

export function EditAccountDialog({ open, account, onClose, onSuccess }: EditAccountDialogProps) {
    const updateMutation = useUpdateAccount();
    const { data: settings, isLoading: isLoadingSettings } = useAccountSettings();
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        type: '',
        address: {
            address1: '',
            address2: '',
            city: '',
            province: '',
            postal_code: '',
            country: 'Canada',
        },
    });

    useEffect(() => {
        if (account) {
            setFormData({
                name: account.name || '',
                type: account.type || '',
                address: account.billingAddress ? {
                    address1: account.billingAddress.address1 || '',
                    address2: account.billingAddress.address2 || '',
                    city: account.billingAddress.city || '',
                    province: account.billingAddress.province || '',
                    postal_code: account.billingAddress.postal_code || '',
                    country: account.billingAddress.country || 'Canada',
                } : {
                    address1: '',
                    address2: '',
                    city: '',
                    province: '',
                    postal_code: '',
                    country: 'Canada',
                },
            });
            setError(null);
        }
    }, [account]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        setFormData(prev => ({
            ...prev,
            type: e.target.value
        }));
    };

    const handleAddressChange = (address: CreateAddressDto) => {
        setFormData(prev => ({
            ...prev,
            address
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) return;

        setError(null);

        try {
            // Validate required fields
            if (!formData.name.trim()) {
                throw new Error('Account name is required');
            }
            if (!formData.type) {
                throw new Error('Account type is required');
            }
            if (!formData.address.address1.trim() || !formData.address.city.trim() || 
                !formData.address.province.trim() || !formData.address.postal_code.trim()) {
                throw new Error('Please fill in all required address fields');
            }

            await updateMutation.mutateAsync({
                id: account.account_id,
                data: {
                    name: formData.name.trim(),
                    type: formData.type,
                    billingAddress: formData.address
                }
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update account:', error);
            setError(error instanceof Error ? error.message : 'Failed to update account. Please try again.');
        }
    };

    if (!account) return null;

    const isLoading = updateMutation.isPending || isLoadingSettings;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                component: 'form',
                onSubmit: handleSubmit
            }}
        >
            <DialogTitle>Edit Account</DialogTitle>
            <DialogContent>
                {(error || updateMutation.error) && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error || (updateMutation.error instanceof Error ? updateMutation.error.message : 'An error occurred')}
                    </Alert>
                )}
                
                <TextField
                    autoFocus
                    margin="dense"
                    name="name"
                    label="Account Name"
                    type="text"
                    fullWidth
                    required
                    value={formData.name}
                    onChange={handleTextChange}
                    disabled={isLoading}
                />
                
                <FormControl fullWidth margin="dense" required>
                    <InputLabel id="type-label">Account Type</InputLabel>
                    <Select
                        labelId="type-label"
                        name="type"
                        value={formData.type}
                        onChange={handleSelectChange}
                        label="Account Type"
                        disabled={isLoading || !settings?.types?.length}
                    >
                        {settings?.types?.map(type => (
                            <MenuItem 
                                key={type.value} 
                                value={type.value}
                                sx={{ 
                                    minHeight: '48px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {type.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Billing Address
                </Typography>
                
                <AddressForm
                    initialAddress={formData.address}
                    onChange={handleAddressChange}
                    disabled={isLoading}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    variant="contained"
                    disabled={isLoading || !settings?.types?.length}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
