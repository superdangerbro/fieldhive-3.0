import React from 'react';
import {
    Box,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import type { FormField } from './types';

const FIELD_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Yes/No' },
    { value: 'select', label: 'Select' },
    { value: 'capture-flow', label: 'Capture Flow' },
] as const;

interface AddFieldFormProps {
    onAdd: (field: FormField) => void;
    onCancel: () => void;
    existingFields: string[];
    initialValues?: FormField;
}

export function AddFieldForm({ onAdd, onCancel, existingFields, initialValues }: AddFieldFormProps) {
    const [field, setField] = React.useState<FormField>(() => {
        if (initialValues) {
            console.log('Initializing with values:', initialValues); // Debug log
            return { ...initialValues };
        }
        return {
            id: `field-${Math.random().toString(36).substr(2, 9)}`,
            name: '',
            label: '',
            type: 'text',
            description: '',
            showWhen: [],
            config: {},
            order: 0
        };
    });

    const [error, setError] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate name
        const normalizedName = field.name.toLowerCase().replace(/\s+/g, '_');
        if (!normalizedName) {
            setError('Name is required');
            return;
        }
        
        // Check for duplicates only if this is a new field or the name has changed
        if (!initialValues || initialValues.name !== normalizedName) {
            if (existingFields.includes(normalizedName)) {
                setError('A field with this name already exists');
                return;
            }
        }

        console.log('Submitting field:', { ...field, name: normalizedName }); // Debug log
        
        // Add field with ID and order
        onAdd({
            ...field,
            id: field.id || `field-${Math.random().toString(36).substr(2, 9)}`,
            name: normalizedName,
            order: existingFields.length
        });
    };

    const handleTypeChange = (type: string) => {
        setField(prev => {
            const newField = { ...prev, type };
            
            // Add default config for specific types
            if (type === 'capture-flow') {
                newField.config = {
                    requireBarcode: true,
                    requirePhoto: true,
                    photoInstructions: ''
                };
            } else if (type === 'select') {
                newField.config = {
                    options: []
                };
            } else {
                newField.config = {};
            }
            
            return newField;
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label="Field Name"
                value={field.name}
                onChange={(e) => {
                    setField(prev => ({ ...prev, name: e.target.value }));
                    setError('');
                }}
                fullWidth
                required
                error={!!error}
                helperText={error || 'Use lowercase letters, numbers, and underscores'}
                disabled={field.type === 'capture-flow'} // Disable name field for capture-flow
            />
            
            <TextField
                label="Display Label"
                value={field.label}
                onChange={(e) => setField(prev => ({ ...prev, label: e.target.value }))}
                fullWidth
                required
            />

            <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                    value={field.type}
                    label="Type"
                    onChange={(e) => handleTypeChange(e.target.value)}
                >
                    {FIELD_TYPES.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                            {type.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="Description"
                value={field.description || ''}
                onChange={(e) => setField(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
            />

            {field.type === 'select' && (
                <TextField
                    label="Options"
                    value={field.config?.options?.join(', ') || ''}
                    onChange={(e) => setField(prev => ({
                        ...prev,
                        config: {
                            ...prev.config,
                            options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        }
                    }))}
                    fullWidth
                    helperText="Enter options separated by commas"
                />
            )}

            {field.type === 'capture-flow' && (
                <>
                    <TextField
                        label="Photo Instructions"
                        value={field.config?.photoInstructions || ''}
                        onChange={(e) => setField(prev => ({
                            ...prev,
                            config: {
                                ...prev.config,
                                photoInstructions: e.target.value
                            }
                        }))}
                        fullWidth
                        multiline
                        rows={2}
                    />
                </>
            )}

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="contained">
                    {initialValues ? 'Save Changes' : 'Add Field'}
                </Button>
            </Box>
        </Box>
    );
}
