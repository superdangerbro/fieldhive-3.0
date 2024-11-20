'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Paper,
  Typography,
  Switch,
  Collapse,
  useTheme,
  SvgIcon,
  FormGroup,
  FormControlLabel,
  IconButton
} from '@mui/material';
import { ChevronDownIcon, ChevronUpIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../../app/config/environment';
import { useFieldMap } from '../../../../../app/globalHooks/useFieldMap';
import AddIcon from '@mui/icons-material/Add';

interface JobFilters {
  statuses: string[];
  types: string[];
}

interface LayersControlProps {
  showFieldEquipment: boolean;
  onToggleFieldEquipment: (event: React.ChangeEvent<HTMLInputElement>) => void;
  jobFilters: JobFilters;
  onJobFiltersChange: (filters: JobFilters) => void;
}

const defaultJobOptions: { statuses: string[]; types: { id: string; name: string; }[] } = {
  statuses: [],
  types: []
};

export function LayersControl({ 
  showFieldEquipment, 
  onToggleFieldEquipment,
  jobFilters,
  onJobFiltersChange
}: LayersControlProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isJobsExpanded, setIsJobsExpanded] = useState(false);
  const [isFloorPlansExpanded, setIsFloorPlansExpanded] = useState(false);
  const theme = useTheme();

  const { 
    floorPlans,
    activeFloorPlan,
    setActiveFloorPlan,
    toggleFloorPlanVisibility,
    selectedProperty
  } = useFieldMap();

  // Fetch available job statuses and types
  const { data: jobOptions = defaultJobOptions } = useQuery({
    queryKey: ['jobOptions'],
    queryFn: async () => {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/jobs/options`);
      if (!response.ok) throw new Error('Failed to fetch job options');
      return response.json() as Promise<{
        statuses: string[];
        types: { id: string; name: string; }[];
      }>;
    }
  });

  const handleStatusToggle = (status: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStatuses = event.target.checked
      ? [...jobFilters.statuses, status]
      : jobFilters.statuses.filter(s => s !== status);
    
    onJobFiltersChange({
      ...jobFilters,
      statuses: newStatuses
    });
  };

  const handleTypeToggle = (typeId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTypes = event.target.checked
      ? [...jobFilters.types, typeId]
      : jobFilters.types.filter(t => t !== typeId);
    
    onJobFiltersChange({
      ...jobFilters,
      types: newTypes
    });
  };

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
          Layers
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

          {/* Floor Plans Section */}
          {selectedProperty && (
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
                onClick={() => setIsFloorPlansExpanded(!isFloorPlansExpanded)}
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
                  Floor Plans
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    // This will be handled by FloorPlanLayer's onAddFloorPlan
                    document.dispatchEvent(new CustomEvent('add-floor-plan'));
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
                <SvgIcon
                  component={isFloorPlansExpanded ? ChevronUpIcon : ChevronDownIcon}
                  sx={{
                    fontSize: '12px',
                    color: theme.palette.text.secondary,
                  }}
                />
              </Box>

              <Collapse in={isFloorPlansExpanded}>
                <Box sx={{ pl: 2, pt: 1 }}>
                  <FormGroup>
                    {floorPlans.map(plan => (
                      <Box
                        key={plan.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 0.5,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                        onClick={() => setActiveFloorPlan(plan.id)}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '0.8125rem',
                            fontWeight: activeFloorPlan === plan.id ? 500 : 400,
                          }}
                        >
                          {plan.name}
                        </Typography>
                        <Switch
                          size="small"
                          checked={plan.visible}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleFloorPlanVisibility(plan.id);
                          }}
                        />
                      </Box>
                    ))}
                    {floorPlans.length === 0 && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: '0.75rem',
                          py: 1,
                        }}
                      >
                        No floor plans added
                      </Typography>
                    )}
                  </FormGroup>
                </Box>
              </Collapse>
            </Box>
          )}

          {/* Jobs Section */}
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
              onClick={() => setIsJobsExpanded(!isJobsExpanded)}
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
                Jobs
              </Typography>
              <SvgIcon
                component={isJobsExpanded ? ChevronUpIcon : ChevronDownIcon}
                sx={{
                  fontSize: '12px',
                  color: theme.palette.text.secondary,
                }}
              />
            </Box>

            <Collapse in={isJobsExpanded}>
              <Box sx={{ pl: 2, pt: 1 }}>
                {/* Status Filters */}
                {jobOptions.statuses.length > 0 && (
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
                      {jobOptions.statuses.map(status => (
                        <Box
                          key={status}
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
                            checked={jobFilters.statuses.includes(status)}
                            onChange={handleStatusToggle(status)}
                          />
                        </Box>
                      ))}
                    </FormGroup>
                  </>
                )}

                {/* Type Filters */}
                {jobOptions.types.length > 0 && (
                  <>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        mt: jobOptions.statuses.length > 0 ? 1 : 0,
                        mb: 0.5,
                      }}
                    >
                      Type
                    </Typography>
                    <FormGroup>
                      {jobOptions.types.map(type => (
                        <Box
                          key={type.id}
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
                            {type.name}
                          </Typography>
                          <Switch
                            size="small"
                            checked={jobFilters.types.includes(type.id)}
                            onChange={handleTypeToggle(type.id)}
                          />
                        </Box>
                      ))}
                    </FormGroup>
                  </>
                )}

                {jobOptions.statuses.length === 0 && jobOptions.types.length === 0 && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                      py: 1,
                    }}
                  >
                    No jobs found
                  </Typography>
                )}
              </Box>
            </Collapse>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
