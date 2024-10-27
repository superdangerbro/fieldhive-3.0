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
    Grid,
    FormControlLabel,
    Switch,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import { createAccount } from '../../services/api';
import type { CreateAccountDto, BillingAddress } from '@fieldhive/shared';

export interface AddAccountDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type AccountFormData = {
    name: string;
    isCompany: boolean;
    billingAddress: {
        address1: string;
        address2?: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    };
};

const initialFormData: AccountFormData = {
    name: '',
    isCompany: false,
    billingAddress: {
        address1: '',
        address2: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'Canada'
    }
};

export default function AddAccountDialog({ open, onClose, onSuccess }: AddAccountDialogProps) {
    const [formData, setFormData] = useState<AccountFormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (name === 'isCompany') {
            setFormData((prev) => ({
                ...prev,
                [name]: checked
            }));
        } else if (name.startsWith('billing.')) {
            const field = name.replace('billing.', '') as keyof AccountFormData['billingAddress'];
            setFormData((prev) => ({
                ...prev,
                billingAddress: {
                    ...prev.billingAddress,
                    [field]: value
                }
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const accountData: CreateAccountDto = {
                name: formData.name,
                isCompany: formData.isCompany,
                status: 'active',
                billingAddress: {
                    address1: formData.billingAddress.address1,
                    address2: formData.billingAddress.address2,
                    city: formData.billingAddress.city,
                    province: formData.billingAddress.province,
                    postalCode: formData.billingAddress.postalCode,
                    country: formData.billingAddress.country
                }
            };

            await createAccount(accountData);
            onSuccess();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData(initialFormData);
        setError(null);
        onClose();
    };

    // Reset form when dialog opens
    React.useEffect(() => {
        if (open) {
            setFormData(initialFormData);
            setError(null);
        }
    }, [open]);

    return (
        <>
            <Dialog 
                open={open} 
                onClose={handleClose}
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
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name="isCompany"
                                                checked={formData.isCompany}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        }
                                        label="Is Company"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="billing.address1"
                                        label="Address Line 1"
                                        fullWidth
                                        required
                                        value={formData.billingAddress.address1}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="billing.address2"
                                        label="Address Line 2"
                                        fullWidth
                                        value={formData.billingAddress.address2}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="billing.city"
                                        label="City"
                                        fullWidth
                                        required
                                        value={formData.billingAddress.city}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="billing.province"
                                        label="Province"
                                        fullWidth
                                        required
                                        value={formData.billingAddress.province}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="billing.postalCode"
                                        label="Postal Code"
                                        fullWidth
                                        required
                                        value={formData.billingAddress.postalCode}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="billing.country"
                                        label="Country"
                                        fullWidth
                                        required
                                        value={formData.billingAddress.country}
                                        onChange={handleChange}
                                        disabled={true}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleClose} color="inherit" disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
                                textTransform: 'none'
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Account'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
}
