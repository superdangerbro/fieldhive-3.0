import React from 'react';
import { Box, TextField, Grid } from '@mui/material';
import type { Address, CreateAddressDto } from '@/app/globalTypes/address';

interface AddressFormProps {
    address?: Partial<Address>;
    onChange: (address: Partial<CreateAddressDto>) => void;
}

export function AddressForm({ address = {}, onChange }: AddressFormProps) {
    const handleChange = (field: keyof CreateAddressDto) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...address,
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
                        value={address.address1 || ''}
                        onChange={handleChange('address1')}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Address Line 2"
                        value={address.address2 || ''}
                        onChange={handleChange('address2')}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="City"
                        value={address.city || ''}
                        onChange={handleChange('city')}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Province"
                        value={address.province || ''}
                        onChange={handleChange('province')}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Postal Code"
                        value={address.postal_code || ''}
                        onChange={handleChange('postal_code')}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Country"
                        value={address.country || ''}
                        onChange={handleChange('country')}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
