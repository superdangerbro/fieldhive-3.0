'use client';

import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Grid } from '@mui/material';
import type { Address, CreateAddressDto } from '@/app/globaltypes';

interface AddressFormProps {
  initialAddress?: Address | CreateAddressDto | null;
  onSubmit: (address: CreateAddressDto) => void;
  onCancel: () => void;
  hideButtons?: boolean;
  disabled?: boolean;
}

export function AddressForm({ 
  initialAddress, 
  onSubmit, 
  onCancel, 
  hideButtons = false,
  disabled = false 
}: AddressFormProps) {
  const [formData, setFormData] = useState<CreateAddressDto>({
    address1: '',
    address2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Canada'
  });

  useEffect(() => {
    if (initialAddress) {
      setFormData({
        address1: initialAddress.address1 || '',
        address2: initialAddress.address2 || '',
        city: initialAddress.city || '',
        province: initialAddress.province || '',
        postal_code: initialAddress.postal_code || '',
        country: initialAddress.country || 'Canada'
      });
    }
  }, [initialAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Address Line 1"
            name="address1"
            value={formData.address1}
            onChange={handleChange}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address Line 2"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Province"
            name="province"
            value={formData.province}
            onChange={handleChange}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Postal Code"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            disabled={disabled}
          />
        </Grid>
      </Grid>
      {!hideButtons && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onCancel} disabled={disabled}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={disabled}
            sx={{
              backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
              '&:hover': {
                backgroundImage: 'linear-gradient(to right, #4f46e5, #4338ca)',
              }
            }}
          >
            Save Address
          </Button>
        </Box>
      )}
    </Box>
  );
}
