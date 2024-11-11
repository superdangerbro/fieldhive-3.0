'use client';

import React from 'react';
import { Box } from '@mui/material';
import { AddressFormStep } from './AddressFormStep';
import { AccountStep } from './AccountStep';
import { LocationStep } from './LocationStep';
import { BoundaryStep } from './BoundaryStep';
import type { StepProps, FormErrors } from './types';

export const StepContent: React.FC<StepProps> = ({
  step,
  setActiveStep,
  propertyData,
  setPropertyData,
  formErrors,
  setFormErrors,
  handleFieldChange,
  selectedAccounts,
  setSelectedAccounts,
  accounts,
  showAddAccount,
  setShowAddAccount,
}) => {
  const errors: FormErrors = formErrors;

  switch (step) {
    case 0:
      return (
        <AddressFormStep
          propertyData={propertyData}
          setPropertyData={setPropertyData}
          formErrors={errors}
          handleFieldChange={handleFieldChange}
        />
      );
    case 1:
      return (
        <AccountStep
          selectedAccounts={selectedAccounts}
          setSelectedAccounts={setSelectedAccounts}
          accounts={accounts}
          showAddAccount={showAddAccount}
          setShowAddAccount={setShowAddAccount}
        />
      );
    case 2:
      return (
        <LocationStep
          propertyData={propertyData}
          setPropertyData={setPropertyData}
          formErrors={errors}
        />
      );
    case 3:
      return (
        <BoundaryStep
          propertyData={propertyData}
          setPropertyData={setPropertyData}
          formErrors={errors}
        />
      );
    default:
      return <Box>Unknown step</Box>;
  }
};
