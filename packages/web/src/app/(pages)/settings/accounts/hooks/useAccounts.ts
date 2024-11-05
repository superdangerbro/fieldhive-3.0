'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AccountType, AccountStatus } from '@/app/globalTypes/account';
import { ENV_CONFIG } from '@/config/environment';

const ENDPOINTS = {
    types: '/settings/accounts/types',
    statuses: '/settings/accounts/statuses'
} as const;

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

// Helper function to handle API errors consistently
const handleApiError = async (response: Response) => {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
};

// Account Types Hooks
export const useAccountTypes = () => {
    return useQuery({
        queryKey: ['accountTypes'],
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

export const useUpdateAccountTypes = () => {
    const queryClient = useQueryClient();

    return useMutation<AccountType[], Error, AccountType[]>({
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
            queryClient.setQueryData(['accountTypes'], data);
        },
    });
};

// Account Statuses Hooks
export const useAccountStatuses = () => {
    return useQuery({
        queryKey: ['accountStatuses'],
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

export const useUpdateAccountStatuses = () => {
    const queryClient = useQueryClient();

    return useMutation<AccountStatus[], Error, AccountStatus[]>({
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
            queryClient.setQueryData(['accountStatuses'], data);
        },
    });
};
