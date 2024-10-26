export interface BillingAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}
export type AccountStatus = 'active' | 'inactive' | 'suspended';
export interface Account {
    id: string;
    name: string;
    billingAddress?: BillingAddress;
    status: AccountStatus;
    createdAt: string;
    updatedAt: string;
}
export interface CreateAccountDto {
    name: string;
    billingAddress?: BillingAddress;
    status?: AccountStatus;
}
export interface UpdateAccountDto {
    name?: string;
    billingAddress?: BillingAddress;
    status?: AccountStatus;
}
export interface AccountResponse {
    id: string;
    name: string;
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
