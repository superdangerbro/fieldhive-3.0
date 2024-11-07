import React from 'react';
import { Box, TextField, Grid } from '@mui/material';
import type { Address, CreateAddressDto } from '@/app/globalTypes/address';

interface AddressFormProps {
    initialAddress?: CreateAddressDto;
    onChange: (address: CreateAddressDto) => void;
    disabled?: boolean;
}

export function AddressForm({ initialAddress = {
    address1: '',
    address2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Canada'
}, onChange, disabled }: AddressFormProps) {
    const handleChange = (field: keyof CreateAddressDto) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...initialAddress,
            [field]: event.target.value
        });
    };

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Address Line 1"
                        value={initialAddress.address1}
                        onChange={handleChange('address1')}
                        disabled={disabled}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Address Line 2"
                        value={initialAddress.address2}
                        onChange={handleChange('address2')}
                        disabled={disabled}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="City"
                        value={initialAddress.city}
                        onChange={handleChange('city')}
                        disabled={disabled}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Province"
                        value={initialAddress.province}
                        onChange={handleChange('province')}
                        disabled={disabled}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Postal Code"
                        value={initialAddress.postal_code}
                        onChange={handleChange('postal_code')}
                        disabled={disabled}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Country"
                        value={initialAddress.country}
                        onChange={handleChange('country')}
                        disabled={disabled}
                        required
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
