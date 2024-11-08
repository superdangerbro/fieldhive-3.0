'use client';

import { useState, useCallback } from 'react';
import type { Account } from '@/app/globalTypes/account';
import type { CreatePropertyDto } from '@/app/globalTypes/property';

interface Address {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postalCode: string;
    country?: string;
}

interface PropertyFormData {
    useCustomName: boolean;
    customName: string;
    type: string;
    serviceAddress: Address;
    useDifferentBillingAddress: boolean;
    billingAddress: Address;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    boundary?: {
        type: 'Polygon';
        coordinates: [number, number][][];
    };
}

interface FormErrors {
    name?: string;
    type?: string;
    serviceAddress?: string;
    billingAddress?: string;
    location?: string;
    accounts?: string;
}

const initialAddress = {
    address1: '',
    address2: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Canada'
};

const initialFormData: PropertyFormData = {
    useCustomName: false,
    customName: '',
    type: '',
    serviceAddress: initialAddress,
    useDifferentBillingAddress: false,
    billingAddress: initialAddress,
    location: undefined,
    boundary: undefined
};

export function usePropertyForm() {
    const [activeStep, setActiveStep] = useState(0);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<Account[]>([]);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [propertyData, setPropertyData] = useState<PropertyFormData>(initialFormData);

    const handleFieldChange = useCallback((field: string, value: any) => {
        setPropertyData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when field is updated
        setFormErrors(prev => ({
            ...prev,
            [field]: undefined
        }));
    }, []);

    const validateStep = useCallback((step: number): boolean => {
        const errors: FormErrors = {};

        switch (step) {
            case 0: // Address Information
                if (!propertyData.serviceAddress.address1) {
                    errors.serviceAddress = 'Service address is required';
                }
                if (propertyData.useDifferentBillingAddress && !propertyData.billingAddress.address1) {
                    errors.billingAddress = 'Billing address is required';
                }
                break;

            case 1: // Account Selection
                if (selectedAccounts.length === 0) {
                    errors.accounts = 'Please select at least one account';
                }
                break;

            case 2: // Location
                if (!propertyData.location) {
                    errors.location = 'Please select a property location';
                }
                break;

            // Add more validation for other steps as needed
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
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
