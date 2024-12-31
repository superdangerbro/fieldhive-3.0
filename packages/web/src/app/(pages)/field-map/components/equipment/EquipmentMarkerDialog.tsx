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
      try {
        setIsDeleting(true);
        await onDelete(equipment.equipment_id);
        onClose();
      } catch (error) {
        console.error('Failed to delete equipment:', error);
        // Show error message to user
        alert('Failed to delete equipment. Please try again.');
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

  console.log('Equipment data in dialog:', {
    equipment,
    data: equipment.data,
    location: equipment.location,
    type: equipment.type,
    status: equipment.status
  });

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle>
        Equipment Details
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* General Information */}
        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            General Information
          </Typography>
          <Typography variant="body2">
            <strong>Type:</strong> {equipment.type}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" component="span">
              <strong>Status:</strong>
            </Typography>
            <Chip
              label={equipment.status}
              size="small"
              sx={{ bgcolor: statusConfig?.color || 'grey.500', color: 'white' }}
            />
          </Box>
          <Typography variant="body2">
            <strong>ID:</strong> {equipment.equipment_id}
          </Typography>
        </Box>

        {/* Location Information */}
        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Location Details
          </Typography>
          <Typography variant="body2">
            <strong>Property:</strong> {equipment.property_name}
          </Typography>
          <Typography variant="body2">
            <strong>Property Type:</strong> {equipment.property_type}
          </Typography>
          <Typography variant="body2">
            <strong>Job:</strong> {equipment.job_title}
          </Typography>
          <Typography variant="body2">
            <strong>Job Type:</strong> {equipment.job_type}
          </Typography>
          <Typography variant="body2">
            <strong>Coordinates:</strong> {equipment.location?.coordinates?.[1].toFixed(6)}, {equipment.location?.coordinates?.[0].toFixed(6)}
          </Typography>
          {Array.isArray(equipment.accounts) && equipment.accounts.length > 0 && (
            <Box mt={1}>
              <Typography variant="body2">
                <strong>Accounts:</strong>
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                {equipment.accounts.map((account: string) => (
                  <Chip
                    key={account}
                    label={account}
                    size="small"
                    sx={{ bgcolor: 'action.selected' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Equipment Fields */}
        {typeConfig?.fields && (
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Equipment Details
            </Typography>
            {typeConfig.fields.map((field: Field) => (
              <Typography key={field.name} variant="body2">
                <strong>{field.label || field.name}:</strong> {getFieldValue(field)}
              </Typography>
            ))}
          </Box>
        )}

        {/* Inspections */}
        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Inspections
          </Typography>
          {equipment.inspections?.length > 0 ? (
            equipment.inspections.map((inspection) => (
              <Box key={inspection.inspection_id} mb={1}>
                <Typography variant="body2">
                  <strong>Date:</strong> {new Date(inspection.created_at).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {inspection.notes || 'No notes'}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No inspections recorded
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'space-between' }}>
        <Button
          onClick={handleDelete}
          color="error"
          variant="outlined"
          disabled={isDeleting}
          startIcon={<DeleteIcon />}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
