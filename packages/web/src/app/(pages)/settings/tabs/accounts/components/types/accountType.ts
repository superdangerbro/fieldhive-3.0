export interface AccountType {
    name: string;
}

export interface AccountTypeSettings {
    types: AccountType[];
}

export interface EditingType {
    index: number;
    value: AccountType;
}
