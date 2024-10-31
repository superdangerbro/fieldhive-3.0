'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Divider, SelectChangeEvent } from '@mui/material';
import type { Property, PropertyType, PropertyStatus, Address } from '@fieldhive/shared';
import { deleteProperty, updatePropertyMetadata, getSetting, getPropertyAddresses } from '../../services/api';
import dynamic from 'next/dynamic';

import PropertyHeader from './PropertyHeader';
import PropertyMetadata from './PropertyMetadata';
import PropertyAddresses from './PropertyAddresses';
import PropertyLocation from './PropertyLocation';
import PropertyTabs from './PropertyTabs';

interface PropertyDetailsProps {
  property: Property | null;
  onEdit: (property: Property) => void;
  onUpdate?: () => void;
  onPropertySelect: (property: Property | null) => void;
}

const DEFAULT_STATUSES: PropertyStatus[] = ['active', 'inactive', 'archived', 'pending'];
const DEFAULT_PROPERTY_TYPES: PropertyType[] = ['residential', 'commercial', 'industrial', 'agricultural', 'other'];

export default function PropertyDetails({ property, onEdit, onUpdate, onPropertySelect }: PropertyDetailsProps) {
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [typeLoading, setTypeLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState<PropertyStatus[]>(DEFAULT_STATUSES);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>(DEFAULT_PROPERTY_TYPES);
  const [serviceAddress, setServiceAddress] = useState<Address | null>(null);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);

  useEffect(() => {
    getSetting('property_statuses')
      .then((statuses: PropertyStatus[]) => {
        if (Array.isArray(statuses) && statuses.length > 0) {
          setStatusOptions(statuses);
        }
      })
      .catch(console.error);

    getSetting('property_types')
      .then((types: PropertyType[]) => {
        if (Array.isArray(types) && types.length > 0) {
          setPropertyTypes(types);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (property) {
      // Fetch addresses
      getPropertyAddresses(property.property_id)
        .then(({ service_address, billing_address }) => {
          setServiceAddress(service_address);
          setBillingAddress(billing_address);
        })
        .catch(console.error);
    }
  }, [property]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!property) return;
    try {
      await deleteProperty(property.property_id);
      setDeleteDialogOpen(false);
      onPropertySelect(null);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      setDeleteError(error.message);
    }
  };

  const handleStatusChange = async (event: SelectChangeEvent<string>) => {
    if (!property) return;
    setStatusLoading(true);
    try {
      const updatedProperty = await updatePropertyMetadata(property.property_id, {
        status: event.target.value as PropertyStatus
      });
      onPropertySelect(updatedProperty);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleTypeChange = async (event: SelectChangeEvent<string>) => {
    if (!property) return;
    setTypeLoading(true);
    try {
      const updatedProperty = await updatePropertyMetadata(property.property_id, {
        property_type: event.target.value as PropertyType
      });
      onPropertySelect(updatedProperty);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setTypeLoading(false);
    }
  };

  if (!property) return null;

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <PropertyHeader 
            property={property}
            onEdit={onEdit}
            onDelete={handleDeleteClick}
            linkedAccounts={property.accounts || []}
          />

          <Divider sx={{ my: 2 }} />

          <PropertyMetadata
            property={property}
            propertyTypes={propertyTypes}
            statusOptions={statusOptions}
            typeLoading={typeLoading}
            statusLoading={statusLoading}
            onTypeChange={handleTypeChange}
            onStatusChange={handleStatusChange}
          />

          <Divider sx={{ my: 2 }} />

          <PropertyAddresses
            serviceAddress={serviceAddress}
            billingAddress={billingAddress}
          />

          <Divider sx={{ my: 2 }} />

          <PropertyLocation
            property={property}
            onUpdate={onUpdate}
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
            <DialogContentText color="error">{deleteError}</DialogContentText>
          ) : (
            <DialogContentText>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
