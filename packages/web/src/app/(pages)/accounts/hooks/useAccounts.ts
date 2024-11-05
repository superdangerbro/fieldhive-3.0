'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Account } from '@/app/globalTypes/account';
import { ENV_CONFIG } from '@/config/environment';

const ENDPOINTS = {
    accounts: '/accounts',
    accountDetails: (id: string) => `/accounts/${id}`,
    accountSettings: {
        types: '/settings/accounts/types',
        statuses: '/settings/accounts/statuses'
    },
    bulkDelete: '/accounts/bulk-delete'
} as const;

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

// Helper function to handle API errors consistently
const handleApiError = async (response: Response) => {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
};

// Accounts List Hook
export const useAccounts = (params?: { limit?: number; offset?: number; search?: string }) => {
    return useQuery({
        queryKey: ['accounts', params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params?.limit) searchParams.append('limit', params.limit.toString());
            if (params?.offset) searchParams.append('offset', params.offset.toString());
            if (params?.search) searchParams.append('search', params.search);

            const url = `${buildUrl(ENDPOINTS.accounts)}?${searchParams.toString()}`;
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            return data.accounts;
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

// Single Account Hook
export const useAccount = (accountId: string | null) => {
    return useQuery({
        queryKey: ['account', accountId],
        queryFn: async () => {
            if (!accountId) return null;

            const response = await fetch(buildUrl(ENDPOINTS.accountDetails(accountId)), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        enabled: !!accountId,
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

// Update Account Hook
export const useUpdateAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Account> }) => {
            const response = await fetch(buildUrl(ENDPOINTS.accountDetails(id)), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: (data, { id }) => {
            queryClient.setQueryData(['account', id], data);
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};

// Create Account Hook
export const useCreateAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<Account>) => {
            const response = await fetch(buildUrl(ENDPOINTS.accounts), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};

// Delete Account Hook
export const useDeleteAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(buildUrl(ENDPOINTS.accountDetails(id)), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};

// Bulk Delete Accounts Hook
export const useBulkDeleteAccounts = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (accountIds: string[]) => {
            const response = await fetch(buildUrl(ENDPOINTS.bulkDelete), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountIds }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};

// Account Settings Hooks
export const useAccountSettings = () => {
    return useQuery({
        queryKey: ['accountSettings'],
        queryFn: async () => {
            const [typesResponse, statusesResponse] = await Promise.all([
                fetch(buildUrl(ENDPOINTS.accountSettings.types), {
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                }),
                fetch(buildUrl(ENDPOINTS.accountSettings.statuses), {
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                })
            ]);

            if (!typesResponse.ok) await handleApiError(typesResponse);
            if (!statusesResponse.ok) await handleApiError(statusesResponse);

            const [types, statuses] = await Promise.all([
                typesResponse.json(),
                statusesResponse.json()
            ]);

            return { types, statuses };
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};
