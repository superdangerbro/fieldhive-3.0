import { useState, useCallback } from 'react';
import { useAccounts } from './useAccounts';
import type { Account } from '../../../globalTypes/account';

interface Address {
  address1: string;
  address2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface Location {
  type: 'Point';
  coordinates: [number, number];
}

interface Boundary {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export interface PropertyFormData {
  useCustomName: boolean;
  customName: string;
  serviceAddress: Address;
  useDifferentBillingAddress: boolean;
  billingAddress: Address;
  boundary: Boundary | null;
  location: Location | null;
  type: string;
}

export const usePropertyForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAccounts, setSelectedAccounts] = useState<Account[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Use React Query for accounts data
  const { data: accounts = [] } = useAccounts({ limit: 100 });
  
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
    type: 'residential',
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

  const validateAccountStep = useCallback(() => {
    const errors: Record<string, string> = {};

    if (selectedAccounts.length === 0) {
      errors.accounts = 'Please select at least one account';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [selectedAccounts]);

  const validateLocationStep = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!propertyData.location) {
      errors.location = 'Please select a property location';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [propertyData]);

  const validateBoundaryStep = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!propertyData.boundary) {
      errors.boundary = 'Please draw the property boundary';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [propertyData]);

  const validateStep = useCallback((step: number) => {
    switch (step) {
      case 0: // Address step
        return validateAddressForm();
      case 1: // Account step
        return validateAccountStep();
      case 2: // Location step
        return validateLocationStep();
      case 3: // Boundary step
        return validateBoundaryStep();
      default:
        return true;
    }
  }, [validateAddressForm, validateAccountStep, validateLocationStep, validateBoundaryStep]);

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

  const handleNext = useCallback(() => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  }, [activeStep, validateStep]);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  const reset = useCallback(() => {
    setActiveStep(0);
    setSelectedAccounts([]);
    setShowAddAccount(false);
    setFormErrors({});
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
      type: 'residential',
    });
  }, []);

  return {
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
    validateAddressForm,
    validateLocationStep,
    validateBoundaryStep,
    validateStep,
    handleFieldChange,
    handleNext,
    handleBack,
    reset,
  };
};
