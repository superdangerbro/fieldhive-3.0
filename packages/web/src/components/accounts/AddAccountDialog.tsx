'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Grid
} from '@mui/material';
import { Account } from '../../services/mockData';
import { v4 as uuidv4 } from 'uuid';

export interface AddAccountDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (account: Account) => void;
}

interface AccountFormData {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

const initialFormData: AccountFormData = {
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
};

export default function AddAccountDialog({ open, onClose, onSubmit }: AddAccountDialogProps) {
    const [formData, setFormData] = useState<AccountFormData>(initialFormData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newAccount: Account = {
            id: uuidv4(),
            name: formData.name,
            billingAddress: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                country: formData.country
            },
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        onSubmit(newAccount);
        setFormData(initialFormData);
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: 'background.paper'
                }
            }}
        >
            <DialogTitle>Add New Account</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    name="name"
                                    label="Account Name"
                                    fullWidth
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="street"
                                    label="Street Address"
                                    fullWidth
                                    required
                                    value={formData.street}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="city"
                                    label="City"
                                    fullWidth
                                    required
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="state"
                                    label="State"
                                    fullWidth
                                    required
                                    value={formData.state}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="zipCode"
                                    label="ZIP Code"
                                    fullWidth
                                    required
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="country"
                                    label="Country"
                                    fullWidth
                                    required
                                    value={formData.country}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
                            textTransform: 'none'
                        }}
                    >
                        Add Account
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
