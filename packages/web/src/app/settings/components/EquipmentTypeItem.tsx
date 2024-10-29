'use client';

import React, { useState } from 'react';
import { Box, Typography, IconButton, Collapse, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { EquipmentTypeConfig, NewFieldState, FormField } from './types';
import AddFieldForm from './AddFieldForm';
import FieldList from './FieldList';
import EditFieldDialog from './EditFieldDialog';
import CopyFieldsDialog from './CopyFieldsDialog';
import RuleDialog from './RuleDialog';

interface Props {
    type: EquipmentTypeConfig;
    allTypes: EquipmentTypeConfig[];
    isExpanded: boolean;
    newField: NewFieldState;
    onToggleExpand: () => void;
    onDeleteType: () => void;
    onFieldChange: (typeName: string, field: NewFieldState) => void;
    onAddField: (typeName: string) => void;
    onDeleteField: (typeName: string, fieldName: string) => void;
    onReorderFields: (typeName: string, startIndex: number, endIndex: number) => void;
    onUpdateField: (typeName: string, fieldName: string, updates: Partial<FormField>) => void;
    onCopyFields: (typeName: string, fields: FormField[]) => void;
}

export default function EquipmentTypeItem({
    type,
    allTypes,
    isExpanded,
    newField,
    onToggleExpand,
    onDeleteType,
    onFieldChange,
    onAddField,
    onDeleteField,
    onReorderFields,
    onUpdateField,
    onCopyFields
}: Props) {
    const [editField, setEditField] = useState<FormField | null>(null);
    const [copyDialogOpen, setCopyDialogOpen] = useState(false);
    const [ruleDialog, setRuleDialog] = useState<{
        open: boolean;
        fieldName: string;
    }>({ open: false, fieldName: '' });

    const handleAddCondition = (fieldName: string) => {
        setRuleDialog({ open: true, fieldName });
    };

    const handleSaveCondition = (condition: { field: string; value: any }) => {
        const field = type.fields.find(f => f.name === ruleDialog.fieldName);
        if (field) {
            onUpdateField(type.name, field.name, {
                ...field,
                showWhen: [...(field.showWhen || []), condition]
            });
        }
        setRuleDialog({ open: false, fieldName: '' });
    };

    const handleEditField = (field: FormField) => {
        setEditField(field);
    };

    const handleSaveEdit = (updatedField: FormField) => {
        if (editField) {
            onUpdateField(type.name, editField.name, updatedField);
        }
        setEditField(null);
    };

    const handleCopyField = (field: FormField) => {
        onCopyFields(type.name, [field]);
    };

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
                <Button
                    startIcon={<ContentCopyIcon />}
                    onClick={(e) => {
                        e.stopPropagation();
                        setCopyDialogOpen(true);
                    }}
                    sx={{ mr: 1 }}
                >
                    Copy Fields
                </Button>
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
                        onAddCondition={handleAddCondition}
                        onEditField={handleEditField}
                        onCopyField={handleCopyField}
                    />
                </Box>
            </Collapse>

            {/* Edit Field Dialog */}
            {editField && (
                <EditFieldDialog
                    open={!!editField}
                    field={editField}
                    onClose={() => setEditField(null)}
                    onSave={handleSaveEdit}
                />
            )}

            {/* Copy Fields Dialog */}
            <CopyFieldsDialog
                open={copyDialogOpen}
                onClose={() => setCopyDialogOpen(false)}
                equipmentTypes={allTypes}
                currentType={type.name}
                onCopyFields={(sourceType, fields) => onCopyFields(type.name, fields)}
            />

            {/* Rule Dialog */}
            <RuleDialog
                open={ruleDialog.open}
                onClose={() => setRuleDialog({ open: false, fieldName: '' })}
                onSave={handleSaveCondition}
                fields={type.fields}
                currentFieldName={ruleDialog.fieldName}
            />
        </Box>
    );
}
