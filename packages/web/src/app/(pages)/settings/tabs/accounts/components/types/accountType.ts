export interface AccountType {
    name: string;
    color: string;  // Added color support
}

export interface AccountTypeSettings {
    types: AccountType[];
}

export interface EditingType {
    index: number;
    value: AccountType;
}
