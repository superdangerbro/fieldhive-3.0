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
import { createAccount } from '@/services/api';

export interface AddAccountDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface AccountFormData {
    name: string;
    is_company: boolean;
    address1: string;
    address2: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
}

const initialFormData: AccountFormData = {
    name: '',
    is_company: false,
    address1: '',
    address2: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Canada'
};

export default function AddAccountDialog({ open, onClose, onSuccess }: AddAccountDialogProps) {
    const [formData, setFormData] = useState<AccountFormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (name === 'is_company') {
            setFormData((prev) => ({
                ...prev,
                [name]: checked
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
            const accountData = {
                name: formData.name,
                is_company: formData.is_company,
                billingAddress: {
                    street: formData.address1,
                    state: formData.province,
                    city: formData.city,
                    zipCode: formData.postalCode,
                    country: formData.country
                },
                status: 'active' as const
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
                                                name="is_company"
                                                checked={formData.is_company}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        }
                                        label="Is Company"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="address1"
                                        label="Address Line 1"
                                        fullWidth
                                        required
                                        value={formData.address1}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="address2"
                                        label="Address Line 2"
                                        fullWidth
                                        value={formData.address2}
                                        onChange={handleChange}
                                        disabled={loading}
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
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="province"
                                        label="Province"
                                        fullWidth
                                        required
                                        value={formData.province}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="postalCode"
                                        label="Postal Code"
                                        fullWidth
                                        required
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        disabled={loading}
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
