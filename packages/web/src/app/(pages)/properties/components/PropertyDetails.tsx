'use client';

import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardContent, 
    Divider, 
    SelectChangeEvent,
    Box,
    TextField,
    Stack,
    IconButton,
    Button,
    Alert
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Property } from '../../../globalTypes/property';
import { useUpdatePropertyMetadata } from '../hooks/usePropertyMetadata';
import { useUpdateProperty } from '../hooks/usePropertyUpdate';
import { useDeleteProperty } from '../hooks/usePropertyDelete';
import { usePropertySettings } from '../hooks/usePropertySettings';
import { useSelectedProperty } from '../hooks/useSelectedProperty';
import { DeletePropertyDialog } from '../dialogs/DeletePropertyDialog';
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

    // Update edited name when property changes
    useEffect(() => {
        setEditedName(property.name);
        setIsEditing(false); // Close edit mode on property change
    }, [property.property_id, property.name]);

    // React Query mutations
    const { 
        mutate: updateMetadata, 
        isPending: isUpdating 
    } = useUpdatePropertyMetadata();

    const {
        mutate: updateProperty,
        isPending: isUpdatingProperty
    } = useUpdateProperty();

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

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        deleteProperty(property.property_id, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                onPropertySelect(null);
                setSelectedProperty(null);
                queryClient.invalidateQueries({ queryKey: ['properties'] });
            }
        });
    };

    const handleStatusChange = async (event: SelectChangeEvent<string>) => {
        try {
            await updateMetadata({
                id: property.property_id,
                data: { status: event.target.value }
            });
            // Invalidate queries to trigger a refresh of all property data
            queryClient.invalidateQueries({ queryKey: ['property', property.property_id] });
            queryClient.invalidateQueries({ queryKey: ['propertyMetadata', property.property_id] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
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
            // Invalidate queries to trigger a refresh of all property data
            queryClient.invalidateQueries({ queryKey: ['property', property.property_id] });
            queryClient.invalidateQueries({ queryKey: ['propertyMetadata', property.property_id] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        } catch (error) {
            console.error('Failed to update type:', error);
        }
    };

    const handleNameSave = async () => {
        if (editedName.trim() !== property.name) {
            updateProperty(
                {
                    id: property.property_id,
                    data: { name: editedName.trim() }
                },
                {
                    onSuccess: async () => {
                        setIsEditing(false);
                        // Invalidate queries to trigger a refresh of all property data
                        queryClient.invalidateQueries({ queryKey: ['property', property.property_id] });
                        queryClient.invalidateQueries({ queryKey: ['properties'] });
                    }
                }
            );
        } else {
            setIsEditing(false);
        }
    };

    const handleNameCancel = () => {
        setEditedName(property.name);
        setIsEditing(false);
    };

    const handleUpdate = async () => {
        // Invalidate all property-related queries to ensure fresh data
        queryClient.invalidateQueries({ queryKey: ['property', property.property_id] });
        queryClient.invalidateQueries({ queryKey: ['propertyLocation', property.property_id] });
        queryClient.invalidateQueries({ queryKey: ['propertyAccounts', property.property_id] });
        queryClient.invalidateQueries({ queryKey: ['propertyMetadata', property.property_id] });
        queryClient.invalidateQueries({ queryKey: ['properties'] });
    };

    const isNameUpdating = isUpdatingProperty;

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
                                    disabled={isNameUpdating}
                                />
                                <IconButton 
                                    onClick={handleNameSave}
                                    disabled={isNameUpdating}
                                    color="primary"
                                >
                                    <SaveIcon />
                                </IconButton>
                                <IconButton 
                                    onClick={handleNameCancel}
                                    disabled={isNameUpdating}
                                >
                                    <CancelIcon />
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <Box sx={{ typography: 'h5', flexGrow: 1 }}>
                                    {property.name}
                                </Box>
                                <IconButton 
                                    onClick={() => setIsEditing(true)}
                                    color="primary"
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton 
                                    onClick={handleDeleteClick}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        )}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <PropertyMetadata
                        property={property}
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
                        propertyId={property.property_id}
                        serviceAddress={property.serviceAddress || null}
                        billingAddress={property.billingAddress || null}
                        onUpdate={handleUpdate}
                    />

                    <Divider sx={{ my: 2 }} />

                    <PropertyLocation
                        property={property}
                    />

                    <Divider sx={{ my: 2 }} />

                    <PropertyTabs
                        tabValue={tabValue}
                        onTabChange={(event, newValue) => setTabValue(newValue)}
                    />
                </CardContent>
            </Card>

            <DeletePropertyDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                error={deleteError instanceof Error ? deleteError : null}
            />
        </>
    );
}
