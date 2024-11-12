'use client';

import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../config/environment';
import type { Property } from '../../../globalTypes/property';

interface ApiResponse {
    properties: Property[];
    total: number;
    limit: number;
    offset: number;
}

const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

export function useProperties() {
    return useQuery<Property[]>({
        queryKey: ['properties'],
        queryFn: async () => {
            console.log('Fetching properties...');
            const url = buildUrl('/properties');
            
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch properties');
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
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
}
