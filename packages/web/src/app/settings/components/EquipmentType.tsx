'use client';

import React from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { EquipmentTypeConfig, NewFieldState, FormField } from './types';
import AddFieldForm from './AddFieldForm';
import FieldList from './FieldList';

interface Props {
    type: EquipmentTypeConfig;
    isExpanded: boolean;
    newField: NewFieldState;
    onToggleExpand: () => void;
    onDeleteType: () => void;
    onFieldChange: (typeName: string, field: NewFieldState) => void;
    onAddField: (typeName: string) => void;
    onDeleteField: (typeName: string, fieldName: string) => void;
    onReorderFields: (typeName: string, startIndex: number, endIndex: number) => void;
    onUpdateField: (typeName: string, fieldName: string, updates: Partial<FormField>) => void;
}

export default function EquipmentType({
    type,
    isExpanded,
    newField,
    onToggleExpand,
    onDeleteType,
    onFieldChange,
    onAddField,
    onDeleteField,
    onReorderFields,
    onUpdateField
}: Props) {
    return (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Box 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={onToggleExpand}
            >
                <IconButton size="small" sx={{ mr: 1 }}>
                    {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                </IconButton>
                <Typography sx={{ flex: 1 }}>{type.name}</Typography>
                <IconButton onClick={(e) => {
                    e.stopPropagation();
                    onDeleteType();
                }}>
                    <DeleteIcon />
                </IconButton>
            </Box>

            <Collapse in={isExpanded}>
                <Box sx={{ p: 2, pl: 6, bgcolor: 'action.hover' }}>
                    <AddFieldForm
                        typeName={type.name}
                        field={newField}
                        onFieldChange={onFieldChange}
                        onAddField={onAddField}
                    />
                    <FieldList
                        fields={type.fields}
                        onDeleteField={(fieldName) => onDeleteField(type.name, fieldName)}
                        onReorderFields={(start, end) => onReorderFields(type.name, start, end)}
                        onAddCondition={() => {}}
                        onEditField={(field) => onUpdateField(type.name, field.name, field)}
                        onCopyField={() => {}}
                    />
                </Box>
            </Collapse>
        </Box>
    );
}
