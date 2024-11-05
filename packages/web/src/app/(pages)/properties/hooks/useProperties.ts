import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import type { Property, CreatePropertyDto, UpdatePropertyDto } from '@/app/globalTypes/property';
import { ENV_CONFIG } from '@/config/environment';

// API endpoints
const ENDPOINTS = {
  properties: '/properties',
  propertyDetails: (id: string) => `/properties/${id}`,
  propertyLocation: (id: string) => `/properties/${id}/location`,
  propertyMetadata: (id: string) => `/properties/${id}/metadata`,
  propertyAddress: (id: string, type: 'service' | 'billing') => `/properties/${id}/address/${type}`,
} as const;

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

// Helper function to handle API errors consistently
const handleApiError = async (response: Response) => {
  const error = await response.json();
  throw new Error(error.message || 'An error occurred');
};

// Helper function to convert API response to Property type
const convertToProperty = (data: any): Property => ({
    ...data,
    created_at: data.created_at ? new Date(data.created_at) : undefined,
    updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
    accounts: data.accounts || [],
    serviceAddress: data.serviceAddress || null,
    billingAddress: data.billingAddress || null,
});

interface UsePropertiesOptions {
  search?: string;
  limit?: number;
  offset?: number;
  accountId?: string;
}

interface DeleteMutationContext {
    previousProperties?: Property[];
}

interface UpdateMutationContext {
    previousProperty?: Property;
    previousProperties?: Property[];
}

// Helper to get properties query key
const getPropertiesKey = (options?: UsePropertiesOptions) => ['properties', options];

// Helper to get property query key
const getPropertyKey = (id: string) => ['property', id];

// Create property mutation
export const useCreateProperty = () => {
    const queryClient = useQueryClient();

    return useMutation<Property, Error, CreatePropertyDto>({
        mutationFn: async (data) => {
            const response = await fetch(buildUrl(ENDPOINTS.properties), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const newProperty = await response.json();
            return convertToProperty(newProperty);
        },
        onSuccess: (newProperty) => {
            // Invalidate and refetch properties list
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            // Add new property to cache
            queryClient.setQueryData(getPropertyKey(newProperty.property_id), newProperty);
        },
    });
};

// Fetch properties with optional params
export const useProperties = (options?: UsePropertiesOptions): UseQueryResult<Property[], Error> => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: getPropertiesKey(options),
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (options) {
                Object.entries(options).forEach(([key, value]) => {
                    if (value !== undefined) {
                        searchParams.append(key, String(value));
                    }
                });
            }
            
            const response = await fetch(
                `${buildUrl(ENDPOINTS.properties)}?${searchParams}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                }
            );

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            return data.properties.map(convertToProperty);
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });

    // Prefetch next page
    useEffect(() => {
        if (options?.offset !== undefined && options?.limit !== undefined) {
            const nextPageOffset = options.offset + options.limit;
            queryClient.prefetchQuery({
                queryKey: getPropertiesKey({ ...options, offset: nextPageOffset }),
                queryFn: async () => {
                    const searchParams = new URLSearchParams();
                    Object.entries({ ...options, offset: nextPageOffset }).forEach(([key, value]) => {
                        if (value !== undefined) {
                            searchParams.append(key, String(value));
                        }
                    });
                    
                    const response = await fetch(
                        `${buildUrl(ENDPOINTS.properties)}?${searchParams}`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                        }
                    );

                    if (!response.ok) {
                        await handleApiError(response);
                    }

                    const data = await response.json();
                    return data.properties.map(convertToProperty);
                }
            });
        }
    }, [options?.offset, options?.limit, queryClient]);

    return query;
};

// Get a single property
export const useProperty = (id: string) => {
    return useQuery({
        queryKey: getPropertyKey(id),
        queryFn: async () => {
            const response = await fetch(
                buildUrl(ENDPOINTS.propertyDetails(id)),
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                }
            );

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            return convertToProperty(data);
        },
        enabled: !!id,
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

// Update property mutation
export const useUpdateProperty = () => {
    const queryClient = useQueryClient();

    return useMutation<Property, Error, { id: string; data: UpdatePropertyDto }, UpdateMutationContext>({
        mutationFn: async ({ id, data }) => {
            const response = await fetch(buildUrl(ENDPOINTS.propertyDetails(id)), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const updatedProperty = await response.json();
            return convertToProperty(updatedProperty);
        },
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: getPropertyKey(id) });
            await queryClient.cancelQueries({ queryKey: ['properties'] });

            const previousProperty = queryClient.getQueryData<Property>(getPropertyKey(id));
            const previousProperties = queryClient.getQueryData<Property[]>(['properties']);

            // Optimistically update
            if (previousProperty) {
                const updatedProperty = { ...previousProperty, ...data };
                queryClient.setQueryData(getPropertyKey(id), updatedProperty);
                
                if (previousProperties) {
                    queryClient.setQueryData<Property[]>(['properties'], 
                        previousProperties.map(p => p.property_id === id ? updatedProperty : p)
                    );
                }
            }

            return { previousProperty, previousProperties };
        },
        onError: (_, __, context) => {
            if (context?.previousProperty && context?.previousProperties) {
                queryClient.setQueryData(['properties'], context.previousProperties);
                queryClient.setQueryData(
                    getPropertyKey(context.previousProperty.property_id),
                    context.previousProperty
                );
            }
        },
        onSettled: (_, __, { id }) => {
            queryClient.invalidateQueries({ queryKey: getPropertyKey(id) });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });
};

// Delete property mutation
export const useDeleteProperty = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string, DeleteMutationContext>({
        mutationFn: async (id) => {
            const response = await fetch(buildUrl(ENDPOINTS.propertyDetails(id)), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }
        },
        onMutate: async (deletedId) => {
            await queryClient.cancelQueries({ queryKey: ['properties'] });

            const previousProperties = queryClient.getQueryData<Property[]>(['properties']);

            queryClient.setQueryData<Property[]>(['properties'], (old) => 
                old?.filter(p => p.property_id !== deletedId) ?? []
            );

            return { previousProperties };
        },
        onError: (_, __, context) => {
            if (context?.previousProperties) {
                queryClient.setQueryData(['properties'], context.previousProperties);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });
};

// Prefetch a single property
export const prefetchProperty = async (queryClient: any, id: string) => {
    await queryClient.prefetchQuery({
        queryKey: getPropertyKey(id),
        queryFn: async () => {
            const response = await fetch(buildUrl(ENDPOINTS.propertyDetails(id)), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            return convertToProperty(data);
        }
    });
};

// Export everything
export {
    ENDPOINTS,
    buildUrl,
    handleApiError,
    convertToProperty,
    getPropertiesKey,
    getPropertyKey,
};
