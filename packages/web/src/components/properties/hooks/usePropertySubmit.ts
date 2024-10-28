'use client';

import { useState } from 'react';
import { createProperty } from '../../../services/api';
import { PropertyType } from '@fieldhive/shared/src/types/property';
import { AccountRole } from '@fieldhive/shared/src/types/account';

interface UsePropertySubmitProps {
    propertyData: any;
    selectedAccount: { id: string; role: AccountRole } | null;
    showAddAccount: boolean;
    contacts: any[];
    setFormErrors: (errors: any) => void;
    onSuccess?: () => void;
    onClose: () => void;
}

export function usePropertySubmit({
    propertyData,
    selectedAccount,
    showAddAccount,
    contacts,
    setFormErrors,
    onSuccess,
    onClose
}: UsePropertySubmitProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        setFormErrors({});

        try {
            const accountConnections = selectedAccount 
                ? [{ accountId: selectedAccount.id, role: selectedAccount.role }]
                : [];

            // Transform the data to match API expectations
            const apiData = {
                name: propertyData.useCustomName ? propertyData.customName : propertyData.serviceAddress.address1,
                address1: propertyData.serviceAddress.address1,
                address2: propertyData.serviceAddress.address2 || undefined,
                city: propertyData.serviceAddress.city,
                province: propertyData.serviceAddress.province,
                postal_code: propertyData.serviceAddress.postalCode,
                country: propertyData.serviceAddress.country || 'Canada',
                type: propertyData.type || PropertyType.RESIDENTIAL,
                location: propertyData.location,
                boundary: propertyData.boundary || undefined,
                accountConnections
            };

            console.log('Submitting property data:', JSON.stringify(apiData, null, 2));
            await createProperty(apiData);
            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error('Error submitting property:', err);
            setFormErrors({ submit: err.message || 'Failed to create property' });
        } finally {
            setLoading(false);
        }
    };

    return {
        handleSubmit,
        loading
    };
}
