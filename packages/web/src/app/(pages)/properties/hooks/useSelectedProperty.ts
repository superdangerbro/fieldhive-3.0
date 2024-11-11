'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../config/environment';
import type { Property } from '../../../globalTypes/property';
import { buildApiRequest, handleApiError } from './utils';

const SELECTED_PROPERTY_KEY = 'selectedPropertyId';

const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

export const useSelectedProperty = () => {
    const queryClient = useQueryClient();
    
    // Query for the selected property ID
    const { data: selectedPropertyId } = useQuery({
        queryKey: ['selectedPropertyId'],
        queryFn: () => {
            if (typeof window === 'undefined') return null;
            return localStorage.getItem(SELECTED_PROPERTY_KEY);
        },
        staleTime: Infinity
    });

    // Query for the selected property data
    const { data: selectedProperty } = useQuery({
        queryKey: ['property', selectedPropertyId],
        queryFn: async () => {
            if (!selectedPropertyId) return null;

            // First check if we already have the data in cache
            const cachedData = queryClient.getQueryData(['property', selectedPropertyId]);
            if (cachedData) return cachedData;

            // If not in cache, fetch from API
            const response = await fetch(
                buildUrl(`/properties/${selectedPropertyId}`),
                buildApiRequest()
            );

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
        },
        enabled: !!selectedPropertyId
    });

    const setSelectedProperty = (property: Property | null) => {
        if (property) {
            localStorage.setItem(SELECTED_PROPERTY_KEY, property.property_id);
            // Update both queries
            queryClient.setQueryData(['selectedPropertyId'], property.property_id);
            queryClient.setQueryData(['property', property.property_id], property);
        } else {
            localStorage.removeItem(SELECTED_PROPERTY_KEY);
            queryClient.setQueryData(['selectedPropertyId'], null);
            if (selectedPropertyId) {
                queryClient.setQueryData(['property', selectedPropertyId], null);
            }
        }
    };

    return { 
        selectedProperty, 
        setSelectedProperty,
        selectedPropertyId 
    };
};
