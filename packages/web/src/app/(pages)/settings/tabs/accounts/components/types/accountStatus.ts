import { AccountStatus, StatusColor } from '@fieldhive/shared';

export interface AccountStatusSettings {
    statuses: AccountStatus[];
}

export interface EditingStatus {
    index: number;
    value: AccountStatus;
}

// Re-export shared types for convenience
export type { AccountStatus, StatusColor };
