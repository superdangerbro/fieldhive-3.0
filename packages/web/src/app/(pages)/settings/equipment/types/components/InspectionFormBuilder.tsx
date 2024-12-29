'use client';

import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
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
            sections: []
        }
    );
    const [addingSectionIndex, setAddingSectionIndex] = useState<number | null>(null);

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

        const { source, destination, type } = result;
        
        if (type === 'SECTION') {
            const sections = Array.from(inspectionConfig.sections);
            const [removed] = sections.splice(source.index, 1);
            sections.splice(destination.index, 0, removed);
            setInspectionConfig(prev => ({ ...prev, sections }));
        } else if (type === 'FIELD') {
            const sections = Array.from(inspectionConfig.sections);
            const sourceSection = sections[parseInt(source.droppableId)];
            const destSection = sections[parseInt(destination.droppableId)];
            
            const sourceFields = Array.from(sourceSection.fields);
            const [removed] = sourceFields.splice(source.index, 1);
            
            if (source.droppableId === destination.droppableId) {
                sourceFields.splice(destination.index, 0, removed);
                sections[parseInt(source.droppableId)] = { ...sourceSection, fields: sourceFields };
            } else {
                const destFields = Array.from(destSection.fields);
                destFields.splice(destination.index, 0, removed);
                sections[parseInt(source.droppableId)] = { ...sourceSection, fields: sourceFields };
                sections[parseInt(destination.droppableId)] = { ...destSection, fields: destFields };
            }
            
            setInspectionConfig(prev => ({ ...prev, sections }));
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

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections" type="SECTION">
                    {(provided) => (
                        <Box 
                            ref={provided.innerRef} 
                            {...provided.droppableProps}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                        >
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
                                            sx={{ p: 2 }}
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

                                            <Droppable droppableId={String(sectionIndex)} type="FIELD">
                                                {(provided) => (
                                                    <Box 
                                                        ref={provided.innerRef} 
                                                        {...provided.droppableProps}
                                                        sx={{ 
                                                            minHeight: 50,
                                                            backgroundColor: 'background.default',
                                                            borderRadius: 1,
                                                            p: 1
                                                        }}
                                                    >
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
                                                                            mb: 1,
                                                                            backgroundColor: 'background.paper',
                                                                            borderRadius: 1,
                                                                            boxShadow: 1
                                                                        }}
                                                                    >
                                                                        <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                                        <Typography>{field.label}</Typography>
                                                                        <Box sx={{ flex: 1 }} />
                                                                        <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                                                                            {field.type}
                                                                        </Typography>
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
