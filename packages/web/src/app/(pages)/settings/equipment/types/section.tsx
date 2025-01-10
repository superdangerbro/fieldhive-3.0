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
    DialogTitle,
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
import type { EquipmentTypeConfig, FormField } from './components/types';
import { SelectFieldDialog } from '@/app/components/fields/SelectFieldDialog';
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
    const [saveError, setSaveError] = React.useState<string | null>(null);
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSave = async (data: EquipmentTypeConfig) => {
        console.log('Saving type:', { mode: dialogState.mode, data });
        setSaveError(null);
        
        try {
            await updateMutation.mutateAsync({
                ...data,
                fields: Array.isArray(data.fields) ? data.fields : [],
                inspectionConfig: data.inspectionConfig || { sections: [] }
            });
            
            // Close dialog and reset state
            if (dialogState.mode !== 'none') {
                closeDialog();
            }
            setAddingFieldsTo(null);
            setEditingField(null);
            
            return true;
        } catch (err) {
            console.error('Error saving type:', err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setSaveError(errorMessage);
            return false;
        }
    };

    const handleAddField = async (typeValue: string, field: FormField) => {
        console.log('Adding field:', { typeValue, field, types });
        
        if (!Array.isArray(types)) {
            console.error('Types is not an array:', types);
            setSaveError('Failed to add field: Types data is invalid');
            return;
        }

        const type = types.find(t => t.value === typeValue);
        if (!type) {
            console.error('Type not found:', typeValue);
            setSaveError('Failed to add field: Equipment type not found');
            return;
        }

        console.log('Found type:', type);

        const updatedType = {
            ...type,
            fields: Array.isArray(type.fields) ? [...type.fields, field] : [field]
        };

        console.log('Updated type:', updatedType);
        const success = await handleSave(updatedType);
        if (success) {
            setAddingFieldsTo(null);
        }
    };

    const handleEditField = async (typeValue: string, oldField: FormField, newField: FormField) => {
        console.log('Editing field:', { typeValue, oldField, newField, types });
        
        if (!Array.isArray(types)) {
            console.error('Types is not an array:', types);
            setSaveError('Failed to edit field: Types data is invalid');
            return;
        }

        const type = types.find(t => t.value === typeValue);
        if (!type) {
            console.error('Type not found:', typeValue);
            setSaveError('Failed to edit field: Equipment type not found');
            return;
        }

        console.log('Found type:', type);

        const updatedType = {
            ...type,
            fields: Array.isArray(type.fields) ? 
                type.fields.map(f => f.name === oldField.name ? newField : f) :
                [newField]
        };

        console.log('Updated type:', updatedType);
        const success = await handleSave(updatedType);
        if (success) {
            setEditingField(null);
        }
    };

    const handleDeleteField = async (typeValue: string, fieldName: string) => {
        console.log('Deleting field:', { typeValue, fieldName, types });
        
        if (!Array.isArray(types)) {
            console.error('Types is not an array:', types);
            setSaveError('Failed to delete field: Types data is invalid');
            return;
        }

        const type = types.find(t => t.value === typeValue);
        if (!type) {
            console.error('Type not found:', typeValue);
            setSaveError('Failed to delete field: Equipment type not found');
            return;
        }

        console.log('Found type:', type);

        const updatedType = {
            ...type,
            fields: Array.isArray(type.fields) ? 
                type.fields.filter(f => f.name !== fieldName) :
                []
        };

        console.log('Updated type:', updatedType);
        await handleSave(updatedType);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (fetchError || updateMutation.error || saveError) {
        const errorMessage = saveError || 
            (updateMutation.error instanceof Error ? updateMutation.error.message : 'An error occurred') ||
            (fetchError instanceof Error ? fetchError.message : 'An error occurred');
            
        return (
            <Box sx={{ p: 2, color: 'error.main' }}>
                <Typography>{errorMessage}</Typography>
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
                                <Box sx={{ pl: 2, mb: 3 }}>
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

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ pl: 2, mb: 3 }}>
                                    <Typography variant="caption" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                                        Fields
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setAddingFieldsTo(type.value)}
                                            startIcon={<AddIcon />}
                                        >
                                            Add Field
                                        </Button>
                                    </Box>
                                    <Box sx={{ mt: 2 }}>
                                        <FieldList
                                            fields={type.fields || []}
                                            onDeleteField={(fieldName) => handleDeleteField(type.value, fieldName)}
                                            onEditField={(field) => setEditingField({ typeValue: type.value, field })}
                                            onAddCondition={(fieldName, condition) => {
                                                const field = type.fields?.find(f => f.name === fieldName);
                                                if (field) {
                                                    const updatedField = {
                                                        ...field,
                                                        conditions: [...(field.conditions || []), condition]
                                                    };
                                                    handleEditField(type.value, field, updatedField);
                                                }
                                            }}
                                            onDeleteCondition={(fieldName, conditionIndex) => {
                                                const field = type.fields?.find(f => f.name === fieldName);
                                                if (field && field.conditions) {
                                                    const updatedField = {
                                                        ...field,
                                                        conditions: field.conditions.filter((_, i) => i !== conditionIndex)
                                                    };
                                                    handleEditField(type.value, field, updatedField);
                                                }
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ pl: 2 }}>
                                    <Typography variant="caption" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                                        Inspection Form
                                    </Typography>
                                    <InspectionFormBuilder
                                        equipmentType={type}
                                        onSave={handleSave}
                                    />
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        size="small"
                                        onClick={() => openEditDialog(type)}
                                        startIcon={<EditIcon />}
                                    >
                                        Edit Type
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => openDeleteDialog(type)}
                                        startIcon={<DeleteIcon />}
                                        color="error"
                                    >
                                        Delete Type
                                    </Button>
                                </Box>
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

            {/* Field Selection Dialog */}
            <SelectFieldDialog
                open={!!addingFieldsTo}
                onClose={() => setAddingFieldsTo(null)}
                onSelect={(field) => handleAddField(addingFieldsTo!, field)}
                existingFieldNames={(types.find(t => t.value === addingFieldsTo)?.fields || []).map(f => f.name)}
            />

            {/* Field Editing Dialog */}
            {editingField && (
                <SelectFieldDialog
                    open={true}
                    onClose={() => setEditingField(null)}
                    onSave={(newField) => handleEditField(editingField.typeValue, editingField.field, newField)}
                    initialValues={editingField.field}
                />
            )}

            {dialogState.mode === 'delete' && dialogState.data && (
                <CrudDeleteDialog
                    open={true}
                    onClose={closeDialog}
                    onConfirm={async () => {
                        if (!dialogState.data) return;
                        await handleSave({
                            ...dialogState.data,
                            deleted: true
                        });
                        closeDialog();
                    }}
                    title="Delete Equipment Type"
                    message={`Are you sure you want to delete the "${dialogState.data.label}" equipment type? This action cannot be undone.`}
                />
            )}
        </Box>
    );
}
