'use client';

import React from 'react';
import { Box, Button, TextField, Select, MenuItem, FormControlLabel, Checkbox, FormControl, InputLabel } from '@mui/material';
import { NewFieldState } from './types';

interface Props {
    typeName: string;
    field: NewFieldState;
    onFieldChange: (typeName: string, field: NewFieldState) => void;
    onAddField: (typeName: string) => void;
}

export function AddFieldForm({ typeName, field, onFieldChange, onAddField }: Props) {
    const handleChange = (updates: Partial<NewFieldState>) => {
        onFieldChange(typeName, { ...field, ...updates });
    };

    return (
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="Field Name"
                    value={field.name}
                    onChange={(e) => handleChange({ name: e.target.value })}
                    sx={{ flex: 1 }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Field Type</InputLabel>
                    <Select
                        value={field.type}
                        onChange={(e) => handleChange({ type: e.target.value })}
                        label="Field Type"
                    >
                        <MenuItem value="string">Text</MenuItem>
                        <MenuItem value="number-input">Number Input</MenuItem>
                        <MenuItem value="number-stepper">Number Stepper</MenuItem>
                        <MenuItem value="slider">Slider</MenuItem>
                        <MenuItem value="select">Select</MenuItem>
                        <MenuItem value="checkbox">Checkbox</MenuItem>
                        <MenuItem value="date">Date</MenuItem>
                    </Select>
                </FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={field.required}
                            onChange={(e) => handleChange({ required: e.target.checked })}
                        />
                    }
                    label="Required"
                />
            </Box>

            {field.type === 'select' && (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        label="New Option"
                        value={field.newOption}
                        onChange={(e) => handleChange({ newOption: e.target.value })}
                        sx={{ flex: 1 }}
                    />
                    <Button
                        variant="outlined"
                        onClick={() => {
                            if (field.newOption && !field.options.includes(field.newOption)) {
                                handleChange({
                                    options: [...field.options, field.newOption],
                                    newOption: ''
                                });
                            }
                        }}
                    >
                        Add Option
                    </Button>
                </Box>
            )}

            {['number-input', 'number-stepper', 'slider'].includes(field.type) && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        type="number"
                        label="Min"
                        value={field.numberConfig.min ?? ''}
                        onChange={(e) => handleChange({
                            numberConfig: { ...field.numberConfig, min: Number(e.target.value) }
                        })}
                    />
                    <TextField
                        type="number"
                        label="Max"
                        value={field.numberConfig.max ?? ''}
                        onChange={(e) => handleChange({
                            numberConfig: { ...field.numberConfig, max: Number(e.target.value) }
                        })}
                    />
                    <TextField
                        type="number"
                        label="Step"
                        value={field.numberConfig.step ?? ''}
                        onChange={(e) => handleChange({
                            numberConfig: { ...field.numberConfig, step: Number(e.target.value) }
                        })}
                    />
                </Box>
            )}

            <Button
                variant="contained"
                onClick={() => onAddField(typeName)}
                disabled={!field.name}
            >
                Add Field
            </Button>
        </Box>
    );
}
