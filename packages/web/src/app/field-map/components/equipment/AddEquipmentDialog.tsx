'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  AlertTitle,
  TextField,
  Checkbox,
  FormControlLabel,
  TextareaAutosize
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEquipmentStore } from '../../../../stores/equipmentStore';

interface AddEquipmentDialogProps {
  open: boolean;
  location: [number, number];
  onClose: () => void;
  onSubmit: (data: { 
    equipment_type_id: string;
    status: string;
    data: Record<string, any>;
  }) => Promise<void>;
}

interface FormData {
  [key: string]: any;
}

interface FieldCondition {
  field: string;
  value: any;
  makeRequired?: boolean;
}

interface Field {
  name: string;
  type: string;
  required: boolean;
  options?: string[];
  numberConfig?: {
    min?: number;
    max?: number;
    step?: number;
  };
  showWhen?: FieldCondition[];
}

/**
 * Dialog for adding new equipment to the map
 * Features:
 * - Dynamic form fields based on equipment type
 * - Conditional field visibility
 * - Field validation
 * - Location display
 */
export function AddEquipmentDialog({
  open,
  location,
  onClose,
  onSubmit,
}: AddEquipmentDialogProps) {
  const { equipmentTypes, equipmentStatuses, fetchEquipmentTypes, fetchEquipmentStatuses } = useEquipmentStore();
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedType('');
      setSelectedStatus('');
      setFormData({});
      setError(null);
      
      // Fetch equipment types and statuses
      fetchEquipmentTypes();
      fetchEquipmentStatuses();
    }
  }, [open, fetchEquipmentTypes, fetchEquipmentStatuses]);

  // Get the selected equipment type configuration
  const selectedTypeConfig = equipmentTypes.find(t => t.name === selectedType);

  // Get visible fields based on conditions
  const getVisibleFields = () => {
    if (!selectedTypeConfig) return [];
    
    return selectedTypeConfig.fields.filter(field => {
      if (!field.showWhen || field.showWhen.length === 0) return true;
      
      return field.showWhen.some((condition: FieldCondition) => {
        const dependentValue = formData[condition.field];
        return dependentValue === condition.value;
      });
    });
  };

  // Check if a field is required based on conditions
  const isFieldRequired = (field: Field) => {
    if (field.required) return true;
    
    if (!field.showWhen) return false;
    
    return field.showWhen.some((condition: FieldCondition) => {
      const dependentValue = formData[condition.field];
      return dependentValue === condition.value && condition.makeRequired;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !selectedStatus) return;

    // Validate required fields
    const visibleFields = getVisibleFields();
    const missingFields = visibleFields
      .filter(field => isFieldRequired(field) && !formData[field.name])
      .map(field => field.name);

    if (missingFields.length > 0) {
      setError(`Required fields missing: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        equipment_type_id: selectedType,
        status: selectedStatus,
        data: formData
      });
      setSelectedType('');
      setSelectedStatus('');
      setFormData({});
    } catch (err) {
      console.error('Failed to add equipment:', err);
      setError(err instanceof Error ? err.message : 'Failed to add equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const renderField = (field: Field) => {
    switch (field.type) {
      case 'select':
        return (
          <FormControl fullWidth key={field.name}>
            <InputLabel>{field.name}</InputLabel>
            <Select
              value={formData[field.name] || ''}
              label={field.name}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              required={isFieldRequired(field)}
            >
              {field.options?.map((option: string) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'boolean':
        return (
          <FormControlLabel
            key={field.name}
            control={
              <Checkbox
                checked={formData[field.name] || false}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
              />
            }
            label={field.name}
          />
        );

      case 'textarea':
        return (
          <FormControl fullWidth key={field.name}>
            <Typography variant="subtitle2" gutterBottom>
              {field.name}
              {isFieldRequired(field) && ' *'}
            </Typography>
            <TextareaAutosize
              minRows={3}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                borderColor: '#ccc'
              }}
            />
          </FormControl>
        );

      case 'number-input':
      case 'number-stepper':
      case 'slider':
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.name}
            type="number"
            value={formData[field.name] || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={isFieldRequired(field)}
            inputProps={{
              min: field.numberConfig?.min,
              max: field.numberConfig?.max,
              step: field.numberConfig?.step
            }}
          />
        );

      default:
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={isFieldRequired(field)}
          />
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen
      sx={{
        '& .MuiDialog-paper': {
          background: (theme) => theme.palette.background.default,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Add Equipment</Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Location: {location[0].toFixed(6)}, {location[1].toFixed(6)}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}
          
          <FormControl fullWidth>
            <InputLabel>Equipment Type</InputLabel>
            <Select
              value={selectedType}
              label="Equipment Type"
              onChange={(e) => {
                setSelectedType(e.target.value);
                setFormData({});  // Reset form data when type changes
              }}
              disabled={isSubmitting}
              required
            >
              {equipmentTypes.map((type) => (
                <MenuItem key={type.name} value={type.name}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={isSubmitting}
              required
            >
              {equipmentStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedTypeConfig && getVisibleFields().map(field => renderField(field))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          fullWidth
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth
          disabled={!selectedType || !selectedStatus || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Adding Equipment...' : 'Add Equipment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
