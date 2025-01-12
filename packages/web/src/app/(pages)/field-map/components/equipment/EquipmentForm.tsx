'use client';

import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Slider,
  FormHelperText,
  Typography,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { FormField } from '@/app/globalTypes/equipment';

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

interface EquipmentFormProps {
  fields: FormField[];
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
}

export function EquipmentForm({ fields, formData, onChange, errors = {} }: EquipmentFormProps) {
  const renderField = (field: FormField) => {
    const value = formData[field.name] ?? '';
    const error = errors[field.name];

    switch (field.type) {
      case 'capture-flow':
        return (
          <Box key={field.name} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {field.label}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {field.config?.requireBarcode && (
                <DarkTextField
                  fullWidth
                  label="Barcode"
                  value={value.barcode || ''}
                  onChange={(e) => onChange(field.name, { ...value, barcode: e.target.value })}
                  error={!!error}
                  helperText={error || 'Scan or enter equipment barcode'}
                  required={true}
                />
              )}
              {field.config?.requirePhoto && (
                <Box>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChange(field.name, { ...value, photo: file });
                      }
                    }}
                    style={{ display: 'none' }}
                    id={`photo-upload-${field.name}`}
                  />
                  <label htmlFor={`photo-upload-${field.name}`}>
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.4)'
                        }
                      }}
                    >
                      {value.photo ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                  </label>
                  {field.config?.photoInstructions && (
                    <FormHelperText>{field.config.photoInstructions}</FormHelperText>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        );

      case 'text':
      case 'textarea':
        return (
          <DarkTextField
            key={field.name}
            fullWidth
            label={field.label}
            name={field.name}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            error={!!error}
            helperText={error || field.description}
            required={field.required}
            multiline={field.type === 'textarea'}
            rows={field.type === 'textarea' ? 4 : 1}
          />
        );

      case 'number':
        if (field.config?.min !== undefined && field.config?.max !== undefined) {
          return (
            <Box key={field.name}>
              <Typography gutterBottom>{field.label}</Typography>
              <Slider
                value={value || field.config.min}
                onChange={(_, newValue) => onChange(field.name, newValue)}
                min={field.config.min}
                max={field.config.max}
                step={field.config.step || 1}
                valueLabelDisplay="auto"
                sx={{ color: 'white' }}
              />
              {error && <FormHelperText error>{error}</FormHelperText>}
              {field.description && <FormHelperText>{field.description}</FormHelperText>}
            </Box>
          );
        }
        return (
          <DarkTextField
            key={field.name}
            fullWidth
            label={field.label}
            name={field.name}
            type="number"
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            error={!!error}
            helperText={error || field.description}
            required={field.required}
            inputProps={{
              min: field.config?.min,
              max: field.config?.max,
              step: field.config?.step || 1,
            }}
          />
        );

      case 'select':
        return (
          <FormControl key={field.name} fullWidth error={!!error}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>{field.label}</InputLabel>
            <DarkSelect
              value={value}
              onChange={(e) => onChange(field.name, e.target.value)}
              label={field.label}
              required={field.required}
            >
              {field.config?.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </DarkSelect>
            {(error || field.description) && (
              <FormHelperText>{error || field.description}</FormHelperText>
            )}
          </FormControl>
        );

      case 'checkbox':
      case 'boolean':
        return (
          <FormControl key={field.name} fullWidth error={!!error}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!value}
                  onChange={(e) => onChange(field.name, e.target.checked)}
                  sx={{
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
                  }}
                />
              }
              label={field.label}
            />
            {(error || field.description) && (
              <FormHelperText>{error || field.description}</FormHelperText>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {fields.map((field) => (
        <Box key={field.name}>
          {renderField(field)}
        </Box>
      ))}
    </Box>
  );
}
