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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  IconButton,
  FormControlLabel,
  Switch,
  CircularProgress,
  FormHelperText,
  Slider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useEquipmentTypes } from '@/app/(pages)/settings/equipment/hooks/useEquipment';
import type { Equipment, Field } from '@/app/globalTypes/equipment';

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

const generateFloorOptions = () => {
  const options = [];
  // Lower floors (L5 to L1)
  for (let i = 5; i >= 1; i--) {
    options.push(`L${i}`);
  }
  // Ground floor
  options.push('G');
  // Upper floors (1 to 10)
  for (let i = 1; i <= 10; i++) {
    options.push(i.toString());
  }
  return options;
};

const FLOOR_OPTIONS = generateFloorOptions();

export function EditEquipmentDialog({
  open,
  equipment,
  onClose,
  onSubmit
}: EditEquipmentDialogProps) {
  const { data: equipmentTypes = [], isLoading } = useEquipmentTypes();
  const [selectedType, setSelectedType] = useState(equipment?.type || '');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCustomFloor, setUseCustomFloor] = useState(false);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (equipment) {
      const floorValue = equipment.data?.floor;
      const isCustomFloor = floorValue && !FLOOR_OPTIONS.includes(floorValue);
      
      setFormData({
        barcode: equipment.barcode || '',
        photo: equipment.photo_url || '',
        is_interior: equipment.data?.is_interior || false,
        floor: floorValue || '',
        target_species: equipment.data?.target_species || '',
      });
      
      setUseCustomFloor(isCustomFloor);
    }
  }, [equipment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || selectedType.trim() === '') {
      setError('Please select an equipment type');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const typeConfig = equipmentTypes.find(t => t.value === selectedType);
      if (!typeConfig) {
        throw new Error('Selected type configuration not found');
      }

      const { barcode, photo, is_interior, floor, ...otherFields } = formData;

      const submissionData = {
        equipment_id: equipment.equipment_id,
        name: typeConfig.label || typeConfig.value,
        equipment_type_id: selectedType,
        job_id: equipment.job_id,
        property_id: equipment.property_id,
        status: equipment.status,
        is_georeferenced: true,
        location: equipment.location,
        barcode: barcode || null,
        photo_url: photo || null,
        data: {
          ...otherFields,
          is_interior: typeof is_interior === 'boolean' ? is_interior : false,
          floor: is_interior ? (floor === '' ? null : floor) : null,
        }
      };

      console.log('Submitting equipment update:', submissionData);
      const success = await onSubmit(submissionData);
      if (success) {
        onClose();
      } else {
        throw new Error('Failed to update equipment');
      }
    } catch (err) {
      console.error('Failed to update equipment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Handle special case for is_interior
      if (field === 'is_interior') {
        if (!value) {
          // Reset floor when turning off interior
          newData.floor = null;
        } else if (!prev.floor) {
          // Set default floor when turning on interior
          newData.floor = 'G';
        }
      }

      return newData;
    });
  };

  const renderField = (field: Field) => {
    switch (field.type) {
      case 'boolean':
        return (
          <FormControl key={field.name} fullWidth sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(formData[field.name])}
                  onChange={(e) => handleFormChange(field.name, e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      color: '#fff',
                      '&.Mui-checked': {
                        color: '#6366f1',
                      }
                    }
                  }}
                />
              }
              label={field.label}
            />
            <FormHelperText>{field.description}</FormHelperText>
          </FormControl>
        );

      case 'slider':
        // Only show floor controls if is_interior is true
        if (field.name === 'floor' && !formData.is_interior) {
          return null;
        }

        return (
          <FormControl key={field.name} fullWidth sx={{ mb: 2 }}>
            <Box sx={{ width: '100%' }}>
              <Typography gutterBottom>{field.label}</Typography>
              
              {/* Custom Floor Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={useCustomFloor}
                    onChange={(e) => {
                      setUseCustomFloor(e.target.checked);
                      if (!e.target.checked) {
                        // Reset to default floor when switching to slider
                        handleFormChange(field.name, formData[field.name] || 'G');
                      }
                    }}
                    size="small"
                  />
                }
                label="Custom Floor"
                sx={{ mb: 2 }}
              />

              {useCustomFloor ? (
                <DarkTextField
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFormChange(field.name, e.target.value)}
                  placeholder="Enter custom floor"
                  fullWidth
                />
              ) : (
                <Slider
                  value={FLOOR_OPTIONS.indexOf(formData[field.name] || 'G')}
                  onChange={(_, index) => handleFormChange(field.name, FLOOR_OPTIONS[index as number])}
                  min={0}
                  max={FLOOR_OPTIONS.length - 1}
                  step={1}
                  marks={FLOOR_OPTIONS.map((label, index) => ({
                    value: index,
                    label
                  }))}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(index) => FLOOR_OPTIONS[index]}
                  sx={{
                    color: 'primary.main',
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#fff',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: 'primary.main',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '& .MuiSlider-mark': {
                      backgroundColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '& .MuiSlider-markLabel': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    }
                  }}
                />
              )}
            </Box>
            <FormHelperText>{field.description}</FormHelperText>
          </FormControl>
        );

      case 'select':
        return (
          <FormControl key={field.name} fullWidth sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {field.label} {field.required && '*'}
            </Typography>
            <DarkSelect
              value={formData[field.name] || ''}
              onChange={(e) => handleFormChange(field.name, e.target.value)}
              required={field.required}
              error={field.required && !formData[field.name]}
            >
              {field.config?.options?.map((option: string) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </DarkSelect>
            {field.description && (
              <FormHelperText>{field.description}</FormHelperText>
            )}
          </FormControl>
        );

      case 'text':
      default:
        return (
          <FormControl key={field.name} fullWidth sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {field.label} {field.required && '*'}
            </Typography>
            <DarkTextField
              fullWidth
              value={formData[field.name] || ''}
              onChange={(e) => handleFormChange(field.name, e.target.value)}
              required={field.required}
              error={field.required && !formData[field.name]}
              helperText={field.description}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </FormControl>
        );
    }
  };

  // Get fields for selected type
  const getFieldsForType = (typeId: string) => {
    const type = equipmentTypes.find(t => t.value === typeId);
    if (!type) return [];

    // Get base fields from type, excluding ones we'll handle specially
    const typeFields = (type.fields || []).filter(field => 
      !['is_interior', 'floor'].includes(field.name)
    );

    return [
      // Add barcode field if type requires it
      ...(type.barcodeRequired ? [{
        name: 'barcode',
        label: 'Barcode',
        type: 'text',
        required: true,
        description: 'Enter the equipment barcode'
      }] : []),
      // Add our special fields
      {
        name: 'is_interior',
        type: 'boolean',
        label: 'Interior Equipment',
        description: 'Whether this equipment is located inside a building'
      },
      {
        name: 'floor',
        type: 'slider',
        label: 'Floor',
        description: 'Floor number where the equipment is located',
        conditions: [
          {
            field: 'is_interior',
            value: true
          }
        ]
      },
      ...typeFields
    ];
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
          backgroundImage: 'none',
        }
      }}
    >
      <DialogTitle>
        Edit Equipment
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Equipment Type
            </InputLabel>
            <DarkSelect
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              label="Equipment Type"
            >
              {equipmentTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </DarkSelect>
          </FormControl>

          {selectedType && getFieldsForType(selectedType).map(field => renderField(field))}
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
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
          disabled={!selectedType || isSubmitting || isLoading}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
