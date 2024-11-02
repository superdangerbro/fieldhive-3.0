'use client';

import React from 'react';
import { List, ListItem, ListItemText, IconButton, Box, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RuleIcon from '@mui/icons-material/Rule';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { FormField } from '../types';

interface Props {
    fields: FormField[];
    onDeleteField: (fieldName: string) => void;
    onReorderFields: (startIndex: number, endIndex: number) => void;
    onAddCondition: (fieldName: string) => void;
    onEditField: (field: FormField) => void;
    onCopyField: (field: FormField) => void;
}

export function FieldList({
    fields,
    onDeleteField,
    onReorderFields,
    onAddCondition,
    onEditField,
    onCopyField
}: Props) {
    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            onReorderFields(draggedIndex, index);
            setDraggedIndex(index);
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <List>
            {fields.map((field, index) => (
                <ListItem
                    key={field.name}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    sx={{
                        bgcolor: 'background.paper',
                        mb: 1,
                        borderRadius: 1,
                        cursor: 'move'
                    }}
                >
                    <DragIndicatorIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                        primary={field.name}
                        secondary={
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip
                                    label={field.type}
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
                                {field.showWhen && field.showWhen.length > 0 && (
                                    <Chip
                                        label={`${field.showWhen.length} condition${field.showWhen.length > 1 ? 's' : ''}`}
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        }
                    />
                    <IconButton onClick={() => onAddCondition(field.name)}>
                        <RuleIcon />
                    </IconButton>
                    <IconButton onClick={() => onEditField(field)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => onCopyField(field)}>
                        <ContentCopyIcon />
                    </IconButton>
                    <IconButton onClick={() => onDeleteField(field.name)}>
                        <DeleteIcon />
                    </IconButton>
                </ListItem>
            ))}
        </List>
    );
}
