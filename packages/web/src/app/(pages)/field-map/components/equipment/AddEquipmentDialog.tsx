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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import MobileScreenShareIcon from '@mui/icons-material/MobileScreenShare';
import { useEquipmentTypes } from '@/app/(pages)/settings/equipment/hooks/useEquipment';
import { useCamera } from '@/app/hooks/useCamera';
import { useBarcode } from '@/app/hooks/useBarcode';
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
  accounts,
}: AddEquipmentDialogProps) {
  const { data: equipmentTypes = [], isLoading } = useEquipmentTypes();
  const { openCamera, takePhoto, isLoading: isCameraLoading } = useCamera();
  const { 
    scanBarcodeFromCamera, 
    scanBarcodeFromImage, 
    cleanup: cleanupBarcode, 
    isLoading: isBarcodeLoading 
  } = useBarcode();
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedType('');
      setFormData({});
      setError(null);
    }
  }, [open]);

  // Clean up barcode scanner on dialog close
  useEffect(() => {
    if (!open) {
      cleanupBarcode();
      setShowBarcodeScanner(false);
    }
  }, [open, cleanupBarcode]);

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
      setSelectedType('');
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

  const handleTakePhoto = async () => {
    try {
      const stream = await openCamera();
      const photoData = await takePhoto(stream);
      setFormData({ ...formData, photo: photoData });
    } catch (err) {
      console.error('Failed to take photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to take photo');
    }
  };

  const handleScanBarcode = async () => {
    try {
      setShowBarcodeScanner(true);
      const barcode = await scanBarcodeFromCamera();
      setFormData({ ...formData, barcode });
      setShowBarcodeScanner(false);
    } catch (err) {
      console.error('Failed to scan barcode:', err);
      setError(err instanceof Error ? err.message : 'Failed to scan barcode');
      setShowBarcodeScanner(false);
    }
  };

  const handleBarcodeImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const barcode = await scanBarcodeFromImage(file);
      setFormData({ ...formData, barcode });
    } catch (err) {
      console.error('Failed to scan barcode from image:', err);
      setError(err instanceof Error ? err.message : 'Failed to scan barcode from image');
    }
  };

  const renderField = (field: Field) => {
    switch (field.type) {
      case 'select':
        return (
          <FormControl fullWidth key={field.name}>
            <InputLabel>{field.label || field.name}</InputLabel>
            <Select
              value={formData[field.name] || ''}
              label={field.label || field.name}
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
            label={field.label || field.name}
          />
        );

      case 'textarea':
        return (
          <FormControl fullWidth key={field.name}>
            <Typography variant="subtitle2" gutterBottom>
              {field.label || field.name}
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
            label={field.label || field.name}
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

      case 'text':
        if (field.name === 'barcode') {
          return (
            <FormControl fullWidth key={field.name}>
              <TextField
                label={field.label || field.name}
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                required={isFieldRequired(field)}
                InputProps={{
                  endAdornment: (
                    <Box display="flex">
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleBarcodeImageUpload}
                      />
                      <IconButton
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isBarcodeLoading}
                        title="Upload barcode image"
                      >
                        <FileUploadIcon />
                      </IconButton>
                      <IconButton 
                        onClick={handleScanBarcode}
                        disabled={isBarcodeLoading}
                        title="Scan with camera"
                      >
                        {isBarcodeLoading ? (
                          <CircularProgress size={24} />
                        ) : (
                          <MobileScreenShareIcon />
                        )}
                      </IconButton>
                    </Box>
                  ),
                }}
              />
              {showBarcodeScanner && (
                <Box mt={1} position="relative" width="100%" height={300}>
                  <video
                    id="video-stream"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box
                      border={2}
                      borderColor="primary.main"
                      width={200}
                      height={200}
                      sx={{ borderStyle: 'dashed' }}
                    />
                  </Box>
                </Box>
              )}
            </FormControl>
          );
        } else if (field.name === 'photo') {
          return (
            <FormControl fullWidth key={field.name}>
              <TextField
                label={field.label || field.name}
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                required={isFieldRequired(field)}
                InputProps={{
                  endAdornment: (
                    <IconButton 
                      onClick={handleTakePhoto}
                      disabled={isCameraLoading}
                    >
                      {isCameraLoading ? (
                        <CircularProgress size={24} />
                      ) : (
                        <PhotoCameraIcon />
                      )}
                    </IconButton>
                  ),
                }}
              />
              {formData[field.name] && (
                <Box mt={1}>
                  <img 
                    src={formData[field.name]} 
                    alt="Equipment photo" 
                    style={{ maxWidth: '100%', maxHeight: '200px' }} 
                  />
                </Box>
              )}
            </FormControl>
          );
        }
        return (
          <FormControl fullWidth key={field.name}>
            <TextField
              label={field.label || field.name}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              required={isFieldRequired(field)}
            />
          </FormControl>
        );

      default:
        return (
          <FormControl fullWidth key={field.name}>
            <TextField
              label={field.label || field.name}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              required={isFieldRequired(field)}
            />
          </FormControl>
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            <Typography variant="h6" gutterBottom>Add Equipment</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Property: {propertyName} ({propertyType})
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Accounts: {accounts?.length ? accounts.join(', ') : 'None'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Job Type: {jobType || 'None'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Status: Active
            </Typography>
          </Box>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="close"
            sx={{ alignSelf: 'flex-start' }}
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
          {/* Context Information */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Location: {location[0].toFixed(6)}, {location[1].toFixed(6)}
            </Typography>
          </Box>

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
                setFormData({}); // Reset form data when type changes
              }}
              disabled={isSubmitting || isLoading}
              required
            >
              {Array.isArray(equipmentTypes) && equipmentTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedTypeConfig && getVisibleFields().map((field: Field) => renderField(field))}
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
          disabled={!selectedType || isSubmitting || isLoading}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Adding Equipment...' : 'Add Equipment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
