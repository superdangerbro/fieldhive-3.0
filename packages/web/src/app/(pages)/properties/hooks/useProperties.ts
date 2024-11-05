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
    throw new Error(error.message || 'An error occurred');
};

// Properties List Hook
export const useProperties = () => {
    return useQuery({
        queryKey: ['properties'],
        queryFn: async () => {
            const response = await fetch(buildUrl(ENDPOINTS.properties), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
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

            const response = await fetch(buildUrl(ENDPOINTS.propertyDetails(propertyId)), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
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
            const response = await fetch(buildUrl(ENDPOINTS.propertyDetails(id)), {
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
            queryClient.setQueryData(['property', id], data);
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });
};

// Create Property Hook
export const useCreateProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreatePropertyDto) => {
            const response = await fetch(buildUrl(ENDPOINTS.properties), {
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
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });
};

// Delete Property Hook
export const useDeleteProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(buildUrl(ENDPOINTS.propertyDetails(id)), {
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
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });
};

// Bulk Delete Properties Hook
export const useBulkDeleteProperties = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (propertyIds: string[]) => {
            const response = await fetch(buildUrl(ENDPOINTS.bulkDelete), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyIds }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });
};

// Get Property Location Hook
export const usePropertyLocation = (propertyId: string | null) => {
    return useQuery({
        queryKey: ['propertyLocation', propertyId],
        queryFn: async () => {
            if (!propertyId) return null;

            const response = await fetch(buildUrl(ENDPOINTS.propertyLocation(propertyId)), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
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
            const response = await fetch(buildUrl(ENDPOINTS.propertyLocation(id)), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinates }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: (data, { id }) => {
            queryClient.setQueryData(['propertyLocation', id], data);
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });
};

// Update Property Boundary Hook
export const useUpdatePropertyBoundary = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, coordinates }: { id: string; coordinates: [number, number][] }) => {
            const response = await fetch(buildUrl(ENDPOINTS.propertyBoundary(id)), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinates }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: (data, { id }) => {
            queryClient.setQueryData(['propertyLocation', id], data);
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });
};

// Prefetch Property
export const prefetchProperty = async (queryClient: any, propertyId: string) => {
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

            return response.json();
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};
