'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';
import type { Account, AccountType, CreateAddressDto } from '@fieldhive/shared';
import { updateAccount, getSetting } from '@/services/api';

interface EditAccountDialogProps {
    open: boolean;
    account: Account | null;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormData {
    name: string;
    type: AccountType;
    address: CreateAddressDto;
}

export default function EditAccountDialog({ open, account, onClose, onSuccess }: EditAccountDialogProps) {
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
                }
            } catch (error) {
                console.error('Failed to load account types:', error);
            }
        };

        if (open) {
            loadAccountTypes();
        }
    }, [open]);

    useEffect(() => {
        if (account) {
            setFormData({
                name: account.name || '',
                type: account.type,
                address: account.billing_address ? {
                    address1: account.billing_address.address1 || '',
                    address2: account.billing_address.address2 || '',
                    city: account.billing_address.city || '',
                    province: account.billing_address.province || '',
                    postal_code: account.billing_address.postal_code || '',
                    country: account.billing_address.country || 'Canada',
                } : {
                    address1: '',
                    address2: '',
                    city: '',
                    province: '',
                    postal_code: '',
                    country: 'Canada',
                },
            });
        }
    }, [account]);

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
        if (!account) return;

        try {
            await updateAccount(account.account_id, {
                name: formData.name,
                type: formData.type,
                billing_address: formData.address
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update account:', error);
        }
    };

    if (!account) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Account</DialogTitle>
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
                    <TextField
                        margin="dense"
                        name="address.address1"
                        label="Address Line 1"
                        type="text"
                        fullWidth
                        required
                        value={formData.address.address1}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.address2"
                        label="Address Line 2"
                        type="text"
                        fullWidth
                        value={formData.address.address2 || ''}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.city"
                        label="City"
                        type="text"
                        fullWidth
                        required
                        value={formData.address.city}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.province"
                        label="Province"
                        type="text"
                        fullWidth
                        required
                        value={formData.address.province}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.postal_code"
                        label="Postal Code"
                        type="text"
                        fullWidth
                        required
                        value={formData.address.postal_code}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.country"
                        label="Country"
                        type="text"
                        fullWidth
                        required
                        value={formData.address.country}
                        onChange={handleTextChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" color="primary">Save Changes</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
