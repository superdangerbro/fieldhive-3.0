'use client';

import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    Collapse,
    Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RuleIcon from '@mui/icons-material/Rule';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import type { FormField, Condition } from './types';
import { isNumberConfig, isSelectConfig } from './types';
import { RuleDialog } from './RuleDialog';

interface FieldListProps {
    fields: FormField[];
    onDeleteField: (name: string) => void;
    onEditField: (field: FormField) => void;
    onAddCondition: (fieldName: string, condition: Condition) => void;
    onDeleteCondition: (fieldName: string, conditionIndex: number) => void;
}

export function FieldList({ 
    fields,
    onDeleteField,
    onEditField,
    onAddCondition,
    onDeleteCondition
}: FieldListProps) {
    const [expandedField, setExpandedField] = useState<string | null>(null);
    const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
    const [selectedField, setSelectedField] = useState<FormField | null>(null);

    const handleAddRule = (field: FormField) => {
        setSelectedField(field);
        setRuleDialogOpen(true);
    };

    const handleSaveRule = (condition: Condition) => {
        if (selectedField) {
            onAddCondition(selectedField.name, condition);
        }
        setRuleDialogOpen(false);
        setSelectedField(null);
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
            case 'capture-flow':
                return 'Equipment Capture';
            case 'boolean':
                return 'Yes/No';
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
        <Box>
            {fields.map((field) => (
                <Box
                    key={field.name}
                    sx={{
                        bgcolor: 'background.paper',
                        mb: 1,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 1
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <IconButton
                            onClick={() => setExpandedField(expandedField === field.name ? null : field.name)}
                            size="small"
                        >
                            {expandedField === field.name ? (
                                <KeyboardArrowDownIcon />
                            ) : (
                                <KeyboardArrowRightIcon />
                            )}
                        </IconButton>
                        
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

                    <Collapse in={expandedField === field.name}>
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
                </Box>
            ))}

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
        </Box>
    );
}
