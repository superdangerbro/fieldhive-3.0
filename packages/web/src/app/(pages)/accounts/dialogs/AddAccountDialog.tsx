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
    Typography
} from '@mui/material';
import { AccountType, CreateAddressDto } from '@fieldhive/shared';
import { createAccount, getSetting } from '@/services/api';
import { AddressForm } from '@/app/(pages)/components/common';

interface AddAccountDialogProps {
    open: boolean;
    onClose: () => void;
    onAccountAdded: () => void;
}

interface FormData {
    name: string;
    type: AccountType;
    address: CreateAddressDto;
}

export function AddAccountDialog({ open, onClose, onAccountAdded }: AddAccountDialogProps) {
    const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        type: '' as AccountType,
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
                }
            } catch (error) {
                console.error('Failed to load account types:', error);
            }
        };

        if (open) {
            loadAccountTypes();
        }
    }, [open]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value,
                },
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (e: SelectChangeEvent<AccountType>) => {
        setFormData(prev => ({
            ...prev,
            type: e.target.value as AccountType
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const accountData = {
                name: formData.name,
                type: formData.type,
                address: formData.address
            };

            await createAccount(accountData);
            onAccountAdded();
            onClose();
        } catch (error) {
            console.error('Failed to create account:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogContent>
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
                    />
                    <FormControl fullWidth margin="dense" required>
                        <InputLabel id="type-label">Account Type</InputLabel>
                        <Select
                            labelId="type-label"
                            name="type"
                            value={formData.type}
                            onChange={handleSelectChange}
                            label="Account Type"
                        >
                            {accountTypes.map(type => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                        Billing Address
                    </Typography>
                    <AddressForm
                        onSubmit={(address) => {
                            setFormData(prev => ({
                                ...prev,
                                address: address as CreateAddressDto
                            }));
                        }}
                        onCancel={() => {}}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" color="primary">Add</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
