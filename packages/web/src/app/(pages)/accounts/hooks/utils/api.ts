import { ENV_CONFIG } from '@/config/environment';

export const ENDPOINTS = {
    accounts: '/accounts',
    accountDetails: (id: string) => `/accounts/${id}`,
    accountSettings: {
        types: '/settings/accounts/types',
        statuses: '/settings/accounts/statuses'
    },
    bulkDelete: '/accounts/bulk-delete',
    archive: (id: string) => `/accounts/${id}/archive`
} as const;

// Helper function to build full API URL
export const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

// Helper function to handle API errors consistently
export const handleApiError = async (response: Response) => {
    const error = await response.json();
    console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error
    });
    throw new Error(error.message || 'An error occurred');
};
