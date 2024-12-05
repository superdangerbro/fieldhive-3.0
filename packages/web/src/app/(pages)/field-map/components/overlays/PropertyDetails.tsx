'use client';

import React from 'react';
import { Box, Typography, useTheme, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../../app/config/environment';
import type { Property } from '../../../../../app/globalTypes/property';

interface PropertyDetailsProps {
  propertyId: string;
}

export function PropertyDetails({ propertyId }: PropertyDetailsProps) {
  const theme = useTheme();

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/${propertyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property details');
      }
      return response.json();
    },
    enabled: !!propertyId,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <Box sx={{ p: 1.5 }}>
        <Typography variant="body2">Loading property details...</Typography>
      </Box>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <Box sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
        {property.name}
      </Typography>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Type:</strong> {property.type || 'N/A'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Status:</strong> {property.status || 'N/A'}
        </Typography>
      </Box>

      {property.serviceAddress && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Service Address:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
            {property.serviceAddress.street}
            <br />
            {property.serviceAddress.city}, {property.serviceAddress.state} {property.serviceAddress.postal_code}
          </Typography>
        </Box>
      )}

      {property.billingAddress && property.billingAddress.address_id !== property.serviceAddress?.address_id && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Billing Address:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
            {property.billingAddress.street}
            <br />
            {property.billingAddress.city}, {property.billingAddress.state} {property.billingAddress.postal_code}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
