'use client';

import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Switch, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';
import { CreateAccountDto } from '@fieldhive/shared';
import { createAccount } from '../../services/api';

interface AddAccountDialogProps {
    open: boolean;
    onClose: () => void;
    onAccountAdded: () => void;
}

interface FormData {
    name: string;
    type: string;
    address: {
        address1: string;
        address2?: string;
        city: string;
        province: string;
        postal_code: string;
        country: string;
    };
}

export default function AddAccountDialog({ open, onClose, onAccountAdded }: AddAccountDialogProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        type: 'Individual',
        address: {
            address1: '',
            address2: '',
            city: '',
            province: '',
            postal_code: '',
            country: 'Canada',
        },
    });

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

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newAccount: CreateAccountDto = {
            name: formData.name,
            type: formData.type,
            status: 'Active',
            address: formData.address,
        };

        try {
            await createAccount(newAccount);
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
                        value={formData.name}
                        onChange={handleTextChange}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="type-label">Account Type</InputLabel>
                        <Select
                            labelId="type-label"
                            name="type"
                            value={formData.type}
                            onChange={handleSelectChange}
                            label="Account Type"
                        >
                            <MenuItem value="Individual">Individual</MenuItem>
                            <MenuItem value="Company">Company</MenuItem>
                            <MenuItem value="Property Manager">Property Manager</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        name="address.address1"
                        label="Address Line 1"
                        type="text"
                        fullWidth
                        value={formData.address.address1}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.address2"
                        label="Address Line 2"
                        type="text"
                        fullWidth
                        value={formData.address.address2}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.city"
                        label="City"
                        type="text"
                        fullWidth
                        value={formData.address.city}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.province"
                        label="Province"
                        type="text"
                        fullWidth
                        value={formData.address.province}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.postal_code"
                        label="Postal Code"
                        type="text"
                        fullWidth
                        value={formData.address.postal_code}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.country"
                        label="Country"
                        type="text"
                        fullWidth
                        value={formData.address.country}
                        onChange={handleTextChange}
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
