'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RuleIcon from '@mui/icons-material/Rule';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { InspectionSection, FormField, EquipmentTypeConfig, Condition } from './types';
import { SelectFieldDialog } from '@/app/components/fields/SelectFieldDialog';
import { FieldList } from './FieldList';
import { crypto } from 'crypto';

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
    const [addingConditionIndex, setAddingConditionIndex] = useState<number | null>(null);

    // Update inspectionConfig when equipmentType changes
    useEffect(() => {
        setInspectionConfig(equipmentType.inspectionConfig || {
            sections: []
        });
    }, [equipmentType]);

    const handleAddSection = () => {
        const newSection = {
            id: crypto.randomUUID(),
            title: `Section ${inspectionConfig.sections.length + 1}`,
            order: inspectionConfig.sections.length,
            fields: []
        };

        setInspectionConfig(prev => ({
            ...prev,
            sections: [...prev.sections, newSection]
        }));
        
        const updatedType = {
            ...equipmentType,
            inspectionConfig: {
                ...equipmentType.inspectionConfig,
                sections: [
                    ...(equipmentType.inspectionConfig?.sections || []),
                    newSection
                ]
            }
        };
        onSave(updatedType);
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

    const handleAddCondition = (sectionIndex: number) => {
        setAddingConditionIndex(sectionIndex);
    };

    const handleSaveCondition = (sectionIndex: number, condition: Condition) => {
        const updatedConfig = { ...inspectionConfig };
        if (!updatedConfig.sections[sectionIndex].showWhen) {
            updatedConfig.sections[sectionIndex].showWhen = [];
        }
        updatedConfig.sections[sectionIndex].showWhen.push(condition);
        setInspectionConfig(updatedConfig);
        handleSave();
    };

    const handleDeleteCondition = (sectionIndex: number, conditionIndex: number) => {
        const updatedConfig = { ...inspectionConfig };
        updatedConfig.sections[sectionIndex].showWhen = 
            updatedConfig.sections[sectionIndex].showWhen?.filter((_, i) => i !== conditionIndex) || [];
        setInspectionConfig(updatedConfig);
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
            {inspectionConfig.sections.length === 0 ? (
                <Box sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 2
                }}>
                    <Typography color="text.secondary" gutterBottom>
                        No sections added yet
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={handleAddSection}
                        startIcon={<AddIcon />}
                        size="small"
                    >
                        Add First Section
                    </Button>
                </Box>
            ) : (
                <>
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
                                {section.fields.length === 0 ? (
                                    <Box sx={{ 
                                        p: 2, 
                                        textAlign: 'center',
                                        border: '1px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 1
                                    }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            No fields added to this section
                                        </Typography>
                                        <Button
                                            size="small"
                                            onClick={() => setAddingSectionIndex(sectionIndex)}
                                            startIcon={<AddIcon />}
                                        >
                                            Add Field
                                        </Button>
                                    </Box>
                                ) : (
                                    <>
                                        <FieldList
                                            fields={section.fields}
                                            onDeleteField={(fieldName) => {
                                                const fieldIndex = section.fields.findIndex(f => f.name === fieldName);
                                                if (fieldIndex !== -1) {
                                                    handleDeleteField(sectionIndex, fieldIndex);
                                                }
                                            }}
                                            onEditField={(field) => {
                                                const fieldIndex = section.fields.findIndex(f => f.name === field.name);
                                                if (fieldIndex !== -1) {
                                                    // Handle edit field here
                                                    console.log('Edit field:', field);
                                                }
                                            }}
                                            onAddCondition={(fieldName, condition) => {
                                                const fieldIndex = section.fields.findIndex(f => f.name === fieldName);
                                                if (fieldIndex !== -1) {
                                                    const updatedConfig = { ...inspectionConfig };
                                                    const field = updatedConfig.sections[sectionIndex].fields[fieldIndex];
                                                    if (!field.conditions) {
                                                        field.conditions = [];
                                                    }
                                                    field.conditions.push(condition);
                                                    setInspectionConfig(updatedConfig);
                                                    handleSave();
                                                }
                                            }}
                                            onDeleteCondition={(fieldName, conditionIndex) => {
                                                const fieldIndex = section.fields.findIndex(f => f.name === fieldName);
                                                if (fieldIndex !== -1) {
                                                    const updatedConfig = { ...inspectionConfig };
                                                    const field = updatedConfig.sections[sectionIndex].fields[fieldIndex];
                                                    if (field.conditions) {
                                                        field.conditions = field.conditions.filter((_, i) => i !== conditionIndex);
                                                        setInspectionConfig(updatedConfig);
                                                        handleSave();
                                                    }
                                                }
                                            }}
                                        />
                                        <Button
                                            size="small"
                                            onClick={() => setAddingSectionIndex(sectionIndex)}
                                            startIcon={<AddIcon />}
                                            sx={{ mt: 1 }}
                                        >
                                            Add Field
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Paper>
                    ))}
                    <Button
                        variant="outlined"
                        onClick={handleAddSection}
                        startIcon={<AddIcon />}
                        size="small"
                    >
                        Add Section
                    </Button>
                </>
            )}

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
