import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account, AccountType, AccountStatus } from '@/app/globalTypes/account';

interface AccountStore {
    // UI State
    selectedAccount: Account | null;
    accountTypes: AccountType[];
    accountStatuses: AccountStatus[];
    settingsLoaded: boolean;

    // UI Actions
    setSelectedAccount: (account: Account | null) => void;
    setAccountTypes: (types: AccountType[]) => void;
    setAccountStatuses: (statuses: AccountStatus[]) => void;
    setSettingsLoaded: (loaded: boolean) => void;

    // UI Helpers
    getTypeColor: (type: string) => string | undefined;
    getStatusColor: (status: string) => string | undefined;
}

export const useAccountStore = create<AccountStore>()(
    persist(
        (set, get) => ({
            // Initial state
            selectedAccount: null,
            accountTypes: [],
            accountStatuses: [],
            settingsLoaded: false,

            // UI Actions
            setSelectedAccount: (account) => set({ selectedAccount: account }),
            setAccountTypes: (types) => set({ accountTypes: types }),
            setAccountStatuses: (statuses) => set({ accountStatuses: statuses }),
            setSettingsLoaded: (loaded) => set({ settingsLoaded: loaded }),

            // UI Helpers
            getTypeColor: (type) => {
                const { accountTypes } = get();
                if (!type || !accountTypes?.length) return undefined;
                const typeConfig = accountTypes.find(t => t.value === type);
                return typeConfig?.color;
            },

            getStatusColor: (status) => {
                const { accountStatuses } = get();
                if (!status || !accountStatuses?.length) return undefined;
                const statusConfig = accountStatuses.find(s => s.value === status);
                return statusConfig?.color;
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
