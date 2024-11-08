'use client';

import React, { useState } from 'react';
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
  TextField,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEquipment } from '@/app/globalHooks/useEquipment';
import type { Equipment, Field, EquipmentStatus, EquipmentType } from '@/app/globalTypes/equipment';

interface EquipmentMarkerDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** The equipment data to display */
  equipment: Equipment;
  /** Handler for closing the dialog */
  onClose: () => void;
  /** Handler for deleting equipment */
  onDelete: (id: string) => Promise<void>;
  /** Handler for updating equipment type */
  onUpdateType: (id: string, typeId: string) => Promise<void>;
}

/**
 * Dialog for displaying and managing equipment details
 * Features:
 * - Equipment information display
 * - Status indication
 * - Field value display
 * - Equipment deletion
 * - Type updates
 */
export function EquipmentMarkerDialog({
  open,
  equipment,
  onClose,
  onDelete,
  onUpdateType
}: EquipmentMarkerDialogProps) {
  const { equipmentTypes, equipmentStatuses } = useEquipment();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      setIsDeleting(true);
      try {
        await onDelete(equipment.equipment_id);
      } catch (error) {
        console.error('Failed to delete equipment:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  /**
   * Get formatted field value based on field type
   */
  const getFieldValue = (field: Field) => {
    const value = equipment.data?.[field.name];
    
    switch (field.type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'select':
        return value || 'Not set';
      case 'number-input':
      case 'number-stepper':
      case 'slider':
        return value?.toString() || 'Not set';
      default:
        return value || 'Not set';
    }
  };

  // Find the status configuration for the current equipment status
  const statusConfig = equipmentStatuses.find((status: EquipmentStatus) => status.name === equipment.status);

  // Find the type configuration for the current equipment
  const typeConfig = equipmentTypes.find((type: EquipmentType) => type.name === equipment.type);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullScreen
      sx={{
        '& .MuiDialog-paper': {
          background: (theme) => theme.palette.background.default,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Equipment Details</Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={onClose}
            disabled={isDeleting}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Location
            </Typography>
            <Typography>
              {equipment.location.coordinates[0].toFixed(6)}, {equipment.location.coordinates[1].toFixed(6)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Type
            </Typography>
            <Typography>{typeConfig?.label || equipment.type}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Status
            </Typography>
            <Chip 
              label={statusConfig?.label || equipment.status}
              sx={{
                backgroundColor: statusConfig?.color || '#94a3b8',
                color: 'white'
              }}
              size="small"
            />
          </Box>

          {typeConfig && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Fields
              </Typography>
              {typeConfig.fields.map((field: Field) => (
                <Box key={field.name} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {field.label || field.name}
                  </Typography>
                  <Typography>
                    {getFieldValue(field)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleDelete}
          variant="outlined"
          color="error"
          fullWidth
          disabled={isDeleting}
          startIcon={<DeleteIcon />}
        >
          Delete Equipment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
