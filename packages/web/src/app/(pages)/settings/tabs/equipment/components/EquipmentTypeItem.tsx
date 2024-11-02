'use client';

import React, { useState } from 'react';
import { Box, Paper, Typography, IconButton, Collapse, TextField, Button, Select, MenuItem, FormControlLabel, Checkbox, FormControl, InputLabel, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { EquipmentTypeConfig, NewFieldState, FormField } from '../types';

interface EquipmentTypeItemProps {
    type: EquipmentTypeConfig;
    allTypes: EquipmentTypeConfig[];
    isExpanded: boolean;
    newField: NewFieldState;
    onToggleExpand: () => void;
    onDeleteType: () => void;
    onFieldChange: (typeName: string, field: NewFieldState) => void;
    onAddField: (typeName: string) => void;
    onDeleteField: (typeName: string, fieldName: string) => void;
    onReorderFields: (typeName: string, startIndex: number, endIndex: number) => void;
    onUpdateField: (typeName: string, fieldName: string, updates: Partial<FormField>) => void;
    onCopyFields: (targetTypeName: string, fields: FormField[]) => void;
    onUpdateTypeName: (oldName: string, newName: string) => void;
}

export function EquipmentTypeItem({
    type,
    allTypes,
    isExpanded,
    newField,
    onToggleExpand,
    onDeleteType,
    onFieldChange,
    onAddField,
    onDeleteField,
    onReorderFields,
    onUpdateField,
    onCopyFields,
    onUpdateTypeName
}: EquipmentTypeItemProps) {
    const [editingTypeName, setEditingTypeName] = useState(false);
    const [newTypeName, setNewTypeName] = useState(type.name);
    const [editingField, setEditingField] = useState<{ name: string; field: FormField } | null>(null);

    const fieldTypes = [
        'string',
        'number-input',
        'number-stepper',
        'slider',
        'select',
        'checkbox',
        'date',
        'time'
    ];

    const handleSaveTypeName = () => {
        if (newTypeName && newTypeName !== type.name) {
            onUpdateTypeName(type.name, newTypeName);
        }
        setEditingTypeName(false);
    };

    const handleSaveField = () => {
        if (editingField) {
            onUpdateField(type.name, editingField.name, editingField.field);
            setEditingField(null);
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <ListItem
                sx={{
                    px: 0,
                    '&:hover': {
                        bgcolor: 'transparent'
                    }
                }}
            >
                <IconButton onClick={onToggleExpand} sx={{ mr: 1 }}>
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                {editingTypeName ? (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                        <TextField
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                            size="small"
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveTypeName()}
                        />
                        <Button onClick={handleSaveTypeName}>Save</Button>
                        <Button onClick={() => setEditingTypeName(false)}>Cancel</Button>
                    </Box>
                ) : (
                    <>
                        <ListItemText primary={type.name} />
                        <ListItemSecondaryAction>
                            <IconButton onClick={() => setEditingTypeName(true)} sx={{ mr: 1 }}>
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={onDeleteType}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </>
                )}
            </ListItem>

            <Collapse in={isExpanded}>
                <Box sx={{ mt: 2, pl: 4 }}>
                    {/* Existing Fields */}
                    {type.fields.map((field, index) => (
                        <ListItem
                            key={field.name}
                            sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                mb: 1,
                                boxShadow: 1
                            }}
                        >
                            {editingField?.name === field.name ? (
                                <Box sx={{ display: 'flex', gap: 2, flex: 1, alignItems: 'center' }}>
                                    <TextField
                                        label="Field Name"
                                        value={editingField.field.name}
                                        onChange={(e) => setEditingField({
                                            ...editingField,
                                            field: { ...editingField.field, name: e.target.value }
                                        })}
                                        size="small"
                                    />
                                    <FormControl size="small">
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            value={editingField.field.type}
                                            onChange={(e) => setEditingField({
                                                ...editingField,
                                                field: { ...editingField.field, type: e.target.value }
                                            })}
                                            label="Type"
                                        >
                                            {fieldTypes.map((type) => (
                                                <MenuItem key={type} value={type}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={editingField.field.required}
                                                onChange={(e) => setEditingField({
                                                    ...editingField,
                                                    field: { ...editingField.field, required: e.target.checked }
                                                })}
                                                size="small"
                                            />
                                        }
                                        label="Required"
                                    />
                                    <Button onClick={handleSaveField}>Save</Button>
                                    <Button onClick={() => setEditingField(null)}>Cancel</Button>
                                </Box>
                            ) : (
                                <>
                                    <ListItemText 
                                        primary={field.name}
                                        secondary={
                                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" component="span" color="textSecondary">
                                                    {field.type}
                                                </Typography>
                                                {field.required && (
                                                    <Typography variant="body2" component="span" color="error">
                                                        *
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => setEditingField({ name: field.name, field: { ...field } })}
                                            sx={{ mr: 1 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => onDeleteField(type.name, field.name)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </>
                            )}
                        </ListItem>
                    ))}

                    {/* Add New Field */}
                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="subtitle2">Add New Field</Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <TextField
                                label="Field Name"
                                value={newField.name}
                                onChange={(e) => onFieldChange(type.name, { ...newField, name: e.target.value })}
                                size="small"
                            />
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={newField.type}
                                    onChange={(e) => onFieldChange(type.name, { ...newField, type: e.target.value })}
                                    label="Type"
                                >
                                    {fieldTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={newField.required}
                                        onChange={(e) => onFieldChange(type.name, { ...newField, required: e.target.checked })}
                                        size="small"
                                    />
                                }
                                label="Required"
                            />
                            <Button 
                                variant="contained" 
                                onClick={() => onAddField(type.name)}
                                disabled={!newField.name}
                                size="small"
                            >
                                Add Field
                            </Button>
                        </Box>

                        {/* Additional Field Options */}
                        {newField.type === 'select' && (
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <TextField
                                    label="New Option"
                                    value={newField.newOption}
                                    onChange={(e) => onFieldChange(type.name, { 
                                        ...newField, 
                                        newOption: e.target.value 
                                    })}
                                    size="small"
                                />
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        if (newField.newOption) {
                                            onFieldChange(type.name, {
                                                ...newField,
                                                options: [...newField.options, newField.newOption],
                                                newOption: ''
                                            });
                                        }
                                    }}
                                    disabled={!newField.newOption}
                                    size="small"
                                >
                                    Add Option
                                </Button>
                            </Box>
                        )}

                        {newField.type === 'select' && newField.options.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {newField.options.map((option, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            bgcolor: 'grey.100',
                                            borderRadius: 1,
                                            px: 1,
                                            py: 0.5
                                        }}
                                    >
                                        <Typography variant="body2">{option}</Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                const newOptions = [...newField.options];
                                                newOptions.splice(index, 1);
                                                onFieldChange(type.name, {
                                                    ...newField,
                                                    options: newOptions
                                                });
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {(['number-input', 'number-stepper', 'slider'].includes(newField.type)) && (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Min"
                                    type="number"
                                    value={newField.numberConfig.min ?? ''}
                                    onChange={(e) => onFieldChange(type.name, {
                                        ...newField,
                                        numberConfig: {
                                            ...newField.numberConfig,
                                            min: Number(e.target.value)
                                        }
                                    })}
                                    size="small"
                                />
                                <TextField
                                    label="Max"
                                    type="number"
                                    value={newField.numberConfig.max ?? ''}
                                    onChange={(e) => onFieldChange(type.name, {
                                        ...newField,
                                        numberConfig: {
                                            ...newField.numberConfig,
                                            max: Number(e.target.value)
                                        }
                                    })}
                                    size="small"
                                />
                                <TextField
                                    label="Step"
                                    type="number"
                                    value={newField.numberConfig.step ?? ''}
                                    onChange={(e) => onFieldChange(type.name, {
                                        ...newField,
                                        numberConfig: {
                                            ...newField.numberConfig,
                                            step: Number(e.target.value)
                                        }
                                    })}
                                    size="small"
                                />
                            </Box>
                        )}
                    </Box>
                </Box>
            </Collapse>
        </Paper>
    );
}
