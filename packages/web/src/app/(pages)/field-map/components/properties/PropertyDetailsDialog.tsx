'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../../app/config/environment';
import { useActiveJobContext } from '../../../../../app/globalHooks/useActiveJobContext';
import { useJobs } from '../../../jobs/hooks/useJobs';
import type { Job } from '../../../../../app/globalTypes/job';

interface PropertyDetailsDialogProps {
  propertyId: string | null;
  onClose: () => void;
  onWorkOnJob?: (job: Job) => void;
}

export function PropertyDetailsDialog({ propertyId, onClose, onWorkOnJob }: PropertyDetailsDialogProps) {
  const theme = useTheme();
  const { activeJob, setActiveJob, setActiveProperty } = useActiveJobContext();
  const [showJobs, setShowJobs] = useState(false);

  // Query for property details
  const { data: property, isLoading: isLoadingProperty } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/${propertyId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch property details');
      }
      return response.json();
    },
    enabled: !!propertyId,
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Query for jobs
  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ['property-jobs', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/${propertyId}/jobs`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch property jobs');
      }
      const data = await response.json();
      return data.jobs || [];
    },
    enabled: !!propertyId && showJobs,
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const handleWorkOnJob = useCallback((job: Job) => {
    if (!property) return;
    setActiveProperty(property);
    setActiveJob(job);
    if (onWorkOnJob) {
      onWorkOnJob(job);
    }
    onClose();
  }, [property, setActiveProperty, setActiveJob, onWorkOnJob, onClose]);

  const handleWorkClick = useCallback(() => {
    setShowJobs(true);
  }, []);

  // Reset show jobs when dialog closes
  useEffect(() => {
    if (!propertyId) {
      setShowJobs(false);
    }
  }, [propertyId]);

  if (!propertyId) return null;

  const isActiveProperty = activeJob?.property?.property_id === propertyId;

  return (
    <Dialog 
      open={!!propertyId} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isLoadingProperty ? (
          <Typography component="div" variant="h6">Loading...</Typography>
        ) : (
          <Typography component="div" variant="h6">{property?.name || 'Property Details'}</Typography>
        )}
        <IconButton
          aria-label="close"
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {!showJobs ? (
          // Property Details View
          isLoadingProperty ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : property ? (
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Type:</strong> {property.type || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Status:</strong> {property.status || 'N/A'}
              </Typography>
              {property.serviceAddress && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Service Address:</strong>
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      {property.serviceAddress.street}
                    </Typography>
                    <Typography variant="body2">
                      {property.serviceAddress.city}, {property.serviceAddress.state} {property.serviceAddress.postal_code}
                    </Typography>
                  </Box>
                </>
              )}
              {property.billingAddress && property.billingAddress.address_id !== property.serviceAddress?.address_id && (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    <strong>Billing Address:</strong>
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      {property.billingAddress.street}
                    </Typography>
                    <Typography variant="body2">
                      {property.billingAddress.city}, {property.billingAddress.state} {property.billingAddress.postal_code}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          ) : (
            <Typography color="error">Failed to load property details</Typography>
          )
        ) : (
          // Jobs List View
          isLoadingJobs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : jobs.length > 0 ? (
            <List>
              {jobs.map((job) => (
                <ListItem key={job.job_id} disablePadding>
                  <ListItemButton onClick={() => handleWorkOnJob(job)}>
                    <ListItemText
                      primary={job.name || `Job #${job.job_id}`}
                      secondary={`Status: ${job.status}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ p: 2 }}>No jobs available for this property</Typography>
          )
        )}
      </DialogContent>

      {!isLoadingProperty && property && !isActiveProperty && !showJobs && (
        <DialogActions sx={{ p: 2, justifyContent: 'flex-start' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<WorkIcon />}
            onClick={handleWorkClick}
          >
            Work on this property
          </Button>
        </DialogActions>
      )}
      
      {showJobs && (
        <DialogActions sx={{ p: 2, justifyContent: 'flex-start' }}>
          <Button onClick={() => setShowJobs(false)}>
            Back to Details
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
