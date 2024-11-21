'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../../app/config/environment';

interface PropertyDetailsDialogProps {
  propertyId: string | null;
  onClose: () => void;
}

export function PropertyDetailsDialog({ propertyId, onClose }: PropertyDetailsDialogProps) {
  const theme = useTheme();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/${propertyId}`);
      if (!response.ok) throw new Error('Failed to fetch property details');
      return response.json();
    },
    enabled: !!propertyId
  });

  if (!propertyId) return null;

  return (
    <Dialog 
      open={!!propertyId} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isLoading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <Typography variant="h6">{property?.name || 'Property Details'}</Typography>
        )}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
