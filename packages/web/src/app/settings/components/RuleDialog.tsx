'use client';

import React, { useState } from 'react';
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
    TextField,
    Box,
    Typography,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { FormField } from './types';

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (condition: { field: string; value: any; makeRequired?: boolean }) => void;
    fields: FormField[];
    currentFieldName: string;
}

export default function RuleDialog({ open, onClose, onSave, fields, currentFieldName }: Props) {
    const [selectedField, setSelectedField] = useState('');
    const [value, setValue] = useState<any>('');
    const [makeRequired, setMakeRequired] = useState(false);

    // Filter out the current field and get available fields
    const availableFields = fields.filter(field => field.name !== currentFieldName);

    const handleSave = () => {
        if (selectedField && value !== '') {
            onSave({ 
                field: selectedField, 
                value,
                makeRequired 
            });
            setSelectedField('');
            setValue('');
            setMakeRequired(false);
            onClose();
        }
    };

    const getValueInput = () => {
        const field = fields.find(f => f.name === selectedField);
        if (!field) return null;

        switch (field.type) {
            case 'select':
                return (
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Value</InputLabel>
                        <Select
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            label="Value"
                        >
                            {field.options?.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 'boolean':
                return (
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Value</InputLabel>
                        <Select
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            label="Value"
                        >
                            <MenuItem value="true">True</MenuItem>
                            <MenuItem value="false">False</MenuItem>
                        </Select>
                    </FormControl>
                );
            case 'number-input':
            case 'number-stepper':
            case 'slider':
                return (
                    <TextField
                        fullWidth
                        label="Value"
                        type="number"
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        sx={{ mt: 2 }}
                        inputProps={{
                            min: field.numberConfig?.min,
                            max: field.numberConfig?.max,
                            step: field.numberConfig?.step
                        }}
                    />
                );
            default:
                return (
                    <TextField
                        fullWidth
                        label="Value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                );
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Display Rule</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Show this field when another field matches a specific value
                    </Typography>

                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Field</InputLabel>
                        <Select
                            value={selectedField}
                            onChange={(e) => {
                                setSelectedField(e.target.value);
                                setValue('');
                            }}
                            label="Field"
                        >
                            {availableFields.map((field) => (
                                <MenuItem key={field.name} value={field.name}>
                                    {field.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedField && getValueInput()}

                    {selectedField && (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={makeRequired}
                                    onChange={(e) => setMakeRequired(e.target.checked)}
                                />
                            }
                            label="Make field required when shown"
                            sx={{ mt: 2 }}
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSave}
                    variant="contained"
                    disabled={!selectedField || value === ''}
                >
                    Add Rule
                </Button>
            </DialogActions>
        </Dialog>
    );
}
