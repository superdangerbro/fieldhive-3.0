'use client';

import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemSecondaryAction,
    ListSubheader,
    DialogActions,
    Button,
    Typography,
    Chip,
} from '@mui/material';
import { fieldRegistry, BaseField } from '@/app/globalTypes/fieldRegistry';
import { FormField } from '../../(pages)/settings/equipment/types/components/types';
import { FIELD_SECTIONS, FieldSection } from '@/app/globalTypes/fieldTemplates';

interface SelectFieldDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (field: FormField) => void;
    existingFieldNames?: string[]; // To prevent duplicates
}

interface FieldsBySection {
    [FIELD_SECTIONS.EQUIPMENT]: BaseField[];
    [FIELD_SECTIONS.INSPECTIONS]: BaseField[];
}

export function SelectFieldDialog({ open, onClose, onSelect, existingFieldNames = [] }: SelectFieldDialogProps) {
    useEffect(() => {
        // Debug logging
        console.log('Field Registry:', fieldRegistry.getAllFields());
        const savedSections = localStorage.getItem('fieldSections');
        console.log('Saved Sections:', savedSections ? JSON.parse(savedSections) : 'None');
        console.log('Existing Field Names:', existingFieldNames);
    }, [open, existingFieldNames]);

    // Get fields from localStorage sections
    const savedSections = localStorage.getItem('fieldSections');
    const sections: FieldSection[] = savedSections ? JSON.parse(savedSections) : [];
    
    // Group fields by their original sections
    const fieldsBySection = sections.reduce((acc, section) => {
        if (section.id === FIELD_SECTIONS.EQUIPMENT || section.id === FIELD_SECTIONS.INSPECTIONS) {
            section.fields.forEach(field => {
                // Debug logging
                console.log('Processing field:', field.name, {
                    inRegistry: fieldRegistry.hasField(field.name),
                    existingField: existingFieldNames.includes(field.name)
                });

                const baseField = fieldRegistry.getField(field.name);
                if (baseField) {
                    if (!acc[section.id]) {
                        acc[section.id] = [];
                    }
                    acc[section.id].push({
                        ...baseField,
                        description: field.label || field.description || baseField.description || baseField.name
                    });
                }
            });
        }
        return acc;
    }, { [FIELD_SECTIONS.EQUIPMENT]: [], [FIELD_SECTIONS.INSPECTIONS]: [] } as FieldsBySection);

    // Debug logging
    console.log('Fields by Section:', fieldsBySection);

    const handleSelect = (baseField: BaseField) => {
        // Create a form field from the base field
        const formField: FormField = {
            name: baseField.name,
            label: baseField.description || baseField.name,
            type: baseField.type,
            description: baseField.description
        };
        onSelect(formField);
        onClose();
    };

    const renderFieldList = (fields: BaseField[], sectionTitle: string) => (
        <List
            subheader={
                <ListSubheader sx={{ bgcolor: 'background.paper' }}>
                    {sectionTitle}
                </ListSubheader>
            }
        >
            {fields.length === 0 ? (
                <ListItem>
                    <ListItemText 
                        secondary="No fields available. Create fields in the Form Fields section first."
                    />
                </ListItem>
            ) : (
                fields.map((field) => {
                    const isDisabled = existingFieldNames.includes(field.name);
                    return (
                        <ListItem 
                            key={field.name} 
                            disablePadding
                            secondaryAction={
                                isDisabled && (
                                    <Chip 
                                        label="Already Added" 
                                        size="small" 
                                        color="default"
                                        sx={{ height: 20 }}
                                    />
                                )
                            }
                        >
                            <ListItemButton
                                onClick={() => handleSelect(field)}
                                disabled={isDisabled}
                            >
                                <ListItemText
                                    primary={field.description || field.name}
                                    secondary={`${field.name} • ${field.type}`}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })
            )}
        </List>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Select Field</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select an existing field to add to your form
                </Typography>

                {renderFieldList(fieldsBySection[FIELD_SECTIONS.EQUIPMENT], 'Equipment Fields')}
                {renderFieldList(fieldsBySection[FIELD_SECTIONS.INSPECTIONS], 'Inspection Fields')}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}
