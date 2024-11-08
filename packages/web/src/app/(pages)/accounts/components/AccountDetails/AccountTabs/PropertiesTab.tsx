'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
    Alert,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import type { Account } from '@/app/globalTypes/account';
import type { Property } from '@/app/globalTypes/property';
import { useProperties } from '../../../../properties/hooks/useProperties';
import { useUpdateAccount } from '../../../hooks/useAccounts';

interface PropertiesTabProps {
    account: Account;
    onUpdate: () => void;
}

export default function PropertiesTab({ account, onUpdate }: PropertiesTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Only fetch properties when editing
    const { data: properties = [], isLoading: loadingProperties } = useProperties({}, {
        enabled: isEditing
    });
    const updateAccountMutation = useUpdateAccount();

    // Initialize selected properties when account changes
    const accountProperties = useMemo(() => account.properties || [], [account.properties]);
    
    // Reset selected properties when dialog opens
    const handleEditClick = useCallback(() => {
        setSelectedProperties(accountProperties);
        setIsEditing(true);
    }, [accountProperties]);

    const handleClose = useCallback(() => {
        setIsEditing(false);
        setError(null);
        setSelectedProperties(accountProperties);
    }, [accountProperties]);

    const handleSubmit = useCallback(async () => {
        if (!account.account_id) return;
        
        try {
            setError(null);
            await updateAccountMutation.mutateAsync({
                id: account.account_id,
                data: {
                    property_ids: selectedProperties.map(prop => prop.property_id)
                }
            });
            onUpdate();
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update properties. Please try again.');
            console.error('Failed to update account properties:', err);
        }
    }, [account.account_id, selectedProperties, updateAccountMutation, onUpdate]);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    Properties
                </Typography>
                <IconButton 
                    size="small" 
                    onClick={handleEditClick}
                    sx={{ ml: 'auto' }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </Box>

            <Grid container spacing={2}>
                {accountProperties.map((property) => (
                    <Grid item xs={12} key={property.property_id}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">
                                    {property.name}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                    <Chip 
                                        label={property.type} 
                                        size="small" 
                                        sx={{ mr: 1 }} 
                                    />
                                    <Chip 
                                        label={property.status} 
                                        size="small" 
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {accountProperties.length === 0 && (
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                            No properties assigned
                        </Typography>
                    </Grid>
                )}
            </Grid>

            {isEditing && (
                <Dialog
                    open={true}
                    onClose={handleClose}
                    maxWidth="sm"
                    fullWidth
                    keepMounted={false}
                >
                    <DialogTitle>Edit Properties</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            {(error || updateAccountMutation.isError) && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error || 'Failed to update properties. Please try again.'}
                                </Alert>
                            )}

                            <Autocomplete
                                multiple
                                options={properties}
                                value={selectedProperties}
                                onChange={(_, newValue) => setSelectedProperties(newValue || [])}
                                getOptionLabel={(option) => option.name || ''}
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
                            onClick={handleClose}
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
            )}
        </Box>
    );
}
