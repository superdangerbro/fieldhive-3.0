'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../config/environment';
import type { CreatePropertyDto, Property } from '../../../globalTypes/property';
import type { CreateAddressDto } from '../../../globalTypes/address';

interface PropertyLocation {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

interface PropertyBoundary {
    type: 'Polygon';
    coordinates: Array<Array<[number, number]>>;
}

interface PropertyCreatePayload {
    name: string;
    type: string;
    status: string;
    service_address: CreateAddressDto;
    billing_address?: CreateAddressDto;
    account_id: string;
    location?: PropertyLocation;
    boundary?: PropertyBoundary;
}

export const useCreateProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: PropertyCreatePayload): Promise<Property> => {
            const url = `${ENV_CONFIG.api.baseUrl}/properties`;
            
            try {
                // Log the exact request
                console.log('Property creation request:', {
                    url,
                    method: 'POST',
                    payload: JSON.stringify(data, null, 2)
                });

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const responseData = await response.json();
                console.log('Property creation response:', responseData);

                if (!response.ok) {
                    throw new Error(responseData.message || 'Failed to create property');
                }

                return responseData;
            } catch (error) {
                console.error('Property creation error:', error);
                throw error instanceof Error 
                    ? error 
                    : new Error('Failed to create property');
            }
        },
        onSuccess: (newProperty) => {
            queryClient.setQueryData(['property', newProperty.property_id], newProperty);
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        }
    });
};

export type { PropertyCreatePayload, PropertyLocation, PropertyBoundary };
