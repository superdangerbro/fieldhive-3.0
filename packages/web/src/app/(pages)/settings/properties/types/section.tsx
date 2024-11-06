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
    TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { usePropertyTypes, useUpdatePropertyTypes } from '../hooks/useProperties';
import { useCrudDialogs } from '@/app/globalHooks/useCrudDialogs';
import { useActionNotifications } from '@/app/globalHooks/useActionNotifications';
import { CrudFormDialog, CrudDeleteDialog } from '@/app/globalComponents/crud/CrudDialogs';
import { ActionNotifications } from '@/app/globalComponents/crud/ActionNotifications';
import { StatusColorPicker } from '@/app/globalComponents/StatusColorPicker';
import type { PropertyType } from '@/app/globalTypes/property';

export function PropertyTypeSection() {
    console.log('PropertyTypeSection render');
    const { data: types = [], isLoading, error: fetchError } = usePropertyTypes();
    const updateMutation = useUpdatePropertyTypes();
    const { dialogState, openCreateDialog, openEditDialog, openDeleteDialog, closeDialog } = useCrudDialogs();
    const { notificationState, notifyAction, clearNotifications } = useActionNotifications();
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSave = async (data: PropertyType) => {
        console.log('Saving type:', { mode: dialogState.mode, data });
        try {
            const updatedTypes = dialogState.mode === 'create'
                ? [...types, data]
                : types.map((type: PropertyType) => 
                    type.value === dialogState.data?.value ? data : type
                );
            
            await updateMutation.mutateAsync(updatedTypes);
            notifyAction(dialogState.mode === 'create' ? 'created' : 'updated', 'Property type', true);
            closeDialog();
        } catch (error) {
            console.error('Failed to save type:', error);
            notifyAction(dialogState.mode === 'create' ? 'create' : 'update', 'Property type', false);
        }
    };

    const handleDelete = async (typeToDelete: PropertyType) => {
        console.log('Deleting type:', typeToDelete);
        try {
            const updatedTypes = types.filter((type: PropertyType) => type.value !== typeToDelete.value);
            await updateMutation.mutateAsync(updatedTypes);
            notifyAction('delete', 'Property type', true);
            closeDialog();
        } catch (error) {
            console.error('Failed to delete type:', error);
            notifyAction('delete', 'Property type', false);
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
                    Property Types
                </Typography>
                <Button 
                    variant="contained"
                    onClick={openCreateDialog}
                >
                    Add Property Type
                </Button>
            </Box>

            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Configure the available property types that can be assigned to properties
            </Typography>

            <List>
                {types.map((type: PropertyType) => (
                    <ListItem
                        key={type.value}
                        sx={{
                            bgcolor: 'background.paper',
                            mb: 1,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Box 
                            sx={{ 
                                width: 16, 
                                height: 16, 
                                borderRadius: 1,
                                bgcolor: type.color,
                                mr: 2
                            }} 
                        />
                        <Typography sx={{ flex: 1 }}>{type.label}</Typography>
                        <IconButton onClick={() => openEditDialog(type)}>
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => openDeleteDialog(type)}>
                            <DeleteIcon />
                        </IconButton>
                    </ListItem>
                ))}
            </List>

            {isFormDialog && (
                <CrudFormDialog
                    open={true}
                    onClose={closeDialog}
                    title={dialogState.mode === 'create' ? 'Add Property Type' : 'Edit Property Type'}
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
                        const color = formData.get('color') as string;
                        
                        if (!name.trim()) return;

                        if (dialogState.mode === 'create' && 
                            types.some(t => t.value === name.trim().toLowerCase())) {
                            alert('A property type with this name already exists');
                            return;
                        }

                        handleSave({
                            value: name.toLowerCase(),
                            label: name,
                            color: color || '#94a3b8'
                        });
                    }}>
                        <TextField
                            name="name"
                            label="Type Name"
                            defaultValue={dialogState.data?.label || ''}
                            fullWidth
                            autoFocus
                            required
                            sx={{ mb: 2 }}
                        />
                        <input 
                            type="hidden" 
                            name="color" 
                            value={dialogState.data?.color || '#94a3b8'} 
                        />
                        <StatusColorPicker
                            color={dialogState.data?.color || '#94a3b8'}
                            onChange={(newColor) => {
                                const input = formRef.current?.querySelector('input[name="color"]') as HTMLInputElement;
                                if (input) input.value = newColor;
                            }}
                        />
                    </form>
                </CrudFormDialog>
            )}

            <CrudDeleteDialog
                open={dialogState.isOpen && dialogState.mode === 'delete'}
                onClose={closeDialog}
                onConfirm={() => dialogState.data && handleDelete(dialogState.data)}
                title="Delete Property Type"
                message={`Are you sure you want to delete the property type "${dialogState.data?.label}"? This action cannot be undone.`}
            />

            <ActionNotifications
                successMessage={notificationState.successMessage}
                errorMessage={notificationState.errorMessage}
                onClose={clearNotifications}
            />
        </Box>
    );
}
