'use client';

import React from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Grid,
    Typography,
    Paper,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { Property, Address } from '@fieldhive/shared';
import { AddressFormData } from '../types';

interface JobAddressFormsProps {
    useCustomAddresses: boolean;
    onUseCustomAddressesChange: (useCustom: boolean) => void;
    selectedProperty: Property | null;
    serviceAddressForm: AddressFormData;
    billingAddressForm: AddressFormData;
    onServiceAddressChange: (address: AddressFormData) => void;
    onBillingAddressChange: (address: AddressFormData) => void;
    availableAddresses: Address[];
    onChooseAddress: (type: 'service' | 'billing', address: Address) => void;
}

export function JobAddressForms({
    useCustomAddresses,
    onUseCustomAddressesChange,
    selectedProperty,
    serviceAddressForm,
    billingAddressForm,
    onServiceAddressChange,
    onBillingAddressChange,
    availableAddresses,
    onChooseAddress
}: JobAddressFormsProps) {
    // Create a map to track duplicate addresses
    const addressMap = new Map<string, number>();
    const getUniqueKey = (address: Address) => {
        const baseKey = address.address_id;
        const count = addressMap.get(baseKey) || 0;
        addressMap.set(baseKey, count + 1);
        return `${baseKey}-${count}`;
    };

    const renderAddressForm = (
        type: 'service' | 'billing',
        address: AddressFormData,
        setAddress: (address: AddressFormData) => void
    ) => (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">
                    {type === 'service' ? 'Service Address' : 'Billing Address'}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Choose from Account</InputLabel>
                    <Select
                        value=""
                        onChange={(e) => {
                            const selectedAddress = availableAddresses.find(
                                addr => addr.address_id === e.target.value.split('-')[0]
                            );
                            if (selectedAddress) {
                                onChooseAddress(type, selectedAddress);
                            }
                        }}
                        label="Choose from Account"
                    >
                        {availableAddresses.map((addr) => {
                            const uniqueKey = getUniqueKey(addr);
                            return (
                                <MenuItem key={uniqueKey} value={addr.address_id}>
                                    {`${addr.address1}, ${addr.city}`}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Address Line 1"
                        value={address.address1}
                        onChange={(e) => setAddress({ ...address, address1: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Address Line 2"
                        value={address.address2}
                        onChange={(e) => setAddress({ ...address, address2: e.target.value })}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="City"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Province/State"
                        value={address.province}
                        onChange={(e) => setAddress({ ...address, province: e.target.value })}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Postal Code"
                        value={address.postal_code}
                        onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Country"
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    />
                </Grid>
            </Grid>
        </Box>
    );

    return (
        <>
            {!useCustomAddresses && selectedProperty && (
                <Paper sx={{ p: 2, bgcolor: 'info.main', color: 'info.contrastText' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Using Property Addresses
                    </Typography>
                    <Box>
                        <Typography variant="body2">
                            Service Address: {selectedProperty.service_address ? 
                                `${selectedProperty.service_address.address1}, ${selectedProperty.service_address.city}` : 
                                'Not set'}
                        </Typography>
                        <Typography variant="body2">
                            Billing Address: {selectedProperty.billing_address ? 
                                `${selectedProperty.billing_address.address1}, ${selectedProperty.billing_address.city}` : 
                                'Not set'}
                        </Typography>
                    </Box>
                </Paper>
            )}

            <FormControlLabel
                control={
                    <Checkbox
                        checked={useCustomAddresses}
                        onChange={(e) => onUseCustomAddressesChange(e.target.checked)}
                    />
                }
                label="Use Custom Addresses"
            />

            {useCustomAddresses && (
                <Box sx={{ mt: 2 }}>
                    {renderAddressForm('service', serviceAddressForm, onServiceAddressChange)}
                    {renderAddressForm('billing', billingAddressForm, onBillingAddressChange)}
                </Box>
            )}
        </>
    );
}
