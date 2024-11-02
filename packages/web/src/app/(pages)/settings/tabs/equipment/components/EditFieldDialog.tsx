'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Box,
    Chip,
    IconButton,
    FormControl,
    InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormField } from '../types';

interface Props {
    open: boolean;
    field: FormField;
    onClose: () => void;
    onSave: (field: FormField) => void;
}

export function EditFieldDialog({ open, field, onClose, onSave }: Props) {
    const [editedField, setEditedField] = useState<FormField>({ ...field });
    const [newOption, setNewOption] = useState('');

    const handleChange = (updates: Partial<FormField>) => {
        setEditedField(prev => ({ ...prev, ...updates }));
    };

    const handleAddOption = () => {
        if (newOption && !editedField.options?.includes(newOption)) {
            handleChange({
                options: [...(editedField.options || []), newOption]
            });
            setNewOption('');
        }
    };

    const handleRemoveOption = (option: string) => {
        handleChange({
            options: editedField.options?.filter(o => o !== option)
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Field: {field.name}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        label="Field Name"
                        value={editedField.name}
                        onChange={(e) => handleChange({ name: e.target.value })}
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <InputLabel>Field Type</InputLabel>
                        <Select
                            value={editedField.type}
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
                                checked={editedField.required}
                                onChange={(e) => handleChange({ required: e.target.checked })}
                            />
                        }
                        label="Required"
                    />

                    {editedField.type === 'select' && (
                        <Box>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <TextField
                                    label="New Option"
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                    fullWidth
                                />
                                <Button variant="outlined" onClick={handleAddOption}>
                                    Add
                                </Button>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {editedField.options?.map((option) => (
                                    <Chip
                                        key={option}
                                        label={option}
                                        onDelete={() => handleRemoveOption(option)}
                                        deleteIcon={<DeleteIcon />}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {['number-input', 'number-stepper', 'slider'].includes(editedField.type) && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                type="number"
                                label="Min"
                                value={editedField.numberConfig?.min ?? ''}
                                onChange={(e) => handleChange({
                                    numberConfig: {
                                        ...editedField.numberConfig,
                                        min: Number(e.target.value)
                                    }
                                })}
                            />
                            <TextField
                                type="number"
                                label="Max"
                                value={editedField.numberConfig?.max ?? ''}
                                onChange={(e) => handleChange({
                                    numberConfig: {
                                        ...editedField.numberConfig,
                                        max: Number(e.target.value)
                                    }
                                })}
                            />
                            <TextField
                                type="number"
                                label="Step"
                                value={editedField.numberConfig?.step ?? ''}
                                onChange={(e) => handleChange({
                                    numberConfig: {
                                        ...editedField.numberConfig,
                                        step: Number(e.target.value)
                                    }
                                })}
                            />
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={() => onSave(editedField)} variant="contained">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
