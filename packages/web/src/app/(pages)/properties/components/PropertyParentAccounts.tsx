'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Autocomplete,
    TextField,
    CircularProgress,
    Alert
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import type { Property } from '../../../globalTypes/property';
import type { Account } from '../../../globalTypes/account';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import { useUpdateProperty } from '../hooks/useProperties';

interface PropertyParentAccountsProps {
    property: Property;
    onUpdate: () => void;
}

export default function PropertyParentAccounts({ property, onUpdate }: PropertyParentAccountsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAccounts, setSelectedAccounts] = useState<Account[]>(
        property.accounts || []
    );

    // Fetch available accounts
    const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
    const updatePropertyMutation = useUpdateProperty();

    const handleSubmit = async () => {
        try {
            await updatePropertyMutation.mutateAsync({
                id: property.property_id,
                data: {
                    account_ids: selectedAccounts.map(acc => acc.account_id)
                }
            });
            onUpdate();
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update property accounts:', error);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                    Parent Accounts
                </Typography>
                <IconButton 
                    size="small" 
                    onClick={() => setIsEditing(true)}
                    sx={{ ml: 'auto' }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {property.accounts?.map((account) => (
                    <Chip
                        key={account.account_id}
                        label={account.name}
                        size="small"
                    />
                ))}
                {(!property.accounts || property.accounts.length === 0) && (
                    <Typography variant="body2" color="text.secondary">
                        No parent accounts assigned
                    </Typography>
                )}
            </Box>

            <Dialog
                open={isEditing}
                onClose={() => setIsEditing(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit Parent Accounts</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {updatePropertyMutation.isError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                Failed to update parent accounts. Please try again.
                            </Alert>
                        )}

                        <Autocomplete
                            multiple
                            options={accounts}
                            value={selectedAccounts}
                            onChange={(_, newValue) => setSelectedAccounts(newValue)}
                            getOptionLabel={(option) => option.name}
                            loading={loadingAccounts}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Parent Accounts"
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <React.Fragment>
                                                {loadingAccounts ? (
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
                                        key={option.account_id}
                                    />
                                ))
                            }
                            isOptionEqualToValue={(option, value) => 
                                option.account_id === value.account_id
                            }
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setIsEditing(false)}
                        disabled={updatePropertyMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={updatePropertyMutation.isPending}
                    >
                        {updatePropertyMutation.isPending ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
