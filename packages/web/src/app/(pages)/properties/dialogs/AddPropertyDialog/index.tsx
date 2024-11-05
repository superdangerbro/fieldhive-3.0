'use client';

import React from 'react';
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
import { usePropertyForm } from '../../hooks/usePropertyForm';
import { StepContent } from './StepContent';
import { useCreateProperty } from '../../hooks/useProperties';
import type { CreatePropertyDto } from '@/app/globalTypes/property';
import { usePropertyStore } from '../../store/propertyStore';

interface AddPropertyDialogProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  'Address Information',
  'Account Selection',
  'Location',
  'Property Boundary'
];

export default function AddPropertyDialog({ open, onClose }: AddPropertyDialogProps) {
  const { mutate: createProperty, isPending: loading, error } = useCreateProperty();
  const { setSelectedProperty } = usePropertyStore();
  
  const {
    activeStep,
    setActiveStep,
    accounts,
    selectedAccounts,
    setSelectedAccounts,
    showAddAccount,
    setShowAddAccount,
    formErrors,
    setFormErrors,
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

  const handleSubmit = async () => {
    if (selectedAccounts.length === 0) {
      setFormErrors(prev => ({ ...prev, accounts: 'Please select at least one account' }));
      return;
    }

    if (!propertyData.location) {
      setFormErrors(prev => ({ ...prev, location: 'Please select a property location' }));
      return;
    }

    // Validate service address
    const { serviceAddress } = propertyData;
    if (!serviceAddress.address1 || !serviceAddress.city || !serviceAddress.province || !serviceAddress.postalCode) {
      setFormErrors(prev => ({ ...prev, serviceAddress: 'Service address is incomplete' }));
      return;
    }

    // Convert service address to the format expected by the API
    const service_address = {
      address1: propertyData.serviceAddress.address1,
      address2: propertyData.serviceAddress.address2 || '',
      city: propertyData.serviceAddress.city,
      province: propertyData.serviceAddress.province,
      postal_code: propertyData.serviceAddress.postalCode,
      country: propertyData.serviceAddress.country || 'Canada',
    };

    // Use service address for billing if useDifferentBillingAddress is false
    const billing_address = propertyData.useDifferentBillingAddress ? {
      address1: propertyData.billingAddress.address1,
      address2: propertyData.billingAddress.address2 || '',
      city: propertyData.billingAddress.city,
      province: propertyData.billingAddress.province,
      postal_code: propertyData.billingAddress.postalCode,
      country: propertyData.billingAddress.country || 'Canada',
    } : service_address;  // Use service address as billing address if not different

    // Prepare boundary data ensuring it matches the expected format
    const boundaryCoordinates = propertyData.boundary?.coordinates[0] || [];
    const closedBoundary = boundaryCoordinates.length > 0 ? 
      [...boundaryCoordinates, boundaryCoordinates[0]] : [];

    const createPropertyData: CreatePropertyDto = {
      name: propertyData.useCustomName ? propertyData.customName : propertyData.serviceAddress.address1,
      type: propertyData.type,
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

    createProperty(createPropertyData, {
      onSuccess: (newProperty) => {
        setSelectedProperty(newProperty);  // Select the newly created property
        handleClose();
      }
    });
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
            {error instanceof Error ? error.message : 'Failed to create property'}
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
