'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Account } from '@/app/globalTypes/account';
import type { CreateAddressDto } from '@/app/globalTypes/address';
import type { User } from '@/app/globalTypes';
import { ENV_CONFIG } from '@/config/environment';

interface CreateAccountDto {
    name: string;
    type: string;
    status?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    billing_address_id?: string;
    billingAddress?: CreateAddressDto;
    users?: User[];
    property_ids?: string[];
}

const ENDPOINTS = {
    accounts: '/accounts',
    accountDetails: (id: string) => `/accounts/${id}`,
    accountSettings: {
        types: '/settings/accounts/types',
        statuses: '/settings/accounts/statuses'
    },
    bulkDelete: '/accounts/bulk-delete',
    archive: (id: string) => `/accounts/${id}/archive`
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
        staleTime: 30000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false
    });
};

// Single Account Hook
export const useAccount = (accountId: string | null) => {
    return useQuery({
        queryKey: ['account', accountId],
        queryFn: async () => {
            if (!accountId) return null;

            console.log('Fetching account details:', { accountId });
            const url = buildUrl(ENDPOINTS.accountDetails(accountId));
            console.log('API Request:', { method: 'GET', url });

            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('API Response:', { account: data });
            return data;
        },
        enabled: !!accountId,
        staleTime: 30000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
};

// Update Account Hook
export const useUpdateAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAccountDto> }) => {
            console.log('Updating account:', { id, data });
            const url = buildUrl(ENDPOINTS.accountDetails(id));
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
            console.log('API Response:', { updatedAccount: result });
            return result;
        },
        onSuccess: async (data, { id }) => {
            console.log('Update successful, invalidating queries');
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['account', id] }),
                queryClient.invalidateQueries({ queryKey: ['accounts'] })
            ]);
        },
        onError: (error) => {
            console.error('Update failed:', error);
        }
    });
};

// Create Account Hook
export const useCreateAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateAccountDto) => {
            console.log('Creating account:', data);
            const url = buildUrl(ENDPOINTS.accounts);
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
            console.log('API Response:', { newAccount: result });
            return result;
        },
        onSuccess: () => {
            console.log('Create successful, invalidating queries');
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
        onError: (error) => {
            console.error('Create failed:', error);
        }
    });
};

// Delete Account Hook
export const useDeleteAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            console.log('Deleting account:', { id });
            const url = buildUrl(ENDPOINTS.accountDetails(id));
            console.log('API Request:', { method: 'DELETE', url });

            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('API Response:', result);
            return result;
        },
        onSuccess: () => {
            console.log('Delete successful, invalidating queries');
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
        onError: (error) => {
            console.error('Delete failed:', error);
        }
    });
};

// Archive Account Hook
export const useArchiveAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            console.log('Archiving account:', { id });
            const url = buildUrl(ENDPOINTS.archive(id));
            console.log('API Request:', { method: 'PUT', url });

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('API Response:', result);
            return result;
        },
        onSuccess: () => {
            console.log('Archive successful, invalidating queries');
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
        onError: (error) => {
            console.error('Archive failed:', error);
        }
    });
};

// Bulk Delete Accounts Hook
export const useBulkDeleteAccounts = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (accountIds: string[]) => {
            console.log('Bulk deleting accounts:', { accountIds });
            const url = buildUrl(ENDPOINTS.bulkDelete);
            console.log('API Request:', { method: 'POST', url, data: { accountIds } });

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountIds }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('API Response:', result);
            return result;
        },
        onSuccess: () => {
            console.log('Bulk delete successful, invalidating queries');
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
        onError: (error) => {
            console.error('Bulk delete failed:', error);
        }
    });
};

// Account Settings Hooks
export const useAccountSettings = () => {
    return useQuery({
        queryKey: ['accountSettings'],
        queryFn: async () => {
            console.log('Fetching account settings');
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

            const [types, statusesData] = await Promise.all([
                typesResponse.json(),
                statusesResponse.json()
            ]);

            console.log('API Response:', { types, statusesData });

            const statuses = statusesData?.statuses || [];

            return { types, statuses };
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};
