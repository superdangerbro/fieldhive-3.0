'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';
import type { Property } from '@/app/globalTypes/property';
import { handleApiError } from './utils';

const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

export const useCreateProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<Property>) => {
            console.log('Creating property:', data);
            const url = buildUrl('/properties');
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
            console.log('API Response:', { newProperty: result });
            return result;
        },
        onSuccess: (newProperty) => {
            console.log('Create successful, updating cache');
            queryClient.setQueryData(['property', newProperty.property_id], newProperty);
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
            console.error('Create failed:', error);
        }
    });
};
