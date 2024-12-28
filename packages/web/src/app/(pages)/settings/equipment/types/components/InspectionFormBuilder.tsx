'use client';

import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    TextField,
    Select,
    MenuItem,
    FormControl,
    FormControlLabel,
    Switch,
    InputLabel,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { InspectionSection, FormField, EquipmentTypeConfig } from './types';
import { AddFieldForm } from './AddFieldForm';

interface InspectionFormBuilderProps {
    equipmentType: EquipmentTypeConfig;
    onSave: (updatedType: EquipmentTypeConfig) => Promise<void>;
}

export function InspectionFormBuilder({ equipmentType, onSave }: InspectionFormBuilderProps) {
    const [inspectionConfig, setInspectionConfig] = useState(
        equipmentType.inspectionConfig || {
            sections: [],
            defaultFrequency: { value: 1, unit: 'months' },
            requirePhotos: true,
            requireNotes: true,
        }
    );
    const [addingSectionIndex, setAddingSectionIndex] = useState<number | null>(null);
    const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);

    const handleAddSection = () => {
        setInspectionConfig(prev => ({
            ...prev,
            sections: [
                ...prev.sections,
                {
                    title: `Section ${prev.sections.length + 1}`,
                    fields: []
                }
            ]
        }));
    };

    const handleDeleteSection = (index: number) => {
        setInspectionConfig(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index)
        }));
    };

    const handleSectionTitleChange = (index: number, title: string) => {
        setInspectionConfig(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) => 
                i === index ? { ...section, title } : section
            )
        }));
    };

    const handleAddField = (sectionIndex: number, field: FormField) => {
        setInspectionConfig(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) => 
                i === sectionIndex 
                    ? { ...section, fields: [...section.fields, field] }
                    : section
            )
        }));
        setAddingSectionIndex(null);
    };

    const handleDeleteField = (sectionIndex: number, fieldIndex: number) => {
        setInspectionConfig(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) => 
                i === sectionIndex 
                    ? { 
                        ...section, 
                        fields: section.fields.filter((_, fi) => fi !== fieldIndex)
                    }
                    : section
            )
        }));
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const { source, destination } = result;
        const sections = Array.from(inspectionConfig.sections);
        
        if (source.droppableId === 'sections') {
            const [removed] = sections.splice(source.index, 1);
            sections.splice(destination.index, 0, removed);
            setInspectionConfig(prev => ({ ...prev, sections }));
        } else {
            // Handle field reordering within sections
            const [sourceSection, destSection] = source.droppableId.split('-')[1].split('to');
            if (sourceSection === destSection) {
                const section = sections[parseInt(sourceSection)];
                const fields = Array.from(section.fields);
                const [removed] = fields.splice(source.index, 1);
                fields.splice(destination.index, 0, removed);
                sections[parseInt(sourceSection)] = { ...section, fields };
                setInspectionConfig(prev => ({ ...prev, sections }));
            }
        }
    };

    const handleSave = async () => {
        await onSave({
            ...equipmentType,
            inspectionConfig
        });
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Inspection Form Configuration
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Configure the inspection form for {equipmentType.label} equipment
                </Typography>
            </Box>

            {/* General Settings */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                    General Settings
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        label="Default Frequency Value"
                        type="number"
                        value={inspectionConfig.defaultFrequency?.value}
                        onChange={(e) => setInspectionConfig(prev => ({
                            ...prev,
                            defaultFrequency: {
                                ...prev.defaultFrequency!,
                                value: parseInt(e.target.value)
                            }
                        }))}
                        sx={{ width: 150 }}
                    />
                    <FormControl sx={{ width: 150 }}>
                        <InputLabel>Frequency Unit</InputLabel>
                        <Select
                            value={inspectionConfig.defaultFrequency?.unit}
                            onChange={(e) => setInspectionConfig(prev => ({
                                ...prev,
                                defaultFrequency: {
                                    ...prev.defaultFrequency!,
                                    unit: e.target.value as any
                                }
                            }))}
                        >
                            <MenuItem value="days">Days</MenuItem>
                            <MenuItem value="weeks">Weeks</MenuItem>
                            <MenuItem value="months">Months</MenuItem>
                            <MenuItem value="years">Years</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={inspectionConfig.requirePhotos}
                                onChange={(e) => setInspectionConfig(prev => ({
                                    ...prev,
                                    requirePhotos: e.target.checked
                                }))}
                            />
                        }
                        label="Require Photos"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={inspectionConfig.requireNotes}
                                onChange={(e) => setInspectionConfig(prev => ({
                                    ...prev,
                                    requireNotes: e.target.checked
                                }))}
                            />
                        }
                        label="Require Notes"
                    />
                </Box>
            </Paper>

            {/* Sections */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections">
                    {(provided) => (
                        <Box ref={provided.innerRef} {...provided.droppableProps}>
                            {inspectionConfig.sections.map((section, sectionIndex) => (
                                <Draggable
                                    key={`section-${sectionIndex}`}
                                    draggableId={`section-${sectionIndex}`}
                                    index={sectionIndex}
                                >
                                    {(provided) => (
                                        <Paper
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            sx={{ mb: 2, p: 2 }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Box {...provided.dragHandleProps}>
                                                    <DragIndicatorIcon />
                                                </Box>
                                                <TextField
                                                    value={section.title}
                                                    onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
                                                    variant="standard"
                                                    sx={{ ml: 1, flex: 1 }}
                                                />
                                                <IconButton 
                                                    onClick={() => handleDeleteSection(sectionIndex)}
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>

                                            {/* Fields */}
                                            <Droppable droppableId={`fields-${sectionIndex}`}>
                                                {(provided) => (
                                                    <Box ref={provided.innerRef} {...provided.droppableProps}>
                                                        {section.fields.map((field, fieldIndex) => (
                                                            <Draggable
                                                                key={`field-${sectionIndex}-${fieldIndex}`}
                                                                draggableId={`field-${sectionIndex}-${fieldIndex}`}
                                                                index={fieldIndex}
                                                            >
                                                                {(provided) => (
                                                                    <Box
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            p: 1,
                                                                            borderBottom: '1px solid',
                                                                            borderColor: 'divider'
                                                                        }}
                                                                    >
                                                                        <DragIndicatorIcon sx={{ mr: 1 }} />
                                                                        <Typography>{field.label}</Typography>
                                                                        <Box sx={{ flex: 1 }} />
                                                                        <IconButton
                                                                            onClick={() => handleDeleteField(sectionIndex, fieldIndex)}
                                                                            size="small"
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </Box>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </Box>
                                                )}
                                            </Droppable>

                                            <Button
                                                startIcon={<AddIcon />}
                                                onClick={() => setAddingSectionIndex(sectionIndex)}
                                                sx={{ mt: 1 }}
                                            >
                                                Add Field
                                            </Button>
                                        </Paper>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>

            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddSection}
                sx={{ mt: 2 }}
            >
                Add Section
            </Button>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    onClick={handleSave}
                >
                    Save Inspection Form
                </Button>
            </Box>

            {/* Add Field Dialog */}
            <Dialog
                open={addingSectionIndex !== null}
                onClose={() => setAddingSectionIndex(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Add Field to Section</DialogTitle>
                <DialogContent>
                    <AddFieldForm
                        onSubmit={(field) => {
                            if (addingSectionIndex !== null) {
                                handleAddField(addingSectionIndex, field);
                            }
                        }}
                        onCancel={() => setAddingSectionIndex(null)}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
}
