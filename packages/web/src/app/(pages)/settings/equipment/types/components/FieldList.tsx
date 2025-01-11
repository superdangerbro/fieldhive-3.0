'use client';

import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    Collapse,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowRight as KeyboardArrowRightIcon,
    Edit as EditIcon,
    DragIndicator as DragIndicatorIcon,
    Rule as RuleIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { FormField, Condition } from './types';
import { isNumberConfig, isSelectConfig } from './types';
import { RuleDialog } from './RuleDialog';

interface FieldListProps {
    fields: FormField[];
    onAddField: (field: FormField) => void;
    onEditField: (field: FormField) => void;
    onDeleteField: (name: string) => void;
    onReorderFields: (result: any) => void;
    onAddCondition: (fieldName: string, condition: Condition) => void;
    onDeleteCondition: (fieldName: string, conditionIndex: number) => void;
}

export function FieldList({ 
    fields,
    onDeleteField,
    onEditField,
    onReorderFields,
    onAddCondition,
    onDeleteCondition
}: FieldListProps) {
    // Sort fields by order and ensure each has an ID
    const sortedFields = [...fields].map(field => ({
        ...field,
        id: field.id || `field-${field.name}-${Math.random().toString(36).substr(2, 9)}`
    })).sort((a, b) => (a.order || 0) - (b.order || 0));
    const [expandedField, setExpandedField] = useState<string | null>(null);
    const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
    const [selectedField, setSelectedField] = useState<FormField | null>(null);

    const handleAddRule = (field: FormField) => {
        setSelectedField(field);
        setRuleDialogOpen(true);
    };

    const handleSaveRule = (rule: Condition) => {
        if (selectedField) {
            onAddCondition(selectedField.name, rule);
        }
        setRuleDialogOpen(false);
        setSelectedField(null);
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination || result.source.index === result.destination.index) return;
        
        const sourceIndex = result.source.index;
        const targetIndex = result.destination.index;
        
        onReorderFields({
            source: { index: sourceIndex },
            destination: { index: targetIndex }
        });
    };

    const getFieldTypeLabel = (field: FormField) => {
        switch (field.type) {
            case 'text':
                return 'Text';
            case 'number':
                return 'Number';
            case 'select':
                return 'Select';
            case 'checkbox':
                return 'Checkbox';
            case 'textarea':
                return 'Text Area';
            default:
                return field.type;
        }
    };

    const renderFieldConfig = (field: FormField) => {
        if (field.type === 'select' && isSelectConfig(field.config)) {
            return (
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Options:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {field.config.options.map((option, index) => (
                            <Chip 
                                key={index} 
                                label={option} 
                                size="small" 
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Box>
            );
        }
        return null;
    };

    return (
        <>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="fields-list" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                    {(provided) => (
                        <Box 
                            {...provided.droppableProps} 
                            ref={provided.innerRef}
                        >
                            {sortedFields.map((field, index) => (
                                <Draggable 
                                    key={field.id} 
                                    draggableId={field.id} 
                                    index={index}
                                    isDragDisabled={false}
                                >
                                    {(provided) => (
                                        <Box
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: 1,
                                                mb: 1,
                                                bgcolor: 'background.paper',
                                                borderRadius: 1,
                                                border: '1px solid',
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <Box {...provided.dragHandleProps} sx={{ mr: 1 }}>
                                                <DragIndicatorIcon />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body1">{field.label}</Typography>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                                    <Chip 
                                                        label={getFieldTypeLabel(field)} 
                                                        size="small" 
                                                        variant="outlined"
                                                    />
                                                    {field.required && (
                                                        <Chip 
                                                            label="Required" 
                                                            size="small" 
                                                            color="primary" 
                                                            variant="outlined"
                                                        />
                                                    )}
                                                    {field.conditions?.length > 0 && (
                                                        <Chip 
                                                            label={`${field.conditions.length} Rules`}
                                                            size="small"
                                                            color="info"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Box>
                                            </Box>

                                            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                                                <Button
                                                    startIcon={<RuleIcon />}
                                                    onClick={() => handleAddRule(field)}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ 
                                                        color: 'text.primary',
                                                        borderColor: 'divider',
                                                        '&:hover': {
                                                            borderColor: 'primary.main'
                                                        }
                                                    }}
                                                >
                                                    Rules
                                                </Button>
                                                <IconButton 
                                                    onClick={() => onEditField(field)}
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton 
                                                    onClick={() => onDeleteField(field.name)}
                                                    size="small"
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                            {sortedFields.map((field, index) => (
                                <Collapse key={field.name} in={expandedField === field.name}>
                                    <Box sx={{ px: 2, pb: 2 }}>
                                        {field.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {field.description}
                                            </Typography>
                                        )}
                                        
                                        {renderFieldConfig(field)}
                                        
                                        {field.conditions && field.conditions.length > 0 && (
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                    Rules:
                                                </Typography>
                                                {field.conditions.map((condition, index) => (
                                                    <Box 
                                                        key={index}
                                                        sx={{ 
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            mb: 1,
                                                            p: 1,
                                                            bgcolor: 'action.hover',
                                                            borderRadius: 1
                                                        }}
                                                    >
                                                        <Typography variant="body2">
                                                            When field{' '}
                                                            <strong>{condition.field}</strong>{' '}
                                                            {condition.operator}{' '}
                                                            <strong>{condition.value}</strong>
                                                            {condition.makeRequired && (
                                                                <Typography 
                                                                    component="span" 
                                                                    variant="caption" 
                                                                    color="warning.main"
                                                                    sx={{ ml: 1 }}
                                                                >
                                                                    (Make Required)
                                                                </Typography>
                                                            )}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => onDeleteCondition(field.name, index)}
                                                            sx={{ 
                                                                ml: 'auto',
                                                                opacity: 0.5,
                                                                '&:hover': { 
                                                                    opacity: 1,
                                                                    color: 'error.main'
                                                                }
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </Collapse>
                            ))}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>

            {selectedField && ruleDialogOpen && (
                <RuleDialog
                    open={ruleDialogOpen}
                    onClose={() => {
                        setRuleDialogOpen(false);
                        setSelectedField(null);
                    }}
                    onSave={handleSaveRule}
                    availableFields={{
                        equipment: fields,
                        inspection: []
                    }}
                    currentFieldName={selectedField.name}
                />
            )}
        </>
    );
}
