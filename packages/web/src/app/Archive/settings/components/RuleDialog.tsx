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

export default function RuleDialog({
    open,
    onClose,
    onSave,
    fields,
    currentFieldName
}: Props) {
    const [selectedField, setSelectedField] = useState('');
    const [value, setValue] = useState<any>('');
    const [makeRequired, setMakeRequired] = useState(false);

    const availableFields = fields.filter(f => f.name !== currentFieldName);
    const selectedFieldConfig = fields.find(f => f.name === selectedField);

    const handleSave = () => {
        onSave({
            field: selectedField,
            value,
            makeRequired
        });
        setSelectedField('');
        setValue('');
        setMakeRequired(false);
    };

    const renderValueInput = () => {
        if (!selectedFieldConfig) return null;

        switch (selectedFieldConfig.type) {
            case 'select':
                return (
                    <FormControl fullWidth>
                        <InputLabel>Value</InputLabel>
                        <Select
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            label="Value"
                        >
                            {selectedFieldConfig.options?.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );

            case 'checkbox':
                return (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={value}
                                onChange={(e) => setValue(e.target.checked)}
                            />
                        }
                        label="Value"
                    />
                );

            case 'number-input':
            case 'number-stepper':
            case 'slider':
                return (
                    <TextField
                        type="number"
                        label="Value"
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        fullWidth
                        inputProps={{
                            min: selectedFieldConfig.numberConfig?.min,
                            max: selectedFieldConfig.numberConfig?.max,
                            step: selectedFieldConfig.numberConfig?.step
                        }}
                    />
                );

            default:
                return (
                    <TextField
                        label="Value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        fullWidth
                    />
                );
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Conditional Rule</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>When Field</InputLabel>
                        <Select
                            value={selectedField}
                            onChange={(e) => setSelectedField(e.target.value)}
                            label="When Field"
                        >
                            {availableFields.map((field) => (
                                <MenuItem key={field.name} value={field.name}>
                                    {field.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedField && renderValueInput()}

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={makeRequired}
                                onChange={(e) => setMakeRequired(e.target.checked)}
                            />
                        }
                        label="Make field required when condition is met"
                    />
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
