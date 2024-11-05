'use client';

import React, { useMemo } from 'react';
import { 
    Grid, 
    Typography, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    SelectChangeEvent,
    CircularProgress,
    Box,
    Paper,
    Stack
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import type { Property } from '../../../globalTypes/property';
import { StatusChip, formatStatus } from './PropertyStatus';

interface PropertyMetadataProps {
  property: Property;
  propertyTypes: string[];
  statusOptions: string[];
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
  const formatValue = (value: string) => 
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

  // Include current property type in options if it's not already there
  const allPropertyTypes = useMemo(() => {
    if (!property.type) return propertyTypes;
    return propertyTypes.includes(property.type) 
      ? propertyTypes 
      : [...propertyTypes, property.type];
  }, [propertyTypes, property.type]);

  // Include current property status in options if it's not already there
  const allStatusOptions = useMemo(() => {
    if (!property.status) return statusOptions;
    const currentStatus = property.status.toLowerCase();
    return statusOptions.includes(currentStatus)
      ? statusOptions
      : [...statusOptions, currentStatus];
  }, [statusOptions, property.status]);

  return (
    <Grid container spacing={3}>
      {/* Left Column - Timestamps */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Timestamps
            </Typography>
          </Box>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body1">
                {property.created_at ? new Date(property.created_at).toLocaleString() : 'N/A'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Updated At
              </Typography>
              <Typography variant="body1">
                {property.updated_at ? new Date(property.updated_at).toLocaleString() : 'N/A'}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      {/* Right Column - Status and Type */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Property Details
            </Typography>
          </Box>
          <Stack spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={property.type || ''}
                onChange={onTypeChange}
                label="Type"
                disabled={typeLoading}
                sx={{ '& .MuiSelect-select': { py: 1 } }}
                endAdornment={typeLoading ? (
                  <Box sx={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)' }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : null}
              >
                {allPropertyTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {formatValue(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={property.status?.toLowerCase() || ''}
                onChange={onStatusChange}
                label="Status"
                disabled={statusLoading}
                sx={{ '& .MuiSelect-select': { py: 1 } }}
                endAdornment={statusLoading ? (
                  <Box sx={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)' }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : null}
              >
                {allStatusOptions.map((status) => (
                  <MenuItem key={status} value={status.toLowerCase()}>
                    <StatusChip status={formatStatus(status)} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
