'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  InputAdornment,
  Switch,
  Slider,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import MobileScreenShareIcon from '@mui/icons-material/MobileScreenShare';
import { useEquipmentTypes } from '@/app/(pages)/settings/equipment/hooks/useEquipment';
import { useCaptureFlow } from '@/app/hooks/useCaptureFlow';
import { useMapContext } from '@/app/globalHooks/useMapContext';
import type { 
  Field, 
  FormData, 
  FieldCondition, 
  EquipmentType, 
  EquipmentStatus 
} from '../../../../../app/globalTypes/equipment';

interface AddEquipmentDialogProps {
  open: boolean;
  location: [number, number];
  onClose: () => void;
  onAddAnother: () => void;
  onSubmit: (data: {
    job_id: string;
    equipment_type_id: string;
    status: string;
    is_georeferenced: boolean;
    location: {
      latitude: number;
      longitude: number;
    };
    data: {
      barcode?: string | null;
      photo?: string | null;
      is_interior?: boolean;
      floor?: string | null;
      [key: string]: any;
    };
  }) => Promise<boolean>;
  showSuccess: boolean;
  successTitle?: string;
  successMessage?: string;
  successButtonText?: string;
  propertyName: string;
  propertyType: string;
  jobType: string;
  jobTitle?: string;
  accounts?: string[];
  editMode?: boolean;
  initialData?: {
    equipment_type_id: string;
    status: string;
    data: Record<string, any>;
  };
}

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
  '& .MuiSelect-select': {
    color: 'white'
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
  }
});

export const AddEquipmentDialog: React.FC<AddEquipmentDialogProps> = ({
  open,
  location,
  onClose,
  onSubmit,
  onAddAnother,
  showSuccess = false,
  successTitle = 'Equipment Added',
  successMessage = 'The equipment has been successfully added.',
  successButtonText = 'Add Another',
  propertyName,
  propertyType,
  jobType,
  jobTitle,
  accounts,
  editMode = false,
  initialData
}) => {
  const { data: equipmentTypes = [], isLoading } = useEquipmentTypes();
  const { 
    startCapture,
    scanBarcode,
    takePhoto,
    cleanup: cleanupCapture,
    currentStep,
    isLoading: isCaptureLoading,
  } = useCaptureFlow();
  const { activeJob } = useMapContext();
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCaptureView, setShowCaptureView] = useState(false);
  const [useCustomFloor, setUseCustomFloor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log('Initial render - showSuccess:', showSuccess);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      console.log('Dialog opened - resetting state');
      setSelectedType('');
      setFormData({});
      setError(null);
      setUseCustomFloor(false);
    }
  }, [open]);

  // Initialize form with initial data if in edit mode
  useEffect(() => {
    if (editMode && initialData && open) {
      setSelectedType(initialData.equipment_type_id);
      setFormData({
        ...initialData.data,
        name: initialData.data.name || '',
        barcode: initialData.data.barcode || null,
        photo: initialData.data.photo || null,
        is_interior: initialData.data.is_interior || false,
        floor: initialData.data.floor || 'G'
      });
    }
  }, [editMode, initialData, open]);

  // Set default floor value when interior is checked
  useEffect(() => {
    if (formData.is_interior && !formData.floor) {
      setFormData(prev => ({
        ...prev,
        floor: 'G'
      }));
    }
  }, [formData.is_interior]);

  // Clean up capture on dialog close
  useEffect(() => {
    if (!open) {
      cleanupCapture();
      setShowCaptureView(false);
    }
  }, [open, cleanupCapture]);

  // Get the selected equipment type configuration
  const selectedTypeConfig = equipmentTypes.find((t) => t.value === selectedType);
  const barcodeRequired = selectedTypeConfig?.barcodeRequired ?? false;
  const photoRequired = selectedTypeConfig?.photoRequired ?? false;

  // Get fields for selected type
  const getFieldsForType = (typeId: string) => {
    const type = equipmentTypes.find(t => t.value === typeId);
    if (!type) return [];

    return [
      {
        name: 'photo',
        type: 'photo',
        label: 'Photo',
        required: true,
        description: 'Take a photo of the equipment'
      },
      {
        name: 'barcode',
        type: 'barcode',
        label: 'Barcode',
        required: true,
        description: 'Scan or enter the barcode'
      },
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
      {
        name: 'target_species',
        type: 'select',
        label: 'Target Species',
        required: true,
        description: 'Species this equipment is intended for',
        config: {
          options: ['Mouse', 'Rat', 'Both']
        }
      }
    ];
  };

  // Render fields based on selected type
  const renderFields = () => {
    if (!selectedType) return null;
    const fields = getFieldsForType(selectedType);
    
    return fields.map(field => {
      // Check conditions
      if (field.conditions) {
        const shouldShow = field.conditions.every(condition => {
          return formData[condition.field] === condition.value;
        });
        if (!shouldShow) return null;
      }
      
      return renderField(field);
    });
  };

  const switchStyles = {
    '& .MuiSwitch-switchBase': {
      color: '#fff',
      '&.Mui-checked': {
        color: '#6366f1',
        '& + .MuiSwitch-track': {
          backgroundColor: '#4f46e5',
          opacity: 0.5
        }
      }
    },
    '& .MuiSwitch-track': {
      backgroundColor: '#374151',
      opacity: 0.3
    }
  };

  // Generate floor options
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || selectedType.trim() === '') {
      setError('Please select an equipment type');
      return;
    }

    if (!activeJob?.job_id) {
      setError('No active job selected');
      return;
    }

    if (!location || location.length !== 2) {
      setError('Invalid location coordinates');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Get all fields for the selected type
      const typeConfig = equipmentTypes.find(t => t.value === selectedType);
      if (!typeConfig) {
        throw new Error('Selected type configuration not found');
      }

      // Extract special fields
      const { barcode, photo, is_interior, floor, ...otherFields } = formData;
      console.log('Raw floor value:', floor, typeof floor);

      // Floor value should be kept as is - either 'G' or a number
      const floorValue = floor === '' ? null : floor;
      console.log('Final floor value:', floorValue, typeof floorValue);

      // Extract latitude and longitude
      const [longitude, latitude] = location;
      console.log('Location coordinates:', { longitude, latitude });

      // Create location object in the format the API expects
      const locationData = {
        latitude,
        longitude
      };
      console.log('Location data:', locationData);

      // Prepare submission data
      const submissionData = {
        name: typeConfig.label || typeConfig.value,
        equipment_type_id: typeConfig.value,
        job_id: activeJob.job_id,
        property_id: activeJob.property_id,
        status: 'active',
        barcode: barcode || null,
        photo_url: photo || null,
        location: locationData,
        data: {
          ...otherFields,
          is_interior: is_interior || false,
          floor: floorValue
        }
      };

      console.log('Final submission data:', JSON.stringify(submissionData, null, 2));
      console.log('Submitting equipment...');
      
      try {
        const success = await onSubmit(submissionData);
        console.log('Submit result:', success);
        if (!success) {
          throw new Error('Failed to submit equipment');
        }
      } catch (submitError) {
        console.error('Error during submit:', submitError);
        throw new Error(submitError instanceof Error ? submitError.message : 'Failed to submit equipment');
      }
    } catch (err) {
      console.error('Failed to submit equipment:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    console.log('Add Another clicked');
    // Reset form state
    setSelectedType('');
    setFormData({});
    setError(null);
    setUseCustomFloor(false);
    // Notify parent to start new placement
    onAddAnother();
  };

  const handleClose = () => {
    console.log('Handle close called, isSubmitting:', isSubmitting);
    if (!isSubmitting) {
      console.log('Closing dialog');
      onClose();
    }
  };

  const handleFinish = () => {
    console.log('Finishing, closing dialog');
    handleClose();
  };

  // Debug effect for dialog state
  useEffect(() => {
    console.log('Dialog state changed:', {
      open,
      showSuccess,
      isSubmitting,
      selectedType,
      hasError: !!error
    });
  }, [open, showSuccess, isSubmitting, selectedType, error]);

  const handleStartCapture = async () => {
    try {
      await startCapture();
      setShowCaptureView(true);
    } catch (err) {
      setError('Camera access required. Please ensure you have a camera connected and browser permissions are granted.');
      console.error('Capture error:', err);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const photoData = await takePhoto();
      setFormData(prev => ({ ...prev, photo: photoData }));
      setShowCaptureView(false);
    } catch (err) {
    console.error('Failed to take photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to take photo');
    }
  };

  const handleBarcodeImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // TODO: Implement image upload scanning
      setError('Image upload not implemented yet');
    } catch (err) {
      console.error('Failed to scan barcode from image:', err);
      setError(err instanceof Error ? err.message : 'Failed to scan barcode from image');
    }
  };

  const handleCancelCapture = () => {
    cleanupCapture();
    setShowCaptureView(false);
  };

  const renderField = (field: Field) => {
    switch (field.type) {
      case 'boolean':
        return (
          <FormControl key={field.name} fullWidth sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData[field.name] || false}
                  onChange={(e) => handleFormChange(field.name, e.target.checked)}
                  sx={switchStyles}
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
                    onChange={(e) => setUseCustomFloor(e.target.checked)}
                    size="small"
                  />
                }
                label="Custom Floor"
                sx={{ mb: 2 }}
              />

              {useCustomFloor ? (
                <DarkTextField
                  value={formData[field.name] || 'G'}
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
        const selectConfig = field.config as SelectConfig;
        if (!selectConfig || !selectConfig.options) {
          console.error('Select field missing config or options:', field);
          return null;
        }
        return (
          <FormControl key={field.name} fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {field.label} {field.required && '*'}
            </Typography>
            <DarkSelect
              value={formData[field.name] || ''}
              onChange={(e) => handleFormChange(field.name, e.target.value)}
              required={field.required}
              error={field.required && !formData[field.name]}
              sx={{
                '& .MuiSelect-select': {
                  color: 'white'
                }
              }}
            >
              {selectConfig.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </DarkSelect>
            {field.description && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {field.description}
              </Typography>
            )}
            {field.required && !formData[field.name] && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {field.label} is required
              </Typography>
            )}
          </FormControl>
        );

      case 'multiselect':
        const multiSelectConfig = field.config as MultiSelectConfig;
        if (!multiSelectConfig || !multiSelectConfig.options) {
          console.error('MultiSelect field missing config or options:', field);
          return null;
        }
        return (
          <FormControl key={field.name} fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {field.label} {field.required && '*'}
            </Typography>
            <DarkSelect
              multiple
              value={formData[field.name] || []}
              onChange={(e) => handleFormChange(field.name, e.target.value)}
              required={field.required}
              error={field.required && (!formData[field.name] || formData[field.name].length === 0)}
              sx={{
                '& .MuiSelect-select': {
                  color: 'white'
                }
              }}
              renderValue={(selected) => (Array.isArray(selected) ? selected.join(', ') : '')}
            >
              {multiSelectConfig.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </DarkSelect>
            {field.description && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {field.description}
              </Typography>
            )}
            {field.required && (!formData[field.name] || formData[field.name].length === 0) && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {field.label} is required
              </Typography>
            )}
          </FormControl>
        );

      case 'barcode':
        return (
          <FormControl key={field.name} fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Barcode {field.required && '*'}
            </Typography>
            <DarkTextField
              fullWidth
              value={formData.barcode || ''}
              onChange={(e) => handleFormChange('barcode', e.target.value)}
              required={field.required}
              error={field.required && !formData.barcode}
              helperText={field.required && !formData.barcode ? 'Barcode is required' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleStartCapture} edge="end">
                      <QrCodeScannerIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
        );

      case 'photo':
        return (
          <FormControl key={field.name} fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Photo {field.required && '*'}
            </Typography>
            <DarkTextField
              fullWidth
              value={formData.photo || ''}
              onChange={(e) => handleFormChange('photo', e.target.value)}
              required={field.required}
              error={field.required && !formData.photo}
              helperText={field.required && !formData.photo ? 'Photo is required' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleStartCapture} edge="end">
                      <PhotoCameraIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
        );

      case 'text':
      default:
        return (
          <FormControl key={field.name} fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {field.label} {field.required && '*'}
            </Typography>
            <DarkTextField
              fullWidth
              value={formData[field.name] || ''}
              onChange={(e) => handleFormChange(field.name, e.target.value)}
              required={field.required}
              error={field.required && !formData[field.name]}
              helperText={field.required && !formData[field.name] ? `${field.label} is required` : ''}
            />
            {field.description && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {field.description}
              </Typography>
            )}
          </FormControl>
        );
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset floor when interior is turned off
      ...(field === 'is_interior' && !value ? { floor: null } : {}),
      // Set default floor when interior is turned on
      ...(field === 'is_interior' && value && !prev.floor ? { floor: 'G' } : {})
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={showSuccess}
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none',
        }
      }}
    >
      {showSuccess ? (
        <>
          <DialogTitle>
            {successTitle || 'Success'}
            <IconButton
              onClick={handleClose}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              py: 4 
            }}>
              <CheckCircleOutlineIcon 
                color="success" 
                sx={{ fontSize: 48, mb: 2 }} 
              />
              <Typography variant="h6" sx={{ mb: 3 }}>
                {successMessage || 'Equipment Added Successfully!'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleAddAnother}
                >
                  {successButtonText || 'Add Another'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClose}
                >
                  Finish
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </>
      ) : (
        <>
          <DialogTitle>
            {editMode ? 'Edit Equipment' : 'Add Equipment'}
            <IconButton
              onClick={handleClose}
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

              {/* Equipment Type Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="equipment-type-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Equipment Type
                </InputLabel>
                <Select
                  labelId="equipment-type-label"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  label="Equipment Type"
                  sx={{
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
                  }}
                >
                  {equipmentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Dynamic Fields */}
              {selectedType && renderFields()}
            </form>
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
              disabled={!selectedType || isSubmitting || isLoading}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? (editMode ? 'Saving...' : 'Adding Equipment...') : (editMode ? 'Save Changes' : 'Add Equipment')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
