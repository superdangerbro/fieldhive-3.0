'use client';

import { useQuery, QueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../config/environment';
import type { Property } from '../../../globalTypes/property';
import { handleApiError, buildApiRequest } from './utils';

const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

interface ApiResponse {
    properties: Property[];
    total: number;
    limit: number;
    offset: number;
}

export const useProperties = (params?: { limit?: number; offset?: number; search?: string }) => {
    return useQuery({
        queryKey: ['properties', params],
        queryFn: async () => {
            console.log('Fetching properties with params:', params);
            const searchParams = new URLSearchParams();
            if (params?.limit) searchParams.append('limit', params.limit.toString());
            if (params?.offset) searchParams.append('offset', params.offset.toString());
            if (params?.search) searchParams.append('search', params.search);

            const url = `${buildUrl('/properties')}?${searchParams.toString()}`;
            console.log('API Request:', { method: 'GET', url });

            try {
                const response = await fetch(url, buildApiRequest());

                if (!response.ok) {
                    await handleApiError(response);
                }

                const data: ApiResponse = await response.json();
                console.log('Properties API Response:', {
                    count: data.properties?.length || 0,
                    firstProperty: data.properties?.[0]
                });

                // Ensure all required fields are present
                return data.properties.map(property => ({
                    ...property,
                    accounts: property.accounts || [],
                    type: property.type || '',
                    status: property.status || '',
                    created_at: property.created_at,
                    updated_at: property.updated_at
                }));
            } catch (error) {
                console.error('Failed to fetch properties:', error);
                throw error;
            }
        }
    });
};

export const useProperty = (propertyId: string | null) => {
    return useQuery({
        queryKey: ['property', propertyId],
        queryFn: async () => {
            if (!propertyId) return null;

            console.log('Fetching property details:', { propertyId });
            const url = buildUrl(`/properties/${propertyId}`);
            console.log('API Request:', { method: 'GET', url });

            try {
                const response = await fetch(url, buildApiRequest());

                if (!response.ok) {
                    await handleApiError(response);
                }

                const data = await response.json();
                console.log('Property API Response:', data);
                return {
                    ...data,
                    accounts: data.accounts || [],
                    type: data.type || '',
                    status: data.status || ''
                };
            } catch (error) {
                console.error('Failed to fetch property:', error);
                throw error;
            }
        },
        enabled: !!propertyId
    });
};

export const prefetchProperty = async (queryClient: QueryClient, id: string) => {
    try {
        await queryClient.prefetchQuery({
            queryKey: ['property', id],
            queryFn: async () => {
                const response = await fetch(buildUrl(`/properties/${id}`), buildApiRequest());

                if (!response.ok) {
                    await handleApiError(response);
                }

                const data = await response.json();
                return {
                    ...data,
                    accounts: data.accounts || [],
                    type: data.type || '',
                    status: data.status || ''
                };
            }
        });
    } catch (error) {
        console.error('Failed to prefetch property:', error);
    }
};
