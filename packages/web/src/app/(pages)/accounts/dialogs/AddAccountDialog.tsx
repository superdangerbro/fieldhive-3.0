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
import { CreateAddressDto } from '@/app/globaltypes';
import { useAccountStore } from '../store';
import { AddressForm } from '@/app/globalComponents/AddressForm';

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
    const { createAccount, fetchAccountSettings, accountTypes, isLoading, error: storeError } = useAccountStore();
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
        if (open) {
            fetchAccountSettings().catch((error: Error) => {
                console.error('Failed to load account settings:', error);
                setError('Unable to load account settings. Please try again or contact support.');
            });

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
    }, [open, fetchAccountSettings]);

    // Set initial type when account types are loaded
    useEffect(() => {
        if (accountTypes.length > 0 && !formData.type) {
            setFormData(prev => ({
                ...prev,
                type: accountTypes[0].value.toLowerCase() // Ensure lowercase value
            }));
        }
    }, [accountTypes, formData.type]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        setFormData(prev => ({
            ...prev,
            type: e.target.value.toLowerCase() // Ensure lowercase value
        }));
    };

    const handleAddressChange = (address: CreateAddressDto) => {
        setFormData(prev => ({
            ...prev,
            address
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            throw new Error('Account name is required');
        }
        if (!formData.type) {
            throw new Error('Account type is required');
        }
        
        const { address1, city, province, postal_code } = formData.address;
        if (!address1?.trim()) {
            throw new Error('Address Line 1 is required');
        }
        if (!city?.trim()) {
            throw new Error('City is required');
        }
        if (!province?.trim()) {
            throw new Error('Province is required');
        }
        if (!postal_code?.trim()) {
            throw new Error('Postal Code is required');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (accountTypes.length === 0) {
            setError('Account types are not available. Please try again later.');
            return;
        }

        setError(null);

        try {
            // Validate form
            validateForm();

            await createAccount({
                name: formData.name.trim(),
                type: formData.type.toLowerCase(), // Ensure lowercase value
                address: {
                    address1: formData.address.address1?.trim() || '',
                    address2: formData.address.address2?.trim(),
                    city: formData.address.city?.trim() || '',
                    province: formData.address.province?.trim() || '',
                    postal_code: formData.address.postal_code?.trim() || '',
                    country: formData.address.country?.trim() || 'Canada',
                }
            });

            onAccountAdded();
            onClose();
        } catch (error) {
            console.error('Failed to create account:', error);
            setError(error instanceof Error ? error.message : 'Failed to create account. Please try again.');
        }
    };

    const isFormValid = () => {
        try {
            validateForm();
            return true;
        } catch {
            return false;
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
                {(error || storeError) && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error || storeError}
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
                    error={!formData.name.trim()}
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
                                key={type.value} 
                                value={type.value.toLowerCase()} // Ensure lowercase value
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
                    disabled={isLoading || accountTypes.length === 0 || !isFormValid()}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                    {isLoading ? 'Adding...' : 'Add Account'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
