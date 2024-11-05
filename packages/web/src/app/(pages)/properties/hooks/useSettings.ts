import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';

type SettingKey = 'property_statuses' | 'property_types';

const SETTINGS_ENDPOINT = '/settings/properties';

// Helper function to build full API URL
const buildUrl = (key: SettingKey) => 
    `${ENV_CONFIG.api.baseUrl}${SETTINGS_ENDPOINT}/${key.replace('property_', '')}`;

export const useSetting = <T>(key: SettingKey): UseQueryResult<T[], Error> => {
    return useQuery({
        queryKey: ['settings', key],
        queryFn: async () => {
            const response = await fetch(buildUrl(key), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Failed to fetch setting: ${key}`);
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error(`Invalid response format for setting: ${key}`);
            }

            return data;
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};
