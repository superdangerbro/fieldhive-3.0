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
import { AccountType, CreateAddressDto } from '@fieldhive/shared';
import { createAccount, getSetting, createAddress } from '@/services/api';
import { AddressForm } from '@/app/(pages)/components/common';

interface AddAccountDialogProps {
    open: boolean;
    onClose: () => void;
    onAccountAdded: () => void;
}

interface FormData {
    name: string;
    type: string;
    address: CreateAddressDto;
}

export function AddAccountDialog({ open, onClose, onAccountAdded }: AddAccountDialogProps) {
    const [accountTypes, setAccountTypes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
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
        const loadAccountTypes = async () => {
            try {
                const types = await getSetting('account_types');
                if (Array.isArray(types) && types.length > 0) {
                    setAccountTypes(types);
                    setFormData(prev => ({
                        ...prev,
                        type: types[0]
                    }));
                } else {
                    throw new Error('No account types available');
                }
            } catch (error) {
                console.error('Failed to load account types:', error);
                setError('Unable to load account types. Please try again or contact support.');
            }
        };

        if (open) {
            loadAccountTypes();
            // Reset form data when dialog opens
            setFormData({
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
            setError(null);
        }
    }, [open]);

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
        if (accountTypes.length === 0) {
            setError('Account types are not available. Please try again later.');
            return;
        }

        setIsLoading(true);
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

            // First create the address
            const addressData = {
                address1: formData.address.address1.trim(),
                address2: formData.address.address2?.trim(),
                city: formData.address.city.trim(),
                province: formData.address.province.trim(),
                postal_code: formData.address.postal_code.trim(),
                country: formData.address.country.trim() || 'Canada',
            };

            const createdAddress = await createAddress(addressData);

            // Then create the account with the address ID
            const accountData = {
                name: formData.name.trim(),
                type: formData.type as AccountType,
                billing_address_id: createdAddress.address_id
            };

            await createAccount(accountData);
            onAccountAdded();
            onClose();
        } catch (error: any) {
            console.error('Failed to create account:', error);
            setError(error.message || 'Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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
            <DialogTitle>Add New Account</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
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
                        disabled={isLoading || accountTypes.length === 0}
                    >
                        {accountTypes.map(type => (
                            <MenuItem 
                                key={type} 
                                value={type}
                                sx={{ 
                                    minHeight: '48px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Billing Address
                </Typography>
                
                <AddressForm
                    initialAddress={formData.address}
                    onSubmit={handleAddressChange}
                    onCancel={() => {}}
                    hideButtons={true}
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
                    disabled={isLoading || accountTypes.length === 0}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                    {isLoading ? 'Adding...' : 'Add Account'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
