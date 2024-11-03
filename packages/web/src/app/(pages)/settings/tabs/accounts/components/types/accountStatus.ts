export interface AccountStatus {
    value: string;
    label: string;
    color: string;
}

export interface AccountStatusSettings {
    statuses: AccountStatus[];
}

export interface EditingStatus {
    index: number;
    value: AccountStatus;
}
