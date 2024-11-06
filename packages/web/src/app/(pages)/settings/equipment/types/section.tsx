'use client';

import React from 'react';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    IconButton,
    CircularProgress,
    TextField,
    Collapse,
    Dialog,
    DialogContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useEquipmentTypes, useUpdateEquipmentTypes } from '../hooks/useEquipment';
import { useCrudDialogs } from '@/app/globalHooks/useCrudDialogs';
import { useActionNotifications } from '@/app/globalHooks/useActionNotifications';
import { CrudFormDialog, CrudDeleteDialog } from '@/app/globalComponents/crud/CrudDialogs';
import { ActionNotifications } from '@/app/globalComponents/crud/ActionNotifications';
import type { EquipmentTypeConfig, FormField } from './components/types';
import { AddFieldForm } from './components/AddFieldForm';
import { FieldList } from './components/FieldList';

export function EquipmentTypeSection() {
    console.log('EquipmentTypeSection render');
    const { data: types = [], isLoading, error: fetchError } = useEquipmentTypes();
    const updateMutation = useUpdateEquipmentTypes();
    const { dialogState, openCreateDialog, openEditDialog, openDeleteDialog, closeDialog } = useCrudDialogs();
    const { notificationState, notifyAction, clearNotifications } = useActionNotifications();
    const [expandedType, setExpandedType] = React.useState<string | null>(null);
    const [addingFieldsTo, setAddingFieldsTo] = React.useState<string | null>(null);
    const [editingField, setEditingField] = React.useState<{ typeValue: string; field: FormField } | null>(null);
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSave = async (data: EquipmentTypeConfig) => {
        console.log('Saving type:', { mode: dialogState.mode, data });
        try {
            const updatedTypes = dialogState.mode === 'create'
                ? [...types, data]
                : types.map((type: EquipmentTypeConfig) => 
                    type.value === dialogState.data?.value ? data : type
                );
            
            await updateMutation.mutateAsync(updatedTypes);
            notifyAction(dialogState.mode === 'create' ? 'created' : 'updated', 'Equipment type', true);
            closeDialog();
        } catch (error) {
            console.error('Failed to save type:', error);
            notifyAction(dialogState.mode === 'create' ? 'create' : 'update', 'Equipment type', false);
        }
    };

    const handleDelete = async (typeToDelete: EquipmentTypeConfig) => {
        console.log('Deleting type:', typeToDelete);
        try {
            const updatedTypes = types.filter((type: EquipmentTypeConfig) => type.value !== typeToDelete.value);
            await updateMutation.mutateAsync(updatedTypes);
            notifyAction('delete', 'Equipment type', true);
            closeDialog();
        } catch (error) {
            console.error('Failed to delete type:', error);
            notifyAction('delete', 'Equipment type', false);
        }
    };

    const handleAddField = async (typeValue: string, field: FormField) => {
        console.log('Adding field:', { typeValue, field });
        try {
            const updatedTypes = types.map(type => {
                if (type.value === typeValue) {
                    return {
                        ...type,
                        fields: [...type.fields, field]
                    };
                }
                return type;
            });

            await updateMutation.mutateAsync(updatedTypes);
            notifyAction('added', 'Field', true);
            setAddingFieldsTo(null);
        } catch (error) {
            console.error('Failed to add field:', error);
            notifyAction('add', 'Field', false);
        }
    };

    const handleEditField = async (typeValue: string, oldField: FormField, newField: FormField) => {
        console.log('Editing field:', { typeValue, oldField, newField });
        try {
            const updatedTypes = types.map(type => {
                if (type.value === typeValue) {
                    return {
                        ...type,
                        fields: type.fields.map(field => 
                            field.name === oldField.name ? newField : field
                        )
                    };
                }
                return type;
            });

            await updateMutation.mutateAsync(updatedTypes);
            notifyAction('updated', 'Field', true);
            setEditingField(null);
        } catch (error) {
            console.error('Failed to edit field:', error);
            notifyAction('update', 'Field', false);
        }
    };

    const handleDeleteField = async (typeValue: string, fieldName: string) => {
        console.log('Deleting field:', { typeValue, fieldName });
        try {
            const updatedTypes = types.map(type => {
                if (type.value === typeValue) {
                    return {
                        ...type,
                        fields: type.fields.filter(field => field.name !== fieldName)
                    };
                }
                return type;
            });

            await updateMutation.mutateAsync(updatedTypes);
            notifyAction('deleted', 'Field', true);
        } catch (error) {
            console.error('Failed to delete field:', error);
            notifyAction('delete', 'Field', false);
        }
    };

    if (isLoading || updateMutation.isPending) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (fetchError || updateMutation.error) {
        const error = fetchError || updateMutation.error;
        return (
            <Box sx={{ p: 2, color: 'error.main' }}>
                <Typography>{error instanceof Error ? error.message : 'An error occurred'}</Typography>
            </Box>
        );
    }

    const isFormDialog = dialogState.isOpen && dialogState.mode !== 'delete';

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                    Equipment Types
                </Typography>
                <Button 
                    variant="contained"
                    onClick={openCreateDialog}
                >
                    Add Equipment Type
                </Button>
            </Box>

            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Configure the available equipment types and their fields
            </Typography>

            <List>
                {types.map((type: EquipmentTypeConfig) => (
                    <ListItem
                        key={type.value}
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
                                onClick={() => setExpandedType(expandedType === type.value ? null : type.value)}
                                size="small"
                            >
                                {expandedType === type.value ? (
                                    <KeyboardArrowDownIcon />
                                ) : (
                                    <KeyboardArrowRightIcon />
                                )}
                            </IconButton>

                            <Typography sx={{ flex: 1 }}>{type.label}</Typography>

                            <Button
                                onClick={() => setAddingFieldsTo(type.value)}
                                variant="outlined"
                                size="small"
                                sx={{ mr: 1 }}
                            >
                                Add Field
                            </Button>

                            <IconButton onClick={() => openEditDialog(type)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => openDeleteDialog(type)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>

                        <Collapse in={expandedType === type.value} sx={{ width: '100%', pl: 6 }}>
                            <Box sx={{ py: 1 }}>
                                <FieldList
                                    fields={type.fields}
                                    onDeleteField={(name) => handleDeleteField(type.value, name)}
                                    onEditField={(field) => setEditingField({ typeValue: type.value, field })}
                                    onAddCondition={(fieldName, condition) => {
                                        const field = type.fields.find(f => f.name === fieldName);
                                        if (field) {
                                            handleEditField(type.value, field, {
                                                ...field,
                                                conditions: [...(field.conditions || []), condition]
                                            });
                                        }
                                    }}
                                    onDeleteCondition={(fieldName, conditionIndex) => {
                                        const field = type.fields.find(f => f.name === fieldName);
                                        if (field && field.conditions) {
                                            handleEditField(type.value, field, {
                                                ...field,
                                                conditions: field.conditions.filter((_, i) => i !== conditionIndex)
                                            });
                                        }
                                    }}
                                />
                            </Box>
                        </Collapse>
                    </ListItem>
                ))}
            </List>

            {isFormDialog && (
                <CrudFormDialog
                    open={true}
                    onClose={closeDialog}
                    title={dialogState.mode === 'create' ? 'Add Equipment Type' : 'Edit Equipment Type'}
                    actions={
                        <>
                            <Button onClick={closeDialog}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={() => formRef.current?.requestSubmit()}
                                variant="contained"
                            >
                                {dialogState.mode === 'create' ? 'Add Type' : 'Save Changes'}
                            </Button>
                        </>
                    }
                >
                    <form ref={formRef} onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const name = formData.get('name') as string;
                        
                        if (!name.trim()) return;

                        if (dialogState.mode === 'create' && 
                            types.some(t => t.value === name.trim().toLowerCase())) {
                            alert('An equipment type with this name already exists');
                            return;
                        }

                        handleSave({
                            value: name.toLowerCase(),
                            label: name,
                            fields: dialogState.data?.fields || []
                        });
                    }}>
                        <TextField
                            name="name"
                            label="Type Name"
                            defaultValue={dialogState.data?.label || ''}
                            fullWidth
                            autoFocus
                            required
                        />
                    </form>
                </CrudFormDialog>
            )}

            <Dialog 
                open={!!addingFieldsTo} 
                onClose={() => setAddingFieldsTo(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    {addingFieldsTo && (
                        <AddFieldForm
                            mode="add"
                            onAdd={(field) => handleAddField(addingFieldsTo, field)}
                            onCancel={() => setAddingFieldsTo(null)}
                            existingFields={(types.find(t => t.value === addingFieldsTo)?.fields || []).map(f => f.name)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog 
                open={!!editingField} 
                onClose={() => setEditingField(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    {editingField && (
                        <AddFieldForm
                            mode="edit"
                            initialField={editingField.field}
                            onAdd={(field) => handleEditField(editingField.typeValue, editingField.field, field)}
                            onCancel={() => setEditingField(null)}
                            existingFields={(types.find(t => t.value === editingField.typeValue)?.fields || [])
                                .filter(f => f.name !== editingField.field.name)
                                .map(f => f.name)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <CrudDeleteDialog
                open={dialogState.isOpen && dialogState.mode === 'delete'}
                onClose={closeDialog}
                onConfirm={() => dialogState.data && handleDelete(dialogState.data)}
                title="Delete Equipment Type"
                message={`Are you sure you want to delete the equipment type "${dialogState.data?.label}"? This action cannot be undone.`}
            />

            <ActionNotifications
                successMessage={notificationState.successMessage}
                errorMessage={notificationState.errorMessage}
                onClose={clearNotifications}
            />
        </Box>
    );
}
