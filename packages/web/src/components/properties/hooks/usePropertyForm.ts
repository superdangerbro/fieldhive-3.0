import { useState, useCallback, useRef } from 'react';
import { PropertyFormData, Account, Contact } from '../types';
import { PropertyType } from '@fieldhive/shared';

export const usePropertyForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  const [propertyData, setPropertyData] = useState<PropertyFormData>({
    useCustomName: false,
    customName: '',
    serviceAddress: {
      address1: '',
      address2: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Canada',
    },
    useDifferentBillingAddress: false,
    billingAddress: {
      address1: '',
      address2: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Canada',
    },
    boundary: null,
    location: null,
    type: PropertyType.RESIDENTIAL,
  });

  const validateAddressForm = useCallback(() => {
    const errors: Record<string, string> = {};
    const { serviceAddress } = propertyData;

    if (!serviceAddress.address1.trim()) {
      errors.address1 = 'Address is required';
    }
    if (!serviceAddress.city.trim()) {
      errors.city = 'City is required';
    }
    if (!serviceAddress.province.trim()) {
      errors.province = 'Province is required';
    }
    if (!serviceAddress.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    }

    if (propertyData.useDifferentBillingAddress) {
      const { billingAddress } = propertyData;
      if (!billingAddress.address1.trim()) {
        errors['billing.address1'] = 'Billing address is required';
      }
      if (!billingAddress.city.trim()) {
        errors['billing.city'] = 'City is required';
      }
      if (!billingAddress.province.trim()) {
        errors['billing.province'] = 'Province is required';
      }
      if (!billingAddress.postalCode.trim()) {
        errors['billing.postalCode'] = 'Postal code is required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [propertyData]);

  const handleFieldChange = useCallback((path: string, value: string) => {
    const parts = path.split('.');
    setPropertyData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newData;
    });
    setFormErrors(prev => ({ ...prev, [path]: '' }));
  }, []);

  const reset = useCallback(() => {
    setActiveStep(0);
    setAccounts([]);
    setSelectedAccount(null);
    setShowAddAccount(false);
    setFormErrors({});
    setContacts([]);
    setPropertyData({
      useCustomName: false,
      customName: '',
      serviceAddress: {
        address1: '',
        address2: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'Canada',
      },
      useDifferentBillingAddress: false,
      billingAddress: {
        address1: '',
        address2: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'Canada',
      },
      boundary: null,
      location: null,
      type: PropertyType.RESIDENTIAL,
    });
  }, []);

  return {
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
  };
};
