export interface BillingAddress {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
}

export type AccountStatus = 'active' | 'inactive' | 'suspended';

export type AccountRole = 'owner' | 'manager' | 'tenant' | 'contractor';

export interface AccountProperty {
    propertyId: string;
    name: string;
    address: string;
    role: AccountRole;
    billingAddress?: {
        useAccountBilling: boolean;
        address?: BillingAddress;
    };
}

export interface Account {
    id: string;
    name: string;
    isCompany: boolean;
    status: AccountStatus;
    billingAddress: BillingAddress;
    properties: AccountProperty[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateAccountDto {
    name: string;
    isCompany?: boolean;
    status?: AccountStatus;
    billingAddress: BillingAddress;
}

export interface UpdateAccountDto {
    name?: string;
    isCompany?: boolean;
    status?: AccountStatus;
    billingAddress?: BillingAddress;
}

export interface AccountResponse {
    id: string;
    name: string;
    isCompany: boolean;
    status: AccountStatus;
    billingAddress: BillingAddress;
    properties: AccountProperty[];
    createdAt: string;
    updatedAt: string;
}

export interface AccountsResponse {
    accounts: AccountResponse[];
    total: number;
    page: number;
    pageSize: number;
}

// Property assignment DTOs
export interface AssignPropertyDto {
    propertyId: string;
    role: AccountRole;
    billingAddress?: {
        useAccountBilling: boolean;
        address?: BillingAddress;
    };
}

export interface UpdatePropertyAssignmentDto {
    role?: AccountRole;
    billingAddress?: {
        useAccountBilling: boolean;
        address?: BillingAddress;
    };
}

// Account assignment DTOs
export interface AssignAccountDto {
    accountId: string;
    role: AccountRole;
}

export interface UpdateAccountAssignmentDto {
    role: AccountRole;
}
