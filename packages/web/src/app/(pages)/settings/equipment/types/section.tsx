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
    DialogContent,
    FormControlLabel,
    Switch,
    Divider
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
import type { EquipmentTypeConfig, FormField } from './components/types';
import { AddFieldForm } from './components/AddFieldForm';
import { FieldList } from './components/FieldList';
import { InspectionFormBuilder } from './components/InspectionFormBuilder';

export function EquipmentTypeSection() {
    console.log('EquipmentTypeSection render');
    const { data: types = [], isLoading, error: fetchError } = useEquipmentTypes();
    const updateMutation = useUpdateEquipmentTypes();
    const { dialogState, openCreateDialog, openEditDialog, openDeleteDialog, closeDialog } = useCrudDialogs();
    const [expandedType, setExpandedType] = React.useState<string | null>(null);
    const [addingFieldsTo, setAddingFieldsTo] = React.useState<string | null>(null);
    const [editingField, setEditingField] = React.useState<{ typeValue: string; field: FormField } | null>(null);
    const [configuringInspection, setConfiguringInspection] = React.useState<string | null>(null);
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSave = async (data: EquipmentTypeConfig) => {
        console.log('Saving type:', { mode: dialogState.mode, data });
        try {
            // If we're updating an existing type (not in dialog mode)
            if (!dialogState.isOpen) {
                const updatedTypes = types.map(type => 
                    type.value === data.value ? data : type
                );
                await updateMutation.mutateAsync(updatedTypes);
                return;
            }

            // If we're in dialog mode (creating or editing)
            const updatedTypes = dialogState.mode === 'create'
                ? [...types, data]
                : types.map(type => 
                    type.value === dialogState.data?.value ? data : type
                );
            
            await updateMutation.mutateAsync(updatedTypes);
            closeDialog();
        } catch (error) {
            console.error('Failed to save type:', error);
        }
    };

    const handleDelete = async (typeToDelete: EquipmentTypeConfig) => {
        console.log('Deleting type:', typeToDelete);
        try {
            const updatedTypes = types.filter((type: EquipmentTypeConfig) => type.value !== typeToDelete.value);
            await updateMutation.mutateAsync(updatedTypes);
            closeDialog();
        } catch (error) {
            console.error('Failed to delete type:', error);
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
            setAddingFieldsTo(null);
        } catch (error) {
            console.error('Failed to add field:', error);
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
            setEditingField(null);
        } catch (error) {
            console.error('Failed to edit field:', error);
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
        } catch (error) {
            console.error('Failed to delete field:', error);
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
                        disablePadding
                        sx={{
                            display: 'block',
                            backgroundColor: 'background.paper',
                            mb: 2,
                            borderRadius: 1,
                            boxShadow: 1
                        }}
                    >
                        <ListItemButton onClick={() => setExpandedType(expandedType === type.value ? null : type.value)} sx={{ p: 2 }}>
                            <Typography variant="h5" sx={{ flex: 1, fontWeight: 600, fontSize: '1.5rem' }}>
                                {type.label}
                            </Typography>
                            {expandedType === type.value ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItemButton>
                        <Collapse in={expandedType === type.value}>
                            <Box sx={{ p: 2 }}>
                                <Box sx={{ pl: 2 }}>
                                    <Typography variant="caption" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                                        General Settings
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={type.barcodeRequired}
                                                    onChange={async (e) => {
                                                        const updatedType = {
                                                            ...type,
                                                            barcodeRequired: e.target.checked
                                                        };
                                                        await handleSave(updatedType);
                                                    }}
                                                />
                                            }
                                            label="Require Barcode"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={type.photoRequired}
                                                    onChange={async (e) => {
                                                        const updatedType = {
                                                            ...type,
                                                            photoRequired: e.target.checked
                                                        };
                                                        await handleSave(updatedType);
                                                    }}
                                                />
                                            }
                                            label="Require Photo"
                                        />
                                    </Box>
                                </Box>

                                <Box sx={{ mt: 3, pl: 2 }}>
                                    <Typography variant="caption" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                                        Fields
                                    </Typography>
                                    
                                    <Box sx={{ mt: 1 }}>
                                        <Button
                                            startIcon={<AddIcon />}
                                            onClick={() => setAddingFieldsTo(type.value)}
                                            variant="outlined"
                                            size="small"
                                        >
                                            Add Field
                                        </Button>
                                    </Box>
                                </Box>

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
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        size="small"
                                        onClick={() => setConfiguringInspection(type.value)}
                                        startIcon={<SettingsIcon />}
                                    >
                                        Configure Inspection Form
                                    </Button>
                                </Box>
                                <IconButton onClick={() => openEditDialog(type)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => openDeleteDialog(type)}>
                                    <DeleteIcon />
                                </IconButton>
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
                            fields: dialogState.data?.fields || [],
                            barcodeRequired: false,
                            photoRequired: false
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

            <Dialog 
                open={!!configuringInspection} 
                onClose={() => setConfiguringInspection(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogContent>
                    {configuringInspection && (
                        <InspectionFormBuilder
                            equipmentType={types.find(t => t.value === configuringInspection)!}
                            onSave={async (updatedType) => {
                                const updatedTypes = types.map(type => 
                                    type.value === configuringInspection ? updatedType : type
                                );
                                await updateMutation.mutateAsync(updatedTypes);
                                setConfiguringInspection(null);
                            }}
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
        </Box>
    );
}
