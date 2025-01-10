'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Checkbox,
    ListItemText,
    Chip
} from '@mui/material';
import type { FormField, Condition } from '@/app/(pages)/settings/equipment/types/components/types';
import { isSelectConfig } from '@/app/(pages)/settings/equipment/types/components/types';

interface RuleDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (condition: Condition) => void;
    field: FormField;
    availableFields: FormField[]; // Other fields that can be targeted
}

export function RuleDialog({ open, onClose, onSave, field, availableFields }: RuleDialogProps) {
    const [operator, setOperator] = useState<Condition['operator']>('equals');
    const [value, setValue] = useState<string>('');
    const [targetFields, setTargetFields] = useState<string[]>([]);
    const [action, setAction] = useState<Condition['action']>('show');

    const handleSave = () => {
        onSave({
            operator,
            value,
            targetFields,
            action
        });
        handleClose();
    };

    const handleClose = () => {
        setOperator('equals');
        setValue('');
        setTargetFields([]);
        setAction('show');
        onClose();
    };

    const getOperatorsByFieldType = (fieldType?: string) => {
        const commonOperators = [
            { value: 'equals', label: 'Equals' },
            { value: 'notEquals', label: 'Does Not Equal' }
        ];

        switch (fieldType) {
            case 'number':
                return [
                    ...commonOperators,
                    { value: 'greaterThan', label: 'Greater Than' },
                    { value: 'lessThan', label: 'Less Than' },
                    { value: 'greaterThanOrEqual', label: 'Greater Than or Equal' },
                    { value: 'lessThanOrEqual', label: 'Less Than or Equal' }
                ];
            case 'text':
            case 'textarea':
                return [
                    ...commonOperators,
                    { value: 'contains', label: 'Contains' },
                    { value: 'notContains', label: 'Does Not Contain' },
                    { value: 'startsWith', label: 'Starts With' },
                    { value: 'endsWith', label: 'Ends With' }
                ];
            case 'checkbox':
                return [
                    { value: 'equals', label: 'Is Checked' },
                    { value: 'notEquals', label: 'Is Not Checked' }
                ];
            default:
                return commonOperators;
        }
    };

    const getValueInput = () => {
        switch (field.type) {
            case 'checkbox':
                return null; // No value input needed for checkbox
            case 'select':
                if (isSelectConfig(field.config)) {
                    return (
                        <FormControl fullWidth>
                            <InputLabel>Value</InputLabel>
                            <Select
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                label="Value"
                            >
                                {field.config.options.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    );
                }
                return null;
            case 'number':
                return (
                    <TextField
                        label="Value"
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        fullWidth
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
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Rule for {field.label}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        When this field:
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel>Operator</InputLabel>
                        <Select
                            value={operator}
                            onChange={(e) => setOperator(e.target.value as Condition['operator'])}
                            label="Operator"
                        >
                            {getOperatorsByFieldType(field.type).map(op => (
                                <MenuItem key={op.value} value={op.value}>
                                    {op.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {getValueInput()}

                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                        Then:
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel>Action</InputLabel>
                        <Select
                            value={action}
                            onChange={(e) => setAction(e.target.value as Condition['action'])}
                            label="Action"
                        >
                            <MenuItem value="show">Show</MenuItem>
                            <MenuItem value="hide">Hide</MenuItem>
                            <MenuItem value="require">Make Required</MenuItem>
                            <MenuItem value="notRequired">Make Not Required</MenuItem>
                            <MenuItem value="enable">Enable</MenuItem>
                            <MenuItem value="disable">Disable</MenuItem>
                        </Select>
                    </FormControl>

                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                        These fields:
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel>Fields</InputLabel>
                        <Select
                            multiple
                            value={targetFields}
                            onChange={(e) => setTargetFields(typeof e.target.value === 'string' ? [e.target.value] : e.target.value)}
                            label="Fields"
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const targetField = availableFields.find(f => f.name === value);
                                        return (
                                            <Chip 
                                                key={value} 
                                                label={targetField?.label || value} 
                                                size="small"
                                            />
                                        );
                                    })}
                                </Box>
                            )}
                        >
                            {availableFields.map((targetField) => (
                                <MenuItem key={targetField.name} value={targetField.name}>
                                    <Checkbox checked={targetFields.indexOf(targetField.name) > -1} />
                                    <ListItemText primary={targetField.label} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">Cancel</Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    disabled={!targetFields.length || (!value && field.type !== 'checkbox')}
                >
                    Add Rule
                </Button>
            </DialogActions>
        </Dialog>
    );
}
