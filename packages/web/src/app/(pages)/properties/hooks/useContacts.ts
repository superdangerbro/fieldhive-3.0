import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';

interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isPrimary: boolean;
}

interface CreateContactDto {
    name: string;
    email: string;
    phone: string;
    role?: string;
    isPrimary: boolean;
    account_id?: string;
}

const CONTACTS_ENDPOINT = '/contacts';

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

// Get contacts for an account
export const useAccountContacts = (accountId: string) => {
    return useQuery({
        queryKey: ['contacts', accountId],
        queryFn: async () => {
            const response = await fetch(buildUrl(`/accounts/${accountId}/contacts`), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch contacts');
            }

            return response.json();
        },
        enabled: !!accountId,
    });
};

// Create contact mutation
export const useCreateContact = () => {
    const queryClient = useQueryClient();

    return useMutation<Contact, Error, CreateContactDto>({
        mutationFn: async (data) => {
            const response = await fetch(buildUrl(CONTACTS_ENDPOINT), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                throw new Error('Failed to create contact');
            }

            return response.json();
        },
        onSuccess: (newContact, variables) => {
            if (variables.account_id) {
                queryClient.invalidateQueries({ 
                    queryKey: ['contacts', variables.account_id] 
                });
            }
        },
    });
};

// Delete contact mutation
export const useDeleteContact = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { id: string; accountId?: string }>({
        mutationFn: async ({ id }) => {
            const response = await fetch(buildUrl(`${CONTACTS_ENDPOINT}/${id}`), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                throw new Error('Failed to delete contact');
            }
        },
        onSuccess: (_, variables) => {
            if (variables.accountId) {
                queryClient.invalidateQueries({ 
                    queryKey: ['contacts', variables.accountId] 
                });
            }
        },
    });
};

// Update contact mutation
export const useUpdateContact = () => {
    const queryClient = useQueryClient();

    return useMutation<Contact, Error, { id: string; data: Partial<CreateContactDto> }>({
        mutationFn: async ({ id, data }) => {
            const response = await fetch(buildUrl(`${CONTACTS_ENDPOINT}/${id}`), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                throw new Error('Failed to update contact');
            }

            return response.json();
        },
        onSuccess: (_, variables) => {
            if (variables.data.account_id) {
                queryClient.invalidateQueries({ 
                    queryKey: ['contacts', variables.data.account_id] 
                });
            }
        },
    });
};

export type { Contact, CreateContactDto };
