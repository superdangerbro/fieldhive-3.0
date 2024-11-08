'use client';

import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';
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

const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

export const usePropertySettings = () => {
    const typesQuery = useQuery<PropertyType[]>({
        queryKey: ['settings', 'propertyTypes'],
        queryFn: async () => {
            const response = await fetch(buildUrl('/settings/properties/types'), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return await response.json();
        }
    });

    const statusesQuery = useQuery<PropertyStatus[]>({
        queryKey: ['settings', 'propertyStatuses'],
        queryFn: async () => {
            const response = await fetch(buildUrl('/settings/properties/statuses'), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            return await response.json();
        }
    });

    return {
        types: typesQuery.data || [],
        statuses: statusesQuery.data || [],
        isLoading: typesQuery.isLoading || statusesQuery.isLoading,
        error: typesQuery.error || statusesQuery.error
    };
};
