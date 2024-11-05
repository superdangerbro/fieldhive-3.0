import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';
import type { Account } from '@/app/globalTypes';

// Remove /v1 since it's already included in the base URL
const ACCOUNTS_ENDPOINT = '/accounts';

interface UseAccountsOptions {
  search?: string;
  limit?: number;
  offset?: number;
}

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

export const useAccounts = (options?: UseAccountsOptions): UseQueryResult<Account[], Error> => {
  return useQuery({
    queryKey: ['accounts', options],
    queryFn: async () => {
      try {
        const searchParams = new URLSearchParams();
        if (options) {
          Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
              searchParams.append(key, String(value));
            }
          });
        }
        
        const url = `${buildUrl(ACCOUNTS_ENDPOINT)}?${searchParams}`;
        console.log('Fetching accounts from:', url);
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Failed to fetch accounts' }));
          console.error('Account fetch error:', {
            status: response.status,
            url,
            error
          });
          throw new Error(error.message || `Failed to fetch accounts: ${response.status}`);
        }

        const data = await response.json();
        if (!data || !Array.isArray(data.accounts)) {
          console.error('Invalid accounts data:', data);
          throw new Error('Invalid response format from accounts API');
        }
        return data.accounts;
      } catch (error) {
        console.error('Error fetching accounts:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch accounts');
      }
    },
    staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
    gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    retry: ENV_CONFIG.queryClient.maxRetries,
  });
};

// Export the endpoint for direct use if needed
export const ENDPOINTS = {
  accounts: ACCOUNTS_ENDPOINT,
  accountDetails: (id: string) => `${ACCOUNTS_ENDPOINT}/${id}`,
} as const;
