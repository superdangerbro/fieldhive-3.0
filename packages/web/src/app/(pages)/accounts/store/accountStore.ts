import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Account, AccountType, AccountStatus, CreateAddressDto, User } from '@/app/globaltypes';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const ACCOUNTS_ENDPOINT = '/accounts';
const ADDRESSES_ENDPOINT = '/addresses';
const SETTINGS_ENDPOINT = '/settings';

interface AccountStore {
    // State
    accounts: Account[];
    accountTypes: AccountType[];
    accountStatuses: AccountStatus[];
    selectedAccount: Account | null;
    isLoading: boolean;
    error: string | null;
    settingsLoaded: boolean;
    settingsLoading: boolean;

    // Selection Actions
    setSelectedAccount: (account: Account | null) => void;
    setAccounts: (accounts: Account[]) => void;
    refreshAccounts: () => Promise<void>;

    // CRUD Actions
    fetchAccounts: () => Promise<void>;
    fetchAccountSettings: () => Promise<void>;
    createAccount: (data: { 
        name: string; 
        type: string;
        address: CreateAddressDto; 
    }) => Promise<void>;
    updateAccount: (id: string, data: {
        name?: string;
        type?: string;
        status?: string;
        billingAddress?: CreateAddressDto;
        users?: User[];
    }) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    archiveAccount: (id: string) => Promise<void>;

    // Settings Helpers
    getTypeColor: (type: string) => string | undefined;
    getStatusColor: (status: string) => string | undefined;
}

// Helper function to convert API response to Account type
const convertToAccount = (data: any): Account => ({
    account_id: data.account_id,
    name: data.name,
    type: data.type,
    status: data.status,
    contact_name: data.contact_name,
    contact_email: data.contact_email,
    contact_phone: data.contact_phone,
    billing_address_id: data.billing_address_id,
    billingAddress: data.billingAddress ? {
        address_id: data.billingAddress.address_id,
        address1: data.billingAddress.address1,
        address2: data.billingAddress.address2,
        city: data.billingAddress.city,
        province: data.billingAddress.province,
        postal_code: data.billingAddress.postal_code,
        country: data.billingAddress.country,
        label: data.billingAddress.label,
        created_at: data.billingAddress.created_at ? new Date(data.billingAddress.created_at) : undefined,
        updated_at: data.billingAddress.updated_at ? new Date(data.billingAddress.updated_at) : undefined,
    } : undefined,
    created_at: data.created_at ? new Date(data.created_at) : undefined,
    updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
    properties: data.properties || [],
    jobs: data.jobs || [],
    users: data.users || []
});

export const useAccountStore = create<AccountStore>()(
    persist(
        (set, get) => ({
            // Initial state
            accounts: [],
            accountTypes: [],
            accountStatuses: [],
            selectedAccount: null,
            isLoading: false,
            error: null,
            settingsLoaded: false,
            settingsLoading: false,

            // Selection Actions
            setSelectedAccount: async (account) => {
                if (account) {
                    try {
                        set({ isLoading: true });
                        const response = await fetch(`${BASE_URL}${ACCOUNTS_ENDPOINT}/${account.account_id}`);
                        if (!response.ok) {
                            throw new Error('Failed to fetch account details');
                        }
                        const data = await response.json();
                        const fullAccount = convertToAccount(data);
                        set({ selectedAccount: fullAccount });
                    } catch (error) {
                        console.error('Failed to fetch account details:', error);
                        set({ selectedAccount: account });
                    } finally {
                        set({ isLoading: false });
                    }
                } else {
                    set({ selectedAccount: null });
                }
            },

            setAccounts: (accounts) => {
                set({ accounts });
            },

            // Settings Helpers
            getTypeColor: (type) => {
                const { accountTypes } = get();
                if (!type || !accountTypes?.length) return undefined;
                const typeConfig = accountTypes.find((t: AccountType) => t.value === type);
                return typeConfig?.color;
            },

            getStatusColor: (status) => {
                const { accountStatuses } = get();
                if (!status || !accountStatuses?.length) return undefined;
                const statusConfig = accountStatuses.find((s: AccountStatus) => s.value === status);
                return statusConfig?.color;
            },

            refreshAccounts: async () => {
                const { selectedAccount } = get();
                if (selectedAccount) {
                    try {
                        set({ isLoading: true, error: null });
                        const response = await fetch(`${BASE_URL}${ACCOUNTS_ENDPOINT}/${selectedAccount.account_id}`);
                        
                        if (!response.ok) {
                            throw new Error('Failed to refresh account');
                        }

                        const data = await response.json();
                        const updatedAccount = convertToAccount(data);
                        set(state => ({
                            selectedAccount: updatedAccount,
                            accounts: state.accounts.map((account: Account) =>
                                account.account_id === updatedAccount.account_id ? updatedAccount : account
                            )
                        }));
                    } catch (error) {
                        set({ error: error instanceof Error ? error.message : 'Failed to refresh account' });
                        console.error('Failed to refresh account:', error);
                    } finally {
                        set({ isLoading: false });
                    }
                }
            },

            // CRUD Actions
            fetchAccounts: async () => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await fetch(`${BASE_URL}${ACCOUNTS_ENDPOINT}`);
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch accounts');
                    }

                    const data = await response.json();
                    const accounts = data.accounts.map(convertToAccount);
                    set({ accounts });

                    const { selectedAccount } = get();
                    if (selectedAccount) {
                        const updatedAccount = accounts.find((a: Account) => a.account_id === selectedAccount.account_id);
                        if (updatedAccount) {
                            set({ selectedAccount: updatedAccount });
                        }
                    }
                } catch (error) {
                    set({ error: error instanceof Error ? error.message : 'Failed to fetch accounts' });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            fetchAccountSettings: async () => {
                const state = get();
                if (state.settingsLoaded || state.settingsLoading) return;
                
                try {
                    set({ settingsLoading: true, error: null });
                    
                    const typesResponse = await fetch(`${BASE_URL}${SETTINGS_ENDPOINT}/accounts/types`);
                    if (!typesResponse.ok) {
                        throw new Error('Failed to fetch account types');
                    }
                    const types = await typesResponse.json();

                    const statusesResponse = await fetch(`${BASE_URL}${SETTINGS_ENDPOINT}/accounts/statuses`);
                    if (!statusesResponse.ok) {
                        throw new Error('Failed to fetch account statuses');
                    }
                    const statusesData = await statusesResponse.json();

                    set({ 
                        accountTypes: types || [],
                        accountStatuses: statusesData?.statuses || [],
                        settingsLoaded: true,
                        settingsLoading: false
                    });
                } catch (error) {
                    set({ 
                        error: error instanceof Error ? error.message : 'Failed to fetch account settings',
                        settingsLoading: false 
                    });
                    throw error;
                }
            },

            createAccount: async (data) => {
                try {
                    set({ isLoading: true, error: null });

                    // First create the address
                    const addressResponse = await fetch(`${BASE_URL}${ADDRESSES_ENDPOINT}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...data.address,
                            label: 'Billing'
                        })
                    });

                    if (!addressResponse.ok) {
                        const addressError = await addressResponse.json();
                        throw new Error(addressError.message || 'Failed to create address');
                    }

                    const address = await addressResponse.json();

                    // Then create the account
                    const accountResponse = await fetch(`${BASE_URL}${ACCOUNTS_ENDPOINT}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: data.name,
                            type: data.type,
                            status: 'Active', // Capital A as expected by the API
                            billing_address_id: address.address_id
                        })
                    });

                    if (!accountResponse.ok) {
                        const accountError = await accountResponse.json();
                        throw new Error(accountError.message || 'Failed to create account');
                    }

                    await get().fetchAccounts();
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
                    set({ error: errorMessage });
                    throw new Error(errorMessage);
                } finally {
                    set({ isLoading: false });
                }
            },

            updateAccount: async (id, data) => {
                try {
                    set({ isLoading: true, error: null });

                    let billing_address_id;
                    if (data.billingAddress) {
                        const addressResponse = await fetch(`${BASE_URL}${ADDRESSES_ENDPOINT}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...data.billingAddress,
                                label: 'Billing'
                            })
                        });

                        if (!addressResponse.ok) {
                            const addressError = await addressResponse.json();
                            throw new Error(addressError.message || 'Failed to update address');
                        }

                        const address = await addressResponse.json();
                        billing_address_id = address.address_id;
                    }

                    const response = await fetch(`${BASE_URL}${ACCOUNTS_ENDPOINT}/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...data,
                            billing_address_id: billing_address_id || undefined,
                            billingAddress: undefined
                        })
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Failed to update account');
                    }

                    await get().refreshAccounts();
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update account';
                    set({ error: errorMessage });
                    throw new Error(errorMessage);
                } finally {
                    set({ isLoading: false });
                }
            },

            deleteAccount: async (id) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await fetch(`${BASE_URL}${ACCOUNTS_ENDPOINT}/${id}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Failed to delete account');
                    }

                    set(state => ({
                        accounts: state.accounts.filter((account: Account) => account.account_id !== id),
                        selectedAccount: state.selectedAccount?.account_id === id ? null : state.selectedAccount
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to delete account';
                    set({ error: errorMessage });
                    throw new Error(errorMessage);
                } finally {
                    set({ isLoading: false });
                }
            },

            archiveAccount: async (id) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await fetch(`${BASE_URL}${ACCOUNTS_ENDPOINT}/${id}/archive`, {
                        method: 'PUT'
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Failed to archive account');
                    }

                    await get().fetchAccounts();
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to archive account';
                    set({ error: errorMessage });
                    throw new Error(errorMessage);
                } finally {
                    set({ isLoading: false });
                }
            }
        }),
        {
            name: 'account-store',
            partialize: (state) => ({ 
                selectedAccount: state.selectedAccount,
                settingsLoaded: state.settingsLoaded,
                accountTypes: state.accountTypes,
                accountStatuses: state.accountStatuses
            })
        }
    )
);
