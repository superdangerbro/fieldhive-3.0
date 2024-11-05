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
    Box
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import type { Property } from '@/app/globalTypes/property';
import { useUpdatePropertyMetadata, useDeleteProperty } from '../hooks/usePropertyMetadata';
import { useSetting } from '../hooks/useSettings';
import { usePropertyStore } from '../store/propertyStore';

// Import all components from the same directory
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
  const { setSelectedProperty, refreshProperty, updatePropertyInStore } = usePropertyStore();
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
    data: statusOptions = [], 
    isLoading: statusLoading,
    error: statusError
  } = useSetting<string>('property_statuses');

  const { 
    data: propertyTypes = [],
    isLoading: typeLoading,
    error: typeError
  } = useSetting<string>('property_types');

  // Refresh property data when it changes
  useEffect(() => {
    if (property) {
      refreshProperty(property.property_id).catch(console.error);
    }
  }, [property.property_id, refreshProperty]);

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
      await refreshProperty(property.property_id);
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
      await refreshProperty(property.property_id);
    } catch (error) {
      console.error('Failed to update type:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await refreshProperty(property.property_id);
      await queryClient.invalidateQueries({ 
        queryKey: ['property', property.property_id]
      });
    } catch (error) {
      console.error('Failed to refresh property:', error);
    }
  };

  const isLoading = statusLoading || typeLoading;
  const hasError = statusError || typeError;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <DialogContentText color="error">
          Failed to load property settings. Please try again later.
        </DialogContentText>
      </Box>
    );
  }

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <PropertyHeader 
            property={property}
            onEdit={onEdit}
            onDelete={handleDeleteClick}
            linkedAccounts={property.accounts || []}
            onUpdate={handleUpdate}
          />

          <Divider sx={{ my: 2 }} />

          <PropertyMetadata
            property={property}
            propertyTypes={propertyTypes}
            statusOptions={statusOptions}
            typeLoading={isUpdating}
            statusLoading={isUpdating}
            onTypeChange={handleTypeChange}
            onStatusChange={handleStatusChange}
          />

          <Divider sx={{ my: 2 }} />

          <PropertyAddresses
            propertyId={property.property_id}
            serviceAddress={property.serviceAddress}
            billingAddress={property.billingAddress}
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
