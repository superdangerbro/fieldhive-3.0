import type { Account } from '../../../../globalTypes/account';
import type { CreateAddressDto } from '../../../../globalTypes/address';

export interface PropertyFormData {
    useCustomName: boolean;
    customName: string;
    type: string;
    serviceAddress: CreateAddressDto;
    useDifferentBillingAddress: boolean;
    billingAddress: CreateAddressDto;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    boundary?: {
        type: 'Polygon';
        coordinates: Array<Array<[number, number]>>;
    };
}

export interface FormErrors {
    type?: string;
    accounts?: string;
    location?: string;
    'serviceAddress.address1'?: string;
    'serviceAddress.city'?: string;
    'serviceAddress.province'?: string;
    'serviceAddress.postal_code'?: string;
    'billingAddress.address1'?: string;
    'billingAddress.city'?: string;
    'billingAddress.province'?: string;
    'billingAddress.postal_code'?: string;
    [key: string]: string | undefined;
}

export interface StepProps {
    step: number;
    setActiveStep: (step: number) => void;
    propertyData: PropertyFormData;
    setPropertyData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
    formErrors: FormErrors;
    setFormErrors: (errors: FormErrors) => void;
    handleFieldChange: (path: string, value: string) => void;
    selectedAccounts: Account[];
    setSelectedAccounts: (accounts: Account[]) => void;
    accounts: Account[];
    showAddAccount: boolean;
    setShowAddAccount: (show: boolean) => void;
}

// Validation helper types
export interface ValidationResult {
    isValid: boolean;
    errors: FormErrors;
}

export interface AddressValidationFields {
    address1: string;
    city: string;
    province: string;
    postal_code: string;
}
