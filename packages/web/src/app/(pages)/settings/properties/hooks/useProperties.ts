'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PropertyType, PropertyStatus } from '@/app/globalTypes/property';
import { ENV_CONFIG } from '@/config/environment';

const ENDPOINTS = {
    types: '/settings/properties/types',
    statuses: '/settings/properties/statuses'
} as const;

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

// Helper function to handle API errors consistently
const handleApiError = async (response: Response) => {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
};

// Property Types Hooks
export const usePropertyTypes = () => {
    return useQuery({
        queryKey: ['propertyTypes'],
        queryFn: async () => {
            const response = await fetch(buildUrl(ENDPOINTS.types), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

export const useUpdatePropertyTypes = () => {
    const queryClient = useQueryClient();

    return useMutation<PropertyType[], Error, PropertyType[]>({
        mutationFn: async (types) => {
            const response = await fetch(buildUrl(ENDPOINTS.types), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(types),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['propertyTypes'], data);
        },
    });
};

// Property Statuses Hooks
export const usePropertyStatuses = () => {
    return useQuery({
        queryKey: ['propertyStatuses'],
        queryFn: async () => {
            const response = await fetch(buildUrl(ENDPOINTS.statuses), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

export const useUpdatePropertyStatuses = () => {
    const queryClient = useQueryClient();

    return useMutation<PropertyStatus[], Error, PropertyStatus[]>({
        mutationFn: async (statuses) => {
            const response = await fetch(buildUrl(ENDPOINTS.statuses), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(statuses),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['propertyStatuses'], data);
        },
    });
};
