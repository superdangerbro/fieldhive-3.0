'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import { EquipmentInspectionDialog } from './EquipmentInspectionDialog';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ... (keep all interfaces and other type definitions as they are)

export function EquipmentMarkerDialog({
  open,
  equipment,
  onClose,
  onDelete,
  onInspect,
  onUpdateType,
}: EquipmentMarkerDialogProps) {
  // ... (keep all state variables and other functions as they are)

  const handleInspectionComplete = async (data: any) => {
    setInspectionDialogOpen(false);
    await fetchInspections();
    onClose(); // Close the marker dialog after inspection is complete
  };

  // ... (keep all other functions and JSX as they are)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          background: (theme) => theme.palette.background.default,
        },
      }}
    >
      {/* ... (keep all other Dialog content as it is) */}
      
      <EquipmentInspectionDialog
        open={inspectionDialogOpen}
        equipment={{
          id: equipment.equipment_id,
          type: equipment.equipment_type_name,
          location: equipment.location.coordinates,
          status: equipment.job.status,
        }}
        onClose={() => setInspectionDialogOpen(false)}
        onComplete={handleInspectionComplete}
      />
    </Dialog>
  );
}
