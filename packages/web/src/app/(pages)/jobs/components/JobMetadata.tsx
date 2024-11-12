'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  FormControl, 
  Select, 
  MenuItem, 
  Chip, 
  SelectChangeEvent, 
  Alert, 
  CircularProgress, 
  Typography, 
  Paper, 
  Stack,
  IconButton,
  Autocomplete,
  TextField
} from '@mui/material';
import type { Job, JobStatus } from '../../../globalTypes/job';
import type { Property } from '../../../globalTypes/property';
import { useSetting } from '../hooks/useSettings';
import { useUpdateJob } from '../hooks/useJobs';
import { useProperties } from '../hooks/useProperties';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { JobTypeSelect } from './JobTypeSelect';

interface JobMetadataProps {
  job: Job;
  onUpdate?: () => void;
}

interface JobStatusResponse {
  statuses: JobStatus[];
}

function formatAddress(address?: any): string {
  if (!address) return 'N/A';

  const parts = [
    address.address1,
    address.address2,
    address.city,
    address.province,
    address.postal_code,
    address.country
  ].filter(Boolean);

  return parts.join(', ');
}

export function JobMetadata({ job, onUpdate }: JobMetadataProps) {
  const [currentStatus, setCurrentStatus] = useState(job.status);
  const [isEditingProperty, setIsEditingProperty] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(job.property || null);

  // Fetch properties for dropdown
  const { data: properties = [], isLoading: isLoadingProperties } = useProperties();

  // Use React Query hooks
  const { 
    data: response, 
    isLoading: isLoadingSettings,
    error: settingsError 
  } = useSetting<JobStatusResponse>('job_statuses');

  const statusOptions = response?.statuses || [];

  const {
    mutate: updateJob,
    isPending: isUpdating,
    error: updateError,
    reset: resetUpdateError
  } = useUpdateJob();

  useEffect(() => {
    setCurrentStatus(job.status);
    setSelectedProperty(job.property || null);
  }, [job]);

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const newStatus = event.target.value;
    const previousStatus = currentStatus;
    setCurrentStatus(newStatus);
    
    updateJob(
      { 
        id: job.job_id, 
        data: { status: newStatus }
      },
      {
        onSuccess: () => {
          if (onUpdate) {
            onUpdate();
          }
        },
        onError: () => {
          setCurrentStatus(previousStatus);
        }
      }
    );
  };

  const handlePropertySave = () => {
    if (selectedProperty?.property_id !== job.property?.property_id) {
      console.log('Updating job property:', {
        jobId: job.job_id,
        property_id: selectedProperty?.property_id
      });
      
      updateJob(
        {
          id: job.job_id,
          data: { property_id: selectedProperty?.property_id }
        },
        {
          onSuccess: () => {
            console.log('Property update successful');
            setIsEditingProperty(false);
            // Ensure we call onUpdate to refresh the job data
            if (onUpdate) {
              onUpdate();
            }
          },
          onError: (error: Error) => {
            console.error('Failed to update property:', error);
            // Reset to previous property on error
            setSelectedProperty(job.property || null);
          }
        }
      );
    } else {
      setIsEditingProperty(false);
    }
  };

  const handlePropertyCancel = () => {
    setSelectedProperty(job.property || null);
    setIsEditingProperty(false);
  };

  // Debug logging for address selection
  console.log('Job data:', {
    jobId: job.job_id,
    useCustomAddresses: job.useCustomAddresses,
    jobServiceAddress: job.serviceAddress,
    jobBillingAddress: job.billingAddress,
    propertyServiceAddress: job.property?.serviceAddress,
    propertyBillingAddress: job.property?.billingAddress
  });

  const serviceAddress = job.useCustomAddresses ? job.serviceAddress : job.property?.serviceAddress;
  const billingAddress = job.useCustomAddresses ? job.billingAddress : job.property?.billingAddress;

  // Debug logging for selected addresses
  console.log('Selected addresses:', {
    serviceAddress,
    billingAddress,
    formattedServiceAddress: formatAddress(serviceAddress),
    formattedBillingAddress: formatAddress(billingAddress)
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {(updateError || settingsError) && (
        <Alert severity="error">
          {updateError instanceof Error ? updateError.message : 
           settingsError instanceof Error ? settingsError.message : 
           'An error occurred'}
        </Alert>
      )}

      {/* Status & Job Type Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <AssignmentIcon color="primary" />
          <Typography variant="h6">Status & Type</Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Status
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={currentStatus}
                  onChange={handleStatusChange}
                  disabled={isUpdating || isLoadingSettings}
                  startAdornment={
                    isLoadingSettings ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null
                  }
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: 1,
                            bgcolor: status.color,
                            mr: 1
                          }}
                        />
                        {status.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Job Type
              </Typography>
              <JobTypeSelect 
                jobId={job.job_id} 
                currentType={job.job_type_id} 
                onUpdate={onUpdate}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Property & Account Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <BusinessIcon color="primary" />
                <Typography variant="h6">Property</Typography>
                {!isEditingProperty ? (
                  <IconButton 
                    onClick={() => setIsEditingProperty(true)}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                ) : null}
              </Box>
              {isEditingProperty ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Autocomplete
                    value={selectedProperty}
                    onChange={(_, newValue) => setSelectedProperty(newValue)}
                    options={properties}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => option.property_id === value.property_id}
                    loading={isLoadingProperties}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Select property..."
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingProperties ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    fullWidth
                    size="small"
                  />
                  <IconButton 
                    onClick={handlePropertySave}
                    color="primary"
                    disabled={isUpdating}
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton 
                    onClick={handlePropertyCancel}
                    disabled={isUpdating}
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
              ) : (
                <Typography variant="body1">{job.property?.name || 'N/A'}</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <AccountBalanceIcon color="primary" />
                <Typography variant="h6">Accounts</Typography>
              </Box>
              <Stack spacing={1}>
                {job.property?.accounts?.map((account) => (
                  <Typography key={account.account_id} variant="body1">
                    {account.name}
                  </Typography>
                )) || <Typography variant="body1">N/A</Typography>}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Addresses Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <LocationOnIcon color="primary" />
          <Typography variant="h6">Addresses</Typography>
          {job.useCustomAddresses && (
            <Chip 
              label="Using Custom Addresses" 
              size="small" 
              color="primary"
            />
          )}
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Box>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                Service Address
                {!job.useCustomAddresses && (
                  <Chip 
                    label="From Property" 
                    size="small" 
                    variant="outlined" 
                    sx={{ ml: 1 }} 
                  />
                )}
              </Typography>
              <Typography>{formatAddress(serviceAddress)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                Billing Address
                {!job.useCustomAddresses && (
                  <Chip 
                    label="From Property" 
                    size="small" 
                    variant="outlined" 
                    sx={{ ml: 1 }} 
                  />
                )}
              </Typography>
              <Typography>{formatAddress(billingAddress)}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
