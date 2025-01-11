'use client';

import React from 'react';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemButton,
    IconButton,
    CircularProgress,
    TextField,
    Collapse,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Switch,
    Divider,
    ListItemText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEquipmentTypes, useUpdateEquipmentTypes } from '../hooks/useEquipment';
import { useCrudDialogs } from '@/app/globalHooks/useCrudDialogs';
import { CrudFormDialog, CrudDeleteDialog } from '@/app/globalComponents/crud/CrudDialogs';
import type { EquipmentTypeConfig, FormField, Section } from './components/types';
import { SelectFieldDialog } from '@/app/components/fields/SelectFieldDialog';
import { FieldList } from './components/FieldList';
import { InspectionFormBuilder } from './components/InspectionFormBuilder';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export function EquipmentTypeSection() {
    const { data: types = [], isLoading, error: fetchError } = useEquipmentTypes();
    const updateMutation = useUpdateEquipmentTypes();
    const { dialogState, openCreateDialog, openEditDialog, openDeleteDialog, closeDialog } = useCrudDialogs();
    const [expandedType, setExpandedType] = React.useState<string | null>(null);
    const [expandedSection, setExpandedSection] = React.useState<string | null>(null);
    const [addingFieldsTo, setAddingFieldsTo] = React.useState<{ typeValue: string; sectionId: string } | null>(null);
    const [editingField, setEditingField] = React.useState<{ typeValue: string; sectionId: string; field: FormField } | null>(null);
    const [editingSectionTitle, setEditingSectionTitle] = React.useState<{
        typeValue: string;
        sectionId: string;
        currentTitle: string;
        isInspection: boolean;
    } | null>(null);
    const [saveError, setSaveError] = React.useState<string | null>(null);

    React.useEffect(() => {
        console.log('Current types:', types);
    }, [types]);

    const handleAddSection = (typeValue: string) => {
        console.log('handleAddSection called with typeValue:', typeValue);
        
        // Find the type
        const type = types.find(t => t.value === typeValue);
        if (!type) {
            console.error('Type not found');
            return;
        }
        console.log('Found type:', type);

        // Create new section
        const newSection: Section = {
            id: crypto.randomUUID(),
            title: 'New Section',
            description: '',
            order: type.sections?.length || 0,
            fields: [],
            conditions: [],
            showWhen: []
        };
        console.log('Created new section:', newSection);

        // Create updated type with new section
        const updatedType: EquipmentTypeConfig = {
            ...type,
            value: type.value,
            label: type.label,
            sections: [...(type.sections || []), newSection],
            barcodeRequired: type.barcodeRequired,
            photoRequired: type.photoRequired,
            inspectionConfig: type.inspectionConfig
        };
        console.log('Updated type:', updatedType);

        try {
            // Find and update the type in the array
            const updatedTypes = types.map(t => 
                t.value === typeValue ? updatedType : t
            );
            console.log('Updating with types:', updatedTypes);

            updateMutation.mutate(updatedTypes);
        } catch (error) {
            console.error('Error in handleAddSection:', error);
        }
    };

    const handleAddInspectionSection = (type: EquipmentTypeConfig) => {
        const newSection = {
            id: crypto.randomUUID(), // Generate unique ID
            title: 'New Inspection Section',
            order: type.inspectionConfig?.sections?.length || 0,
            fields: [],
            conditions: [],
            showWhen: []
        };

        const updatedType = {
            ...type,
            inspectionConfig: {
                ...type.inspectionConfig,
                sections: [...(type.inspectionConfig?.sections || []), newSection]
            }
        };

        updateMutation.mutate([updatedType]);
    };

    const handleEditSection = (typeValue: string, sectionId: string, updates: Partial<Section>) => {
        const type = types.find(t => t.value === typeValue);
        if (!type) return;

        const updatedType = {
            ...type,
            sections: type.sections.map(section => 
                section.id === sectionId ? { ...section, ...updates } : section
            )
        };

        updateMutation.mutate([updatedType]);
    };

    const handleDeleteSection = (typeValue: string, sectionId: string) => {
        const type = types.find(t => t.value === typeValue);
        if (!type) return;

        const updatedType = {
            ...type,
            sections: type.sections.filter(section => section.id !== sectionId)
        };

        updateMutation.mutate([updatedType]);
    };

    const handleMoveSection = (typeValue: string, sectionId: string, direction: 'up' | 'down') => {
        const type = types.find(t => t.value === typeValue);
        if (!type) return;

        const sections = [...type.sections];
        const currentIndex = sections.findIndex(s => s.id === sectionId);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= sections.length) return;

        // Swap sections
        [sections[currentIndex], sections[newIndex]] = [sections[newIndex], sections[currentIndex]];
        
        // Update order values
        sections.forEach((section, index) => {
            section.order = index;
        });

        const updatedType = {
            ...type,
            sections: sections
        };

        updateMutation.mutate([updatedType]);
    };

    const handleAddField = (typeValue: string, sectionId: string, field: FormField) => {
        const type = types.find(t => t.value === typeValue);
        if (!type) return;

        // Ensure field has an ID
        const fieldWithId = {
            ...field,
            id: field.id || crypto.randomUUID()
        };

        const updatedType = {
            ...type,
            sections: type.sections.map(section => {
                if (section.id === sectionId) {
                    return {
                        ...section,
                        fields: [...section.fields, fieldWithId]
                    };
                }
                return section;
            })
        };

        updateMutation.mutate([updatedType]);
        setAddingFieldsTo(null);
    };

    const handleEditField = (typeValue: string, sectionId: string, fieldName: string, updates: Partial<FormField>) => {
        const type = types.find(t => t.value === typeValue);
        if (!type) return;

        const updatedType = {
            ...type,
            sections: type.sections.map(section => {
                if (section.id === sectionId) {
                    return {
                        ...section,
                        fields: section.fields.map(field => 
                            field.name === fieldName ? { ...field, ...updates } : field
                        )
                    };
                }
                return section;
            })
        };

        updateMutation.mutate([updatedType]);
        setEditingField(null);
    };

    const handleDeleteField = (typeValue: string, sectionId: string, fieldName: string) => {
        const type = types.find(t => t.value === typeValue);
        if (!type) return;

        const updatedType: EquipmentTypeConfig = {
            ...type,
            sections: type.sections.map(section => {
                if (section.id === sectionId) {
                    return {
                        ...section,
                        fields: section.fields.filter(field => field.name !== fieldName)
                    };
                }
                return section;
            })
        };

        updateMutation.mutate([updatedType]);
    };

    const handleReorderFields = (typeValue: string, sectionId: string, sourceIndex: number, targetIndex: number) => {
        const type = types.find(t => t.value === typeValue);
        if (!type) return;

        const section = type.sections.find(s => s.id === sectionId);
        if (!section) return;

        // Ensure all fields have IDs
        const fieldsWithIds = section.fields.map(field => ({
            ...field,
            id: field.id || `field-${field.name}-${Math.random().toString(36).substr(2, 9)}`
        }));

        const [movedField] = fieldsWithIds.splice(sourceIndex, 1);
        fieldsWithIds.splice(targetIndex, 0, movedField);

        // Update order values
        fieldsWithIds.forEach((field, index) => {
            field.order = index;
        });

        const updatedType = {
            ...type,
            sections: type.sections.map(s => {
                if (s.id === sectionId) {
                    return {
                        ...s,
                        fields: fieldsWithIds
                    };
                }
                return s;
            })
        };

        updateMutation.mutate([updatedType]);
    };

    const handleDeleteInspectionSection = (typeValue: string, sectionIndex: number) => {
        const typeIndex = types.findIndex(t => t.value === typeValue);
        if (typeIndex === -1) return;

        const type = types[typeIndex];
        if (!type.inspectionConfig) return;

        const updatedType = {
            ...type,
            inspectionConfig: {
                ...type.inspectionConfig,
                sections: type.inspectionConfig.sections.filter((_, i) => i !== sectionIndex)
            }
        };
        updateMutation.mutate([updatedType]);
    };

    const handleEditSectionTitle = (typeValue: string, sectionId: string, newTitle: string, isInspection: boolean = false) => {
        const type = types.find(t => t.value === typeValue);
        if (!type) return;

        const updatedType = { ...type };
        
        if (isInspection) {
            if (!updatedType.inspectionConfig?.sections) return;
            
            updatedType.inspectionConfig = {
                ...updatedType.inspectionConfig,
                sections: updatedType.inspectionConfig.sections.map(section =>
                    section.id === sectionId ? { ...section, title: newTitle } : section
                )
            };
        } else {
            updatedType.sections = updatedType.sections.map(section =>
                section.id === sectionId ? { ...section, title: newTitle } : section
            );
        }

        const updatedTypes = types.map(t =>
            t.value === typeValue ? updatedType : t
        );

        updateMutation.mutate(updatedTypes);
        setEditingSectionTitle(null);
    };

    const handleReorderSections = (typeValue: string, result: any) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;

        const type = types.find(t => t.value === typeValue);
        if (!type) return;

        const sections = Array.from(type.sections || []);
        const [movedSection] = sections.splice(result.source.index, 1);
        sections.splice(result.destination.index, 0, movedSection);

        // Update order values
        sections.forEach((section, index) => {
            section.order = index;
        });

        const updatedType = {
            ...type,
            sections
        };

        updateMutation.mutate([updatedType]);
    };

    const handleReorderInspectionSections = (typeValue: string, result: any) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;

        const type = types.find(t => t.value === typeValue);
        if (!type || !type.inspectionConfig) return;

        const sections = Array.from(type.inspectionConfig.sections || []);
        const [movedSection] = sections.splice(result.source.index, 1);
        sections.splice(result.destination.index, 0, movedSection);

        const updatedType = {
            ...type,
            inspectionConfig: {
                ...type.inspectionConfig,
                sections
            }
        };

        updateMutation.mutate([updatedType]);
    };

    const handleDeleteInspectionField = (typeValue: string, sectionId: string, fieldName: string) => {
        const type = types.find(t => t.value === typeValue);
        if (!type) return;

        const updatedType: EquipmentTypeConfig = {
            ...type,
            inspectionConfig: {
                ...type.inspectionConfig,
                sections: type.inspectionConfig.sections.map(section => {
                    if (section.id === sectionId) {
                        return {
                            ...section,
                            fields: section.fields.filter(field => field.name !== fieldName)
                        };
                    }
                    return section;
                })
            }
        };

        updateMutation.mutate([updatedType]);
    };

    return (
        <Box>
            {isLoading ? (
                <CircularProgress />
            ) : fetchError ? (
                <Typography color="error">{fetchError.message}</Typography>
            ) : (
                <>
                    <List>
                        {types.map((type) => (
                            <ListItem
                                key={type.value}
                                disablePadding
                                sx={{ flexDirection: 'column', alignItems: 'stretch' }}
                            >
                                <ListItemButton
                                    onClick={() => setExpandedType(expandedType === type.value ? null : type.value)}
                                    sx={{
                                        '& .MuiTypography-root': {
                                            fontSize: '1.5rem',
                                            fontWeight: 600
                                        }
                                    }}
                                >
                                    <ListItemText 
                                        primary={type.label}
                                        primaryTypographyProps={{
                                            variant: 'h4',
                                            sx: { mb: 0 }
                                        }}
                                    />
                                    {expandedType === type.value ? (
                                        <KeyboardArrowDownIcon sx={{ fontSize: '2rem' }} />
                                    ) : (
                                        <KeyboardArrowRightIcon sx={{ fontSize: '2rem' }} />
                                    )}
                                </ListItemButton>

                                <Collapse in={expandedType === type.value}>
                                    <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                                        {/* Equipment Form Section */}
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            p: 1,
                                            bgcolor: 'background.paper',
                                            borderRadius: 1,
                                            mb: 2
                                        }}>
                                            <Typography 
                                                variant="h6"
                                                sx={{ flex: 1, mb: 0 }}
                                            >
                                                Equipment Form
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                onClick={() => handleAddSection(type.value)}
                                                size="small"
                                            >
                                                Add Section
                                            </Button>
                                        </Box>
                                        <DragDropContext onDragEnd={(result) => handleReorderSections(type.value, result)}>
                                            <Droppable droppableId={`equipment-sections-${type.value}`} isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                                                {(provided) => (
                                                    <Box {...provided.droppableProps} ref={provided.innerRef}>
                                                        {type.sections?.map((section, index) => (
                                                            <Draggable key={section.id} draggableId={section.id} index={index} isDragDisabled={false}>
                                                                {(provided) => (
                                                                    <Box
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        sx={{
                                                                            mb: 2,
                                                                            p: 2,
                                                                            bgcolor: 'background.paper',
                                                                            borderRadius: 1,
                                                                            border: '1px solid',
                                                                            borderColor: 'divider'
                                                                        }}
                                                                    >
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                                            <Typography variant="h6" sx={{ flex: 1 }}>
                                                                                {section.title}
                                                                            </Typography>
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => setEditingSectionTitle({
                                                                                    typeValue: type.value,
                                                                                    sectionId: section.id,
                                                                                    currentTitle: section.title,
                                                                                    isInspection: false
                                                                                })}
                                                                                sx={{ mr: 1 }}
                                                                            >
                                                                                <EditIcon />
                                                                            </IconButton>
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleDeleteSection(type.value, section.id)}
                                                                                color="error"
                                                                            >
                                                                                <DeleteIcon />
                                                                            </IconButton>
                                                                        </Box>
                                                                        <Box sx={{ pl: 2 }}>
                                                                            <Button
                                                                                startIcon={<AddIcon />}
                                                                                onClick={() => setAddingFieldsTo({ typeValue: type.value, sectionId: section.id })}
                                                                                size="small"
                                                                            >
                                                                                Add Field
                                                                            </Button>
                                                                            {section.fields && (
                                                                                <FieldList
                                                                                    fields={section.fields}
                                                                                    onAddField={(field) => handleAddField(type.value, section.id, field)}
                                                                                    onEditField={(field) => handleEditField(type.value, section.id, field.name, field)}
                                                                                    onDeleteField={(name) => handleDeleteField(type.value, section.id, name)}
                                                                                    onReorderFields={(result) => handleReorderFields(type.value, section.id, result.source.index, result.destination.index)}
                                                                                    onAddCondition={(fieldName, condition) => handleAddCondition(type.value, section.id, fieldName, condition)}
                                                                                    onDeleteCondition={(fieldName, conditionIndex) => handleDeleteCondition(type.value, section.id, fieldName, conditionIndex)}
                                                                                />
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </Box>
                                                )}
                                            </Droppable>
                                        </DragDropContext>

                                        {/* Inspection Form Section */}
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            p: 1,
                                            bgcolor: 'background.paper',
                                            borderRadius: 1,
                                            mb: 2
                                        }}>
                                            <Typography 
                                                variant="h6"
                                                sx={{ flex: 1, mb: 0 }}
                                            >
                                                Inspection Form
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                onClick={() => handleAddInspectionSection(type)}
                                                size="small"
                                            >
                                                Add Section
                                            </Button>
                                        </Box>
                                        <DragDropContext onDragEnd={(result) => handleReorderInspectionSections(type.value, result)}>
                                            <Droppable droppableId={`inspection-sections-${type.value}`} isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                                                {(provided) => (
                                                    <Box {...provided.droppableProps} ref={provided.innerRef}>
                                                        {type.inspectionConfig?.sections?.map((section, index) => (
                                                            <Draggable key={section.id} draggableId={section.id} index={index} isDragDisabled={false}>
                                                                {(provided) => (
                                                                    <Box
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        sx={{
                                                                            mb: 2,
                                                                            p: 2,
                                                                            bgcolor: 'background.paper',
                                                                            borderRadius: 1,
                                                                            border: '1px solid',
                                                                            borderColor: 'divider'
                                                                        }}
                                                                    >
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                                            <Typography variant="h6" sx={{ flex: 1 }}>
                                                                                {section.title}
                                                                            </Typography>
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => setEditingSectionTitle({
                                                                                    typeValue: type.value,
                                                                                    sectionId: section.id,
                                                                                    currentTitle: section.title,
                                                                                    isInspection: true
                                                                                })}
                                                                                sx={{ mr: 1 }}
                                                                            >
                                                                                <EditIcon />
                                                                            </IconButton>
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleDeleteInspectionSection(type.value, index)}
                                                                                color="error"
                                                                            >
                                                                                <DeleteIcon />
                                                                            </IconButton>
                                                                        </Box>
                                                                        <Box sx={{ pl: 2 }}>
                                                                            <Button
                                                                                startIcon={<AddIcon />}
                                                                                onClick={() => setAddingFieldsTo({ typeValue: type.value, sectionId: section.id })}
                                                                                size="small"
                                                                            >
                                                                                Add Field
                                                                            </Button>
                                                                            {section.fields && (
                                                                                <FieldList
                                                                                    fields={section.fields}
                                                                                    onAddField={(field) => handleAddField(type.value, section.id, field)}
                                                                                    onEditField={(field) => handleEditField(type.value, section.id, field.name, field)}
                                                                                    onDeleteField={(name) => handleDeleteField(type.value, section.id, name)}
                                                                                    onReorderFields={(result) => handleReorderFields(type.value, section.id, result.source.index, result.destination.index)}
                                                                                    onAddCondition={(fieldName, condition) => handleAddCondition(type.value, section.id, fieldName, condition)}
                                                                                    onDeleteCondition={(fieldName, conditionIndex) => handleDeleteCondition(type.value, section.id, fieldName, conditionIndex)}
                                                                                />
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </Box>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                    </Box>
                                </Collapse>
                            </ListItem>
                        ))}
                    </List>

                    {editingField && (
                        <SelectFieldDialog
                            open={true}
                            onClose={() => setEditingField(null)}
                            onSave={(field) => {
                                if (editingField) {
                                    handleEditField(
                                        editingField.typeValue,
                                        editingField.sectionId,
                                        editingField.field.name,
                                        field
                                    );
                                }
                            }}
                            initialValues={editingField.field}
                        />
                    )}
                    {/* Edit Section Title Dialog */}
                    <Dialog 
                        open={editingSectionTitle !== null} 
                        onClose={() => setEditingSectionTitle(null)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>Edit Section Title</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Section Title"
                                type="text"
                                fullWidth
                                value={editingSectionTitle?.currentTitle || ''}
                                onChange={(e) => setEditingSectionTitle(prev => prev ? {
                                    ...prev,
                                    currentTitle: e.target.value
                                } : null)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setEditingSectionTitle(null)}>Cancel</Button>
                            <Button 
                                onClick={() => {
                                    if (editingSectionTitle) {
                                        handleEditSectionTitle(
                                            editingSectionTitle.typeValue,
                                            editingSectionTitle.sectionId,
                                            editingSectionTitle.currentTitle,
                                            editingSectionTitle.isInspection
                                        );
                                    }
                                }}
                                variant="contained"
                            >
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </Box>
    );
}
