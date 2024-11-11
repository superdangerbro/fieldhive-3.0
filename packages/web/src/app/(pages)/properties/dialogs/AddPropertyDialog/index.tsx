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
    Box,
    Alert,
    AlertTitle,
    CircularProgress
} from '@mui/material';
import { useCreateProperty, type PropertyCreatePayload, type PropertyLocation } from '../../hooks/usePropertyCreate';
import { useSelectedProperty } from '../../hooks/useSelectedProperty';
import { usePropertyForm } from '../../hooks/usePropertyForm';
import { StepContent } from './StepContent';

const steps = [
    'Basic Information',
    'Account Selection',
    'Location',
    'Boundary'
];

interface AddPropertyDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function AddPropertyDialog({ open, onClose }: AddPropertyDialogProps) {
    const { mutateAsync: createProperty, isPending: propertyLoading, error: propertyError } = useCreateProperty();
    const { setSelectedProperty } = useSelectedProperty();
    const [error, setError] = useState<Error | null>(null);
    const [currentOperation, setCurrentOperation] = useState<string>('');
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
        handleNext: formHandleNext,
        handleBack,
        reset,
        validateStep
    } = usePropertyForm();

    const handleClose = () => {
        reset();
        setError(null);
        setCurrentOperation('');
        onClose();
    };

    const handleNext = () => {
        setError(null);
        setFormErrors({});

        if (validateStep(activeStep)) {
            formHandleNext();
        }
    };

    const handleCreate = async () => {
        try {
            if (!selectedAccounts?.[0]?.account_id) {
                throw new Error('Please select an account');
            }

            setCurrentOperation('Creating property...');

            // Location is already in GeoJSON format [lng, lat] from LocationStep
            const location: PropertyLocation | undefined = propertyData.location || undefined;

            const propertyPayload: PropertyCreatePayload = {
                name: propertyData.useCustomName ? propertyData.customName : propertyData.serviceAddress.address1,
                type: propertyData.type,
                status: 'active',
                service_address: {
                    address1: propertyData.serviceAddress.address1,
                    address2: propertyData.serviceAddress.address2,
                    city: propertyData.serviceAddress.city,
                    province: propertyData.serviceAddress.province,
                    postal_code: propertyData.serviceAddress.postal_code,
                    country: 'Canada'
                },
                billing_address: propertyData.useDifferentBillingAddress ? {
                    address1: propertyData.billingAddress.address1,
                    address2: propertyData.billingAddress.address2,
                    city: propertyData.billingAddress.city,
                    province: propertyData.billingAddress.province,
                    postal_code: propertyData.billingAddress.postal_code,
                    country: 'Canada'
                } : undefined,
                account_id: selectedAccounts[0].account_id,
                location,
                boundary: propertyData.boundary  // Already in GeoJSON format from BoundaryStep
            };

            console.log('Creating property with data:', JSON.stringify(propertyPayload, null, 2));
            const newProperty = await createProperty(propertyPayload);
            console.log('Property created successfully:', newProperty);
            
            setSelectedProperty(newProperty);
            handleClose();
        } catch (err) {
            console.error('Property creation failed:', err);
            setError(err instanceof Error ? err : new Error('Failed to create property'));
        }
    };

    const loading = propertyLoading;
    const displayError = error || propertyError;

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Add New Property</DialogTitle>
            <DialogContent>
                {displayError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <AlertTitle>Error</AlertTitle>
                        {displayError instanceof Error ? displayError.message : 'Failed to create property'}
                    </Alert>
                )}

                <Box sx={{ mt: 2, mb: 4 }}>
                    <Stepper activeStep={activeStep}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

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
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep > 0 && (
                    <Button onClick={handleBack} disabled={loading}>Back</Button>
                )}
                {activeStep === steps.length - 1 ? (
                    <Button 
                        onClick={handleCreate}
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                        sx={{
                            backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
                            '&:not(:disabled)': {
                                backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
                            }
                        }}
                    >
                        {loading ? 'Creating Property...' : 'Create Property'}
                    </Button>
                ) : (
                    <Button 
                        variant="contained"
                        onClick={handleNext}
                        sx={{
                            backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
                            '&:not(:disabled)': {
                                backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
                            }
                        }}
                    >
                        Next
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
