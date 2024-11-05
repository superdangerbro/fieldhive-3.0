'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EquipmentType, EquipmentStatus } from '@/app/globalTypes/equipment';
import { ENV_CONFIG } from '@/config/environment';

const ENDPOINTS = {
    types: '/settings/equipment/types',
    statuses: '/settings/equipment/statuses'
} as const;

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

// Helper function to handle API errors consistently
const handleApiError = async (response: Response) => {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
};

// Equipment Types Hooks
export const useEquipmentTypes = () => {
    return useQuery({
        queryKey: ['equipmentTypes'],
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

export const useUpdateEquipmentTypes = () => {
    const queryClient = useQueryClient();

    return useMutation<EquipmentType[], Error, EquipmentType[]>({
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
            queryClient.setQueryData(['equipmentTypes'], data);
        },
    });
};

// Equipment Statuses Hooks
export const useEquipmentStatuses = () => {
    return useQuery({
        queryKey: ['equipmentStatuses'],
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

export const useUpdateEquipmentStatuses = () => {
    const queryClient = useQueryClient();

    return useMutation<EquipmentStatus[], Error, EquipmentStatus[]>({
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
            queryClient.setQueryData(['equipmentStatuses'], data);
        },
    });
};
