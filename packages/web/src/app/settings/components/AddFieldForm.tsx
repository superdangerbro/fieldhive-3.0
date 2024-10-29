'use client';

import React from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    FormControlLabel, 
    Checkbox,
    Typography,
    Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { NewFieldState } from './types';
import NumberFieldConfig from './NumberFieldConfig';

interface Props {
    typeName: string;
    field: NewFieldState;
    onFieldChange: (typeName: string, field: NewFieldState) => void;
    onAddField: (typeName: string) => void;
}

const FIELD_TYPES = [
    'string',
    'textarea',
    'number-input',
    'number-stepper',
    'slider',
    'select',
    'boolean'
];

export default function AddFieldForm({ typeName, field, onFieldChange, onAddField }: Props) {
    const handleAddOption = () => {
        if (field.newOption && !field.options.includes(field.newOption)) {
            onFieldChange(typeName, {
                ...field,
                options: [...field.options, field.newOption],
                newOption: ''
            });
        }
    };

    const handleRemoveOption = (optionToRemove: string) => {
        onFieldChange(typeName, {
            ...field,
            options: field.options.filter(option => option !== optionToRemove)
        });
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Add Field
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Field Name"
                    value={field.name}
                    onChange={(e) => onFieldChange(typeName, { ...field, name: e.target.value })}
                    fullWidth
                />

                <FormControl fullWidth>
                    <InputLabel>Field Type</InputLabel>
                    <Select
                        value={field.type}
                        onChange={(e) => onFieldChange(typeName, { 
                            ...field, 
                            type: e.target.value,
                            // Reset type-specific configs when type changes
                            options: e.target.value === 'select' ? [] : field.options,
                            numberConfig: ['number-input', 'number-stepper', 'slider'].includes(e.target.value) 
                                ? { min: 0, step: 1 }
                                : field.numberConfig
                        })}
                        label="Field Type"
                    >
                        {FIELD_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={field.required}
                            onChange={(e) => onFieldChange(typeName, { ...field, required: e.target.checked })}
                        />
                    }
                    label="Required"
                />

                {/* Select Options */}
                {field.type === 'select' && (
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Options
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                                label="New Option"
                                value={field.newOption}
                                onChange={(e) => onFieldChange(typeName, { ...field, newOption: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                onClick={handleAddOption}
                                startIcon={<AddIcon />}
                            >
                                Add
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {field.options.map((option) => (
                                <Chip
                                    key={option}
                                    label={option}
                                    onDelete={() => handleRemoveOption(option)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Number Configuration */}
                {['number-input', 'number-stepper', 'slider'].includes(field.type) && (
                    <NumberFieldConfig
                        config={field.numberConfig}
                        onChange={(config) => onFieldChange(typeName, { ...field, numberConfig: config })}
                    />
                )}

                <Button
                    variant="contained"
                    onClick={() => onAddField(typeName)}
                    disabled={!field.name}
                    startIcon={<AddIcon />}
                >
                    Add Field
                </Button>
            </Box>
        </Box>
    );
}
