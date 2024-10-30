'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Grid,
    CircularProgress,
    Alert,
    Snackbar,
    Typography,
    FormControlLabel,
    Checkbox,
    Autocomplete,
    FormControl,
    FormHelperText
} from '@mui/material';
import { createProperty, getAccounts } from '../../services/api';
import type { CreatePropertyDto, Account } from '@fieldhive/shared';

export interface AddPropertyDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type PropertyFormData = {
    name: string;
    showName: boolean;
    parent_accounts: Account[];
    billing_address: {
        address1: string;
        address2?: string;
        city: string;
        province: string;
        postal_code: string;
        country: string;
    };
    service_address: {
        address1: string;
        address2?: string;
        city: string;
        province: string;
        postal_code: string;
        country: string;
    };
    billing_matches_service: boolean;
};

export default function AddPropertyDialog({ open, onClose, onSuccess }: AddPropertyDialogProps) {
    const [formData, setFormData] = useState<PropertyFormData>({
        name: '',
        showName: true,
        parent_accounts: [],
        billing_address: {
            address1: '',
            address2: '',
            city: '',
            province: '',
            postal_code: '',
            country: 'Canada'
        },
        service_address: {
            address1: '',
            address2: '',
            city: '',
            province: '',
            postal_code: '',
            country: 'Canada'
        },
        billing_matches_service: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [accountsLoading, setAccountsLoading] = useState(false);

    useEffect(() => {
        const fetchAccounts = async () => {
            setAccountsLoading(true);
            try {
                const response = await getAccounts({ limit: 100, offset: 0 });
                setAccounts(response.accounts);
            } catch (error) {
                console.error('Failed to fetch accounts:', error);
            } finally {
                setAccountsLoading(false);
            }
        };

        if (open) {
            fetchAccounts();
        }
    }, [open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;
        if (name === 'showName' || name === 'billing_matches_service') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
            if (name === 'billing_matches_service' && checked) {
                setFormData(prev => ({
                    ...prev,
                    billing_address: { ...prev.service_address }
                }));
            }
        } else if (name.startsWith('billing_address.')) {
            const field = name.replace('billing_address.', '');
            setFormData(prev => ({
                ...prev,
                billing_address: {
                    ...prev.billing_address,
                    [field]: value
                }
            }));
        } else if (name.startsWith('service_address.')) {
            const field = name.replace('service_address.', '');
            const newServiceAddress = {
                ...formData.service_address,
                [field]: value
            };
            setFormData(prev => ({
                ...prev,
                service_address: newServiceAddress,
                billing_address: prev.billing_matches_service ? newServiceAddress : prev.billing_address
            }));
        } else {
            setFormData(prev => ({
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
            const propertyData: CreatePropertyDto = {
                name: formData.showName ? formData.name : `Property at ${formData.service_address.address1}`,
                billing_address: formData.billing_address,
                service_address: formData.service_address
            };

            await createProperty(propertyData);
            onSuccess();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create property');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            showName: true,
            parent_accounts: [],
            billing_address: {
                address1: '',
                address2: '',
                city: '',
                province: '',
                postal_code: '',
                country: 'Canada'
            },
            service_address: {
                address1: '',
                address2: '',
                city: '',
                province: '',
                postal_code: '',
                country: 'Canada'
            },
            billing_matches_service: true
        });
        setError(null);
        onClose();
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Add Property</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Box sx={{ mt: 1 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="showName"
                                                checked={formData.showName}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        }
                                        label="Show Property Name"
                                    />
                                </Grid>

                                {formData.showName && (
                                    <Grid item xs={12}>
                                        <TextField
                                            name="name"
                                            label="Property Name"
                                            fullWidth
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <Autocomplete
                                        multiple
                                        options={accounts}
                                        loading={accountsLoading}
                                        getOptionLabel={(option) => option.name}
                                        value={formData.parent_accounts}
                                        onChange={(event, newValue) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                parent_accounts: newValue
                                            }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Parent Accounts"
                                                placeholder="Select parent accounts"
                                            />
                                        )}
                                        disabled={loading}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="h6">Service Address</Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        name="service_address.address1"
                                        label="Address Line 1"
                                        fullWidth
                                        required
                                        value={formData.service_address.address1}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="service_address.address2"
                                        label="Address Line 2"
                                        fullWidth
                                        value={formData.service_address.address2}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="service_address.city"
                                        label="City"
                                        fullWidth
                                        required
                                        value={formData.service_address.city}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="service_address.province"
                                        label="Province"
                                        fullWidth
                                        required
                                        value={formData.service_address.province}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="service_address.postal_code"
                                        label="Postal Code"
                                        fullWidth
                                        required
                                        value={formData.service_address.postal_code}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="billing_matches_service"
                                                checked={formData.billing_matches_service}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        }
                                        label="Billing Address matches Service Address"
                                    />
                                </Grid>

                                {!formData.billing_matches_service && (
                                    <>
                                        <Grid item xs={12}>
                                            <Typography variant="h6">Billing Address</Typography>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                name="billing_address.address1"
                                                label="Address Line 1"
                                                fullWidth
                                                required
                                                value={formData.billing_address.address1}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                name="billing_address.address2"
                                                label="Address Line 2"
                                                fullWidth
                                                value={formData.billing_address.address2}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                name="billing_address.city"
                                                label="City"
                                                fullWidth
                                                required
                                                value={formData.billing_address.city}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                name="billing_address.province"
                                                label="Province"
                                                fullWidth
                                                required
                                                value={formData.billing_address.province}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                name="billing_address.postal_code"
                                                label="Postal Code"
                                                fullWidth
                                                required
                                                value={formData.billing_address.postal_code}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </Grid>
                                    </>
                                )}
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
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Property'}
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
