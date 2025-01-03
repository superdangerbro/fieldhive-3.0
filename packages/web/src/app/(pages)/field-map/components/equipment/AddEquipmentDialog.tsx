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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import MobileScreenShareIcon from '@mui/icons-material/MobileScreenShare';
import { useEquipmentTypes } from '@/app/(pages)/settings/equipment/hooks/useEquipment';
import { useCaptureFlow } from '@/app/hooks/useCaptureFlow';
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

export const AddEquipmentDialog: React.FC<AddEquipmentDialogProps> = ({
  open,
  location,
  onClose,
  onSubmit,
  onAddAnother,
  showSuccess,
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
        floor: initialData.data.floor || null
      });
    }
  }, [editMode, initialData, open]);

  // Set initial floor value when interior is checked
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
  const hasBarcode = selectedTypeConfig?.fields.some(f => f.name === 'barcode');
  const hasPhoto = selectedTypeConfig?.fields.some(f => f.name === 'photo');
  const showCaptureButtons = hasBarcode && hasPhoto;

  // Get visible fields based on conditions
  const getVisibleFields = () => {
    if (!selectedTypeConfig) return [];
    return selectedTypeConfig.fields;
  };

  // Check if a field is required based on conditions
  const isFieldRequired = (field: Field): boolean => {
    return field.required ?? false;
  };

  // Base dark theme styles for text fields
  const darkThemeTextField = {
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
    '& .MuiOutlinedInput-input': {
      color: 'white',
    },
    '& .MuiIconButton-root': {
      color: 'white',
    },
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

      // Prepare submission data
      const submissionData = {
        job_id: jobType,
        equipment_type_id: typeConfig.value,  
        status: 'active',
        is_georeferenced: true,
        location: {
          latitude,
          longitude
        },
        data: {
          ...otherFields,
          is_interior: is_interior || false,
          floor: floorValue,
          barcode: barcode || null,
          photo: photo || null
        }
      };

      console.log('Final submission data:', JSON.stringify(submissionData, null, 2));
      console.log('Submitting equipment...');
      
      try {
        const success = await onSubmit(submissionData);
        console.log('Submit result:', success);
      } catch (submitError) {
        console.error('Error during submit:', submitError);
        throw submitError;
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
    // Get the field configuration from the equipment type
    const fieldConfig = selectedTypeConfig?.fields.find(f => f.name === field.name);
    
    switch (field.name) {
      case 'photo':
        return (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Photo
            </Typography>
            <TextField
              fullWidth
              value={formData[field.name] || ''}
              required={field.required}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      component="label"
                      title="Upload photo"
                      edge="end"
                    >
                      <FileUploadIcon />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData(prev => ({
                              ...prev,
                              [field.name]: file.name
                            }));
                          }
                        }}
                      />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
        );

      case 'barcode':
        return (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Barcode
            </Typography>
            <TextField
              fullWidth
              value={formData[field.name] || ''}
              required={field.required}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  [field.name]: e.target.value
                }));
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      component="label"
                      title="Upload barcode image"
                      edge="end"
                    >
                      <FileUploadIcon />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleBarcodeImageUpload}
                      />
                    </IconButton>
                    <IconButton
                      onClick={() => handleStartCapture('barcode')}
                      title="Scan barcode"
                      edge="end"
                    >
                      <QrCodeScannerIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
        );

      case 'floor':
        if (!formData.is_interior) return null;
        
        const floorOptions = FLOOR_OPTIONS;
        const defaultFloorValue = floorOptions.indexOf('G');
        
        return (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">
                Floor
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={useCustomFloor}
                    onChange={(e) => {
                      setUseCustomFloor(e.target.checked);
                      // When switching back to slider, set to 'G'
                      if (!e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          floor: 'G'
                        }));
                      }
                    }}
                  />
                }
                label="Custom"
                sx={{ m: 0 }}
              />
            </Box>
            
            {useCustomFloor ? (
              <TextField
                fullWidth
                size="small"
                placeholder="Enter custom floor..."
                value={formData.floor || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    floor: value === '' ? null : value
                  }));
                }}
              />
            ) : (
              <Box sx={{ px: 1, mt: 3, mb: 2 }}>
                <Slider
                  min={0}
                  max={floorOptions.length - 1}
                  defaultValue={defaultFloorValue}
                  value={floorOptions.indexOf(formData.floor || 'G')}
                  marks={floorOptions.map((label, index) => ({
                    value: index,
                    label
                  }))}
                  valueLabelDisplay="on"
                  valueLabelFormat={(index) => floorOptions[index as number]}
                  onChange={(_, index) => {
                    const value = floorOptions[index as number];
                    setFormData(prev => ({
                      ...prev,
                      floor: value
                    }));
                  }}
                  sx={{
                    '& .MuiSlider-valueLabel': {
                      background: 'rgba(0, 0, 0, 0.8)',
                      borderRadius: 1,
                      padding: '2px 6px',
                      fontSize: '0.75rem',
                    }
                  }}
                />
              </Box>
            )}
          </FormControl>
        );

      case 'is_interior':
        return (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(formData[field.name])}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      [field.name]: e.target.checked,
                      ...(e.target.checked ? {} : { floor: undefined })
                    }));
                  }}
                />
              }
              label={
                <Typography variant="subtitle2">
                  Interior Equipment
                </Typography>
              }
            />
          </FormControl>
        );

      default:
        return (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {field.label}
            </Typography>
            <TextField
              fullWidth
              value={formData[field.name] || ''}
              required={field.required}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  [field.name]: e.target.value
                }));
              }}
            />
          </FormControl>
        );
    }
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
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
                Location Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Property:</Typography>
                  <Typography variant="body2" color="text.primary">{propertyName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Property Type:</Typography>
                  <Typography variant="body2" color="text.primary">{propertyType}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Job Type:</Typography>
                  <Typography variant="body2" color="text.primary">{jobType}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Coordinates:</Typography>
                  <Typography variant="body2" color="text.primary">
                    {location[1].toFixed(6)}, {location[0].toFixed(6)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Equipment Type Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Equipment Type</InputLabel>
              <Select
                value={selectedType}
                label="Equipment Type"
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  // Reset form data when type changes
                  setFormData({});
                  setError(null);
                }}
                disabled={isSubmitting || isLoading}
                required
                sx={darkThemeTextField}
              >
                {Array.isArray(equipmentTypes) && equipmentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Main capture button for mobile flow */}
            {!showCaptureView && selectedType && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {showCaptureButtons && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<QrCodeScannerIcon />}
                      onClick={() => handleStartCapture('barcode')}
                      disabled={isCaptureLoading}
                    >
                      Scan Barcode
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PhotoCameraIcon />}
                      onClick={() => handleStartCapture('photo')}
                      disabled={isCaptureLoading}
                    >
                      Take Photo
                    </Button>
                  </>
                )}
              </Box>
            )}

            {/* Dynamic form fields */}
            {selectedType && getVisibleFields().map(field => (
              <React.Fragment key={field.name}>
                {renderField(field)}
              </React.Fragment>
            ))}

            {/* Camera View */}
            {showCaptureView && (
              <Box mt={2} position="relative" width="100%" height={300}>
                <video
                  id="video-stream"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                  autoPlay
                  playsInline
                />
                {/* Rest of the camera view UI */}
              </Box>
            )}
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
