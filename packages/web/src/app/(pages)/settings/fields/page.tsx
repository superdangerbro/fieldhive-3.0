'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    List,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FIELD_SECTIONS, STANDARD_FIELDS, type FieldSection } from '@/app/globalTypes/fieldTemplates';
import { fieldRegistry, BaseField } from '@/app/globalTypes/fieldRegistry';
import { AddFieldForm } from '../equipment/types/components/AddFieldForm';

// Initial sections with no default fields
const initialSections: FieldSection[] = [
    {
        id: FIELD_SECTIONS.EQUIPMENT,
        name: 'Equipment Fields',
        description: 'Fields specific to field equipment',
        fields: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: FIELD_SECTIONS.INSPECTIONS,
        name: 'Inspection Fields',
        description: 'Fields specific to equipment inspections',
        fields: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export default function FieldsPage() {
    const [sections, setSections] = useState<FieldSection[]>(() => {
        // Try to load from localStorage first
        const savedSections = localStorage.getItem('fieldSections');
        if (savedSections) {
            try {
                const parsed = JSON.parse(savedSections);
                // Register all fields from loaded sections
                parsed.forEach((section: FieldSection) => {
                    section.fields.forEach(field => {
                        const baseField: BaseField = {
                            name: field.name,
                            type: field.type,
                            description: field.description
                        };
                        fieldRegistry.registerField(baseField);
                    });
                });
                return parsed;
            } catch (e) {
                console.error('Error loading sections from localStorage:', e);
            }
        }
        
        // Fall back to initial sections if nothing in localStorage
        return initialSections;
    });

    useEffect(() => {
        // Save sections to localStorage
        localStorage.setItem('fieldSections', JSON.stringify(sections));

        // Register all fields in the registry
        sections.forEach(section => {
            section.fields.forEach(field => {
                const baseField: BaseField = {
                    name: field.name,
                    type: field.type,
                    description: field.description
                };
                fieldRegistry.registerField(baseField);
            });
        });

        // Debug logging
        console.log('Saved sections:', sections);
        console.log('Field registry:', fieldRegistry.getAllFields());
    }, [sections]); // Re-run when sections change

    const [selectedSection, setSelectedSection] = useState<FieldSection | null>(null);
    const [isAddingField, setIsAddingField] = useState(false);
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [isEditingField, setIsEditingField] = useState(false);
    const [selectedField, setSelectedField] = useState<FormField | null>(null);
    const [newSection, setNewSection] = useState({ 
        name: '', 
        description: '',
        type: FIELD_SECTIONS.CUSTOM 
    });

    const handleAddField = (field: FormField) => {
        if (!selectedSection) return;

        // Register the base field first
        const baseField: BaseField = {
            name: field.name,
            type: field.type,
            description: field.description
        };
        fieldRegistry.registerField(baseField);

        // Then add the field to the section
        setSections(prevSections => 
            prevSections.map(section =>
                section.id === selectedSection.id
                    ? { ...section, fields: [...section.fields, field] }
                    : section
            )
        );
        setIsAddingField(false);
    };

    const handleEditField = (oldField: FormField, newField: FormField) => {
        if (!selectedSection) return;

        // Update the base field registration
        const baseField: BaseField = {
            name: newField.name,
            type: newField.type,
            description: newField.description
        };
        fieldRegistry.registerField(baseField);

        // Update the field in the section
        setSections(prevSections =>
            prevSections.map(section =>
                section.id === selectedSection.id
                    ? {
                        ...section,
                        fields: section.fields.map(field =>
                            field.name === oldField.name ? newField : field
                        )
                    }
                    : section
            )
        );
        setIsEditingField(false);
        setSelectedField(null);
    };

    const handleDeleteField = (fieldToDelete: FormField) => {
        if (!selectedSection) return;

        setSections(prevSections =>
            prevSections.map(section =>
                section.id === selectedSection.id
                    ? {
                        ...section,
                        fields: section.fields.filter(field => field.name !== fieldToDelete.name)
                    }
                    : section
            )
        );
    };

    const handleAddSection = () => {
        const newSectionObj: FieldSection = {
            id: newSection.type,
            name: newSection.name,
            description: newSection.description,
            fields: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setSections(prev => [...prev, newSectionObj]);
        setNewSection({ name: '', description: '', type: FIELD_SECTIONS.CUSTOM });
        setIsAddingSection(false);
    };

    const handleDeleteSection = (sectionId: string) => {
        setSections(prev => prev.filter(section => section.id !== sectionId));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Form Fields</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAddingSection(true)}
                >
                    Add Section
                </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure the fields available for equipment and inspection forms
            </Typography>

            {sections.map((section) => (
                <Accordion 
                    key={section.id}
                    expanded={selectedSection?.id === section.id}
                    onChange={() => setSelectedSection(selectedSection?.id === section.id ? null : section)}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                            <Typography>{section.name}</Typography>
                            <Chip 
                                label={`${section.fields.length} fields`}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {section.description}
                        </Typography>

                        <Button
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedField(null);
                                setIsAddingField(true);
                            }}
                            variant="outlined"
                            size="small"
                            sx={{ mb: 2 }}
                        >
                            Add Field
                        </Button>

                        <List>
                            {section.fields.map((field, index) => (
                                <Paper 
                                    key={field.name}
                                    sx={{ 
                                        p: 2,
                                        mb: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}
                                >
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1">
                                            {field.label}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {field.name} • {field.type}
                                        </Typography>
                                        {field.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {field.description}
                                            </Typography>
                                        )}
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setSelectedField(field);
                                            setIsEditingField(true);
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDeleteField(field)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Paper>
                            ))}
                        </List>

                        {section.id !== FIELD_SECTIONS.EQUIPMENT && section.id !== FIELD_SECTIONS.INSPECTIONS && (
                            <Button
                                color="error"
                                onClick={() => handleDeleteSection(section.id)}
                                startIcon={<DeleteIcon />}
                                sx={{ mt: 2 }}
                            >
                                Delete Section
                            </Button>
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}

            <Dialog
                open={isAddingSection}
                onClose={() => setIsAddingSection(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Add Section</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <TextField
                            label="Section Name"
                            value={newSection.name}
                            onChange={(e) => setNewSection(prev => ({ ...prev, name: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={newSection.description}
                            onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={newSection.type}
                                onChange={(e) => setNewSection(prev => ({ ...prev, type: e.target.value }))}
                                label="Type"
                            >
                                <MenuItem value={FIELD_SECTIONS.CUSTOM}>Custom</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddingSection(false)}>Cancel</Button>
                    <Button 
                        onClick={handleAddSection}
                        variant="contained"
                        disabled={!newSection.name.trim()}
                    >
                        Add Section
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={isAddingField || isEditingField}
                onClose={() => {
                    setIsAddingField(false);
                    setIsEditingField(false);
                    setSelectedField(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    <AddFieldForm
                        mode={isEditingField ? 'edit' : 'add'}
                        initialField={selectedField || undefined}
                        onAdd={isEditingField && selectedField 
                            ? (newField) => handleEditField(selectedField, newField)
                            : handleAddField
                        }
                        onCancel={() => {
                            setIsAddingField(false);
                            setIsEditingField(false);
                            setSelectedField(null);
                        }}
                        existingFields={sections.flatMap(s => s.fields.map(f => f.name))}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
}
