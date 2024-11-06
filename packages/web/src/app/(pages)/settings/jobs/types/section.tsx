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
import { useJobTypes, useUpdateJobTypes } from '../hooks/useJobs';
import { useCrudDialogs } from '@/app/globalHooks/useCrudDialogs';
import { useActionNotifications } from '@/app/globalHooks/useActionNotifications';
import { CrudFormDialog, CrudDeleteDialog } from '@/app/globalComponents/crud/CrudDialogs';
import { ActionNotifications } from '@/app/globalComponents/crud/ActionNotifications';
import type { JobType } from '@/app/globalTypes/job';

export function JobTypeSection() {
    console.log('JobTypeSection render');
    const { data: types = [], isLoading, error: fetchError } = useJobTypes();
    const updateMutation = useUpdateJobTypes();
    const { dialogState, openCreateDialog, openEditDialog, openDeleteDialog, closeDialog } = useCrudDialogs();
    const { notificationState, notifyAction, clearNotifications } = useActionNotifications();
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSave = async (data: JobType) => {
        console.log('Saving type:', { mode: dialogState.mode, data });
        try {
            const updatedTypes = dialogState.mode === 'create'
                ? [...types, data]
                : types.map((type: JobType) => 
                    type.value === dialogState.data?.value ? data : type
                );
            
            await updateMutation.mutateAsync(updatedTypes);
            notifyAction(dialogState.mode === 'create' ? 'created' : 'updated', 'Job type', true);
            closeDialog();
        } catch (error) {
            console.error('Failed to save type:', error);
            notifyAction(dialogState.mode === 'create' ? 'create' : 'update', 'Job type', false);
        }
    };

    const handleDelete = async (typeToDelete: JobType) => {
        console.log('Deleting type:', typeToDelete);
        try {
            const updatedTypes = types.filter((type: JobType) => type.value !== typeToDelete.value);
            await updateMutation.mutateAsync(updatedTypes);
            notifyAction('delete', 'Job type', true);
            closeDialog();
        } catch (error) {
            console.error('Failed to delete type:', error);
            notifyAction('delete', 'Job type', false);
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
                    Job Types
                </Typography>
                <Button 
                    variant="contained"
                    onClick={openCreateDialog}
                >
                    Add Job Type
                </Button>
            </Box>

            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Configure the available job types that can be assigned to jobs
            </Typography>

            <List>
                {types.map((type: JobType) => (
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
                    title={dialogState.mode === 'create' ? 'Add Job Type' : 'Edit Job Type'}
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
                            alert('A job type with this name already exists');
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

            <CrudDeleteDialog
                open={dialogState.isOpen && dialogState.mode === 'delete'}
                onClose={closeDialog}
                onConfirm={() => dialogState.data && handleDelete(dialogState.data)}
                title="Delete Job Type"
                message={`Are you sure you want to delete the job type "${dialogState.data?.label}"? This action cannot be undone.`}
            />

            <ActionNotifications
                successMessage={notificationState.successMessage}
                errorMessage={notificationState.errorMessage}
                onClose={clearNotifications}
            />
        </Box>
    );
}
