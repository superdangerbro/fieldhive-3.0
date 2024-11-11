'use client';

import { useState, useCallback } from 'react';
import type { Account } from '../../../globalTypes/account';
import type { CreatePropertyDto } from '../../../globalTypes/property';
import type { PropertyFormData, FormErrors } from '../dialogs/AddPropertyDialog/types';
import type { CreateAddressDto } from '../../../globalTypes/address';

const initialAddress: CreateAddressDto = {
    address1: '',
    address2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Canada'
};

const initialFormData: PropertyFormData = {
    useCustomName: false,
    customName: '',
    type: '',
    serviceAddress: { ...initialAddress },
    useDifferentBillingAddress: false,
    billingAddress: { ...initialAddress },
    location: undefined,
    boundary: undefined
};

const validateAddressFields = (
    address: CreateAddressDto,
    prefix: 'serviceAddress' | 'billingAddress',
    errors: FormErrors
): boolean => {
    let isValid = true;

    // Helper to check and set error
    const validateField = (field: keyof CreateAddressDto, label: string) => {
        if (!address[field]) {
            errors[`${prefix}.${field}`] = `${label} is required`;
            isValid = false;
        }
    };

    validateField('address1', 'Street address');
    validateField('city', 'City');
    validateField('province', 'Province');
    validateField('postal_code', 'Postal code');

    // Log validation results
    console.log(`Validating ${prefix}:`, { address, isValid, errors });

    return isValid;
};

export function usePropertyForm() {
    const [activeStep, setActiveStep] = useState(0);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<Account[]>([]);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [propertyData, setPropertyData] = useState<PropertyFormData>(initialFormData);

    const handleFieldChange = useCallback((field: string, value: any) => {
        setPropertyData(prev => {
            const parts = field.split('.');
            if (parts.length === 2 && (parts[0] === 'serviceAddress' || parts[0] === 'billingAddress')) {
                const [addressType, fieldName] = parts;
                return {
                    ...prev,
                    [addressType]: {
                        ...prev[addressType],
                        [fieldName]: value
                    }
                };
            }
            return { ...prev, [field]: value };
        });
        
        // Clear error for this field
        setFormErrors(prev => ({
            ...prev,
            [field]: undefined
        }));
    }, []);

    const validateStep = useCallback((step: number): boolean => {
        const errors: FormErrors = {};
        let isValid = true;

        switch (step) {
            case 0: {
                // Validate property type
                if (!propertyData.type) {
                    errors.type = 'Property type is required';
                    isValid = false;
                }

                // Always validate service address
                if (!validateAddressFields(propertyData.serviceAddress, 'serviceAddress', errors)) {
                    isValid = false;
                }

                // Validate billing address if using different one
                if (propertyData.useDifferentBillingAddress) {
                    if (!validateAddressFields(propertyData.billingAddress, 'billingAddress', errors)) {
                        isValid = false;
                    }
                }
                break;
            }

            case 1: {
                if (selectedAccounts.length === 0) {
                    errors.accounts = 'Please select at least one account';
                    isValid = false;
                }
                break;
            }

            case 2: {
                if (!propertyData.location) {
                    errors.location = 'Please select a property location';
                    isValid = false;
                }
                break;
            }
        }

        // Log validation results
        console.log('Step validation:', { step, isValid, errors });

        setFormErrors(errors);
        return isValid;
    }, [propertyData, selectedAccounts]);

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
        setAccounts([]);
        setSelectedAccounts([]);
        setShowAddAccount(false);
        setFormErrors({});
        setPropertyData(initialFormData);
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
        handleFieldChange,
        handleNext,
        handleBack,
        reset,
        validateStep
    };
}
