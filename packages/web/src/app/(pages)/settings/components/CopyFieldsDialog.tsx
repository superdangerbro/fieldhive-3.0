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
    List,
    ListItem,
    ListItemText,
    Checkbox,
    Box,
    Typography
} from '@mui/material';
import { EquipmentTypeConfig, FormField } from './types';

interface Props {
    open: boolean;
    onClose: () => void;
    equipmentTypes: EquipmentTypeConfig[];
    currentType: string;
    onCopyFields: (sourceType: string, fields: FormField[]) => void;
}

export function CopyFieldsDialog({
    open,
    onClose,
    equipmentTypes,
    currentType,
    onCopyFields
}: Props) {
    const [selectedType, setSelectedType] = useState('');
    const [selectedFields, setSelectedFields] = useState<string[]>([]);

    const sourceType = equipmentTypes.find(t => t.name === selectedType);
    const availableTypes = equipmentTypes.filter(t => t.name !== currentType);

    const handleTypeChange = (typeName: string) => {
        setSelectedType(typeName);
        setSelectedFields([]);
    };

    const handleToggleField = (fieldName: string) => {
        setSelectedFields(prev => {
            if (prev.includes(fieldName)) {
                return prev.filter(f => f !== fieldName);
            }
            return [...prev, fieldName];
        });
    };

    const handleCopy = () => {
        if (sourceType) {
            const fieldsToCopy = sourceType.fields.filter(f => 
                selectedFields.includes(f.name)
            );
            onCopyFields(sourceType.name, fieldsToCopy);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Copy Fields from Another Type</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Source Equipment Type</InputLabel>
                        <Select
                            value={selectedType}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            label="Source Equipment Type"
                        >
                            {availableTypes.map((type) => (
                                <MenuItem key={type.name} value={type.name}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {sourceType && sourceType.fields.length > 0 ? (
                        <>
                            <Typography variant="subtitle2" sx={{ mt: 2 }}>
                                Select Fields to Copy
                            </Typography>
                            <List>
                                {sourceType.fields.map((field) => (
                                    <ListItem
                                        key={field.name}
                                        dense
                                        button
                                        onClick={() => handleToggleField(field.name)}
                                    >
                                        <Checkbox
                                            edge="start"
                                            checked={selectedFields.includes(field.name)}
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                        <ListItemText
                                            primary={field.name}
                                            secondary={`Type: ${field.type}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    ) : selectedType ? (
                        <Typography color="text.secondary">
                            No fields available in the selected type
                        </Typography>
                    ) : null}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleCopy}
                    variant="contained"
                    disabled={!selectedType || selectedFields.length === 0}
                >
                    Copy Selected Fields
                </Button>
            </DialogActions>
        </Dialog>
    );
}
