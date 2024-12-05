'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Switch, 
  Typography, 
  useTheme,
  SvgIcon,
  Collapse
} from '@mui/material';
import { Square3Stack3DIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { PropertyFilters } from './PropertyFilters';
import { PropertyDetails } from './PropertyDetails';
import { LayersControlProps, Filters } from './types';

const defaultFilters: Filters = {
  statuses: ['active'],
  types: []
};

export function LayersControl({ 
  showFieldEquipment, 
  onToggleFieldEquipment,
  propertyFilters,
  onPropertyFiltersChange,
  activePropertyId
}: LayersControlProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPropertiesExpanded, setIsPropertiesExpanded] = useState(true);
  const theme = useTheme();

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'absolute',
        top: theme.spacing(3),
        left: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        overflow: 'hidden',
        zIndex: 1000,
        minWidth: 220,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.75,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <SvgIcon
          component={Square3Stack3DIcon}
          sx={{
            fontSize: '16px',
          }}
        />
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          {activePropertyId ? 'Property Details' : 'Layers'}
        </Typography>
        <SvgIcon
          component={isExpanded ? ChevronUpIcon : ChevronDownIcon}
          sx={{
            fontSize: '12px',
          }}
        />
      </Box>

      {/* Content */}
      <Collapse in={isExpanded}>
        {activePropertyId ? (
          <PropertyDetails propertyId={activePropertyId} />
        ) : (
          <Box sx={{ px: 1.5, py: 1 }}>
            {/* Field Equipment Toggle */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.5,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.8125rem',
                }}
              >
                Field Equipment
              </Typography>
              <Switch
                size="small"
                checked={showFieldEquipment}
                onChange={onToggleFieldEquipment}
                name="showFieldEquipment"
              />
            </Box>

            {/* Properties Section */}
            <Box sx={{ mt: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                }}
                onClick={() => setIsPropertiesExpanded(!isPropertiesExpanded)}
              >
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    color: theme.palette.text.secondary,
                    fontSize: '0.8125rem',
                  }}
                >
                  Properties
                </Typography>
                <SvgIcon
                  component={isPropertiesExpanded ? ChevronUpIcon : ChevronDownIcon}
                  sx={{
                    fontSize: '12px',
                    color: theme.palette.text.secondary,
                  }}
                />
              </Box>

              <Collapse in={isPropertiesExpanded}>
                <Box sx={{ mt: 1 }}>
                  <PropertyFilters
                    filters={propertyFilters}
                    onChange={onPropertyFiltersChange}
                    isExpanded={isPropertiesExpanded}
                    onExpandToggle={() => setIsPropertiesExpanded(!isPropertiesExpanded)}
                  />
                </Box>
              </Collapse>
            </Box>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
}
