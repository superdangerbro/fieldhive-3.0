'use client';

import { useMutation } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../config/environment';
import type { CreateAddressDto, Address } from '../../../globalTypes/address';

export const useCreateAddress = () => {
    return useMutation({
        mutationFn: async (data: CreateAddressDto): Promise<Address> => {
            const url = `${ENV_CONFIG.api.baseUrl}/addresses`;
            
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        address1: data.address1?.trim(),
                        address2: data.address2?.trim() || '',
                        city: data.city?.trim(),
                        province: data.province?.trim(),
                        postal_code: data.postal_code?.trim(),
                        country: 'Canada'
                    }),
                });

                const responseData = await response.json();
                console.log('Address creation response:', responseData); // Log the exact response

                if (!response.ok) {
                    throw new Error(responseData.message || 'Failed to create address');
                }

                // Ensure we're getting a valid address_id
                if (!responseData.address_id) {
                    console.error('Missing address_id in response:', responseData);
                    throw new Error('Created address is missing ID');
                }

                // Log the exact address_id format
                console.log('Created address_id:', responseData.address_id);

                return responseData;
            } catch (error) {
                console.error('Address creation failed:', error);
                throw error instanceof Error 
                    ? error 
                    : new Error('Failed to create address');
            }
        }
    });
};
