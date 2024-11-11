'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../config/environment';
import type { Property } from '../../../globalTypes/property';
import { handleApiError, buildApiRequest, retryWithBackoff } from './utils';

const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

export const useDeleteProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            console.log('Deleting property:', { id });
            const url = buildUrl(`/properties/${id}`);
            console.log('API Request:', { method: 'DELETE', url });

            return retryWithBackoff(async () => {
                const response = await fetch(url, buildApiRequest({
                    method: 'DELETE'
                }));

                if (!response.ok) {
                    await handleApiError(response);
                }

                const result = await response.json();
                console.log('API Response:', result);
                return result;
            });
        },
        onSuccess: (_, id) => {
            console.log('Delete successful, updating cache');
            queryClient.removeQueries({ queryKey: ['property', id] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
            console.error('Delete failed:', error);
        }
    });
};

export const useBulkDeleteProperties = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (propertyIds: string[]) => {
            console.log('Bulk deleting properties:', { propertyIds });
            const url = buildUrl('/properties/bulk-delete');
            console.log('API Request:', { method: 'POST', url, data: { propertyIds } });

            return retryWithBackoff(async () => {
                const response = await fetch(url, buildApiRequest({
                    method: 'POST',
                    body: JSON.stringify({ propertyIds })
                }));

                if (!response.ok) {
                    await handleApiError(response);
                }

                const result = await response.json();
                console.log('API Response:', result);
                return result;
            });
        },
        onSuccess: (_, propertyIds) => {
            console.log('Bulk delete successful, updating cache');
            propertyIds.forEach(id => {
                queryClient.removeQueries({ queryKey: ['property', id] });
            });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
            console.error('Bulk delete failed:', error);
        }
    });
};
