'use client';

import React from 'react';
import { Box, Typography, IconButton, Button, Chip, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RuleIcon from '@mui/icons-material/Rule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from 'react-beautiful-dnd';
import { FormField } from './types';

interface Props {
    fields: FormField[];
    onDeleteField: (fieldName: string) => void;
    onReorderFields: (startIndex: number, endIndex: number) => void;
    onAddCondition: (fieldName: string) => void;
    onEditField: (field: FormField) => void;
    onCopyField: (field: FormField) => void;
}

export default function FieldList({ 
    fields, 
    onDeleteField, 
    onReorderFields, 
    onAddCondition,
    onEditField,
    onCopyField
}: Props) {
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        onReorderFields(result.source.index, result.destination.index);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields">
                {(provided: DroppableProvided) => (
                    <Box 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        {fields.map((field, index) => (
                            <Draggable 
                                key={field.name} 
                                draggableId={field.name} 
                                index={index}
                            >
                                {(provided: DraggableProvided) => (
                                    <Paper
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        elevation={1}
                                        sx={{ overflow: 'hidden' }}
                                    >
                                        <Box 
                                            sx={{ 
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: 2,
                                                bgcolor: 'background.paper',
                                                borderBottom: field.showWhen?.length ? 1 : 0,
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <Box {...provided.dragHandleProps} sx={{ mr: 1, color: 'text.secondary' }}>
                                                <DragIndicatorIcon />
                                            </Box>

                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle1">{field.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {field.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    {field.type === 'select' && 
                                                        field.options && 
                                                        `: ${field.options.join(' | ')}`}
                                                    {(['number-input', 'number-stepper', 'slider'].includes(field.type)) &&
                                                        field.numberConfig &&
                                                        `: ${field.numberConfig.min} to ${field.numberConfig.max}${field.numberConfig.step !== 1 ? `, step ${field.numberConfig.step}` : ''}`}
                                                </Typography>
                                            </Box>

                                            {field.required && (
                                                <Chip 
                                                    label="Always Required" 
                                                    size="small" 
                                                    color="primary"
                                                    sx={{ mr: 2 }}
                                                />
                                            )}

                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton 
                                                    onClick={() => onCopyField(field)}
                                                    size="small"
                                                    title="Copy Field"
                                                >
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                                
                                                <IconButton 
                                                    onClick={() => onEditField(field)}
                                                    size="small"
                                                    title="Edit Field"
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                
                                                <Button 
                                                    startIcon={<RuleIcon />}
                                                    onClick={() => onAddCondition(field.name)}
                                                    size="small"
                                                    variant="outlined"
                                                >
                                                    Add Rule
                                                </Button>
                                                
                                                <IconButton 
                                                    onClick={() => onDeleteField(field.name)}
                                                    size="small"
                                                    color="error"
                                                    title="Delete Field"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        {/* Rules Section */}
                                        {field.showWhen && field.showWhen.length > 0 && (
                                            <Box sx={{ 
                                                bgcolor: 'action.hover',
                                                p: 2,
                                                pl: 6
                                            }}>
                                                <Typography 
                                                    variant="caption" 
                                                    color="text.secondary" 
                                                    sx={{ 
                                                        display: 'block',
                                                        mb: 1,
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    Display Rules
                                                </Typography>
                                                {field.showWhen.map((condition, idx) => (
                                                    <Box 
                                                        key={`${condition.field}-${idx}`}
                                                        sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            mb: idx < field.showWhen!.length - 1 ? 1 : 0
                                                        }}
                                                    >
                                                        <Typography variant="body2">
                                                            Show when {condition.field} is {JSON.stringify(condition.value)}
                                                            {condition.makeRequired && (
                                                                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                                                                    <CheckCircleIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                                                                    Required when shown
                                                                </Box>
                                                            )}
                                                        </Typography>
                                                        <IconButton 
                                                            size="small"
                                                            onClick={() => {
                                                                const updatedConditions = field.showWhen?.filter((_, i) => i !== idx);
                                                                onEditField({
                                                                    ...field,
                                                                    showWhen: updatedConditions
                                                                });
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Paper>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </Box>
                )}
            </Droppable>
        </DragDropContext>
    );
}
