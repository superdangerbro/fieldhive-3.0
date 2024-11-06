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
  Stack 
} from '@mui/material';
import type { Job, Address, JobStatus, JobType } from '@/app/globalTypes';
import { useSetting } from '../hooks/useSettings';
import { useUpdateJob } from '../hooks/useJobs';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WorkIcon from '@mui/icons-material/Work';

interface JobMetadataProps {
  job: Job;
  onUpdate?: () => void;
}

function formatAddress(address?: Address | null): string {
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
  const [currentStatus, setCurrentStatus] = useState<JobStatus>(
    typeof job.status === 'string' 
      ? { name: job.status, color: '#94a3b8' } 
      : job.status
  );

  // Use React Query hooks
  const { 
    data: statusOptions = [], 
    isLoading: isLoadingSettings,
    error: settingsError 
  } = useSetting<JobStatus[]>('job_statuses');

  const {
    mutate: updateJob,
    isPending: isUpdating,
    error: updateError,
    reset: resetUpdateError
  } = useUpdateJob();

  useEffect(() => {
    setCurrentStatus(
      typeof job.status === 'string'
        ? { name: job.status, color: '#94a3b8' }
        : job.status
    );
  }, [job]);

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const newStatusName = event.target.value;
    const newStatus = statusOptions.find(s => s.name === newStatusName);
    if (!newStatus) return;

    const previousStatus = currentStatus;
    setCurrentStatus(newStatus);
    
    updateJob(
      { 
        id: job.job_id, 
        data: { status: newStatus.name }
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

  const serviceAddress = job.use_custom_addresses ? job.service_address : job.property?.service_address;
  const billingAddress = job.use_custom_addresses ? job.billing_address : job.property?.billing_address;

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
                  value={currentStatus.name}
                  onChange={handleStatusChange}
                  disabled={isUpdating || isLoadingSettings}
                  startAdornment={
                    isLoadingSettings ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null
                  }
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status.name} value={status.name}>
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
                        {status.name}
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon color="action" sx={{ fontSize: '1.2rem' }} />
                <Typography>{job.job_type?.name || 'N/A'}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Property & Account Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <BusinessIcon color="primary" />
              <Typography variant="h6">Property</Typography>
            </Box>
            <Typography variant="body1">{job.property?.name || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={6}>
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
          </Grid>
        </Grid>
      </Paper>

      {/* Addresses Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <LocationOnIcon color="primary" />
          <Typography variant="h6">Addresses</Typography>
          {job.use_custom_addresses && (
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
                {!job.use_custom_addresses && (
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
                {!job.use_custom_addresses && (
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
