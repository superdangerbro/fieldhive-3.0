import React from 'react';
import { Box } from '@mui/material';
import { AddressFormStep } from '../steps/AddressFormStep';
import { AccountStep } from '../steps/AccountStep';
import { PropertyFormData, Account, Contact } from '../types';

interface StepContentProps {
  step: number;
  propertyData: PropertyFormData;
  setPropertyData: (data: PropertyFormData) => void;
  formErrors: Record<string, string>;
  setFormErrors: (errors: Record<string, string>) => void;
  handleFieldChange: (path: string, value: string) => void;
  selectedAccount: Account | null;
  setSelectedAccount: (account: Account | null) => void;
  accounts: Account[];
  showAddAccount: boolean;
  setShowAddAccount: (show: boolean) => void;
  fetchAccounts: () => Promise<void>;
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
}

export const StepContent: React.FC<StepContentProps> = ({
  step,
  propertyData,
  setPropertyData,
  formErrors,
  setFormErrors,
  handleFieldChange,
  selectedAccount,
  setSelectedAccount,
  accounts,
  showAddAccount,
  setShowAddAccount,
  fetchAccounts,
  contacts,
  setContacts,
}) => {
  switch (step) {
    case 0:
      return (
        <AddressFormStep
          propertyData={propertyData}
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
          formErrors={formErrors}
        />
      );
    default:
      return <Box>Unknown step</Box>;
  }
};
