'use client';

import React, { useState, useEffect } from 'react';
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
import { SelectFieldDialog } from '@/app/components/fields/SelectFieldDialog';

interface InspectionFormBuilderProps {
    equipmentType: EquipmentTypeConfig;
    onSave: (updatedType: EquipmentTypeConfig) => Promise<void>;
}

const droppableProps = {
    isDropDisabled: false,
    isCombineEnabled: false,
    ignoreContainerClipping: false,
    renderClone: null,
    mode: 'standard' as const
};

export function InspectionFormBuilder({ equipmentType, onSave }: InspectionFormBuilderProps) {
    const [inspectionConfig, setInspectionConfig] = useState(
        equipmentType.inspectionConfig || {
            sections: []
        }
    );
    const [addingSectionIndex, setAddingSectionIndex] = useState<number | null>(null);

    // Update inspectionConfig when equipmentType changes
    useEffect(() => {
        setInspectionConfig(equipmentType.inspectionConfig || {
            sections: []
        });
    }, [equipmentType]);

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
        handleSave();
    };

    const handleDeleteSection = (index: number) => {
        setInspectionConfig(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index)
        }));
        handleSave();
    };

    const handleSectionTitleChange = (index: number, title: string) => {
        setInspectionConfig(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === index
                    ? { ...section, title }
                    : section
            )
        }));
        handleSave();
    };

    const handleAddField = (sectionIndex: number, field: FormField) => {
        setInspectionConfig(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex
                    ? {
                        ...section,
                        fields: [...section.fields, field]
                    }
                    : section
            )
        }));
        handleSave();
    };

    const handleDeleteField = (sectionIndex: number, fieldIndex: number) => {
        setInspectionConfig(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) =>
                i === sectionIndex
                    ? {
                        ...section,
                        fields: section.fields.filter((_, j) => j !== fieldIndex)
                    }
                    : section
            )
        }));
        handleSave();
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const { source, destination, type } = result;

        if (type === 'SECTION') {
            const sections = Array.from(inspectionConfig.sections);
            const [removed] = sections.splice(source.index, 1);
            sections.splice(destination.index, 0, removed);
            setInspectionConfig(prev => ({ ...prev, sections }));
            handleSave();
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
            handleSave();
        }
    };

    const handleSave = async () => {
        const updatedType = {
            ...equipmentType,
            inspectionConfig: {
                ...inspectionConfig,
                sections: inspectionConfig.sections.map(section => ({
                    ...section,
                    fields: section.fields.map(field => ({
                        name: field.name,
                        label: field.label,
                        type: field.type,
                        required: field.required
                    }))
                }))
            }
        };
        console.log('Saving updated type:', updatedType);
        await onSave(updatedType);
    };

    return (
        <Box>
            {inspectionConfig.sections.map((section, sectionIndex) => (
                <Paper key={sectionIndex} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DragIndicatorIcon sx={{ color: 'text.secondary', mr: 1 }} />
                        <TextField
                            value={section.title}
                            onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
                            variant="standard"
                            fullWidth
                            placeholder="Section Title"
                            sx={{ mr: 1 }}
                        />
                        <IconButton
                            size="small"
                            onClick={() => handleDeleteSection(sectionIndex)}
                            color="error"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ pl: 4 }}>
                        {section.fields.map((field, fieldIndex) => (
                            <Box key={fieldIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography>{field.label}</Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDeleteField(sectionIndex, fieldIndex)}
                                    sx={{ ml: 1 }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            size="small"
                            onClick={() => setAddingSectionIndex(sectionIndex)}
                            startIcon={<AddIcon />}
                            sx={{ mt: 1 }}
                        >
                            Add Field
                        </Button>
                    </Box>
                </Paper>
            ))}

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                    variant="outlined"
                    onClick={handleAddSection}
                    startIcon={<AddIcon />}
                    size="small"
                >
                    Add Section
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    size="small"
                >
                    Save Changes
                </Button>
            </Box>

            {/* Field Selection Dialog */}
            <SelectFieldDialog
                open={addingSectionIndex !== null}
                onClose={() => setAddingSectionIndex(null)}
                onSelect={(field) => {
                    if (addingSectionIndex !== null) {
                        handleAddField(addingSectionIndex, field);
                        setAddingSectionIndex(null);
                    }
                }}
                existingFieldNames={inspectionConfig.sections.flatMap(s => s.fields.map(f => f.name))}
            />
        </Box>
    );
}
