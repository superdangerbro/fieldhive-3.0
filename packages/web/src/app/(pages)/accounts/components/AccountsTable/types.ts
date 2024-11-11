import type { Account } from '@/app/globalTypes/account';

export interface AccountsTableProps {
  refreshTrigger?: number;
  onAccountSelect: (account: Account | null) => void;
  selectedAccount: Account | null;
  onAccountsLoad: (accounts: Account[]) => void;
}

export type GridParams = {
  row: Account;
  value: any;
}
