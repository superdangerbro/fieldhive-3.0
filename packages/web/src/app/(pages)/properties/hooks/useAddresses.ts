import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';
import type { Address, CreateAddressDto } from '../../../globalTypes/address';

const ADDRESSES_ENDPOINT = '/addresses';

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

// Create address mutation
export const useCreateAddress = () => {
    const queryClient = useQueryClient();

    return useMutation<Address, Error, CreateAddressDto>({
        mutationFn: async (data) => {
            const response = await fetch(buildUrl(ADDRESSES_ENDPOINT), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                throw new Error('Failed to create address');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
        },
    });
};

// Update address mutation
export const useUpdateAddress = () => {
    const queryClient = useQueryClient();

    return useMutation<Address, Error, { id: string; data: Partial<CreateAddressDto> }>({
        mutationFn: async ({ id, data }) => {
            const response = await fetch(buildUrl(`${ADDRESSES_ENDPOINT}/${id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                throw new Error('Failed to update address');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
        },
    });
};

export type { Address, CreateAddressDto };
