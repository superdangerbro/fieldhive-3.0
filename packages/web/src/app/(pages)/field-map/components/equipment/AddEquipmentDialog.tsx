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
  Alert,
  AlertTitle,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useEquipmentTypes } from '@/app/(pages)/settings/equipment/hooks/useEquipment';
import { useMapContext } from '@/app/globalHooks/useMapContext';
import type { Field, FormData, EquipmentType } from '../../../../../app/globalTypes/equipment';
import { EquipmentForm } from './EquipmentForm';

interface AddEquipmentDialogProps {
  open: boolean;
  location: [number, number];
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  onAddAnother: () => void;
  showSuccess: boolean;
  propertyName?: string;
  propertyType?: string;
  jobType?: string;
  jobTitle?: string;
  accounts?: string[];
}

const DarkSelect = styled(Select)({
  '& .MuiSelect-select': {
    color: 'white'
  }
});

export const AddEquipmentDialog: React.FC<AddEquipmentDialogProps> = ({
  open,
  location,
  onClose,
  onSubmit,
  onAddAnother,
  showSuccess,
  propertyName,
  propertyType,
  jobType,
  jobTitle,
  accounts,
}) => {
  const { data: equipmentTypes = [], isLoading } = useEquipmentTypes();
  const { activeJob } = useMapContext();
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the selected equipment type's fields
  const selectedEquipmentType = equipmentTypes.find(type => type.value === selectedType);
  const fields = selectedEquipmentType?.fields || [];

  const handleTypeChange = (event: any) => {
    const newType = event.target.value;
    setSelectedType(newType);
    // Reset form data when type changes
    setFormData({});
  };

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
        type: selectedType,
        location,
        ...formData
      });

      if (success) {
        setFormData({});
        setSelectedType('');
        if (!showSuccess) {
          onClose();
        }
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
        Add Equipment
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

        {showSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <AlertTitle>Success</AlertTitle>
            Equipment added successfully!
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Equipment Type</InputLabel>
            <DarkSelect
              value={selectedType}
              onChange={handleTypeChange}
              label="Equipment Type"
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
          disabled={!selectedType || isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Add'}
        </Button>
        {showSuccess && (
          <Button
            onClick={onAddAnother}
            color="primary"
            disabled={isSubmitting}
          >
            Add Another
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
