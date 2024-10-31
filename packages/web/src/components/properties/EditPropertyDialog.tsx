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
    Divider
} from '@mui/material';
import { updateProperty } from '../../services/api';
import type { Property, UpdatePropertyDto } from '@fieldhive/shared';
import AccountSelector, { MinimalAccount } from './AccountSelector';

export interface EditPropertyDialogProps {
    open: boolean;
    property: Property | null;
    onClose: () => void;
    onSuccess: () => void;
}

type AddressFormData = {
    address1: string;
    address2: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
};

type PropertyFormData = {
    name: string;
    billing_address: AddressFormData;
    service_address: AddressFormData;
    accounts: MinimalAccount[];
};

const emptyAddress: AddressFormData = {
    address1: '',
    address2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Canada'
};

const initialFormData: PropertyFormData = {
    name: '',
    billing_address: { ...emptyAddress },
    service_address: { ...emptyAddress },
    accounts: []
};

export default function EditPropertyDialog({ open, property, onClose, onSuccess }: EditPropertyDialogProps) {
    const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sameAsService, setSameAsService] = useState(false);

    useEffect(() => {
        if (property) {
            const billingAddress = property.billing_address || { ...emptyAddress };
            const serviceAddress = property.service_address || { ...emptyAddress };

            setFormData({
                name: property.name,
                billing_address: {
                    address1: billingAddress.address1 || '',
                    address2: billingAddress.address2 || '',
                    city: billingAddress.city || '',
                    province: billingAddress.province || '',
                    postal_code: billingAddress.postal_code || '',
                    country: billingAddress.country || 'Canada'
                },
                service_address: {
                    address1: serviceAddress.address1 || '',
                    address2: serviceAddress.address2 || '',
                    city: serviceAddress.city || '',
                    province: serviceAddress.province || '',
                    postal_code: serviceAddress.postal_code || '',
                    country: serviceAddress.country || 'Canada'
                },
                accounts: property.accounts?.map(a => ({
                    account_id: a.account_id,
                    name: a.name
                })) || []
            });

            // Check if billing address is same as service address
            if (property.billing_address && property.service_address) {
                const isSameAddress = 
                    property.billing_address.address1 === property.service_address.address1 &&
                    property.billing_address.address2 === property.service_address.address2 &&
                    property.billing_address.city === property.service_address.city &&
                    property.billing_address.province === property.service_address.province &&
                    property.billing_address.postal_code === property.service_address.postal_code;
                setSameAsService(isSameAddress);
            }
        } else {
            setFormData(initialFormData);
            setSameAsService(false);
        }
    }, [property]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('billing_address.')) {
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
                billing_address: sameAsService ? newServiceAddress : prev.billing_address
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSameAsServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSameAsService(e.target.checked);
        if (e.target.checked) {
            setFormData(prev => ({
                ...prev,
                billing_address: { ...prev.service_address }
            }));
        }
    };

    const handleAccountsChange = (accounts: MinimalAccount[]) => {
        setFormData(prev => ({
            ...prev,
            accounts
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!property) return;

        setLoading(true);
        setError(null);
        
        try {
            const propertyData: UpdatePropertyDto = {
                name: formData.name,
                service_address: formData.service_address,
                billing_address: sameAsService ? formData.service_address : formData.billing_address,
                accounts: formData.accounts.map(a => a.account_id)
            };

            await updateProperty(property.property_id, propertyData);
            onSuccess();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update property');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError(null);
        setFormData(initialFormData);
        setSameAsService(false);
        onClose();
    };

    if (!property) return null;

    return (
        <>
            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Edit Property</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Box sx={{ mt: 1 }}>
                            <Grid container spacing={3}>
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
                                <Divider sx={{ my: 2 }} />

                                <Grid item xs={12}>
                                    <AccountSelector
                                        selectedAccounts={formData.accounts}
                                        onChange={handleAccountsChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Divider sx={{ my: 2 }} />

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
                                <Divider sx={{ my: 2 }} />

                                <Grid item xs={12}>
                                    <Typography variant="h6">Billing Address</Typography>
                                    <FormControlLabel
                                        control={<Checkbox checked={sameAsService} onChange={handleSameAsServiceChange} disabled={loading} />}
                                        label="Same as service address"
                                    />
                                </Grid>
                                { !sameAsService &&
                                    <>
                                        <Grid item xs={12}>
                                            <TextField
                                                name="billing_address.address1"
                                                label="Address Line 1"
                                                fullWidth
                                                required
                                                value={formData.billing_address.address1}
                                                onChange={handleChange}
                                                disabled={loading || sameAsService}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                name="billing_address.address2"
                                                label="Address Line 2"
                                                fullWidth
                                                value={formData.billing_address.address2}
                                                onChange={handleChange}
                                                disabled={loading || sameAsService}
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
                                                disabled={loading || sameAsService}
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
                                                disabled={loading || sameAsService}
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
                                                disabled={loading || sameAsService}
                                            />
                                        </Grid>
                                    </>
                                }
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
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
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
