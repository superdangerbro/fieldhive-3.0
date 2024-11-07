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
import { useAccountStatuses, useUpdateAccountStatuses } from '../hooks/useAccounts';
import { useCrudDialogs } from '@/app/globalHooks/useCrudDialogs';
import { CrudFormDialog, CrudDeleteDialog } from '@/app/globalComponents/crud/CrudDialogs';
import { StatusColorPicker } from '@/app/globalComponents/StatusColorPicker';
import type { AccountStatus } from '@/app/globalTypes/account';

export function AccountStatusSection() {
    console.log('AccountStatusSection render');
    const { data: statuses = [], isLoading, error: fetchError } = useAccountStatuses();
    const updateMutation = useUpdateAccountStatuses();
    const { dialogState, openCreateDialog, openEditDialog, openDeleteDialog, closeDialog } = useCrudDialogs();
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSave = async (data: AccountStatus) => {
        console.log('Saving status:', { mode: dialogState.mode, data });
        try {
            const updatedStatuses = dialogState.mode === 'create'
                ? [...statuses, data]
                : statuses.map((status: AccountStatus) => 
                    status.value === dialogState.data?.value ? data : status
                );
            
            await updateMutation.mutateAsync(updatedStatuses);
            closeDialog();
        } catch (error) {
            console.error('Failed to save status:', error);
        }
    };

    const handleDelete = async (statusToDelete: AccountStatus) => {
        console.log('Deleting status:', statusToDelete);
        try {
            const updatedStatuses = statuses.filter((status: AccountStatus) => status.value !== statusToDelete.value);
            await updateMutation.mutateAsync(updatedStatuses);
            closeDialog();
        } catch (error) {
            console.error('Failed to delete status:', error);
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
                    Account Statuses
                </Typography>
                <Button 
                    variant="contained"
                    onClick={openCreateDialog}
                >
                    Add Status
                </Button>
            </Box>

            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Configure the available statuses that can be assigned to accounts
            </Typography>

            <List>
                {statuses.map((status: AccountStatus) => (
                    <ListItem
                        key={status.value}
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
                                bgcolor: status.color,
                                mr: 2
                            }} 
                        />
                        <Typography sx={{ flex: 1 }}>{status.label}</Typography>
                        <IconButton onClick={() => openEditDialog(status)}>
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => openDeleteDialog(status)}>
                            <DeleteIcon />
                        </IconButton>
                    </ListItem>
                ))}
            </List>

            {isFormDialog && (
                <CrudFormDialog
                    open={true}
                    onClose={closeDialog}
                    title={dialogState.mode === 'create' ? 'Add Status' : 'Edit Status'}
                    actions={
                        <>
                            <Button onClick={closeDialog}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={() => formRef.current?.requestSubmit()}
                                variant="contained"
                            >
                                {dialogState.mode === 'create' ? 'Add Status' : 'Save Changes'}
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
                            statuses.some(s => s.value === name.trim().toLowerCase())) {
                            alert('A status with this name already exists');
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
                            label="Status Name"
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
                title="Delete Status"
                message={`Are you sure you want to delete the status "${dialogState.data?.label}"? This action cannot be undone.`}
            />
        </Box>
    );
}
