'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
    Typography,
    TextField,
    Chip,
    ListItemText
} from '@mui/material';
import type { Condition, FormField } from './types';
import { isSelectConfig } from './types';

interface RuleDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (condition: Condition) => void;
    availableFields: {
        equipment: FormField[];
        inspection: FormField[];
    };
    currentFieldName: string;
}

export function RuleDialog({ open, onClose, onSave, availableFields, currentFieldName }: RuleDialogProps) {
    console.log('RuleDialog Props:', { availableFields, currentFieldName });

    // Get the current field's configuration
    const currentFieldConfig = availableFields.equipment.find(f => f.name === currentFieldName) ||
        availableFields.inspection.find(f => f.name === currentFieldName);

    console.log('Current Field Config:', currentFieldConfig);

    const getOperatorsByFieldType = () => {
        console.log('Getting operators for field type:', currentFieldConfig?.type);
        
        if (!currentFieldConfig) {
            console.log('No field config found!');
            return [];
        }

        const commonOperators = [
            { value: 'equals', label: 'Equals' },
            { value: 'notEquals', label: 'Does Not Equal' }
        ];

        const textOperators = [
            { value: 'contains', label: 'Contains' },
            { value: 'notContains', label: 'Does Not Contain' },
            { value: 'startsWith', label: 'Starts With' },
            { value: 'endsWith', label: 'Ends With' }
        ];

        let operators;
        switch (currentFieldConfig.type) {
            case 'number':
                operators = [
                    ...commonOperators,
                    ...textOperators,
                    { value: 'greaterThan', label: 'Greater Than' },
                    { value: 'lessThan', label: 'Less Than' },
                    { value: 'greaterThanOrEqual', label: 'Greater Than or Equal' },
                    { value: 'lessThanOrEqual', label: 'Less Than or Equal' }
                ];
                break;
            case 'text':
            case 'textarea':
                operators = [
                    ...commonOperators,
                    ...textOperators
                ];
                break;
            case 'boolean':
            case 'checkbox':
                operators = [
                    { value: 'equals', label: 'Is Checked' },
                    { value: 'notEquals', label: 'Is Not Checked' }
                ];
                break;
            case 'select':
                operators = commonOperators;
                break;
            default:
                console.log('Unknown field type:', currentFieldConfig.type);
                operators = [...commonOperators, ...textOperators];
        }
        console.log('Returning operators:', operators);
        return operators;
    };

    // Calculate operators once
    const operators = useMemo(() => getOperatorsByFieldType(), [currentFieldConfig?.type]);
    console.log('Memoized operators:', operators);

    // Initialize state with first operator if available
    const [operator, setOperator] = useState<string>('');
    const [value, setValue] = useState<string>('');
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [action, setAction] = useState<'show' | 'hide' | 'require'>('show');

    // Update operator when operators list changes
    useEffect(() => {
        if (operators.length > 0 && !operator) {
            console.log('Setting initial operator to:', operators[0].value);
            setOperator(operators[0].value);
        }
    }, [operators, operator]);

    console.log('Current operator value:', operator);

    // Get all available fields except the current one for target selection
    const otherFields = useMemo(() => 
        [...availableFields.equipment, ...availableFields.inspection]
            .filter(f => f.name !== currentFieldName),
        [availableFields, currentFieldName]
    );

    const handleSave = () => {
        onSave({
            field: currentFieldName,
            operator: operator as Condition['operator'],
            value,
            targetFields: selectedFields,
            action
        });
        handleClose();
    };

    const handleClose = () => {
        setOperator(operators.length > 0 ? operators[0].value : '');
        setValue('');
        setSelectedFields([]);
        setAction('show');
        onClose();
    };

    const getValueInput = () => {
        if (!currentFieldConfig) return null;

        switch (currentFieldConfig.type) {
            case 'checkbox':
                return (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={value === 'true'}
                                onChange={(e) => setValue(e.target.checked.toString())}
                            />
                        }
                        label="Is Checked"
                    />
                );
            case 'select':
                if (isSelectConfig(currentFieldConfig.config)) {
                    return (
                        <FormControl fullWidth>
                            <InputLabel>Value</InputLabel>
                            <Select
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                label="Value"
                            >
                                {currentFieldConfig.config.options.map((option) => (
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
                        fullWidth
                        type="number"
                        label="Value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                );
            default:
                return (
                    <TextField
                        fullWidth
                        label="Value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                );
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Rule for {currentFieldName}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {/* Condition Section */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>When</Typography>
                    <FormControl fullWidth>
                        <InputLabel>Operator</InputLabel>
                        <Select
                            value={operator}
                            onChange={(e) => {
                                console.log('Selected operator:', e.target.value);
                                setOperator(e.target.value);
                                setValue('');
                            }}
                            label="Operator"
                        >
                            {operators.map(op => (
                                <MenuItem key={op.value} value={op.value}>
                                    {op.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {getValueInput()}

                    {/* Action Section */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Then</Typography>
                    <FormControl fullWidth>
                        <InputLabel>Action</InputLabel>
                        <Select
                            value={action}
                            onChange={(e) => setAction(e.target.value as 'show' | 'hide' | 'require')}
                            label="Action"
                        >
                            <MenuItem value="show">Show</MenuItem>
                            <MenuItem value="hide">Hide</MenuItem>
                            <MenuItem value="require">Make Required</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Target Fields</InputLabel>
                        <Select
                            multiple
                            value={selectedFields}
                            onChange={(e) => setSelectedFields(typeof e.target.value === 'string' ? [e.target.value] : e.target.value)}
                            label="Target Fields"
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const field = otherFields.find(f => f.name === value);
                                        return <Chip key={value} label={field?.label || value} />;
                                    })}
                                </Box>
                            )}
                        >
                            {otherFields.map((field) => (
                                <MenuItem key={field.name} value={field.name}>
                                    <Checkbox checked={selectedFields.indexOf(field.name) > -1} />
                                    <ListItemText primary={field.label} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    color="primary"
                    disabled={!value || selectedFields.length === 0}
                >
                    Add Rule
                </Button>
            </DialogActions>
        </Dialog>
    );
}
