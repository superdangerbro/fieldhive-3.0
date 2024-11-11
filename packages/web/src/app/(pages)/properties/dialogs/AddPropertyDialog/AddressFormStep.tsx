'use client';

import React from 'react';
import {
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import type { PropertyFormData, FormErrors } from './types';
import type { CreateAddressDto } from '../../../../globalTypes/address';

interface AddressFormStepProps {
  propertyData: PropertyFormData;
  setPropertyData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  formErrors: FormErrors;
  handleFieldChange: (path: string, value: string) => void;
}

const propertyTypes = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'other', label: 'Other' }
];

const AddressFields: React.FC<{
  prefix: string;
  address: CreateAddressDto;
  onChange: (field: string, value: string) => void;
  formErrors: FormErrors;
  disabled?: boolean;
}> = ({ prefix, address, onChange, formErrors, disabled = false }) => {
  // Initialize country if not set
  React.useEffect(() => {
    if (!address.country) {
      onChange(`${prefix}.country`, 'Canada');
    }
  }, [address.country, onChange, prefix]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Address Line 1"
        value={address.address1 || ''}
        onChange={e => onChange(`${prefix}.address1`, e.target.value)}
        fullWidth
        required
        size="small"
        error={!!formErrors[`${prefix}.address1`]}
        helperText={formErrors[`${prefix}.address1`]}
        disabled={disabled}
      />
      <TextField
        label="Address Line 2"
        value={address.address2 || ''}
        onChange={e => onChange(`${prefix}.address2`, e.target.value)}
        fullWidth
        size="small"
        disabled={disabled}
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="City"
          value={address.city || ''}
          onChange={e => onChange(`${prefix}.city`, e.target.value)}
          fullWidth
          required
          size="small"
          error={!!formErrors[`${prefix}.city`]}
          helperText={formErrors[`${prefix}.city`]}
          disabled={disabled}
        />
        <TextField
          label="Province"
          value={address.province || ''}
          onChange={e => onChange(`${prefix}.province`, e.target.value)}
          fullWidth
          required
          size="small"
          error={!!formErrors[`${prefix}.province`]}
          helperText={formErrors[`${prefix}.province`]}
          disabled={disabled}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Postal Code"
          value={address.postal_code || ''}
          onChange={e => onChange(`${prefix}.postal_code`, e.target.value)}
          fullWidth
          required
          size="small"
          error={!!formErrors[`${prefix}.postal_code`]}
          helperText={formErrors[`${prefix}.postal_code`]}
          disabled={disabled}
        />
        <TextField
          label="Country"
          value={address.country || 'Canada'}
          onChange={e => onChange(`${prefix}.country`, e.target.value)}
          fullWidth
          required
          size="small"
          disabled={true}
        />
      </Box>
    </Box>
  );
};

export const AddressFormStep: React.FC<AddressFormStepProps> = ({
  propertyData,
  setPropertyData,
  formErrors,
  handleFieldChange,
}) => {
  // Initialize country for both addresses if not set
  React.useEffect(() => {
    if (!propertyData.serviceAddress.country) {
      handleFieldChange('serviceAddress.country', 'Canada');
    }
    if (!propertyData.billingAddress.country) {
      handleFieldChange('billingAddress.country', 'Canada');
    }
  }, [propertyData.serviceAddress.country, propertyData.billingAddress.country, handleFieldChange]);

  const handleUseDifferentBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const useDifferent = e.target.checked;
    setPropertyData(prev => ({
      ...prev,
      useDifferentBillingAddress: useDifferent,
      billingAddress: useDifferent ? { ...prev.billingAddress, country: 'Canada' } : { ...prev.serviceAddress }
    }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={propertyData.useCustomName}
              onChange={e => setPropertyData(prev => ({ ...prev, useCustomName: e.target.checked }))}
            />
          }
          label="Set custom property name"
        />
        
        {propertyData.useCustomName && (
          <TextField
            label="Property Name"
            value={propertyData.customName}
            onChange={e => setPropertyData(prev => ({ ...prev, customName: e.target.value }))}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      <FormControl size="small" fullWidth error={!!formErrors.type} required>
        <InputLabel>Property Type</InputLabel>
        <Select
          value={propertyData.type}
          label="Property Type"
          onChange={e => setPropertyData(prev => ({ ...prev, type: e.target.value }))}
        >
          {propertyTypes.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
        {formErrors.type && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
            {formErrors.type}
          </Typography>
        )}
      </FormControl>

      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
        Service Address
      </Typography>
      <AddressFields 
        prefix="serviceAddress"
        address={propertyData.serviceAddress}
        onChange={handleFieldChange}
        formErrors={formErrors}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={propertyData.useDifferentBillingAddress}
            onChange={handleUseDifferentBillingChange}
          />
        }
        label="Use different billing address"
        sx={{ mt: 2 }}
      />

      <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mt: propertyData.useDifferentBillingAddress ? 2 : 0 }}>
        Billing Address {!propertyData.useDifferentBillingAddress && '(Same as Service Address)'}
      </Typography>
      <AddressFields 
        prefix="billingAddress"
        address={propertyData.billingAddress}
        onChange={handleFieldChange}
        formErrors={formErrors}
        disabled={!propertyData.useDifferentBillingAddress}
      />
    </Box>
  );
};
