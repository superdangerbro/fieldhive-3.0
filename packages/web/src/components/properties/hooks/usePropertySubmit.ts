import { useCallback } from 'react';
import { createAccount, createProperty } from '../../../services/api';
import { PropertyFormData, Contact } from '../types';
import { CreateAccountDto } from '@fieldhive/shared';
import { Feature, Polygon, FeatureCollection } from 'geojson';

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

    if (!propertyData.boundary) {
      setFormErrors({ submit: 'Please draw a property boundary' });
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

    // This check is redundant with validateSubmission, but helps TypeScript
    if (!propertyData.boundary) {
      setFormErrors({ submit: 'Please draw a property boundary' });
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

        console.log('Account Data:', JSON.stringify(accountData, null, 2)); // Log account data

        const account = await createAccount(accountData);
        accountId = account.id;

        // TODO: Create contacts for the account in a separate API call
        // This would require adding a new API endpoint for creating contacts
      } else if (selectedAccount) {
        accountId = selectedAccount.id;
      } else {
        throw new Error('No account selected or created');
      }

      // Format location as GeoJSON Point
      const locationGeoJSON = propertyData.location ? {
        type: 'Point',
        coordinates: [
          Number(propertyData.location.coordinates[0]),
          Number(propertyData.location.coordinates[1])
        ]
      } : null;

      // Format boundary as GeoJSON Polygon
      const boundaryGeoJSON = propertyData.boundary ? {
        type: 'Polygon',
        coordinates: [
          propertyData.boundary.coordinates[0].map(coord => [
            Number(coord[0]),
            Number(coord[1])
          ])
        ]
      } : null;

      // Prepare property data
      const propertyPayload = {
        name: propertyData.useCustomName 
          ? propertyData.customName 
          : `${propertyData.serviceAddress.address1}, ${propertyData.serviceAddress.city}`,
        type: propertyData.type,
        address: propertyData.serviceAddress.address1,
        location: locationGeoJSON,
        boundary: boundaryGeoJSON,
        accountConnections: [{
          accountId,
          role: 'owner' // Removed type assertion
        }]
      };

      console.log('Creating property with payload:', JSON.stringify(propertyPayload, null, 2));
      const result = await createProperty(propertyPayload, accountId);
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