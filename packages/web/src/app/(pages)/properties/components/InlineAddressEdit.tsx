'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Stack,
  TextField,
  Button,
  CircularProgress,
  Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { Address } from '../../../globalTypes/address';
import { useUpdatePropertyAddress } from '../hooks/usePropertyAddress';

interface InlineAddressEditProps {
  propertyId: string;
  address: Address | null;
  type: 'service' | 'billing';
  onUpdate?: () => void;
}

interface AddressFormData {
  address1: string;
  address2: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

const emptyAddress: AddressFormData = {
  address1: '',
  address2: '',
  city: '',
  province: '',
  postal_code: '',
  country: 'Canada'
};

export default function InlineAddressEdit({ 
  propertyId, 
  address, 
  type,
  onUpdate 
}: InlineAddressEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>(() => {
    if (!address) return emptyAddress;
    return {
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      province: address.province || '',
      postal_code: address.postal_code || '',
      country: address.country || 'Canada'
    };
  });

  const { mutate: updateAddress, isPending } = useUpdatePropertyAddress();

  // Update form data when address prop changes
  useEffect(() => {
    if (!address) {
      setFormData(emptyAddress);
      return;
    }
    
    setFormData({
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      province: address.province || '',
      postal_code: address.postal_code || '',
      country: address.country || 'Canada'
    });
  }, [address]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!address) {
      setFormData(emptyAddress);
    } else {
      setFormData({
        address1: address.address1 || '',
        address2: address.address2 || '',
        city: address.city || '',
        province: address.province || '',
        postal_code: address.postal_code || '',
        country: address.country || 'Canada'
      });
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    if (formData.address1.trim()) {
      updateAddress(
        { 
          propertyId, 
          type,
          address: {
            ...formData,
            address2: formData.address2.trim() || ''
          }
        },
        {
          onSuccess: () => {
            setIsEditing(false);
            if (onUpdate) onUpdate();
          }
        }
      );
    }
  };

  const handleChange = (field: keyof AddressFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <Paper 
      elevation={1}
      sx={{ 
        p: 2,
        height: '100%',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          {type === 'service' ? 'Service Address' : 'Billing Address'}
        </Typography>
        {!isEditing && !isPending && (
          <IconButton 
            onClick={handleEdit} 
            size="small"
            sx={{ ml: 'auto' }}
          >
            <EditIcon />
          </IconButton>
        )}
      </Box>

      {isPending && !isEditing ? (
        <Stack spacing={1}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="50%" />
        </Stack>
      ) : isEditing ? (
        <Stack spacing={2}>
          <TextField
            label="Address Line 1"
            value={formData.address1}
            onChange={handleChange('address1')}
            size="small"
            fullWidth
            required
          />
          <TextField
            label="Address Line 2"
            value={formData.address2}
            onChange={handleChange('address2')}
            size="small"
            fullWidth
          />
          <TextField
            label="City"
            value={formData.city}
            onChange={handleChange('city')}
            size="small"
            fullWidth
            required
          />
          <TextField
            label="Province/State"
            value={formData.province}
            onChange={handleChange('province')}
            size="small"
            fullWidth
            required
          />
          <TextField
            label="Postal Code"
            value={formData.postal_code}
            onChange={handleChange('postal_code')}
            size="small"
            fullWidth
            required
          />
          <TextField
            label="Country"
            value={formData.country}
            onChange={handleChange('country')}
            size="small"
            fullWidth
            required
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 'auto' }}>
            <Button
              onClick={handleCancel}
              disabled={isPending}
              size="small"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={isPending || !formData.address1.trim()}
              size="small"
            >
              {isPending ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </Box>
        </Stack>
      ) : (
        <Stack spacing={0.5}>
          {address ? (
            <>
              <Typography variant="body1" fontWeight="medium">
                {address.address1}
              </Typography>
              {address.address2 && (
                <Typography variant="body2" color="text.secondary">
                  {address.address2}
                </Typography>
              )}
              {(address.city || address.province) && (
                <Typography variant="body2" color="text.secondary">
                  {[address.city, address.province].filter(Boolean).join(', ')}
                </Typography>
              )}
              {address.postal_code && (
                <Typography variant="body2" color="text.secondary">
                  {address.postal_code}
                </Typography>
              )}
              {address.country && (
                <Typography variant="body2" color="text.secondary">
                  {address.country}
                </Typography>
              )}
            </>
          ) : (
            <Typography color="text.secondary">Not set</Typography>
          )}
        </Stack>
      )}
    </Paper>
  );
}
