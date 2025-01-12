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
  TextField,
  Alert,
  AlertTitle,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormHelperText,
  Slider,
  FormControlLabel,
  Switch
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useEquipmentTypes } from '@/app/(pages)/settings/equipment/hooks/useEquipment';
import type { Equipment, Field } from '@/app/globalTypes/equipment';
import { EquipmentForm } from './EquipmentForm';

const DarkTextField = styled(TextField)({
  '& .MuiInputBase-input': {
    color: 'white',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiIconButton-root': {
    color: 'white',
  }
});

const DarkSelect = styled(Select)({
  color: 'white',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.23)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  '& .MuiSvgIcon-root': {
    color: 'white',
  }
});

interface EditEquipmentDialogProps {
  open: boolean;
  equipment: Equipment;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
}

export function EditEquipmentDialog({
  open,
  equipment,
  onClose,
  onSubmit
}: EditEquipmentDialogProps) {
  const { data: equipmentTypes = [], isLoading } = useEquipmentTypes();
  const [selectedType, setSelectedType] = useState(equipment?.type || '');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the selected equipment type's fields
  const selectedEquipmentType = equipmentTypes.find(type => type.value === selectedType);
  const fields = selectedEquipmentType?.fields || [];

  // Initialize form data when dialog opens or equipment changes
  useEffect(() => {
    if (equipment) {
      setSelectedType(equipment.type);
      setFormData(equipment.data || {});
    }
  }, [equipment]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate required fields
      const missingFields = fields
        .filter(field => field.required && !formData[field.name])
        .map(field => field.name);

      if (missingFields.length > 0) {
        setError(`Required fields missing: ${missingFields.join(', ')}`);
        return;
      }

      const success = await onSubmit({
        ...equipment,
        type: selectedType,
        data: formData
      });

      if (success) {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle>
        Edit Equipment
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Equipment Type</InputLabel>
            <DarkSelect
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              label="Equipment Type"
              disabled // Type cannot be changed in edit mode
            >
              {equipmentTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </DarkSelect>
          </FormControl>
        </Box>

        {selectedType && (
          <EquipmentForm
            fields={fields}
            formData={formData}
            onChange={handleFieldChange}
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
