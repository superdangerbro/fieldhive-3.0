import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';
import type { Account } from '@/app/globalTypes/account';

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
      const searchParams = new URLSearchParams();
      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
      }
      
      const response = await fetch(
        `${buildUrl(ACCOUNTS_ENDPOINT)}?${searchParams}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch accounts');
      }

      const data = await response.json();
      return data.accounts;
    },
    staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
    gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
  });
};

// Export the endpoint for direct use if needed
export const ENDPOINTS = {
  accounts: ACCOUNTS_ENDPOINT,
  accountDetails: (id: string) => `/accounts/${id}`,
} as const;
