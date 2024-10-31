'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    CircularProgress,
    Alert,
    Snackbar,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import { createProperty } from '../../services/api';
import type { CreatePropertyDto } from '@fieldhive/shared';
import { StepContent } from './AddPropertyDialog/StepContent';
import { usePropertyForm } from './hooks/usePropertyForm';
import { Account } from './types';

export interface AddPropertyDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const steps = ['Address Details', 'Account Details', 'Location', 'Property Boundary'];

// Mock account data - replace with actual API call
const mockAccounts: Account[] = [
    { id: '1', name: 'Account 1' },
    { id: '2', name: 'Account 2' },
    { id: '3', name: 'Account 3' },
];

export default function AddPropertyDialog({ open, onClose, onSuccess }: AddPropertyDialogProps) {
    const {
        activeStep,
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
    } = usePropertyForm();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (selectedAccounts.length === 0) {
            setError('Please select at least one account');
            return;
        }

        if (!propertyData.location) {
            setError('Please select a property location');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const createPropertyData: CreatePropertyDto = {
                name: propertyData.useCustomName ? propertyData.customName : `Property at ${propertyData.serviceAddress.address1}`,
                property_type: propertyData.type,
                location: {
                    type: 'Point',
                    coordinates: [
                        propertyData.location.coordinates[0],
                        propertyData.location.coordinates[1]
                    ]
                },
                boundary: propertyData.boundary ? {
                    type: 'Polygon',
                    coordinates: propertyData.boundary.coordinates[0].map(coord => 
                        [coord[0], coord[1]] as [number, number]
                    )
                } : undefined,
                service_address: {
                    address1: propertyData.serviceAddress.address1,
                    address2: propertyData.serviceAddress.address2,
                    city: propertyData.serviceAddress.city,
                    province: propertyData.serviceAddress.province,
                    postal_code: propertyData.serviceAddress.postalCode,
                    country: propertyData.serviceAddress.country,
                },
                billing_address: propertyData.useDifferentBillingAddress ? {
                    address1: propertyData.billingAddress.address1,
                    address2: propertyData.billingAddress.address2,
                    city: propertyData.billingAddress.city,
                    province: propertyData.billingAddress.province,
                    postal_code: propertyData.billingAddress.postalCode,
                    country: propertyData.billingAddress.country,
                } : undefined,
                account_id: selectedAccounts[0].id, // Primary account
            };

            await createProperty(createPropertyData);
            onSuccess();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create property');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        reset();
        setError(null);
        onClose();
    };

    const fetchAccounts = async () => {
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        setAccounts(mockAccounts);
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Add Property</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 3, mb: 1 }}>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                    <Box sx={{ mt: 4, mb: 2 }}>
                        <StepContent
                            step={activeStep}
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
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose} color="inherit" disabled={loading}>
                        Cancel
                    </Button>
                    {activeStep > 0 && (
                        <Button onClick={handleBack} color="inherit" disabled={loading}>
                            Back
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                        disabled={loading}
                        sx={{
                            backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
                            textTransform: 'none'
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : activeStep === steps.length - 1 ? (
                            'Create Property'
                        ) : (
                            'Next'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
}
