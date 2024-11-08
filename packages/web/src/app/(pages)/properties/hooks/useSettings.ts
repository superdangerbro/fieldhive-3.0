'use client';

import { useQuery } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';

type SettingKey = 'property_types' | 'property_statuses';

interface SettingOption {
    value: string;
    label: string;
    color?: string;
}

export function useSetting(key: SettingKey) {
    return useQuery<SettingOption[]>({
        queryKey: ['settings', key],
        queryFn: async () => {
            try {
                const endpoint = key === 'property_types' ? 'types' : 'statuses';
                const url = `${ENV_CONFIG.api.baseUrl}/settings/properties/${endpoint}`;
                console.log('Fetching settings:', { key, url });

                const response = await fetch(url);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Failed to fetch settings:', errorText);
                    throw new Error(`Failed to fetch ${key}: ${errorText}`);
                }

                const data = await response.json();
                console.log('Received settings data:', data);
                return data;
            } catch (error) {
                console.error('Settings fetch error:', error);
                throw error;
            }
        }
    });
}
