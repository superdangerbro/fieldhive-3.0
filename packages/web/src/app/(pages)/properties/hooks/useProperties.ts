'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Property, CreatePropertyDto, UpdatePropertyDto } from '@/app/globalTypes/property';
import { ENV_CONFIG } from '@/config/environment';

const ENDPOINTS = {
    properties: '/properties',
    propertyDetails: (id: string) => `/properties/${id}`,
    bulkDelete: '/properties/bulk-delete',
    propertyLocation: (id: string) => `/properties/${id}/location`,
    propertyBoundary: (id: string) => `/properties/${id}/boundary`
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

// Properties List Hook
export const useProperties = () => {
    return useQuery({
        queryKey: ['properties'],
        queryFn: async () => {
            console.log('Fetching properties list');
            const response = await fetch(buildUrl(ENDPOINTS.properties), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Properties fetched:', { count: data.properties.length });
            return data.properties;
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

// Single Property Hook
export const useProperty = (propertyId: string | null) => {
    return useQuery({
        queryKey: ['property', propertyId],
        queryFn: async () => {
            if (!propertyId) return null;

            console.log('Fetching property details:', { propertyId });
            const response = await fetch(buildUrl(ENDPOINTS.propertyDetails(propertyId)), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Property details fetched:', { propertyId, data });
            return data;
        },
        enabled: !!propertyId,
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

// Update Property Hook
export const useUpdateProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdatePropertyDto }) => {
            console.log('Updating property:', { id, data });
            const response = await fetch(buildUrl(ENDPOINTS.propertyDetails(id)), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('Property updated:', { id, result });
            return result;
        },
        onSuccess: (data, { id }) => {
            console.log('Update successful, invalidating queries');
            queryClient.setQueryData(['property', id], data);
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
            console.error('Update failed:', error);
        }
    });
};

// Create Property Hook
export const useCreateProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreatePropertyDto) => {
            console.log('Creating property:', data);
            const response = await fetch(buildUrl(ENDPOINTS.properties), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('Property created:', result);
            return result;
        },
        onSuccess: () => {
            console.log('Create successful, invalidating queries');
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
            console.error('Create failed:', error);
        }
    });
};

// Delete Property Hook
export const useDeleteProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            console.log('Deleting property:', { id });
            const response = await fetch(buildUrl(ENDPOINTS.propertyDetails(id)), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('Property deleted:', result);
            return result;
        },
        onSuccess: () => {
            console.log('Delete successful, invalidating queries');
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
            const response = await fetch(buildUrl(ENDPOINTS.bulkDelete), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyIds }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('Properties bulk deleted:', result);
            return result;
        },
        onSuccess: () => {
            console.log('Bulk delete successful, invalidating queries');
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
            console.error('Bulk delete failed:', error);
        }
    });
};

// Get Property Location Hook
export const usePropertyLocation = (propertyId: string | null) => {
    return useQuery({
        queryKey: ['propertyLocation', propertyId],
        queryFn: async () => {
            if (!propertyId) return null;

            console.log('Fetching property location:', { propertyId });
            const response = await fetch(buildUrl(ENDPOINTS.propertyLocation(propertyId)), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Property location fetched:', { propertyId, data });
            return data;
        },
        enabled: !!propertyId,
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

// Update Property Location Hook
export const useUpdatePropertyLocation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, coordinates }: { id: string; coordinates: [number, number] }) => {
            console.log('Updating property location:', { id, coordinates });
            const response = await fetch(buildUrl(ENDPOINTS.propertyLocation(id)), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinates }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('Property location updated:', { id, result });
            return result;
        },
        onSuccess: (data, { id }) => {
            console.log('Location update successful, invalidating queries');
            queryClient.setQueryData(['propertyLocation', id], data);
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
            console.error('Location update failed:', error);
        }
    });
};

// Update Property Boundary Hook
export const useUpdatePropertyBoundary = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, coordinates }: { id: string; coordinates: [number, number][] }) => {
            console.log('Updating property boundary:', { id, coordinates });
            const response = await fetch(buildUrl(ENDPOINTS.propertyBoundary(id)), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinates }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const result = await response.json();
            console.log('Property boundary updated:', { id, result });
            return result;
        },
        onSuccess: (data, { id }) => {
            console.log('Boundary update successful, invalidating queries');
            queryClient.setQueryData(['propertyLocation', id], data);
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
            console.error('Boundary update failed:', error);
        }
    });
};

// Prefetch Property
export const prefetchProperty = async (queryClient: any, propertyId: string) => {
    console.log('Prefetching property:', { propertyId });
    await queryClient.prefetchQuery({
        queryKey: ['property', propertyId],
        queryFn: async () => {
            const response = await fetch(buildUrl(ENDPOINTS.propertyDetails(propertyId)), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Property prefetched:', { propertyId, data });
            return data;
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};
