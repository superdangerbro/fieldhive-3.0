import { useCallback } from 'react';
import { createAccount, createProperty } from '../../../services/api';
import { PropertyFormData, Contact } from '../types';
import { CreateAccountDto, CreatePropertyRequest, PropertyType } from '@fieldhive/shared';
import { Point } from 'geojson';

interface UsePropertySubmitProps {
  propertyData: PropertyFormData;
  selectedAccount: { id: string; name: string } | null;
  showAddAccount: boolean;
  contacts: Contact[];
  setFormErrors: (errors: Record<string, string>) => void;
  onSuccess?: () => void;
  onClose: () => void;
}

export const usePropertySubmit = ({
  propertyData,
  selectedAccount,
  showAddAccount,
  contacts,
  setFormErrors,
  onSuccess,
  onClose,
}: UsePropertySubmitProps) => {
  const validateSubmission = useCallback(() => {
    // Validate required fields
    if (!propertyData.serviceAddress.address1 || !propertyData.serviceAddress.city || !propertyData.serviceAddress.province) {
      setFormErrors({ submit: 'Please fill in all required address fields' });
      return false;
    }

    if (!propertyData.location) {
      setFormErrors({ submit: 'Property location is required. Please ensure the address can be geocoded.' });
      return false;
    }

    if (showAddAccount) {
      if (!selectedAccount?.name || contacts.length === 0) {
        setFormErrors({ submit: 'Please provide account name and at least one contact' });
        return false;
      }

      // Validate contacts
      const invalidContacts = contacts.filter(
        contact => !contact.name || !contact.email || !contact.phone
      );
      if (invalidContacts.length > 0) {
        setFormErrors({ submit: 'Please fill in all required contact fields' });
        return false;
      }
    } else if (!selectedAccount) {
      setFormErrors({ submit: 'Please select an account' });
      return false;
    }

    return true;
  }, [propertyData, selectedAccount, showAddAccount, contacts, setFormErrors]);

  const handleSubmit = useCallback(async () => {
    if (!validateSubmission()) {
      return;
    }

    try {
      let accountId: string;

      // Handle account creation if needed
      if (showAddAccount && selectedAccount) {
        // Use the service address as the billing address for new accounts
        const accountData: CreateAccountDto = {
          name: selectedAccount.name,
          status: 'active',
          isCompany: false,
          billingAddress: propertyData.useDifferentBillingAddress 
            ? propertyData.billingAddress 
            : propertyData.serviceAddress
        };

        console.log('Creating account with data:', accountData);
        const account = await createAccount(accountData);
        accountId = account.id;

        // TODO: Create contacts for the account in a separate API call
      } else if (selectedAccount) {
        accountId = selectedAccount.id;
      } else {
        throw new Error('No account selected or created');
      }

      // Create location point
      const location: Point = {
        type: 'Point',
        coordinates: [
          Number(propertyData.location!.coordinates[0]),
          Number(propertyData.location!.coordinates[1])
        ]
      };

      // Prepare property data according to CreatePropertyRequest type
      const propertyPayload = {
        name: propertyData.useCustomName 
          ? propertyData.customName 
          : propertyData.serviceAddress.address1,
        address1: propertyData.serviceAddress.address1,
        address2: propertyData.serviceAddress.address2,
        city: propertyData.serviceAddress.city,
        province: propertyData.serviceAddress.province,
        postal_code: propertyData.serviceAddress.postalCode,
        country: propertyData.serviceAddress.country,
        type: propertyData.type,
        location,
        accountConnections: [{
          accountId,
          role: 'owner'
        }]
      };

      console.log('Creating property with payload:', propertyPayload);
      const result = await createProperty(propertyPayload);
      console.log('Property created:', result);

      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating property:', error);
      setFormErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to create property' 
      });
    }
  }, [
    propertyData,
    selectedAccount,
    showAddAccount,
    contacts,
    validateSubmission,
    setFormErrors,
    onClose,
    onSuccess,
  ]);

  return {
    handleSubmit,
    validateSubmission,
  };
};
