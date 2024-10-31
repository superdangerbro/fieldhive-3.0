import React from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { PropertyType } from '@fieldhive/shared/src/types/property';
import { AddressFields, PropertyFormData } from '../types';

interface AddressFormStepProps {
  propertyData: PropertyFormData;
  setPropertyData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  formErrors: Record<string, string>;
  handleFieldChange: (path: string, value: string) => void;
}

const AddressForm: React.FC<{
  prefix: string;
  address: AddressFields;
  onChange: (field: string, value: string) => void;
  formErrors: Record<string, string>;
}> = ({ prefix, address, onChange, formErrors }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <TextField
      label="Address Line 1"
      value={address.address1}
      onChange={e => onChange(`${prefix}.address1`, e.target.value)}
      fullWidth
      required
      size="small"
      error={!!formErrors[`${prefix}.address1`] || !!formErrors.address1}
      helperText={formErrors[`${prefix}.address1`] || formErrors.address1}
    />
    <TextField
      label="Address Line 2"
      value={address.address2}
      onChange={e => onChange(`${prefix}.address2`, e.target.value)}
      fullWidth
      size="small"
    />
    <Box sx={{ display: 'flex', gap: 2 }}>
      <TextField
        label="City"
        value={address.city}
        onChange={e => onChange(`${prefix}.city`, e.target.value)}
        fullWidth
        required
        size="small"
        error={!!formErrors[`${prefix}.city`] || !!formErrors.city}
        helperText={formErrors[`${prefix}.city`] || formErrors.city}
      />
      <TextField
        label="Province"
        value={address.province}
        onChange={e => onChange(`${prefix}.province`, e.target.value)}
        fullWidth
        required
        size="small"
        error={!!formErrors[`${prefix}.province`] || !!formErrors.province}
        helperText={formErrors[`${prefix}.province`] || formErrors.province}
      />
    </Box>
    <Box sx={{ display: 'flex', gap: 2 }}>
      <TextField
        label="Postal Code"
        value={address.postalCode}
        onChange={e => onChange(`${prefix}.postalCode`, e.target.value)}
        fullWidth
        required
        size="small"
        error={!!formErrors[`${prefix}.postalCode`] || !!formErrors.postalCode}
        helperText={formErrors[`${prefix}.postalCode`] || formErrors.postalCode}
      />
      <TextField
        label="Country"
        value={address.country}
        onChange={e => onChange(`${prefix}.country`, e.target.value)}
        fullWidth
        required
        size="small"
        disabled
      />
    </Box>
  </Box>
);

const propertyTypes: PropertyType[] = [
  'residential',
  'commercial',
  'industrial',
  'agricultural',
  'other'
];

export const AddressFormStep: React.FC<AddressFormStepProps> = ({
  propertyData,
  setPropertyData,
  formErrors,
  handleFieldChange,
}) => {
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

      <FormControl size="small" fullWidth>
        <InputLabel>Property Type</InputLabel>
        <Select
          value={propertyData.type}
          label="Property Type"
          onChange={e => setPropertyData(prev => ({ ...prev, type: e.target.value as PropertyType }))}
        >
          {propertyTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replace('_', ' ')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
        Service Address
      </Typography>
      <AddressForm 
        prefix="serviceAddress"
        address={propertyData.serviceAddress}
        onChange={handleFieldChange}
        formErrors={formErrors}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={propertyData.useDifferentBillingAddress}
            onChange={e => setPropertyData(prev => ({ 
              ...prev, 
              useDifferentBillingAddress: e.target.checked,
              billingAddress: e.target.checked ? prev.billingAddress : prev.serviceAddress
            }))}
          />
        }
        label="Use different billing address"
        sx={{ mt: 2 }}
      />

      {propertyData.useDifferentBillingAddress && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mt: 2 }}>
            Billing Address
          </Typography>
          <AddressForm 
            prefix="billingAddress"
            address={propertyData.billingAddress}
            onChange={handleFieldChange}
            formErrors={formErrors}
          />
        </>
      )}
    </Box>
  );
};
