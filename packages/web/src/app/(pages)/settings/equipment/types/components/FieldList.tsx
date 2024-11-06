'use client';

import React, { useState } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    IconButton,
    Box,
    Chip,
    Typography,
    Collapse,
    Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
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
    const [selectedField, setSelectedField] = useState<string | null>(null);

    const handleAddRule = (fieldName: string) => {
        setSelectedField(fieldName);
        setRuleDialogOpen(true);
    };

    const handleSaveRule = (condition: Condition) => {
        if (selectedField) {
            onAddCondition(selectedField, condition);
        }
        setRuleDialogOpen(false);
        setSelectedField(null);
    };

    const getFieldTypeLabel = (field: FormField) => {
        switch (field.type) {
            case 'text':
                return 'Text Field';
            case 'number':
                return 'Number Field';
            case 'select':
                return `Dropdown (${isSelectConfig(field.config) ? field.config.options.length : 0} options)`;
            case 'checkbox':
                return 'Checkbox';
            case 'textarea':
                return 'Text Area';
            default:
                return field.type;
        }
    };

    const renderFieldConfig = (field: FormField) => {
        if (isNumberConfig(field.config)) {
            return (
                <Box sx={{ mt: 1 }}>
                    {field.config.min !== undefined && <Typography>Min: {field.config.min}</Typography>}
                    {field.config.max !== undefined && <Typography>Max: {field.config.max}</Typography>}
                    {field.config.step !== undefined && <Typography>Step: {field.config.step}</Typography>}
                </Box>
            );
        }

        if (isSelectConfig(field.config)) {
            return (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="caption">Options:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {field.config.options.map((option: string) => (
                            <Chip key={option} label={option} size="small" />
                        ))}
                    </Box>
                </Box>
            );
        }

        return null;
    };

    const renderConditions = (field: FormField) => {
        if (!field.conditions?.length) return null;

        return (
            <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Conditions:</Typography>
                {field.conditions.map((condition, index) => {
                    const dependentField = fields.find(f => f.name === condition.field);
                    return (
                        <Box 
                            key={index} 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                mt: 0.5,
                                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                borderRadius: 1,
                                p: 1
                            }}
                        >
                            <Typography variant="body2">
                                When {dependentField?.label || condition.field} is {String(condition.value)}
                                {condition.makeRequired && ' (Required)'}
                            </Typography>
                            <IconButton 
                                size="small" 
                                onClick={() => onDeleteCondition(field.name, index)}
                                sx={{ ml: 'auto' }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    );
                })}
            </Box>
        );
    };

    return (
        <>
            <List>
                {fields.map((field) => (
                    <ListItem
                        key={field.name}
                        sx={{
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            bgcolor: 'background.paper',
                            mb: 1,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
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
                            
                            <ListItemText
                                primary={field.label}
                                secondary={
                                    <Box component="span" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                                    </Box>
                                }
                            />

                            <Box sx={{ ml: 'auto', display: 'flex' }}>
                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={() => handleAddRule(field.name)}
                                    size="small"
                                >
                                    Add Rule
                                </Button>
                                <IconButton onClick={() => onEditField(field)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => onDeleteField(field.name)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Box>

                        <Collapse in={expandedField === field.name} sx={{ width: '100%', pl: 6 }}>
                            <Box sx={{ py: 1 }}>
                                {field.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {field.description}
                                    </Typography>
                                )}
                                {renderFieldConfig(field)}
                                {renderConditions(field)}
                            </Box>
                        </Collapse>
                    </ListItem>
                ))}
            </List>

            <RuleDialog
                open={ruleDialogOpen}
                onClose={() => {
                    setRuleDialogOpen(false);
                    setSelectedField(null);
                }}
                onSave={handleSaveRule}
                availableFields={fields}
                currentFieldName={selectedField || ''}
            />
        </>
    );
}
