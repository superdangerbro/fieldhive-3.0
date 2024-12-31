'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  TextareaAutosize,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
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
  onSubmit: (data: { 
    type: string;
    status: string;
    data: Record<string, any>;
  }) => Promise<void>;
  propertyName: string;
  propertyType: string;
  jobType: string;
  jobTitle?: string;
  accounts?: string[];
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
  propertyName,
  propertyType,
  jobType,
  jobTitle,
  accounts,
}: AddEquipmentDialogProps) {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedType('');
      setFormData({});
      setError(null);
    }
  }, [open]);

  // Clean up capture on dialog close
  useEffect(() => {
    if (!open) {
      cleanupCapture();
      setShowCaptureView(false);
    }
  }, [open, cleanupCapture]);

  // Get the selected equipment type configuration
  const selectedTypeConfig = equipmentTypes.find((t) => t.value === selectedType);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) {
      setError('Equipment type is required');
      return;
    }

    // Validate required fields
    const visibleFields = getVisibleFields();
    const missingFields = visibleFields
      .filter((field: Field) => isFieldRequired(field) && !formData[field.name])
      .map((field: Field) => field.name);

    if (missingFields.length > 0) {
      setError(`Required fields missing: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        type: selectedType,
        status: 'active',
        data: formData
      });
      onClose();
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
    switch (field.name) {
      case 'photo':
        return (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label={field.label || "Photo"}
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
                            const reader = new FileReader();
                            reader.onload = async (event) => {
                              const dataUrl = event.target?.result as string;
                              const compressedDataUrl = await compressImage(dataUrl);
                              setFormData(prev => ({
                                ...prev,
                                [field.name]: compressedDataUrl
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </IconButton>
                    <IconButton
                      onClick={() => setShowCaptureView(true)}
                      title="Take photo"
                      edge="end"
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={darkThemeTextField}
            />
            {formData[field.name] && (
              <Box sx={{ mt: 1 }}>
                <img 
                  src={formData[field.name]} 
                  alt="Equipment" 
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                />
              </Box>
            )}
          </FormControl>
        );

      case 'barcode':
        return (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label={field.label || "Barcode"}
              required={field.required}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [field.name]: e.target.value
              }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowCaptureView(true)}
                      edge="end"
                      title="Scan barcode"
                    >
                      <QrCodeScannerIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={darkThemeTextField}
            />
          </FormControl>
        );

      default:
        return (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label={field.label || field.name}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [field.name]: e.target.value
              }))}
              required={field.required}
              sx={darkThemeTextField}
            />
          </FormControl>
        );
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
          backgroundImage: 'none',
        }
      }}
    >
      <DialogTitle>
        Add Equipment
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Location Details */}
        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Location Details
          </Typography>
          <Typography variant="body2">
            <strong>Property:</strong> {propertyName}
          </Typography>
          <Typography variant="body2">
            <strong>Property Type:</strong> {propertyType}
          </Typography>
          {jobTitle && (
            <Typography variant="body2">
              <strong>Job Title:</strong> {jobTitle}
            </Typography>
          )}
          <Typography variant="body2">
            <strong>Job Type:</strong> {jobType}
          </Typography>
          <Typography variant="body2">
            <strong>Coordinates:</strong> {location[0].toFixed(6)}, {location[1].toFixed(6)}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Equipment Type Selection */}
        <FormControl fullWidth sx={{ mb: 4 }}>
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
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleStartCapture}
            disabled={isCaptureLoading}
            startIcon={<MobileScreenShareIcon />}
            sx={{ mb: 4 }}
          >
            Scan Barcode & Take Photo
          </Button>
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
          {isSubmitting ? 'Adding Equipment...' : 'Add Equipment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
