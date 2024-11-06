'use client';

import React, { useState } from 'react';
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
import type { Account } from '../../../globalTypes/account';
import type { Property } from '../../../globalTypes/property';
import { useUpdateAccount } from '../hooks/useAccounts';
import { useProperties } from '../../properties/hooks/useProperties';

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
    const [selectedProperties, setSelectedProperties] = useState<Property[]>(
        account.properties || []
    );

    // Fetch all available properties
    const { data: properties = [], isLoading: loadingProperties } = useProperties();
    const updateAccountMutation = useUpdateAccount();

    const handleSubmit = async () => {
        try {
            await updateAccountMutation.mutateAsync({
                id: account.account_id,
                data: {
                    property_ids: selectedProperties.map(prop => prop.property_id)
                }
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update account properties:', error);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Edit Properties</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    {updateAccountMutation.isError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Failed to update properties. Please try again.
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
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={onClose}
                    disabled={updateAccountMutation.isPending}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={updateAccountMutation.isPending}
                >
                    {updateAccountMutation.isPending ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
