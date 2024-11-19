'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Paper,
  Typography,
  Switch,
  Collapse,
  useTheme,
  SvgIcon
} from '@mui/material';
import { ChevronDownIcon, ChevronUpIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';

interface LayersControlProps {
  showFieldEquipment: boolean;
  onToggleFieldEquipment: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showActiveJobs: boolean;
  onToggleActiveJobs: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LayersControl({ 
  showFieldEquipment, 
  onToggleFieldEquipment,
  showActiveJobs,
  onToggleActiveJobs
}: LayersControlProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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
        minWidth: 180,
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
              Active Jobs
            </Typography>
            <Switch
              size="small"
              checked={showActiveJobs}
              onChange={onToggleActiveJobs}
              name="showActiveJobs"
            />
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
