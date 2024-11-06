'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';

interface AccountType {
    value: string;
    label: string;
}

interface AccountStatus {
    value: string;
    label: string;
    color: string;
}

const ENDPOINTS = {
    types: '/settings/accounts/types',
    statuses: '/settings/accounts/statuses'
} as const;

// Helper function to build full API URL
const buildUrl = (endpoint: string) => {
    const url = `${ENV_CONFIG.api.baseUrl}${endpoint}`;
    console.log('API URL:', url);
    return url;
};

// Helper function to handle API errors consistently
const handleApiError = async (response: Response) => {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
};

// Account Types Hooks
export const useAccountTypes = () => {
    return useQuery<AccountType[]>({
        queryKey: ['accountTypes'],
        queryFn: async () => {
            console.log('Fetching account types...');
            const response = await fetch(buildUrl(ENDPOINTS.types), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Account types response:', data);
            return Array.isArray(data) ? data : [];
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

export const useUpdateAccountTypes = () => {
    const queryClient = useQueryClient();

    return useMutation<AccountType[], Error, AccountType[]>({
        mutationFn: async (types) => {
            console.log('Updating account types:', types);
            const response = await fetch(buildUrl(ENDPOINTS.types), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(types),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Account types update response:', data);
            return Array.isArray(data) ? data : [];
        },
        onSuccess: (data) => {
            console.log('Update successful, setting query data:', data);
            queryClient.setQueryData(['accountTypes'], data);
        },
    });
};

// Account Statuses Hooks
export const useAccountStatuses = () => {
    return useQuery<AccountStatus[]>({
        queryKey: ['accountStatuses'],
        queryFn: async () => {
            console.log('Fetching account statuses...');
            const response = await fetch(buildUrl(ENDPOINTS.statuses), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Account statuses response:', data);
            return data.statuses || [];
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

export const useUpdateAccountStatuses = () => {
    const queryClient = useQueryClient();

    return useMutation<AccountStatus[], Error, AccountStatus[]>({
        mutationFn: async (statuses) => {
            console.log('Updating account statuses:', statuses);
            const response = await fetch(buildUrl(ENDPOINTS.statuses), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: { statuses } }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Account statuses update response:', data);
            return data.statuses || [];
        },
        onSuccess: (data) => {
            console.log('Update successful, setting query data:', data);
            queryClient.setQueryData(['accountStatuses'], data);
        },
    });
};
