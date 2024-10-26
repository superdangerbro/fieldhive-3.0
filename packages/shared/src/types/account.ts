export interface BillingAddress {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
}

export type AccountStatus = 'active' | 'inactive' | 'suspended';

export interface Account {
    id: string;
    name: string;
    is_company: boolean;
    billingAddress?: BillingAddress;
    status: AccountStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAccountDto {
    name: string;
    is_company: boolean;
    billingAddress?: BillingAddress;
    status?: AccountStatus;
}

export interface UpdateAccountDto {
    name?: string;
    is_company?: boolean;
    billingAddress?: BillingAddress;
    status?: AccountStatus;
}

export interface AccountResponse {
    id: string;
    name: string;
    is_company: boolean;
    billingAddress?: BillingAddress;
    status: AccountStatus;
    createdAt: string;
    updatedAt: string;
}

export interface AccountsResponse {
    accounts: AccountResponse[];
    total: number;
    page: number;
    pageSize: number;
}
