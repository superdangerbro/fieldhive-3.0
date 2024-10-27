import { useState, useCallback, useRef, useEffect } from 'react';
import { PropertyFormData, Account, Contact } from '../types';
import { PropertyType } from '@fieldhive/shared';
import { Feature, Polygon, FeatureCollection } from 'geojson';

interface MapboxDrawFeatureCollection extends FeatureCollection {
  features: Feature[];
}

export const usePropertyForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [drawnFeatures, setDrawnFeatures] = useState<MapboxDrawFeatureCollection | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  const lastLocation = useRef<[number, number] | null>(null);
  const previousStep = useRef(0);
  const isCleaningUp = useRef(false);

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

  // Update boundary when features change
  useEffect(() => {
    if (drawnFeatures && drawnFeatures.features.length > 0) {
      const feature = drawnFeatures.features[0];
      if (feature.geometry.type === 'Polygon') {
        setPropertyData(prev => ({
          ...prev,
          boundary: feature.geometry as Polygon
        }));
      }
    } else {
      setPropertyData(prev => ({
        ...prev,
        boundary: null
      }));
    }
  }, [drawnFeatures]);

  // Handle step changes
  useEffect(() => {
    if (activeStep === 1 && previousStep.current !== 1) {
      // Entering map step
      if (!isCleaningUp.current) {
        setMapLoaded(false);
      }
    }
    previousStep.current = activeStep;
  }, [activeStep]);

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
    isCleaningUp.current = true;
    setActiveStep(0);
    setMapLoaded(false);
    setIsDrawing(false);
    setShowInstructions(true);
    setAccounts([]);
    setSelectedAccount(null);
    setShowAddAccount(false);
    setDrawnFeatures(null);
    setFormErrors({});
    setContacts([]);
    lastLocation.current = null;
    previousStep.current = 0;
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
    isCleaningUp.current = false;
  }, []);

  return {
    activeStep,
    setActiveStep,
    mapLoaded,
    setMapLoaded,
    isDrawing,
    setIsDrawing,
    showInstructions,
    setShowInstructions,
    accounts,
    setAccounts,
    selectedAccount,
    setSelectedAccount,
    showAddAccount,
    setShowAddAccount,
    drawnFeatures,
    setDrawnFeatures,
    formErrors,
    setFormErrors,
    contacts,
    setContacts,
    lastLocation,
    propertyData,
    setPropertyData,
    validateAddressForm,
    handleFieldChange,
    reset,
  };
};
