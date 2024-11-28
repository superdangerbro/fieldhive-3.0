'use client';

import React from 'react';
import { 
  Box, 
  Typography,
  Switch,
  Collapse,
  FormGroup,
  SvgIcon
} from '@mui/material';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@mui/material';
import { ENV_CONFIG } from '../../../../../app/config/environment';
import { PropertyFiltersProps, PropertyOptions } from './types';

const defaultOptions: PropertyOptions = {
  statuses: [],
  types: []
};

export function PropertyFilters({
  isExpanded,
  onExpandToggle,
  propertyFilters,
  onPropertyFiltersChange
}: PropertyFiltersProps) {
  const theme = useTheme();

  const { data: propertyOptions = defaultOptions, isLoading } = useQuery({
    queryKey: ['propertyOptions'] as const,
    queryFn: async () => {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/options`);
      if (!response.ok) throw new Error('Failed to fetch property options');
      const data: PropertyOptions = await response.json();
      return data;
    }
  });

  const handleStatusToggle = (status: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStatuses = event.target.checked
      ? [...propertyFilters.statuses, status]
      : propertyFilters.statuses.filter(s => s !== status);
    
    onPropertyFiltersChange({
      ...propertyFilters,
      statuses: newStatuses
    });
  };

  const handleTypeToggle = (type: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTypes = event.target.checked
      ? [...propertyFilters.types, type]
      : propertyFilters.types.filter(t => t !== type);
    
    onPropertyFiltersChange({
      ...propertyFilters,
      types: newTypes
    });
  };

  return (
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
        onClick={onExpandToggle}
      >
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            color: theme.palette.text.secondary,
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          Properties
        </Typography>
        <SvgIcon
          component={isExpanded ? ChevronUpIcon : ChevronDownIcon}
          sx={{
            fontSize: '12px',
            color: theme.palette.text.secondary,
          }}
        />
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ pl: 2, pt: 1 }}>
          {/* Status Filters */}
          {propertyOptions.statuses.length > 0 && (
            <>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  mb: 0.5,
                }}
              >
                Status
              </Typography>
              <FormGroup>
                {propertyOptions.statuses.map((status, index) => (
                  <Box
                    key={`property-status-${status}-${index}`}
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
                        textTransform: 'capitalize',
                      }}
                    >
                      {status}
                    </Typography>
                    <Switch
                      size="small"
                      checked={propertyFilters.statuses.includes(status)}
                      onChange={handleStatusToggle(status)}
                    />
                  </Box>
                ))}
              </FormGroup>
            </>
          )}

          {/* Type Filters */}
          {propertyOptions.types.length > 0 && (
            <>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  mt: propertyOptions.statuses.length > 0 ? 1 : 0,
                  mb: 0.5,
                }}
              >
                Type
              </Typography>
              <FormGroup>
                {propertyOptions.types.map((type, index) => (
                  <Box
                    key={`property-type-${type}-${index}`}
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
                        textTransform: 'capitalize',
                      }}
                    >
                      {type}
                    </Typography>
                    <Switch
                      size="small"
                      checked={propertyFilters.types.includes(type)}
                      onChange={handleTypeToggle(type)}
                    />
                  </Box>
                ))}
              </FormGroup>
            </>
          )}

          {propertyOptions.statuses.length === 0 && propertyOptions.types.length === 0 && !isLoading && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
                py: 1,
              }}
            >
              No properties found
            </Typography>
          )}

          {isLoading && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
                py: 1,
              }}
            >
              Loading...
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
