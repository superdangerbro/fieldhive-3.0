'use client';

import React from 'react';
import { Box } from '@mui/material';
import { AddressFormStep } from './AddressFormStep';
import { AccountStep } from './AccountStep';
import { LocationStep } from './LocationStep';
import { BoundaryStep } from './BoundaryStep';
import type { Account } from '../../../../globalTypes/account';
import type { PropertyFormData } from '../../hooks/usePropertyForm';

interface StepContentProps {
  step: number;
  setActiveStep: (step: number) => void;
  propertyData: PropertyFormData;
  setPropertyData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  formErrors: Record<string, string>;
  setFormErrors: (errors: Record<string, string>) => void;
  handleFieldChange: (path: string, value: string) => void;
  selectedAccounts: Account[];
  setSelectedAccounts: (accounts: Account[]) => void;
  accounts: Account[];
  showAddAccount: boolean;
  setShowAddAccount: (show: boolean) => void;
}

export const StepContent: React.FC<StepContentProps> = ({
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
  const handleEditLocation = () => {
    setActiveStep(2); // Jump to Location step
  };

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
          formErrors={formErrors}
        />
      );
    case 3:
      return (
        <BoundaryStep
          propertyData={propertyData}
          setPropertyData={setPropertyData}
          formErrors={formErrors}
        />
      );
    default:
      return <Box>Unknown step</Box>;
  }
};
