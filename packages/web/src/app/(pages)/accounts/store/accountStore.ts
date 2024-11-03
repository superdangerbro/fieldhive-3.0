import { create } from 'zustand';
import { AccountType, CreateAddressDto, Account } from '@/app/globaltypes';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const ACCOUNTS_ENDPOINT = '/accounts';
const ADDRESSES_ENDPOINT = '/addresses';

interface AccountStore {
    // State
    accounts: Account[];
    selectedAccount: Account | null;
    isLoading: boolean;
    error: string | null;

    // Selection Actions
    setSelectedAccount: (account: Account | null) => void;
    setAccounts: (accounts: Account[]) => void;
    refreshAccounts: () => Promise<void>;

    // CRUD Actions
    fetchAccounts: () => Promise<void>;
    createAccount: (data: { 
        name: string; 
        type: AccountType; 
        address: CreateAddressDto; 
    }) => Promise<void>;
    updateAccount: (id: string, data: Partial<Account>) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
}

// Helper function to convert API response to Account type
const convertToAccount = (data: any): Account => ({
    ...data,
    created_at: data.created_at ? new Date(data.created_at) : undefined,
    updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
    billingAddress: data.billingAddress ? {
        ...data.billingAddress,
        created_at: data.billingAddress.created_at ? new Date(data.billingAddress.created_at) : undefined,
        updated_at: data.billingAddress.updated_at ? new Date(data.billingAddress.updated_at) : undefined,
    } : undefined
});

export const useAccountStore = create<AccountStore>((set, get) => ({
    // Initial state
    accounts: [],
    selectedAccount: null,
    isLoading: false,
    error: null,

    // Selection Actions
    setSelectedAccount: (account) => {
        set({ selectedAccount: account });
    },

    setAccounts: (accounts) => {
        set({ accounts });
    },

    refreshAccounts: async () => {
        const { selectedAccount } = get();
        if (selectedAccount) {
            try {
                set({ isLoading: true, error: null });
                const response = await fetch(`${BASE_URL}${ACCOUNTS_ENDPOINT}?search=${selectedAccount.account_id}`);
                
                if (!response.ok) {
                    throw new Error('Failed to refresh accounts');
                }

                const data = await response.json();
                if (data.accounts?.length > 0) {
                    const updatedAccount = convertToAccount(data.accounts[0]);
                    set(state => ({
                        selectedAccount: updatedAccount,
                        accounts: state.accounts.map(account =>
                            account.account_id === updatedAccount.account_id ? updatedAccount : account
                        )
                    }));
                }
            } catch (error) {
                set({ error: error instanceof Error ? error.message : 'Failed to refresh accounts' });
                console.error('Failed to refresh accounts:', error);
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
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch accounts' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    createAccount: async (data) => {
        try {
            set({ isLoading: true, error: null });

            // First create the address
            const addressResponse = await fetch(`${BASE_URL}${ADDRESSES_ENDPOINT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data.address)
            });

            if (!addressResponse.ok) {
                throw new Error('Failed to create address');
            }

            const address = await addressResponse.json();

            // Then create the account
            const accountResponse = await fetch(`${BASE_URL}${ACCOUNTS_ENDPOINT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    type: data.type,
                    billing_address_id: address.address_id
                })
            });

            if (!accountResponse.ok) {
                throw new Error('Failed to create account');
            }

            // Refresh the accounts list
            await get().fetchAccounts();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to create account' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateAccount: async (id, data) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}${ACCOUNTS_ENDPOINT}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to update account');
            }

            // Refresh the accounts list
            await get().fetchAccounts();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update account' });
            throw error;
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
                throw new Error('Failed to delete account');
            }

            // Update local state
            set(state => ({
                accounts: state.accounts.filter(account => account.account_id !== id),
                selectedAccount: state.selectedAccount?.account_id === id ? null : state.selectedAccount
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete account' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    }
}));
