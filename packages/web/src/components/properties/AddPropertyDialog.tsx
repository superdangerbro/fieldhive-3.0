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
} from '@mui/material';
import { AddressFormStep } from './steps/AddressFormStep';
import { AccountStep } from './steps/AccountStep';
import { LocationPickerDialog } from './LocationPickerDialog';
import { usePropertyForm } from './hooks/usePropertyForm';
import { usePropertySubmit } from './hooks/usePropertySubmit';
import { usePropertyGeocoding } from './hooks/usePropertyGeocoding';
import { getAccounts } from '../../services/api';

const steps = ['Property Details', 'Account'];

const stepTitles = {
  0: 'Enter Property Details',
  1: 'Select or Create Account',
};

interface AddPropertyDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddPropertyDialog: React.FC<AddPropertyDialogProps> = ({ open, onClose, onSuccess }) => {
  const [showLocationPicker, setShowLocationPicker] = React.useState(false);
  const lastLocation = React.useRef<[number, number] | null>(null);

  const {
    activeStep,
    setActiveStep,
    accounts,
    setAccounts,
    selectedAccount,
    setSelectedAccount,
    showAddAccount,
    setShowAddAccount,
    formErrors,
    setFormErrors,
    contacts,
    setContacts,
    propertyData,
    setPropertyData,
    validateAddressForm,
    handleFieldChange,
    reset,
  } = usePropertyForm();

  const { handleSubmit } = usePropertySubmit({
    propertyData,
    selectedAccount,
    showAddAccount,
    contacts,
    setFormErrors,
    onSuccess,
    onClose,
  });

  const { handleGeocodeAddress } = usePropertyGeocoding({
    propertyData,
    setPropertyData,
    lastLocation,
  });

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!validateAddressForm()) {
        return;
      }

      // Try to geocode the address
      const geocoded = await handleGeocodeAddress();
      if (!geocoded) {
        setShowLocationPicker(true);
        return;
      }
    }

    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    // Clear any step-specific errors when going back
    setFormErrors({});
  };

  const handleLocationSelect = (point: Point) => {
    setPropertyData({
      ...propertyData,
      location: point
    });
    lastLocation.current = [point.coordinates[0], point.coordinates[1]];
    setShowLocationPicker(false);
    setActiveStep(prev => prev + 1);
  };

  const fetchAccounts = React.useCallback(async () => {
    try {
      const response = await getAccounts();
      setAccounts(response.accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setFormErrors({ submit: 'Failed to fetch accounts' });
    }
  }, [setAccounts, setFormErrors]);

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <AddressFormStep
            propertyData={propertyData}
            setPropertyData={setPropertyData}
            formErrors={formErrors}
            handleFieldChange={handleFieldChange}
          />
        );
      case 1:
        return (
          <AccountStep
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            accounts={accounts}
            showAddAccount={showAddAccount}
            setShowAddAccount={setShowAddAccount}
            fetchAccounts={fetchAccounts}
            contacts={contacts}
            setContacts={setContacts}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle>{stepTitles[activeStep as keyof typeof stepTitles]}</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {getStepContent(activeStep)}
          {formErrors.submit && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formErrors.submit}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
          <Button 
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext} 
            variant="contained"
          >
            {activeStep === steps.length - 1 ? 'Create Property' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>

      <LocationPickerDialog
        open={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={handleLocationSelect}
        initialLocation={lastLocation.current || [-98, 56]}
        address={`${propertyData.serviceAddress.address1}, ${propertyData.serviceAddress.city}`}
      />
    </>
  );
};

export default AddPropertyDialog;
