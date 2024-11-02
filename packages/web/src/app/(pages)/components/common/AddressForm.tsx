'use client';

import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Grid } from '@mui/material';
import type { Address } from '@fieldhive/shared';
import { createAddress, updateAddress } from '@/services/api';

interface AddressFormProps {
  initialAddress?: Address | null;
  onSubmit: (address: Address) => void;
  onCancel: () => void;
}

export function AddressForm({ initialAddress, onSubmit, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let address;
      if (initialAddress?.address_id) {
        address = await updateAddress(initialAddress.address_id, formData);
      } else {
        address = await createAddress(formData);
      }
      onSubmit(address);
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Address Line 1"
            name="address1"
            value={formData.address1}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address Line 2"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
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
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained"
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
    </Box>
  );
}
