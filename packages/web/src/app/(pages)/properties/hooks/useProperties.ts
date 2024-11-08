'use client';

import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';
import type { Property } from '@/app/globalTypes/property';
import { handleApiError } from './utils';

interface PropertyType {
    value: string;
    label: string;
}

interface PropertyStatus {
    value: string;
    label: string;
    color: string;
}

const ENDPOINTS = {
    properties: '/properties',
    propertyDetails: (id: string) => `/properties/${id}`,
    search: '/properties/search',
    bulkDelete: '/properties/bulk-delete',
    settings: {
        propertyTypes: '/settings/properties/types',
        propertyStatuses: '/settings/properties/statuses'
    }
} as const;

// Properties List Hook
export const useProperties = (params?: { limit?: number; offset?: number; search?: string }) => {
    return useQuery({
        queryKey: ['properties', params],
        queryFn: async () => {
            console.log('Fetching properties with params:', params);
            const searchParams = new URLSearchParams();
            if (params?.limit) searchParams.append('limit', params.limit.toString());
            if (params?.offset) searchParams.append('offset', params.offset.toString());
            if (params?.search) searchParams.append('search', params.search);

            const url = `${ENV_CONFIG.api.baseUrl}${ENDPOINTS.properties}?${searchParams.toString()}`;
            console.log('API Request:', { method: 'GET', url });

            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Properties API Response:', data);

            // Handle both array and object responses
            if (Array.isArray(data)) {
                return data;
            }
            return data.properties || [];
        },
        staleTime: 0 // Always fetch fresh data
    });
};

// Single Property Hook
export const useProperty = (propertyId: string | null) => {
    return useQuery({
        queryKey: ['property', propertyId],
        queryFn: async () => {
            if (!propertyId) return null;

            console.log('Fetching property details:', { propertyId });
            const url = `${ENV_CONFIG.api.baseUrl}${ENDPOINTS.propertyDetails(propertyId)}`;
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

            if (!data) {
                throw new Error('No property data received');
            }

            return data;
        },
        enabled: !!propertyId,
        staleTime: 0 // Always fetch fresh data
    });
};

// Selected Property Hook
export const useSelectedProperty = () => {
    const queryClient = useQueryClient();
    
    const selectedPropertyId = typeof window !== 'undefined' 
        ? localStorage.getItem('selectedPropertyId') 
        : null;

    const { data: selectedProperty, refetch } = useQuery({
        queryKey: ['property', selectedPropertyId],
        queryFn: async () => {
            if (!selectedPropertyId) return null;

            const response = await fetch(
                `${ENV_CONFIG.api.baseUrl}${ENDPOINTS.propertyDetails(selectedPropertyId)}`,
                {
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                }
            );

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Selected property data:', data);
            return data;
        },
        enabled: !!selectedPropertyId,
        staleTime: 0 // Always fetch fresh data
    });

    const setSelectedProperty = async (property: Property | null) => {
        if (property) {
            localStorage.setItem('selectedPropertyId', property.property_id);
            queryClient.setQueryData(['property', property.property_id], property);
            await refetch(); // Immediately fetch fresh data
        } else {
            localStorage.removeItem('selectedPropertyId');
            queryClient.setQueryData(['property', selectedPropertyId], null);
        }
    };

    return { selectedProperty, setSelectedProperty };
};

// Update Property Hook
export const useUpdateProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Property> }) => {
            console.log('Updating property:', { id, data });
            const url = `${ENV_CONFIG.api.baseUrl}${ENDPOINTS.propertyDetails(id)}`;
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
            console.log('API Response:', { updatedProperty: result });
            return result;
        },
        onSuccess: (data, { id }) => {
            console.log('Update successful, updating cache');
            queryClient.setQueryData(['property', id], data);
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
            console.error('Update failed:', error);
        }
    });
};

// Delete Property Hook
export const useDeleteProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            console.log('Deleting property:', { id });
            const url = `${ENV_CONFIG.api.baseUrl}${ENDPOINTS.propertyDetails(id)}`;
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

// Bulk Delete Properties Hook
export const useBulkDeleteProperties = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (propertyIds: string[]) => {
            console.log('Bulk deleting properties:', { propertyIds });
            const url = `${ENV_CONFIG.api.baseUrl}${ENDPOINTS.bulkDelete}`;
            console.log('API Request:', { method: 'POST', url, data: { propertyIds } });

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyIds }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('API Response:', result);
            return result;
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

// Prefetch Property Function
export const prefetchProperty = async (queryClient: QueryClient, id: string) => {
    try {
        await queryClient.prefetchQuery({
            queryKey: ['property', id],
            queryFn: async () => {
                const response = await fetch(
                    `${ENV_CONFIG.api.baseUrl}${ENDPOINTS.propertyDetails(id)}`,
                    {
                        headers: { 'Content-Type': 'application/json' },
                        signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                    }
                );

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
