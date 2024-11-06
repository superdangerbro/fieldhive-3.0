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
    FormControlLabel,
    Checkbox,
    Box,
    Typography
} from '@mui/material';
import type { Condition, FormField } from './types';
import { isSelectConfig } from './types';

interface RuleDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (condition: Condition) => void;
    availableFields: FormField[];
    currentFieldName: string;
}

export function RuleDialog({ open, onClose, onSave, availableFields, currentFieldName }: RuleDialogProps) {
    const [selectedField, setSelectedField] = useState<string>('');
    const [selectedValue, setSelectedValue] = useState<string | boolean>('');
    const [makeRequired, setMakeRequired] = useState(false);

    const handleSave = () => {
        onSave({
            field: selectedField,
            value: selectedValue,
            makeRequired
        });
        handleClose();
    };

    const handleClose = () => {
        setSelectedField('');
        setSelectedValue('');
        setMakeRequired(false);
        onClose();
    };

    // Filter out the current field and get valid fields for conditions
    const validFields = availableFields.filter(field => 
        field.name !== currentFieldName && 
        (field.type === 'select' || field.type === 'checkbox')
    );

    // Get the selected field's possible values
    const getFieldValues = () => {
        const field = availableFields.find(f => f.name === selectedField);
        if (!field) return [];

        if (field.type === 'checkbox') {
            return [true, false];
        }

        if (field.type === 'select' && isSelectConfig(field.config)) {
            return field.config.options;
        }

        return [];
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Condition</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                    {validFields.length === 0 ? (
                        <Typography color="error">
                            No valid fields available for conditions. Add checkbox or dropdown fields first.
                        </Typography>
                    ) : (
                        <>
                            <FormControl fullWidth>
                                <InputLabel>When field</InputLabel>
                                <Select
                                    value={selectedField}
                                    onChange={(e) => {
                                        setSelectedField(e.target.value);
                                        setSelectedValue('');
                                    }}
                                    label="When field"
                                >
                                    {validFields.map(field => (
                                        <MenuItem key={field.name} value={field.name}>
                                            {field.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {selectedField && (
                                <FormControl fullWidth>
                                    <InputLabel>Has value</InputLabel>
                                    <Select
                                        value={String(selectedValue)}
                                        onChange={(e) => setSelectedValue(e.target.value === 'true' ? true : e.target.value === 'false' ? false : e.target.value)}
                                        label="Has value"
                                    >
                                        {getFieldValues().map((value: string | boolean) => (
                                            <MenuItem key={String(value)} value={String(value)}>
                                                {String(value)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={makeRequired}
                                        onChange={(e) => setMakeRequired(e.target.checked)}
                                    />
                                }
                                label="Make this field required when condition is met"
                            />
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button 
                    onClick={handleSave}
                    variant="contained"
                    disabled={!selectedField || selectedValue === ''}
                >
                    Add Condition
                </Button>
            </DialogActions>
        </Dialog>
    );
}
