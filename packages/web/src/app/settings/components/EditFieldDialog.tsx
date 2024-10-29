'use client';

import React, { useState } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Box,
    Typography,
    Chip,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FormField } from './types';
import NumberFieldConfig from './NumberFieldConfig';

interface Props {
    open: boolean;
    field: FormField;
    onClose: () => void;
    onSave: (field: FormField) => void;
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

export default function EditFieldDialog({ open, field, onClose, onSave }: Props) {
    const [editedField, setEditedField] = useState<FormField>({ ...field });
    const [newOption, setNewOption] = useState('');

    const handleSave = () => {
        onSave(editedField);
        onClose();
    };

    const handleAddOption = () => {
        if (newOption && !editedField.options?.includes(newOption)) {
            setEditedField({
                ...editedField,
                options: [...(editedField.options || []), newOption]
            });
            setNewOption('');
        }
    };

    const handleRemoveOption = (optionToRemove: string) => {
        setEditedField({
            ...editedField,
            options: editedField.options?.filter(option => option !== optionToRemove)
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Field</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Field Name"
                        value={editedField.name}
                        onChange={(e) => setEditedField({ ...editedField, name: e.target.value })}
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <InputLabel>Field Type</InputLabel>
                        <Select
                            value={editedField.type}
                            onChange={(e) => setEditedField({ 
                                ...editedField, 
                                type: e.target.value,
                                // Reset type-specific configs when type changes
                                options: e.target.value === 'select' ? [] : undefined,
                                numberConfig: ['number-input', 'number-stepper', 'slider'].includes(e.target.value) 
                                    ? { min: 0, step: 1 }
                                    : undefined
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
                                checked={editedField.required}
                                onChange={(e) => setEditedField({ ...editedField, required: e.target.checked })}
                            />
                        }
                        label="Required"
                    />

                    {/* Select Options */}
                    {editedField.type === 'select' && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Options
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <TextField
                                    label="New Option"
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
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
                                {editedField.options?.map((option) => (
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
                    {['number-input', 'number-stepper', 'slider'].includes(editedField.type) && (
                        <NumberFieldConfig
                            config={editedField.numberConfig || { min: 0, step: 1 }}
                            onChange={(config) => setEditedField({ ...editedField, numberConfig: config })}
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
}
