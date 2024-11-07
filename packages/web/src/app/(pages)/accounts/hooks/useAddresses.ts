'use client';

import { useMutation } from '@tanstack/react-query';
import type { CreateAddressDto } from '@/app/globalTypes/address';
import { ENV_CONFIG } from '@/config/environment';

const ENDPOINTS = {
    addresses: '/addresses',
    addressDetails: (id: string) => `/addresses/${id}`,
} as const;

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

// Helper function to handle API errors consistently
const handleApiError = async (response: Response) => {
    const error = await response.json();
    console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error
    });
    throw new Error(error.message || 'An error occurred');
};

// Update Address Hook
export const useUpdateAddress = () => {
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: CreateAddressDto }) => {
            console.log('Updating address:', { id, data });
            const url = buildUrl(ENDPOINTS.addressDetails(id));
            console.log('API Request:', { method: 'PUT', url, data });

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('API Response:', { updatedAddress: result });
            return result;
        }
    });
};

// Create Address Hook
export const useCreateAddress = () => {
    return useMutation({
        mutationFn: async (data: CreateAddressDto) => {
            console.log('Creating address:', data);
            const url = buildUrl(ENDPOINTS.addresses);
            console.log('API Request:', { method: 'POST', url, data });

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('API Response:', { newAddress: result });
            return result;
        }
    });
};
