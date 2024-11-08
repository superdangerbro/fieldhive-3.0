'use client';

import { useQuery, QueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';
import type { Property } from '@/app/globalTypes/property';
import { handleApiError } from './utils';

const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

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

            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Properties API Response:', {
                count: data.properties?.length || 0,
                firstProperty: data.properties?.[0]
            });

            return data.properties || [];
        },
        staleTime: 0 // Always fetch fresh data
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

            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Property API Response:', data);
            return data;
        },
        enabled: !!propertyId,
        staleTime: 0 // Always fetch fresh data
    });
};

export const prefetchProperty = async (queryClient: QueryClient, id: string) => {
    try {
        await queryClient.prefetchQuery({
            queryKey: ['property', id],
            queryFn: async () => {
                const response = await fetch(buildUrl(`/properties/${id}`), {
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                });

                if (!response.ok) {
                    await handleApiError(response);
                }

                return await response.json();
            }
        });
    } catch (error) {
        console.error('Failed to prefetch property:', error);
    }
};
