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
import { useUpdateAccount } from '../hooks/useAccounts';
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
            const result = await updateAccountMutation.mutateAsync({
                id: account.account_id,
                data: {
                    property_ids: selectedProperties.map(prop => prop.property_id)
                }
            });

            // Update the specific account in the cache
            queryClient.setQueryData(['account', account.account_id], result);

            // Update the account in the accounts list if it exists in cache
            queryClient.setQueriesData({ queryKey: ['accounts'] }, (oldData: any) => {
                if (!oldData?.accounts) return oldData;
                return {
                    ...oldData,
                    accounts: oldData.accounts.map((acc: Account) => 
                        acc.account_id === account.account_id ? result : acc
                    )
                };
            });

            notifySuccess('Properties updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
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
            keepMounted={false}
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
                                        <React.Fragment>
                                            {loadingProperties ? (
                                                <CircularProgress color="inherit" size={20} />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option.name}
                                    {...getTagProps({ index })}
                                    key={option.property_id}
                                />
                            ))
                        }
                        isOptionEqualToValue={(option, value) => 
                            option.property_id === value.property_id
                        }
                        disabled={isLoading}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={handleClose}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
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
