'use client';

import React from 'react';
import { Marker } from 'react-map-gl';
import { Box, Tooltip, Typography, Divider, Stack, Chip } from '@mui/material';
import type { Property } from '@fieldhive/shared';
import type { MapProperty, PointLocation, StandardLocation } from '../../types';

interface PropertyMarkerProps {
  /** Property data with map-specific location */
  property: MapProperty;
  /** Handler for property click */
  onClick: (property: MapProperty) => void;
}

/**
 * Get color for property status
 */
const getStatusColor = (status: string = 'active') => {
  const normalizedStatus = status.toLowerCase();
  switch (normalizedStatus) {
    case 'active':
      return '#2e7d32'; // success color
    case 'inactive':
      return '#ed6c02'; // warning color
    case 'archived':
      return '#d32f2f'; // error color
    case 'pending':
    default:
      return '#757575'; // grey color
  }
};

/**
 * Get color for job status
 */
const getJobStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#ed6c02'; // warning
    case 'in_progress':
      return '#0288d1'; // info
    case 'completed':
      return '#2e7d32'; // success
    case 'cancelled':
      return '#d32f2f'; // error
    default:
      return '#757575'; // grey
  }
};

/**
 * Format date string for display
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
};

/**
 * Tooltip content for property marker
 */
const PropertyTooltip = ({ property }: { property: MapProperty }) => (
  <Box sx={{ p: 1.5, maxWidth: 300 }}>
    {/* Property Info */}
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      {property.name}
    </Typography>
    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
      <Typography variant="body2" color="text.secondary">
        {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
      </Typography>
      <Chip 
        label={property.status.toUpperCase()} 
        size="small"
        sx={{ 
          bgcolor: getStatusColor(property.status),
          color: 'white',
          fontWeight: 'bold'
        }}
      />
    </Stack>

    {/* Address Info */}
    {property.service_address && (
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {[
          property.service_address.address1,
          property.service_address.city,
          property.service_address.province
        ].filter(Boolean).join(', ')}
      </Typography>
    )}

    {/* Accounts */}
    {property.accounts && property.accounts.length > 0 && (
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {property.accounts.map(a => a.name).join(', ')}
      </Typography>
    )}

    {/* Jobs Summary */}
    {property.job_stats && property.job_stats.total > 0 && (
      <>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" gutterBottom>
          Jobs ({property.job_stats.total})
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
          {property.job_stats.pending > 0 && (
            <Chip
              label={`${property.job_stats.pending} Pending`}
              size="small"
              sx={{
                bgcolor: getJobStatusColor('pending'),
                color: 'white',
                fontSize: '0.75rem',
                mb: 0.5
              }}
            />
          )}
          {property.job_stats.in_progress > 0 && (
            <Chip
              label={`${property.job_stats.in_progress} In Progress`}
              size="small"
              sx={{
                bgcolor: getJobStatusColor('in_progress'),
                color: 'white',
                fontSize: '0.75rem',
                mb: 0.5
              }}
            />
          )}
          {property.job_stats.completed > 0 && (
            <Chip
              label={`${property.job_stats.completed} Completed`}
              size="small"
              sx={{
                bgcolor: getJobStatusColor('completed'),
                color: 'white',
                fontSize: '0.75rem',
                mb: 0.5
              }}
            />
          )}
        </Stack>

        {/* Latest Job */}
        {property.job_stats.latest && (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              Latest: {property.job_stats.latest.title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={property.job_stats.latest.status.replace('_', ' ').toUpperCase()}
                size="small"
                sx={{
                  bgcolor: getJobStatusColor(property.job_stats.latest.status),
                  color: 'white',
                  fontSize: '0.7rem'
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {formatDate(property.job_stats.latest.created_at)}
              </Typography>
            </Stack>
          </Box>
        )}
      </>
    )}
  </Box>
);

/**
 * Property marker component for the map
 * Features:
 * - Status-colored marker
 * - Detailed tooltip
 * - Job statistics
 * - Click handling
 * 
 * @component
 * @example
 * ```tsx
 * <PropertyMarker
 *   property={propertyData}
 *   onClick={handlePropertyClick}
 * />
 * ```
 */
export const PropertyMarker: React.FC<PropertyMarkerProps> = ({ property, onClick }) => {
  const [longitude, latitude] = property.location.coordinates;

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      onClick={() => onClick(property)}
    >
      <Tooltip title={<PropertyTooltip property={property} />}>
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            bgcolor: getStatusColor(property.status),
            border: '2px solid white',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.2)'
            }
          }}
        />
      </Tooltip>
    </Marker>
  );
};
