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
import type { Property, UpdatePropertyDto } from '../../../globalTypes/property';
import type { CreateAddressDto } from '../../../globalTypes/address';
import type { Account } from '../../../globalTypes/account';
import { useUpdateProperty } from '../hooks/useProperties';
import { useCreateAddress, useUpdateAddress } from '../hooks/useAddresses';
import AccountSelector from '../components/AccountSelector';

export interface EditPropertyDialogProps {
    open: boolean;
    property: Property | null;
    onClose: () => void;
}

const emptyAddress: CreateAddressDto = {
    address1: '',
    address2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Canada'
};

interface PropertyFormData {
    name: string;
    billing_address: CreateAddressDto;
    service_address: CreateAddressDto;
    accounts: Account[];
}

const initialFormData: PropertyFormData = {
    name: '',
    billing_address: { ...emptyAddress },
    service_address: { ...emptyAddress },
    accounts: []
};

export default function EditPropertyDialog({ open, property, onClose }: EditPropertyDialogProps) {
    const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
    const [sameAsService, setSameAsService] = useState(false);
    const [showError, setShowError] = useState(false);

    // React Query mutations
    const { mutate: updateProperty, isPending: isUpdatingProperty, error: propertyError } = useUpdateProperty();
    const { mutate: createAddress, isPending: isCreatingAddress } = useCreateAddress();
    const { mutate: updateAddress, isPending: isUpdatingAddress } = useUpdateAddress();

    const loading = isUpdatingProperty || isCreatingAddress || isUpdatingAddress;
    const error = propertyError;

    useEffect(() => {
        if (property) {
            const billingAddress = property.billingAddress || { ...emptyAddress };
            const serviceAddress = property.serviceAddress || { ...emptyAddress };

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
                accounts: property.accounts || []
            });

            // Check if billing address is same as service address
            if (property.billingAddress && property.serviceAddress) {
                const isSameAddress = 
                    property.billingAddress.address1 === property.serviceAddress.address1 &&
                    property.billingAddress.address2 === property.serviceAddress.address2 &&
                    property.billingAddress.city === property.serviceAddress.city &&
                    property.billingAddress.province === property.serviceAddress.province &&
                    property.billingAddress.postal_code === property.serviceAddress.postal_code;
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
            const field = name.replace('billing_address.', '') as keyof CreateAddressDto;
            setFormData(prev => ({
                ...prev,
                billing_address: {
                    ...prev.billing_address,
                    [field]: value
                }
            }));
        } else if (name.startsWith('service_address.')) {
            const field = name.replace('service_address.', '') as keyof CreateAddressDto;
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

    const handleAccountsChange = (accounts: Account[]) => {
        setFormData(prev => ({
            ...prev,
            accounts
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!property) return;

        // Create or update service address
        if (property.serviceAddress?.address_id) {
            updateAddress({
                id: property.serviceAddress.address_id,
                data: formData.service_address
            }, {
                onSuccess: (updatedServiceAddress) => {
                    // Create or update billing address if different
                    if (!sameAsService) {
                        if (property.billingAddress?.address_id) {
                            updateAddress({
                                id: property.billingAddress.address_id,
                                data: formData.billing_address
                            }, {
                                onSuccess: (updatedBillingAddress) => {
                                    // Update property with both addresses and accounts
                                    updatePropertyWithAddresses(
                                        updatedServiceAddress.address_id,
                                        updatedBillingAddress.address_id
                                    );
                                }
                            });
                        } else {
                            createAddress(formData.billing_address, {
                                onSuccess: (newBillingAddress) => {
                                    // Update property with both addresses and accounts
                                    updatePropertyWithAddresses(
                                        updatedServiceAddress.address_id,
                                        newBillingAddress.address_id
                                    );
                                }
                            });
                        }
                    } else {
                        // Update property with only service address and accounts
                        updatePropertyWithAddresses(updatedServiceAddress.address_id);
                    }
                }
            });
        } else {
            createAddress(formData.service_address, {
                onSuccess: (newServiceAddress) => {
                    if (!sameAsService) {
                        createAddress(formData.billing_address, {
                            onSuccess: (newBillingAddress) => {
                                // Update property with both new addresses and accounts
                                updatePropertyWithAddresses(
                                    newServiceAddress.address_id,
                                    newBillingAddress.address_id
                                );
                            }
                        });
                    } else {
                        // Update property with only new service address and accounts
                        updatePropertyWithAddresses(newServiceAddress.address_id);
                    }
                }
            });
        }
    };

    const updatePropertyWithAddresses = (serviceAddressId: string, billingAddressId?: string) => {
        const propertyData: UpdatePropertyDto = {
            name: formData.name,
            service_address_id: serviceAddressId,
            billing_address_id: sameAsService ? serviceAddressId : billingAddressId,
            account_ids: formData.accounts.map(account => account.account_id)
        };

        updateProperty(
            { id: property!.property_id, data: propertyData },
            { 
                onSuccess: () => {
                    handleClose();
                },
                onError: () => {
                    setShowError(true);
                }
            }
        );
    };

    const handleClose = () => {
        setFormData(initialFormData);
        setSameAsService(false);
        setShowError(false);
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
                open={showError && !!error} 
                autoHideDuration={6000} 
                onClose={() => setShowError(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
                    {error instanceof Error ? error.message : 'Failed to update property'}
                </Alert>
            </Snackbar>
        </>
    );
}
