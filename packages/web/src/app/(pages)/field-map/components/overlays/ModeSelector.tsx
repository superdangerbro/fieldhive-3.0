'use client';

import { WrenchIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { MapPinIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { useMapContext } from '../../../../../app/globalHooks/useMapContext';

export type Mode = 'edit' | 'service' | null;

interface ModeSelectorProps {
  onAddEquipment?: () => void;
  onAddFloorplan?: () => void;
}

function FloatingButton({ 
  icon, 
  label, 
  className, 
  sx, 
  color = '#3b82f6',
  onClick,
  ...props 
}: any) {
  return (
    <Box
      className={className}
      sx={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ...sx
      }}
    >
      <IconButton
        onClick={onClick}
        sx={{
          width: { xs: 40, sm: 48 },
          height: { xs: 40, sm: 48 },
          backgroundColor: color,
          color: '#fff',
          boxShadow: 3,
          '&:hover': {
            backgroundColor: color,
            filter: 'brightness(0.9)',
            transform: 'scale(1.05)',
          },
        }}
        {...props}
      >
        {icon}
      </IconButton>
      <Typography
        variant="caption"
        sx={{
          color: '#fff',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          whiteSpace: 'nowrap',
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.02em',
          boxShadow: 1,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export function ModeSelector({ onAddEquipment, onAddFloorplan }: ModeSelectorProps) {
  const theme = useTheme();
  const {
    activeMode,
    activeJob,
    setActiveMode,
    setIsAddingEquipment,
    setIsAddingFloorplan
  } = useMapContext();

  const handleModeChange = (mode: Mode) => {
    if (mode === 'edit' && !activeJob) {
      // If trying to enter edit mode without an active job,
      // let the parent component handle showing the job selection dialog
      onAddEquipment?.();
      return;
    }
    setActiveMode(mode);
  };

  const handleAddEquipment = () => {
    if (!activeJob) {
      onAddEquipment?.();
      return;
    }
    setIsAddingEquipment(true);
  };

  const handleAddFloorplan = () => {
    if (!activeJob) {
      onAddEquipment?.();
      return;
    }
    setIsAddingFloorplan(true);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: { xs: theme.spacing(10), sm: theme.spacing(12) },
        left: { xs: theme.spacing(2), sm: theme.spacing(3) },
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
        zIndex: theme.zIndex.modal,
      }}
    >
      <Box 
        sx={{ 
          position: 'relative',
          width: 56,
          height: 56,
          '& .floating-button': {
            transform: activeMode === 'edit' ? 'scale(1)' : 'scale(0)',
            opacity: activeMode === 'edit' ? 1 : 0,
            pointerEvents: activeMode === 'edit' ? 'auto' : 'none',
          },
          '& .button-1': {
            bottom: activeMode === 'edit' ? '90px' : '0px',
            left: activeMode === 'edit' ? '0px' : '0px',
          },
          '& .button-2': {
            bottom: activeMode === 'edit' ? '45px' : '0px',
            left: activeMode === 'edit' ? '70px' : '0px',
          }
        }}
      >
        {/* Add Equipment button */}
        <FloatingButton
          className="floating-button button-1"
          icon={<MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Add Equipment"
          color="#16a34a"
          title="Add Equipment"
          onClick={handleAddEquipment}
        />

        {/* Add Floorplan button */}
        <FloatingButton
          className="floating-button button-2"
          icon={<DocumentPlusIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Add Floorplan"
          color="#ea580c"
          title="Add Floorplan"
          onClick={handleAddFloorplan}
          sx={{
            transitionDelay: '50ms',
          }}
        />

        {/* Main Edit button */}
        <IconButton
          onClick={() => handleModeChange('edit')}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
            backgroundColor: activeMode === 'edit' 
              ? '#7c3aed' // Purple for active state
              : '#3b82f6', // Blue matching map controls
            color: '#fff',
            boxShadow: theme.shadows[3],
            '&:hover': {
              backgroundColor: activeMode === 'edit'
                ? '#6d28d9' // Darker purple
                : '#2563eb', // Darker blue
            },
            transition: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          title="Add/Edit Mode"
        >
          <PencilSquareIcon className="h-6 w-6 sm:h-7 sm:w-7" />
        </IconButton>
      </Box>
      
      {/* Service button */}
      <IconButton
        onClick={() => handleModeChange('service')}
        sx={{
          width: { xs: 48, sm: 56 },
          height: { xs: 48, sm: 56 },
          backgroundColor: activeMode === 'service'
            ? '#7c3aed' // Purple for active state
            : '#3b82f6', // Blue matching map controls
          color: '#fff',
          boxShadow: theme.shadows[3],
          '&:hover': {
            backgroundColor: activeMode === 'service'
              ? '#6d28d9' // Darker purple
              : '#2563eb', // Darker blue
          },
          transition: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        title="Service Mode"
      >
        <WrenchIcon className="h-6 w-6 sm:h-7 sm:w-7" />
      </IconButton>
    </Box>
  );
}
