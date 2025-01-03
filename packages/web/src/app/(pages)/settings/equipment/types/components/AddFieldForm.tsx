'use client';

import React, { useState, useEffect } from 'react';
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
    Divider,
    Slider
} from '@mui/material';
import type { FieldType, FormField } from './types';
import { isNumberConfig, isSelectConfig } from './types';
import { NumberFieldConfig } from '../components/NumberFieldConfig';
import { SelectFieldConfig } from '../components/SelectFieldConfig';
import { SavedFields } from './SavedFields';

interface AddFieldFormProps {
    onAdd: (field: FormField) => void;
    onCancel: () => void;
    existingFields: string[];
    initialField?: FormField;
    mode?: 'add' | 'edit';
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Dropdown' },
    { value: 'multiselect', label: 'Multiselect' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'boolean', label: 'Boolean Switch' },
    { value: 'slider', label: 'Slider' }
];

export function AddFieldForm({ onAdd, onCancel, existingFields, initialField, mode = 'add' }: AddFieldFormProps) {
    console.log('AddFieldForm render:', { initialField, mode });
    const [field, setField] = useState<FormField>(() => initialField || {
        name: '',
        label: '',
        type: 'text',
        required: false
    });

    useEffect(() => {
        console.log('Current field state:', field);
    }, [field]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting field:', field);
        
        // Only check for duplicates in add mode
        if (mode === 'add' && existingFields.includes(field.name)) {
            console.warn('Field name already exists:', field.name);
            alert('A field with this name already exists');
            return;
        }

        onAdd(field);
        if (mode === 'add') {
            setField({
                name: '',
                label: '',
                type: 'text',
                required: false
            });
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        console.log('Name change:', { name });
        setField(prev => ({

            ...prev,
            name,
            label: name // Use the same value for both
        }));
    };

    const handleFieldTypeChange = (type: FieldType) => {
        setField(prev => {
            const newField = { ...prev, type };
            
            // Initialize config based on type
            switch (type) {
                case 'number':
                    newField.config = { min: 0, max: 100, step: 1 };
                    break;
                case 'select':
                case 'multiselect':
                    newField.config = { options: [] };
                    break;
                case 'slider':
                    newField.config = { 
                        min: -5, 
                        max: 10,
                        step: 1,
                        marks: [
                            { value: -5, label: 'L5' },
                            { value: -4, label: 'L4' },
                            { value: -3, label: 'L3' },
                            { value: -2, label: 'L2' },
                            { value: -1, label: 'L1' },
                            { value: 0, label: 'G' },
                            { value: 1, label: '1' },
                            { value: 5, label: '5' },
                            { value: 10, label: '10' }
                        ]
                    };
                    break;
                default:
                    newField.config = undefined;
            }
            
            return newField;
        });
    };

    const handleConfigChange = (config: any) => {
        console.log('Config change:', { config });
        setField(prev => ({
            ...prev,
            config
        }));
    };

    const renderFieldConfig = () => {
        switch (field.type) {
            case 'number':
                return (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Number Configuration
                        </Typography>
                        <NumberFieldConfig
                            config={field.config as NumberConfig}
                            onChange={(config) => setField(prev => ({ ...prev, config }))}
                        />
                    </Box>
                );
            case 'select':
            case 'multiselect':
                return (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Options
                        </Typography>
                        <SelectFieldConfig
                            config={field.config as SelectConfig | MultiSelectConfig}
                            onChange={(config) => setField(prev => ({ ...prev, config }))}
                        />
                    </Box>
                );
            case 'slider':
                return (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Slider Configuration
                        </Typography>
                        <Slider
                            min={field.config.min}
                            max={field.config.max}
                            step={field.config.step}
                            marks={field.config.marks}
                            value={field.value}
                            onChange={(e, value) => setField(prev => ({ ...prev, value }))}
                        />
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box>
            <Typography variant="subtitle2" gutterBottom>
                Saved Fields
            </Typography>
            <SavedFields 
                onAddFields={(fields) => {
                    fields.forEach(field => onAdd(field));
                }} 
                existingFields={existingFields}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
                Custom Field
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6">
                    {mode === 'add' ? 'Add Field' : 'Edit Field'}
                </Typography>
                
                <TextField
                    label="Field Name"
                    value={field.name}
                    onChange={handleNameChange}
                    required
                    helperText="Name shown to users"
                />

                <FormControl fullWidth>
                    <InputLabel>Field Type</InputLabel>
                    <Select
                        value={field.type}
                        onChange={(e) => handleFieldTypeChange(e.target.value as FieldType)}
                        label="Field Type"
                        disabled={mode === 'edit'} // Can't change type in edit mode
                    >
                        {FIELD_TYPES.map(type => (
                            <MenuItem key={type.value} value={type.value}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {renderFieldConfig()}

                <TextField
                    label="Description"
                    value={field.description || ''}
                    onChange={(e) => setField(prev => ({ ...prev, description: e.target.value }))}
                    multiline
                    rows={2}
                    helperText="Optional help text for this field"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={field.required}
                            onChange={(e) => setField(prev => ({ ...prev, required: e.target.checked }))}
                        />
                    }
                    label="Required Field"
                />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained"
                        disabled={!field.name}
                    >
                        {mode === 'add' ? 'Add Field' : 'Save Changes'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
