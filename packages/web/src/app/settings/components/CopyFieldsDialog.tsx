'use client';

import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Box, Checkbox, FormControlLabel, Typography, List, ListItem } from '@mui/material';
import { EquipmentTypeConfig, FormField } from './types';

interface Props {
    open: boolean;
    onClose: () => void;
    equipmentTypes: EquipmentTypeConfig[];
    currentType: string;
    onCopyFields: (sourceType: string, fields: FormField[]) => void;
}

export default function CopyFieldsDialog({ open, onClose, equipmentTypes, currentType, onCopyFields }: Props) {
    const [selectedType, setSelectedType] = useState('');
    const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setSelectedFields(new Set());
    };

    const handleFieldToggle = (fieldName: string) => {
        const newSelected = new Set(selectedFields);
        if (newSelected.has(fieldName)) {
            newSelected.delete(fieldName);
        } else {
            newSelected.add(fieldName);
        }
        setSelectedFields(newSelected);
    };

    const handleSelectAll = () => {
        const sourceType = equipmentTypes.find(t => t.name === selectedType);
        if (sourceType) {
            setSelectedFields(new Set(sourceType.fields.map(f => f.name)));
        }
    };

    const handleCopy = () => {
        const sourceType = equipmentTypes.find(t => t.name === selectedType);
        if (sourceType) {
            const fieldsToCopy = sourceType.fields.filter(f => selectedFields.has(f.name));
            onCopyFields(selectedType, fieldsToCopy);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Copy Fields from Another Type</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Source Type</InputLabel>
                        <Select
                            value={selectedType}
                            label="Source Type"
                            onChange={(e) => handleTypeChange(e.target.value)}
                        >
                            {equipmentTypes
                                .filter(t => t.name !== currentType)
                                .map(type => (
                                    <MenuItem key={type.name} value={type.name}>
                                        {type.name}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>

                    {selectedType && (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1">Select Fields to Copy</Typography>
                                <Button onClick={handleSelectAll}>Select All</Button>
                            </Box>
                            <List>
                                {equipmentTypes
                                    .find(t => t.name === selectedType)
                                    ?.fields.map(field => (
                                        <ListItem key={field.name} dense>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={selectedFields.has(field.name)}
                                                        onChange={() => handleFieldToggle(field.name)}
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography>{field.name}</Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {field.type}
                                                            {field.required && ' (Required)'}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))
                                }
                            </List>
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleCopy} 
                    variant="contained"
                    disabled={selectedFields.size === 0}
                >
                    Copy Selected Fields
                </Button>
            </DialogActions>
        </Dialog>
    );
}
