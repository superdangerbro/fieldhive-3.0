'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    CircularProgress,
    Alert,
    Autocomplete,
    TextField,
    Chip
} from '@mui/material';
import { useUpdateAccount } from '../hooks';
import { useProperties } from '@/app/(pages)/properties/hooks/useProperties';
import { useActionNotifications } from '@/app/globalHooks/useActionNotifications';
import { useQueryClient } from '@tanstack/react-query';
import type { Account } from '@/app/globalTypes/account';
import type { Property } from '@/app/globalTypes/property';

interface EditAccountPropertiesDialogProps {
    open: boolean;
    account: Account;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditAccountPropertiesDialog({ 
    open, 
    account, 
    onClose, 
    onSuccess 
}: EditAccountPropertiesDialogProps) {
    const queryClient = useQueryClient();
    const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
    const { notifySuccess, notifyError } = useActionNotifications();
    const { data: properties = [], isLoading: loadingProperties } = useProperties();
    const updateAccountMutation = useUpdateAccount();

    useEffect(() => {
        if (open && account.properties) {
            setSelectedProperties([...account.properties]);
        }
    }, [open, account.properties]);

    const handleSubmit = useCallback(async () => {
        try {
            await updateAccountMutation.mutateAsync({
                id: account.account_id,
                data: {
                    property_ids: selectedProperties.map(prop => prop.property_id)
                }
            });

            // Refresh everything
            await queryClient.refetchQueries();

            notifySuccess('Properties updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update properties:', error);
            notifyError('Failed to update properties');
            setSelectedProperties(account.properties || []);
        }
    }, [account.account_id, account.properties, selectedProperties, updateAccountMutation, queryClient, onSuccess, onClose, notifySuccess, notifyError]);

    const handleClose = useCallback(() => {
        setSelectedProperties(account.properties || []);
        onClose();
    }, [account.properties, onClose]);

    const isLoading = loadingProperties || updateAccountMutation.isPending;

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                component: 'form',
                onSubmit: (e: React.FormEvent) => {
                    e.preventDefault();
                    handleSubmit();
                }
            }}
        >
            <DialogTitle>Edit Properties</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    {updateAccountMutation.error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {updateAccountMutation.error instanceof Error 
                                ? updateAccountMutation.error.message 
                                : 'Failed to update properties. Please try again.'}
                        </Alert>
                    )}

                    <Autocomplete
                        multiple
                        options={properties}
                        value={selectedProperties}
                        onChange={(_, newValue) => setSelectedProperties(newValue)}
                        getOptionLabel={(option) => option.name}
                        loading={loadingProperties}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Properties"
                                variant="outlined"
                                placeholder={selectedProperties.length === 0 ? "Select properties..." : ""}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingProperties ? (
                                                <CircularProgress color="inherit" size={20} />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        renderTags={(value) =>
                            value.map((option) => (
                                <Chip
                                    key={option.property_id}
                                    label={option.name}
                                    variant="filled"
                                    onDelete={() => {
                                        setSelectedProperties(prev => 
                                            prev.filter(p => p.property_id !== option.property_id)
                                        );
                                    }}
                                />
                            ))
                        }
                        isOptionEqualToValue={(option, value) => 
                            option.property_id === value.property_id
                        }
                        disabled={isLoading}
                        componentsProps={{
                            paper: {
                                sx: { marginTop: 1 }
                            }
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={handleClose}
                    disabled={isLoading}
                    type="button"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
