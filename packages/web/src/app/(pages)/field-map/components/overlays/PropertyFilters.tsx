import React from 'react';
import {
  Box,
  Typography,
  Switch,
  SvgIcon,
  Collapse,
  useTheme,
  FormGroup,
  CircularProgress
} from '@mui/material';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../../app/config/environment';

const isDev = process.env.NODE_ENV === 'development';

export interface PropertyFiltersProps {
  filters: {
    statuses: string[];
    types: string[];
  };
  onChange: (filters: { statuses: string[]; types: string[] }) => void;
  isExpanded?: boolean;
  onExpandToggle?: () => void;
}

interface PropertyOptions {
  statuses: string[];
  types: string[];
}

interface ApiResponse {
  statuses?: string[];
  types?: string[];
}

export function PropertyFilters({
  filters,
  onChange,
  isExpanded = true,
  onExpandToggle
}: PropertyFiltersProps) {
  const theme = useTheme();

  // Fetch property options from the API
  const { data: propertyOptions, isLoading } = useQuery<PropertyOptions>({
    queryKey: ['propertyOptions'],
    queryFn: async (): Promise<PropertyOptions> => {
      try {
        if (!ENV_CONFIG?.api?.baseUrl) {
          console.error('API base URL is not configured');
          throw new Error('API base URL is not configured');
        }

        const url = `${ENV_CONFIG.api.baseUrl}/properties/options`;
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch property options: ${errorText}`);
        }
        
        const data: ApiResponse = await response.json();
        
        // Ensure we have valid arrays
        const statuses = Array.isArray(data?.statuses) ? data.statuses : [];
        const types = Array.isArray(data?.types) ? data.types : [];
        
        // Make sure 'active' is in the list and normalize all values
        const normalizedStatuses = Array.from(new Set([
          'active',
          ...statuses.map((status: string) => status?.toLowerCase() || '')
        ])).filter(Boolean).sort();
        
        const normalizedTypes = Array.from(new Set(
          types.map((type: string) => type?.toLowerCase() || '')
        )).filter(Boolean).sort();

        return {
          statuses: normalizedStatuses,
          types: normalizedTypes
        };
      } catch (error) {
        console.error('Failed to fetch property options:', error);
        return { statuses: ['active'], types: [] };
      }
    },
    initialData: { statuses: ['active'], types: [] }
  });

  // Return early with loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  // Only render if we have options
  if (!propertyOptions.statuses.length && !propertyOptions.types.length) {
    return null;
  }

  const handleStatusToggle = (status: string) => () => {
    const currentStatuses = filters?.statuses || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onChange({
      ...filters,
      statuses: newStatuses
    });
  };

  const handleTypeToggle = (type: string) => () => {
    const currentTypes = filters?.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    onChange({
      ...filters,
      types: newTypes
    });
  };

  return (
    <Box>
      {/* Header */}
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
          }}
        >
          Filters
        </Typography>
        {isLoading ? (
          <CircularProgress size={16} />
        ) : (
          <SvgIcon
            component={isExpanded ? ChevronUpIcon : ChevronDownIcon}
            sx={{
              fontSize: '12px',
              color: theme.palette.text.secondary,
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Collapse in={isExpanded}>
        <Box sx={{ mt: 1, pl: 2 }}>
          {/* Status Filters */}
          {propertyOptions.statuses.length > 0 && (
            <Box>
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
                {propertyOptions.statuses.map((status: string) => (
                  <Box
                    key={status}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 0.25,
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
                      checked={filters?.statuses?.includes(status) || false}
                      onChange={handleStatusToggle(status)}
                      disabled={isLoading}
                    />
                  </Box>
                ))}
              </FormGroup>
            </Box>
          )}

          {/* Type Filters */}
          {propertyOptions.types.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  mb: 0.5,
                }}
              >
                Type ({propertyOptions.types.length})
              </Typography>
              <FormGroup>
                {propertyOptions.types.map((type: string) => (
                  <Box
                    key={type}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 0.25,
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
                      checked={filters?.types?.includes(type) || false}
                      onChange={handleTypeToggle(type)}
                      disabled={isLoading}
                    />
                  </Box>
                ))}
              </FormGroup>
            </Box>
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
              No filters available
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
