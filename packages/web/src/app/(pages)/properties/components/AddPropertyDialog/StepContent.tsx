'use client';

import React from 'react';
import { Box } from '@mui/material';
import { AddressFormStep } from '../steps/AddressFormStep';
import { AccountStep } from '../steps/AccountStep';
import { LocationStep } from '../steps/LocationStep';
import { BoundaryStep } from '../steps/BoundaryStep';
import { PropertyFormData, Account, Contact } from '../../types';

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
  fetchAccounts: () => Promise<void>;
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
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
  fetchAccounts,
  contacts,
  setContacts,
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
          fetchAccounts={fetchAccounts}
          contacts={contacts}
          setContacts={setContacts}
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
