'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { usePropertyForm } from '../hooks/usePropertyForm';
import { StepContent } from './AddPropertyDialog/StepContent';
import { createProperty, getAccounts } from '@/services/api';
import type { CreatePropertyDto } from '@fieldhive/shared';

interface AddPropertyDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const steps = [
  'Address Information',
  'Account Selection',
  'Location',
  'Property Boundary'
];

export default function AddPropertyDialog({ open, onClose, onSuccess }: AddPropertyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    activeStep,
    setActiveStep,
    accounts,
    setAccounts,
    selectedAccounts,
    setSelectedAccounts,
    showAddAccount,
    setShowAddAccount,
    formErrors,
    setFormErrors,
    contacts,
    setContacts,
    propertyData,
    setPropertyData,
    handleFieldChange,
    handleNext,
    handleBack,
    reset,
    validateStep
  } = usePropertyForm();

  const handleClose = () => {
    reset();
    onClose();
  };

  const fetchAccounts = async () => {
    try {
      const response = await getAccounts({ limit: 100 });
      setAccounts(response.accounts);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      setError('Failed to load accounts');
    }
  };

  const handleSubmit = async () => {
    if (selectedAccounts.length === 0) {
      setError('Please select at least one account');
      return;
    }

    if (!propertyData.location) {
      setError('Please select a property location');
      return;
    }

    // Validate service address
    const { serviceAddress } = propertyData;
    if (!serviceAddress.address1 || !serviceAddress.city || !serviceAddress.province || !serviceAddress.postalCode) {
      setError('Service address is incomplete');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Convert service address to the format expected by the API
      const service_address = {
        address1: propertyData.serviceAddress.address1,
        address2: propertyData.serviceAddress.address2 || '',
        city: propertyData.serviceAddress.city,
        province: propertyData.serviceAddress.province,
        postal_code: propertyData.serviceAddress.postalCode,
        country: propertyData.serviceAddress.country,
      };

      // Use service address for billing if useDifferentBillingAddress is false
      const billing_address = propertyData.useDifferentBillingAddress ? {
        address1: propertyData.billingAddress.address1,
        address2: propertyData.billingAddress.address2 || '',
        city: propertyData.billingAddress.city,
        province: propertyData.billingAddress.province,
        postal_code: propertyData.billingAddress.postalCode,
        country: propertyData.billingAddress.country,
      } : undefined;

      // Prepare boundary data ensuring it matches the expected format
      const boundaryCoordinates = propertyData.boundary?.coordinates[0] || [];
      const closedBoundary = boundaryCoordinates.length > 0 ? 
        [...boundaryCoordinates, boundaryCoordinates[0]] : [];

      const createPropertyData: CreatePropertyDto = {
        name: propertyData.useCustomName ? propertyData.customName : propertyData.serviceAddress.address1,
        property_type: propertyData.type,
        location: {
          type: 'Point',
          coordinates: propertyData.location.coordinates as [number, number]
        },
        boundary: boundaryCoordinates.length > 0 ? {
          type: 'Polygon',
          coordinates: [closedBoundary as [number, number][]]
        } : undefined,
        service_address,
        billing_address,
        account_id: selectedAccounts[0].account_id,
      };

      console.log('Creating property with data:', JSON.stringify(createPropertyData, null, 2));
      await createProperty(createPropertyData);
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error creating property:', err);
      setError(err instanceof Error ? err.message : 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  const handleStepNext = () => {
    if (validateStep(activeStep)) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  // Fetch accounts when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchAccounts();
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Add New Property</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} sx={{ my: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400 }}>
          <StepContent
            step={activeStep}
            setActiveStep={setActiveStep}
            propertyData={propertyData}
            setPropertyData={setPropertyData}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            handleFieldChange={handleFieldChange}
            selectedAccounts={selectedAccounts}
            setSelectedAccounts={setSelectedAccounts}
            accounts={accounts}
            showAddAccount={showAddAccount}
            setShowAddAccount={setShowAddAccount}
            fetchAccounts={fetchAccounts}
            contacts={contacts}
            setContacts={setContacts}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleStepNext}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {activeStep === steps.length - 1 ? 'Create Property' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
