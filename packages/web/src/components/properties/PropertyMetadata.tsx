'use client';

import React from 'react';
import { Grid, Typography, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import type { Property, PropertyType, PropertyStatus } from '@fieldhive/shared';
import { StatusChip, formatStatus } from '../common/PropertyStatus';

interface PropertyMetadataProps {
  property: Property;
  propertyTypes: PropertyType[];
  statusOptions: PropertyStatus[];
  typeLoading: boolean;
  statusLoading: boolean;
  onTypeChange: (event: SelectChangeEvent<string>) => void;
  onStatusChange: (event: SelectChangeEvent<string>) => void;
}

export default function PropertyMetadata({ 
  property,
  propertyTypes,
  statusOptions,
  typeLoading,
  statusLoading,
  onTypeChange,
  onStatusChange,
}: PropertyMetadataProps) {
  return (
    <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
      <Grid item xs={12} sm={6} md={2}>
        <Typography variant="subtitle2" color="text.secondary">Property ID</Typography>
        <Typography variant="body2">{property.property_id}</Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
        <Typography variant="body2">{new Date(property.created_at).toLocaleString()}</Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <Typography variant="subtitle2" color="text.secondary">Updated At</Typography>
        <Typography variant="body2">{new Date(property.updated_at).toLocaleString()}</Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FormControl size="small" fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            value={property.property_type}
            onChange={onTypeChange}
            label="Type"
            disabled={typeLoading}
            sx={{ '& .MuiSelect-select': { py: 1 } }}
          >
            {propertyTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FormControl size="small" fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={property.status.toLowerCase()}
            onChange={onStatusChange}
            label="Status"
            disabled={statusLoading}
            sx={{ '& .MuiSelect-select': { py: 1 } }}
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status.toLowerCase()}>
                <StatusChip status={formatStatus(status)} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
