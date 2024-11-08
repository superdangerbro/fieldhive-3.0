'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';
import type { Property } from '@/app/globalTypes/property';
import { handleApiError } from './utils';

const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

export const useSelectedProperty = () => {
    const queryClient = useQueryClient();
    
    const selectedPropertyId = typeof window !== 'undefined' 
        ? localStorage.getItem('selectedPropertyId') 
        : null;

    const { data: selectedProperty, refetch } = useQuery({
        queryKey: ['property', selectedPropertyId],
        queryFn: async () => {
            if (!selectedPropertyId) return null;

            const response = await fetch(buildUrl(`/properties/${selectedPropertyId}`), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Selected property data:', data);
            return data;
        },
        enabled: !!selectedPropertyId,
        staleTime: 0 // Always fetch fresh data for selected property
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
