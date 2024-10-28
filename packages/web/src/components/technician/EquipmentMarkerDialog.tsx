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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Equipment {
  equipment_id: string;
  equipment_type_id: string;
  equipment_type_name: string;
  job_id: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  is_georeferenced: boolean;
  created_at: string;
  updated_at: string;
  equipment_type: {
    id: string;
    name: string;
  };
  job: {
    id: string;
    status: string;
    job_type: string;
  };
  property: {
    id: string;
    name: string;
    address: string;
  };
  account: {
    id: string;
    name: string;
  };
}

interface EquipmentType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface EquipmentMarkerDialogProps {
  open: boolean;
  equipment: Equipment;
  onClose: () => void;
  onDelete: (equipmentId: string) => void;
  onInspect: (equipment: Equipment) => void;
  onUpdateType: (equipmentId: string, equipmentTypeId: string) => void;
}

export function EquipmentMarkerDialog({
  open,
  equipment,
  onClose,
  onDelete,
  onInspect,
  onUpdateType,
}: EquipmentMarkerDialogProps) {
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);

  useEffect(() => {
    // Fetch equipment types
    fetch(`${API_BASE_URL}/equipment-types`)
      .then(res => res.json())
      .then(data => setEquipmentTypes(data))
      .catch(err => console.error('Failed to fetch equipment types:', err));
  }, []);

  const handleDelete = () => {
    onDelete(equipment.equipment_id);
  };

  const handleInspect = () => {
    onInspect(equipment);
  };

  const handleTypeChange = async (event: any) => {
    const newTypeId = event.target.value;
    try {
      await onUpdateType(equipment.equipment_id, newTypeId);
    } catch (error) {
      console.error('Failed to update equipment type:', error);
    }
  };

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
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Equipment Details</Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography 
          variant="caption" 
          color="error" 
          sx={{ 
            cursor: 'pointer',
            display: 'block',
            mt: 1
          }}
          onClick={handleDelete}
        >
          Delete Equipment
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 2,
          }}
        >
          <FormControl fullWidth>
            <InputLabel>Equipment Type</InputLabel>
            <Select
              value={equipment.equipment_type_id}
              label="Equipment Type"
              onChange={handleTypeChange}
            >
              {equipmentTypes.map(type => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body1">
            Account: {equipment.account.name}
          </Typography>

          <Typography variant="body1">
            Property: {equipment.property.name}
            <Typography variant="body2" color="text.secondary">
              {equipment.property.address}
            </Typography>
          </Typography>

          <Typography variant="body1">
            Job Type: {equipment.job.job_type}
            <Typography variant="body2" color="text.secondary">
              Status: {equipment.job.status}
            </Typography>
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Location: {equipment.location.coordinates[0].toFixed(6)}, {equipment.location.coordinates[1].toFixed(6)}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Created: {format(new Date(equipment.created_at), 'PPp')}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Equipment ID: {equipment.equipment_id}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleInspect}
          variant="contained"
          color="primary"
          fullWidth
        >
          Create Inspection Report
        </Button>
      </DialogActions>
    </Dialog>
  );
}
