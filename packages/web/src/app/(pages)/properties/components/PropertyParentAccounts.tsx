'use client';

import React, { useState, useEffect } from 'react';
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
    const [selectedAccounts, setSelectedAccounts] = useState<Account[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
    const updatePropertyMutation = useUpdateProperty();

    useEffect(() => {
        if (property.accounts) {
            setSelectedAccounts([...property.accounts]);
        }
    }, [property.accounts]);

    const handleClose = () => {
        setIsEditing(false);
        setError(null);
        if (property.accounts) {
            setSelectedAccounts([...property.accounts]);
        }
    };

    const handleSubmit = async () => {
        if (!property.property_id) return;
        
        try {
            setError(null);
            await updatePropertyMutation.mutateAsync({
                id: property.property_id,
                data: {
                    account_ids: selectedAccounts.map(acc => acc.account_id)
                }
            });
            onUpdate();
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update parent accounts. Please try again.');
            console.error('Failed to update property accounts:', err);
        }
    };

    return (
        <Box>
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

            {isEditing && (
                <Dialog
                    open={true}
                    onClose={handleClose}
                    maxWidth="sm"
                    fullWidth
                    keepMounted={false}
                >
                    <DialogTitle>Edit Parent Accounts</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            {(error || updatePropertyMutation.isError) && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error || 'Failed to update parent accounts. Please try again.'}
                                </Alert>
                            )}

                            <Autocomplete
                                multiple
                                options={accounts}
                                value={selectedAccounts}
                                onChange={(_, newValue) => setSelectedAccounts(newValue || [])}
                                getOptionLabel={(option) => option.name || ''}
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
                            onClick={handleClose}
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
            )}
        </Box>
    );
}
