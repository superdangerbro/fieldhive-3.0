'use client';

import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardContent, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogContentText, 
    DialogActions, 
    Button, 
    Divider, 
    SelectChangeEvent,
    CircularProgress,
    Box,
    TextField,
    Stack,
    IconButton
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import type { Property } from '@/app/globalTypes/property';
import { useUpdatePropertyMetadata } from '../hooks/usePropertyMetadata';
import { useDeleteProperty } from '../hooks/usePropertyDelete';
import { usePropertySettings } from '../hooks/usePropertySettings';
import { useProperty } from '../hooks/usePropertyList';
import { useSelectedProperty } from '../hooks/useSelectedProperty';

import PropertyHeader from './PropertyHeader';
import PropertyMetadata from './PropertyMetadata';
import PropertyAddresses from './PropertyAddresses';
import PropertyLocation from './PropertyLocation';
import PropertyTabs from './PropertyTabs';

interface PropertyDetailsProps {
    property: Property;
    onEdit: (property: Property) => void;
    onPropertySelect: (property: Property | null) => void;
}

export default function PropertyDetails({ 
    property, 
    onEdit, 
    onPropertySelect 
}: PropertyDetailsProps) {
    const [tabValue, setTabValue] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(property.name);
    const { setSelectedProperty } = useSelectedProperty();
    const queryClient = useQueryClient();

    // React Query mutations
    const { 
        mutate: updateMetadata, 
        isPending: isUpdating 
    } = useUpdatePropertyMetadata();

    const { 
        mutate: deleteProperty, 
        isPending: isDeleting,
        error: deleteError
    } = useDeleteProperty();

    // Fetch settings
    const { 
        statuses: statusOptions = [], 
        types: propertyTypes = [],
        isLoading: settingsLoading
    } = usePropertySettings();

    // Fetch latest property data
    const { 
        data: latestProperty, 
        refetch: refreshProperty,
        isLoading: isPropertyLoading,
        error: propertyError 
    } = useProperty(property.property_id);

    useEffect(() => {
        if (property?.property_id) {
            refreshProperty();
        }
    }, [property?.property_id, refreshProperty]);

    useEffect(() => {
        if (latestProperty) {
            setEditedName(latestProperty.name);
        }
    }, [latestProperty]);

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        deleteProperty(property.property_id, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                onPropertySelect(null);
                setSelectedProperty(null);
            }
        });
    };

    const handleStatusChange = async (event: SelectChangeEvent<string>) => {
        try {
            await updateMetadata({
                id: property.property_id,
                data: { status: event.target.value }
            });
            await refreshProperty();
            await queryClient.invalidateQueries({ queryKey: ['properties'] });
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleTypeChange = async (event: SelectChangeEvent<string>) => {
        try {
            await updateMetadata({
                id: property.property_id,
                data: { type: event.target.value }
            });
            await refreshProperty();
            await queryClient.invalidateQueries({ queryKey: ['properties'] });
        } catch (error) {
            console.error('Failed to update type:', error);
        }
    };

    const handleNameSave = async () => {
        if (editedName.trim() !== property.name) {
            try {
                await updateMetadata({
                    id: property.property_id,
                    data: { name: editedName.trim() }
                });
                await refreshProperty();
                await queryClient.invalidateQueries({ queryKey: ['properties'] });
            } catch (error) {
                console.error('Failed to update name:', error);
            }
        }
        setIsEditing(false);
    };

    const handleNameCancel = () => {
        setEditedName(property.name);
        setIsEditing(false);
    };

    const handleUpdate = async () => {
        try {
            await refreshProperty();
            await queryClient.invalidateQueries({ 
                queryKey: ['property', property.property_id]
            });
            await queryClient.invalidateQueries({ queryKey: ['properties'] });
        } catch (error) {
            console.error('Failed to refresh property:', error);
        }
    };

    if (isPropertyLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
            </Box>
        );
    }

    if (propertyError) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <DialogContentText color="error">
                    Failed to load property details. Please try again later.
                    {propertyError instanceof Error ? `: ${propertyError.message}` : ''}
                </DialogContentText>
            </Box>
        );
    }

    const currentProperty = latestProperty || property;

    return (
        <>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        {isEditing ? (
                            <>
                                <TextField
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    size="small"
                                    fullWidth
                                    autoFocus
                                    disabled={isUpdating}
                                />
                                <IconButton 
                                    onClick={handleNameSave}
                                    disabled={isUpdating}
                                    color="primary"
                                >
                                    <SaveIcon />
                                </IconButton>
                                <IconButton 
                                    onClick={handleNameCancel}
                                    disabled={isUpdating}
                                >
                                    <CancelIcon />
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <Box sx={{ typography: 'h5', flexGrow: 1 }}>
                                    {currentProperty.name}
                                </Box>
                                <IconButton 
                                    onClick={() => setIsEditing(true)}
                                    color="primary"
                                >
                                    <EditIcon />
                                </IconButton>
                            </>
                        )}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <PropertyMetadata
                        property={currentProperty}
                        propertyTypes={propertyTypes}
                        statusOptions={statusOptions}
                        typeLoading={isUpdating || settingsLoading}
                        statusLoading={isUpdating || settingsLoading}
                        onTypeChange={handleTypeChange}
                        onStatusChange={handleStatusChange}
                        onUpdate={handleUpdate}
                    />

                    <Divider sx={{ my: 2 }} />

                    <PropertyAddresses
                        propertyId={currentProperty.property_id}
                        serviceAddress={currentProperty.serviceAddress}
                        billingAddress={currentProperty.billingAddress}
                        onUpdate={handleUpdate}
                    />

                    <Divider sx={{ my: 2 }} />

                    <PropertyLocation
                        property={currentProperty}
                    />

                    <Divider sx={{ my: 2 }} />

                    <PropertyTabs
                        tabValue={tabValue}
                        onTabChange={(event, newValue) => setTabValue(newValue)}
                    />
                </CardContent>
            </Card>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Delete Property</DialogTitle>
                <DialogContent>
                    {deleteError ? (
                        <DialogContentText color="error">
                            {deleteError instanceof Error ? deleteError.message : 'Failed to delete property'}
                        </DialogContentText>
                    ) : (
                        <DialogContentText>
                            Are you sure you want to delete this property? This action cannot be undone.
                        </DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        color="error"
                        disabled={isDeleting}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
