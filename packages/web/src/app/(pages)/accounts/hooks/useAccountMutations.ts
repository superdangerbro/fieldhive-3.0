'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildUrl, handleApiError, ENDPOINTS } from './utils/api';
import { transformAccount } from './utils/transformAccount';
import { ENV_CONFIG } from '@/config/environment';
import type { CreateAccountDto } from './types';

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
            return transformAccount(result);
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
            return transformAccount(result);
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
            return transformAccount(result);
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
