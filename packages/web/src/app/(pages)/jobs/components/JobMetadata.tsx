'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, FormControl, InputLabel, Select, MenuItem, Chip, SelectChangeEvent, Alert, CircularProgress, Typography, Paper, Stack } from '@mui/material';
import type { Job, JobStatus } from '@fieldhive/shared';
import { updateJob, getSetting } from '@/services/api';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WorkIcon from '@mui/icons-material/Work';
import { JOB_STATUSES, getStatusColor, formatAddress } from '../utils';

interface JobMetadataProps {
  job: Job;
  onUpdate?: () => void;
}

export function JobMetadata({ job, onUpdate }: JobMetadataProps) {
  const [statusLoading, setStatusLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<JobStatus>(job.status);
  const [statusOptions, setStatusOptions] = useState<JobStatus[]>(JOB_STATUSES);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    setCurrentStatus(job.status);
  }, [job]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const statuses = await getSetting('job_statuses');
        if (Array.isArray(statuses) && statuses.length > 0) {
          setStatusOptions(statuses);
        }
      } catch (error) {
        console.error('Failed to fetch job statuses:', error);
        setStatusOptions(JOB_STATUSES);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  const handleStatusChange = async (event: SelectChangeEvent<string>) => {
    const newStatus = event.target.value as JobStatus;
    setStatusLoading(true);
    setError(null);
    
    const previousStatus = currentStatus;
    setCurrentStatus(newStatus);
    
    try {
      await updateJob(job.job_id, {
        status: newStatus
      });
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      setCurrentStatus(previousStatus);
      setError('Failed to update job status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
  };

  const serviceAddress = job.use_custom_addresses ? job.service_address : job.property?.service_address;
  const billingAddress = job.use_custom_addresses ? job.billing_address : job.property?.billing_address;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && (
        <Alert severity="error">
          {error}
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
                  disabled={statusLoading || isLoadingSettings}
                  startAdornment={
                    isLoadingSettings ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null
                  }
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      <Chip 
                        label={status.replace('_', ' ').toUpperCase()} 
                        size="small" 
                        color={getStatusColor(status)} 
                        sx={{ color: 'white' }} 
                      />
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
